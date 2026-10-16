'use server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import sharp from 'sharp'
import { payloadClient } from '@/data/payload'
import { getMember, setMemberCookie, clearMemberCookie } from '@/lib/members/session'
import { checkFormToken, hashClient, rateLimit, sanitizeText, tooManyLinks } from '@/lib/forms/protect'
import type { FormState } from './actions'

const keep = (fd: FormData, keys: string[]) => Object.fromEntries(keys.map((k) => [k, String(fd.get(k) ?? '')]))
const errs = (e: z.ZodError) => Object.fromEntries(e.issues.map((i) => [String(i.path[0]), i.message]))

async function ipKey() {
  const h = await headers()
  return hashClient(h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'nepoznato')
}

function guard(fd: FormData): string | null {
  if (String(fd.get('website') ?? '') !== '') return 'Zahtjev nije prihvaćen.'
  if (!checkFormToken(fd.get('token'), Date.now(), 2000)) return 'Obrazac je istekao ili je poslan prebrzo. Pokušajte ponovo.'
  return null
}

// ---------- Registracija i prijava ----------
const registerSchema = z.object({
  displayName: z.string().min(2, 'Upišite ime (najmanje 2 znaka).').max(60, 'Ime je predugo.'),
  email: z.string().email('Upišite ispravan email.'),
  password: z.string().min(8, 'Lozinka mora imati najmanje 8 znakova.').max(128, 'Lozinka je preduga.'),
})

export async function registerMember(_p: FormState, fd: FormData): Promise<FormState> {
  const values = keep(fd, ['displayName', 'email'])
  const g = guard(fd)
  if (g) return { status: 'error', message: g, values }
  const key = await ipKey()
  if (!rateLimit(`reg:${key}`, 5, 60 * 60_000)) return { status: 'error', message: 'Previše pokušaja. Pokušajte kasnije.', values }
  const parsed = registerSchema.safeParse({
    displayName: sanitizeText(fd.get('displayName'), 60),
    email: sanitizeText(fd.get('email'), 120).toLowerCase(),
    password: String(fd.get('password') ?? ''),
  })
  if (!parsed.success) return { status: 'error', message: 'Provjerite označena polja.', errors: errs(parsed.error), values }
  const payload = await payloadClient()
  const exists = await payload.count({ collection: 'members', where: { email: { equals: parsed.data.email } }, overrideAccess: true })
  if (exists.totalDocs) return { status: 'error', message: 'Račun s ovim emailom već postoji. Prijavite se.', values }
  try {
    await payload.create({ collection: 'members', overrideAccess: true, data: { ...parsed.data, clientHash: key } })
    const res = await payload.login({ collection: 'members', data: { email: parsed.data.email, password: parsed.data.password } })
    if (res.token) await setMemberCookie(res.token)
  } catch {
    return { status: 'error', message: 'Registracija trenutno nije uspjela. Pokušajte ponovo.', values }
  }
  redirect('/moji-recepti/')
}

export async function loginMember(_p: FormState, fd: FormData): Promise<FormState> {
  const values = keep(fd, ['email'])
  const key = await ipKey()
  if (!rateLimit(`login:${key}`, 10, 15 * 60_000)) return { status: 'error', message: 'Previše pokušaja prijave. Pokušajte za 15 minuta.', values }
  const email = sanitizeText(fd.get('email'), 120).toLowerCase()
  const password = String(fd.get('password') ?? '')
  try {
    const payload = await payloadClient()
    const res = await payload.login({ collection: 'members', data: { email, password } })
    if (!res.token || (res.user as { blocked?: boolean }).blocked) throw new Error('blokiran')
    await setMemberCookie(res.token)
  } catch {
    return { status: 'error', message: 'Email ili lozinka nisu ispravni.', values }
  }
  redirect('/moji-recepti/')
}

export async function logoutMember() {
  await clearMemberCookie()
  redirect('/')
}

// ---------- Profil ----------
export async function updateProfile(_p: FormState, fd: FormData): Promise<FormState> {
  const member = await getMember()
  if (!member) redirect('/prijava/')
  const displayName = sanitizeText(fd.get('displayName'), 60)
  const bio = sanitizeText(fd.get('bio'), 600)
  if (displayName.length < 2) return { status: 'error', message: 'Upišite ime.', errors: { displayName: 'Najmanje 2 znaka.' }, values: { displayName, bio } }
  if (tooManyLinks(bio, 1)) return { status: 'error', message: 'Predstavljanje smije imati najviše jedan link.', values: { displayName, bio } }
  const payload = await payloadClient()
  await payload.update({ collection: 'members', id: member.id, overrideAccess: true, data: { displayName, bio } })
  return { status: 'ok', message: 'Profil je sačuvan.' }
}

