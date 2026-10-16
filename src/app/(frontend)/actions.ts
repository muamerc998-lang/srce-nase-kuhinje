'use server'
import { headers } from 'next/headers'
import { z } from 'zod'
import { payloadClient, publicWhere } from '@/data/payload'
import { getSiteSettings } from '@/data/site'
import { checkFormToken, hashClient, rateLimit, sanitizeText, tooManyLinks } from '@/lib/forms/protect'

export interface FormState {
  status: 'idle' | 'ok' | 'error'
  message: string
  errors?: Record<string, string>
  /** uneseni podaci se vraćaju da se ne izgube pri grešci */
  values?: Record<string, string>
}

async function clientKey() {
  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'nepoznato'
  return hashClient(ip)
}

function values(fd: FormData, keys: string[]) {
  return Object.fromEntries(keys.map((k) => [k, String(fd.get(k) ?? '')]))
}

const spamGuard = (fd: FormData): string | null => {
  if (String(fd.get('website') ?? '') !== '') return 'Poruka nije prihvaćena.'
  if (!checkFormToken(fd.get('token'))) return 'Obrazac je istekao ili je poslan prebrzo. Pokušajte ponovo.'
  return null
}

const zodErrors = (e: z.ZodError) => Object.fromEntries(e.issues.map((i) => [String(i.path[0]), i.message]))

async function publishedRecipe(uid: string) {
  const payload = await payloadClient()
  const res = await payload.find({ collection: 'recipes', where: publicWhere({ uid: { equals: uid } }), limit: 1, depth: 0, select: { slug: true } })
  return res.docs[0]?.id ?? null
}

// ---------- Iskustva, pitanja i ocjene ----------
const commentSchema = z.object({
  recipe: z.string().uuid(),
  kind: z.enum(['iskustvo', 'pitanje']),
  name: z.string().min(2, 'Upišite ime (najmanje 2 znaka).').max(60, 'Ime je predugo.'),
  email: z.union([z.literal(''), z.string().email('Email nije ispravan.')]),
  text: z.string().min(10, 'Poruka je prekratka (najmanje 10 znakova).').max(2000, 'Poruka je preduga (najviše 2000 znakova).'),
  rating: z.union([z.literal(''), z.enum(['1', '2', '3', '4', '5'])]),
})

export async function submitComment(_prev: FormState, fd: FormData): Promise<FormState> {
  const keep = values(fd, ['kind', 'name', 'email', 'text', 'rating'])
  const settings = await getSiteSettings()
  if (!settings.features.comments) return { status: 'error', message: 'Komentari trenutno nisu uključeni.', values: keep }
  const spam = spamGuard(fd)
  if (spam) return { status: 'error', message: spam, values: keep }
  const key = await clientKey()
  if (!rateLimit(`comment:${key}`, 3, 10 * 60_000)) {
    return { status: 'error', message: 'Poslali ste više poruka u kratkom vremenu. Pokušajte ponovo za nekoliko minuta.', values: keep }
  }
  const parsed = commentSchema.safeParse({
    recipe: String(fd.get('recipe') ?? ''),
    kind: String(fd.get('kind') ?? 'iskustvo'),
    name: sanitizeText(fd.get('name'), 60),
    email: sanitizeText(fd.get('email'), 120),
    text: sanitizeText(fd.get('text'), 2000),
    rating: settings.features.ratings ? String(fd.get('rating') ?? '') : '',
  })
  if (!parsed.success) return { status: 'error', message: 'Provjerite označena polja.', errors: zodErrors(parsed.error), values: keep }
  if (tooManyLinks(parsed.data.text)) {
    return { status: 'error', message: 'Poruka smije sadržavati najviše jedan link.', errors: { text: 'Previše linkova.' }, values: keep }
  }
  const recipeId = await publishedRecipe(parsed.data.recipe)
  if (!recipeId) return { status: 'error', message: 'Recept nije pronađen.', values: keep }
  try {
    const payload = await payloadClient()
    await payload.create({
      collection: 'comments',
      overrideAccess: true,
      data: {
        recipe: recipeId,
        kind: parsed.data.kind,
        name: parsed.data.name,
        email: parsed.data.email || undefined,
        text: parsed.data.text,
        rating: parsed.data.rating && parsed.data.kind === 'iskustvo' ? Number(parsed.data.rating) : undefined,
        status: 'na-cekanju',
        clientHash: key,
      },
    })
  } catch {
    return { status: 'error', message: 'Poruka trenutno nije mogla biti sačuvana. Pokušajte ponovo.', values: keep }
  }
  return { status: 'ok', message: 'Hvala! Poruka je poslana uredništvu i bit će objavljena nakon pregleda.' }
}

