/**
 * Pravi AI fotografije jela prema content/PRAVILA-PISANJA.md §6.
 *   npx tsx scripts/generisi-slike.ts content/recepti/slike/promptovi.json [slug …]
 * Ključ: OPENAI_API_KEY iz .env.local. Postojeće slike se preskaču.
 * Izlaz: content/recepti/slike/<slug>.webp, 1600 × 1200 (4:3).
 */
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import sharp from 'sharp'

dotenv.config({ path: '.env.local' })

const MODEL = 'gpt-image-2'
const OUT = 'content/recepti/slike'

const prompt = (dish: string) =>
  `Realistic home-style food photograph of ${dish}. Rustic wooden table in a warm Bosnian home kitchen, soft natural daylight from the side, shallow depth of field, the dish centered with space around it, appetizing but authentic, warm tones. No text, no logos, no watermark, no people, no hands.`

async function main() {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY nije postavljen u .env.local')
  const [file, ...only] = process.argv.slice(2)
  const items: { slug: string; dish: string }[] = JSON.parse(fs.readFileSync(file, 'utf8'))
  for (const it of items) {
    if (only.length && !only.includes(it.slug)) continue
    const out = path.join(OUT, `${it.slug}.webp`)
    if (fs.existsSync(out)) {
      console.log(`preskočeno (postoji): ${it.slug}`)
      continue
    }
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, prompt: prompt(it.dish), size: '1536x1024', quality: 'high', n: 1 }),
    })
    const json = (await res.json()) as { data?: { b64_json?: string }[]; error?: { message: string } }
    if (!res.ok || !json.data?.[0]?.b64_json) {
      console.log(`GREŠKA ${it.slug}: ${json.error?.message ?? res.status}`)
      continue
    }
    await sharp(Buffer.from(json.data[0].b64_json, 'base64')).resize(1600, 1200, { fit: 'cover', position: 'centre' }).webp({ quality: 82 }).toFile(out)
    console.log(`napravljeno: ${out}`)
  }
}

main().catch((e) => {
  console.error(`Greška: ${(e as Error).message}`)
  process.exit(1)
})