// ---------- Slanje recepta ----------
const MAX_IMAGE = 8 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']

const submissionSchema = z.object({
  title: z.string().min(3, 'Upišite naziv recepta.').max(120, 'Naziv je predug.'),
  story: z.string().max(3000, 'Priča je preduga.'),
  ingredients: z.string().min(10, 'Upišite sastojke (jedan po redu).').max(4000, 'Previše teksta.'),
  steps: z.string().min(20, 'Opišite pripremu (jedan korak po redu).').max(8000, 'Previše teksta.'),
  servings: z.union([z.literal(''), z.coerce.number().int().min(1).max(100)]),
  totalMinutes: z.union([z.literal(''), z.coerce.number().int().min(1).max(6000)]),
  category: z.union([z.literal(''), z.coerce.number().int().positive()]),
})

export async function submitMemberRecipe(_p: FormState, fd: FormData): Promise<FormState> {
  const member = await getMember()
  if (!member) redirect('/prijava/')
  const values = keep(fd, ['title', 'story', 'ingredients', 'steps', 'servings', 'totalMinutes', 'category'])
  const g = guard(fd)
  if (g) return { status: 'error', message: g, values }
  if (!rateLimit(`sub:${member.id}`, 5, 24 * 60 * 60_000)) {
    return { status: 'error', message: 'Dnevno možete poslati najviše 5 recepata.', values }
  }
  const parsed = submissionSchema.safeParse({
    title: sanitizeText(fd.get('title'), 120),
    story: sanitizeText(fd.get('story'), 3000),
    ingredients: sanitizeText(fd.get('ingredients'), 4000),
    steps: sanitizeText(fd.get('steps'), 8000),
    servings: String(fd.get('servings') ?? ''),
    totalMinutes: String(fd.get('totalMinutes') ?? ''),
    category: String(fd.get('category') ?? ''),
  })
  if (!parsed.success) return { status: 'error', message: 'Provjerite označena polja.', errors: errs(parsed.error), values }
  const d = parsed.data
  if (tooManyLinks(`${d.story} ${d.ingredients} ${d.steps}`, 1)) {
    return { status: 'error', message: 'Recept smije sadržavati najviše jedan link.', values }
  }

  const payload = await payloadClient()
  let imageId: number | undefined
  const file = fd.get('image')
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_IMAGE) return { status: 'error', message: 'Slika je veća od 8 MB.', errors: { image: 'Najviše 8 MB.' }, values }
    if (!ALLOWED.includes(file.type)) return { status: 'error', message: 'Dozvoljene su samo JPG, PNG ili WebP slike.', errors: { image: 'Samo JPG, PNG ili WebP.' }, values }
    try {
      // Slika se dekodira i ponovo kodira: drugi tipovi fajlova i skriveni sadržaj ne prolaze, metapodaci se uklanjaju.
      const data = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 50_000_000 })
        .rotate()
        .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer()
      const img = await payload.create({
        collection: 'submission-images',
        overrideAccess: true,
        data: { alt: `Fotografija recepta: ${d.title}` },
        file: { data, mimetype: 'image/webp', name: `citalac-${member.id}-${Date.now()}.webp`, size: data.length },
      })
      imageId = img.id
    } catch {
      return { status: 'error', message: 'Slika se ne može pročitati. Pokušajte s drugom fotografijom.', errors: { image: 'Neispravna slika.' }, values }
    }
  }

  await payload.create({
    collection: 'submissions',
    overrideAccess: true,
    data: {
      member: member.id,
      title: d.title,
      story: d.story || undefined,
      ingredients: d.ingredients,
      steps: d.steps,
      servings: d.servings === '' ? undefined : d.servings,
      totalMinutes: d.totalMinutes === '' ? undefined : d.totalMinutes,
      category: d.category === '' ? undefined : d.category,
      image: imageId,
      status: 'na-cekanju',
      clientHash: await ipKey(),
    },
  })
  return { status: 'ok', message: 'Hvala! Recept je poslan uredništvu. Pojavit će se javno kad ga odobrimo.' }
}
