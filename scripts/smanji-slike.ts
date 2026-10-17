/**
 * Smanjuje slike recepata u public/media tako da nijedan fajl nema više od 100 KB.
 *   npx tsx scripts/smanji-slike.ts            → sve slike iz content/recepti/slike/promptovi.json
 *   npx tsx scripts/smanji-slike.ts slug slug  → samo navedeni recepti
 *   ... --sve                                   → ponovo napravi sve veličine iz izvorne slike
 *
 * WebP kvalitet se spušta korak po korak (najniže 50) dok fajl ne stane u limit; ako ni to nije
 * dovoljno, slika se smanji uz isti omjer stranica.
 * Uvijek se kreće od izvorne slike (content/recepti/slike/<slug>.webp), da se kvalitet ne gubi
 * ponovnim snimanjem. Poziva se i automatski iz dodaj-slike.ts.
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'

export const MAX_BYTES = 100 * 1024
const MEDIA = path.resolve('public/media')
const SOURCES = path.resolve('content/recepti/slike')

/** Fajlovi jednog recepta u public/media: <slug>.webp i <slug>-ŠxV.webp (Payload veličine). */
function mediaFiles(slug: string) {
  const re = new RegExp(`^${slug.replace(/[-]/g, '\\-')}(-\\d+x\\d+)?\\.webp$`)
  return fs.existsSync(MEDIA) ? fs.readdirSync(MEDIA).filter((f) => re.test(f)) : []
}

/** Prvo se spušta kvalitet (najniže 50); ako ni to nije dovoljno, slika se smanji uz isti omjer stranica. */
async function fit(source: Buffer, width: number, height: number) {
  let last = { buf: Buffer.alloc(0), q: 0, w: width }
  for (const scale of [1, 0.875, 0.75, 0.625]) {
    const w = Math.round(width * scale)
    const h = Math.round(height * scale)
    for (let q = scale === 1 ? 82 : 70; q >= 50; q -= 4) {
      const buf = await sharp(source).resize(w, h, { fit: 'cover', position: 'centre' }).webp({ quality: q, effort: 6 }).toBuffer()
      last = { buf, q, w }
      if (buf.length <= MAX_BYTES) return last
    }
  }
  return last
}

export async function shrinkRecipeImages(slug: string, log = true, all = false) {
  const source = path.join(SOURCES, `${slug}.webp`)
  for (const f of mediaFiles(slug)) {
    const file = path.join(MEDIA, f)
    const size = fs.statSync(file).size
    if (size <= MAX_BYTES && !all) continue
    const current = fs.readFileSync(file)
    const meta = await sharp(current).metadata()
    // dimenzije iz Payloada (ime fajla) ili postojećeg fajla
    const dims = f.match(/-(\d+)x(\d+)\.webp$/)
    const [width, height] = dims ? [Number(dims[1]), Number(dims[2])] : [1600, 1200]
    if (!fs.existsSync(source) && !meta.width) continue
    const { buf, q, w } = await fit(fs.existsSync(source) ? fs.readFileSync(source) : current, width, height)
    fs.writeFileSync(file, buf)
    if (log) console.log(`${f}: ${Math.round(size / 1024)} KB → ${Math.round(buf.length / 1024)} KB (kvalitet ${q}${w !== width ? `, širina ${w} px` : ''})`)
  }
}

async function main() {
  const all = process.argv.includes('--sve')
  const only = process.argv.slice(2).filter((a) => !a.startsWith('--'))
  const slugs = only.length
    ? only
    : (JSON.parse(fs.readFileSync(path.join(SOURCES, 'promptovi.json'), 'utf8')) as { slug: string }[]).map((i) => i.slug)
  for (const slug of slugs) await shrinkRecipeImages(slug, true, all)
  const over = slugs.flatMap(mediaFiles).filter((f) => fs.statSync(path.join(MEDIA, f)).size > MAX_BYTES)
  console.log(over.length ? `Još iznad 100 KB: ${over.join(', ')}` : 'Sve slike recepata su do 100 KB.')
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