// ---------- Prijava greške u receptu ----------
const correctionSchema = z.object({
  recipe: z.string().uuid(),
  message: z.string().min(10, 'Opišite grešku (najmanje 10 znakova).').max(3000, 'Opis je predug.'),
  email: z.union([z.literal(''), z.string().email('Email nije ispravan.')]),
})

export async function submitCorrection(_prev: FormState, fd: FormData): Promise<FormState> {
  const keep = values(fd, ['message', 'email'])
  const spam = spamGuard(fd)
  if (spam) return { status: 'error', message: spam, values: keep }
  const key = await clientKey()
  if (!rateLimit(`correction:${key}`, 5, 60 * 60_000)) {
    return { status: 'error', message: 'Previše prijava u kratkom vremenu. Pokušajte kasnije.', values: keep }
  }
  const parsed = correctionSchema.safeParse({
    recipe: String(fd.get('recipe') ?? ''),
    message: sanitizeText(fd.get('message'), 3000),
    email: sanitizeText(fd.get('email'), 120),
  })
  if (!parsed.success) return { status: 'error', message: 'Provjerite označena polja.', errors: zodErrors(parsed.error), values: keep }
  const recipeId = await publishedRecipe(parsed.data.recipe)
  if (!recipeId) return { status: 'error', message: 'Recept nije pronađen.', values: keep }
  try {
    const payload = await payloadClient()
    const r = await payload.findByID({ collection: 'recipes', id: recipeId, depth: 0, select: { title: true } })
    await payload.create({
      collection: 'messages',
      overrideAccess: true,
      data: {
        kind: 'greska',
        subject: `Greška u receptu: ${r.title}`,
        recipe: recipeId,
        email: parsed.data.email || undefined,
        message: parsed.data.message,
        clientHash: key,
      },
    })
  } catch {
    return { status: 'error', message: 'Prijava trenutno nije mogla biti sačuvana. Pokušajte ponovo.', values: keep }
  }
  return { status: 'ok', message: 'Hvala na prijavi! Uredništvo će provjeriti recept.' }
}

// ---------- Kontakt ----------
const contactSchema = z.object({
  name: z.string().min(2, 'Upišite ime.').max(80, 'Ime je predugo.'),
  email: z.string().email('Upišite ispravan email kako bismo vam mogli odgovoriti.'),
  subject: z.string().min(3, 'Upišite naslov.').max(120, 'Naslov je predug.'),
  message: z.string().min(10, 'Poruka je prekratka.').max(5000, 'Poruka je preduga.'),
})

export async function submitContact(_prev: FormState, fd: FormData): Promise<FormState> {
  const keep = values(fd, ['name', 'email', 'subject', 'message'])
  const spam = spamGuard(fd)
  if (spam) return { status: 'error', message: spam, values: keep }
  const key = await clientKey()
  if (!rateLimit(`contact:${key}`, 3, 60 * 60_000)) {
    return { status: 'error', message: 'Previše poruka u kratkom vremenu. Pokušajte kasnije.', values: keep }
  }
  const parsed = contactSchema.safeParse({
    name: sanitizeText(fd.get('name'), 80),
    email: sanitizeText(fd.get('email'), 120),
    subject: sanitizeText(fd.get('subject'), 120),
    message: sanitizeText(fd.get('message'), 5000),
  })
  if (!parsed.success) return { status: 'error', message: 'Provjerite označena polja.', errors: zodErrors(parsed.error), values: keep }
  if (tooManyLinks(parsed.data.message, 3)) return { status: 'error', message: 'Poruka sadrži previše linkova.', values: keep }
  try {
    const payload = await payloadClient()
    await payload.create({ collection: 'messages', overrideAccess: true, data: { kind: 'kontakt', ...parsed.data, clientHash: key } })
  } catch {
    return { status: 'error', message: 'Poruka trenutno nije mogla biti sačuvana. Pokušajte ponovo.', values: keep }
  }
  return { status: 'ok', message: 'Hvala! Poruka je primljena.' }
}
