/**
 * Generiše DEMONSTRACIJSKE slike (nisu fotografije hrane) realistične veličine,
 * kako bi raspored, responzivne veličine i performanse mogli biti provjereni
 * prije dolaska stvarnih fotografija. Svaka slika nosi vidljiv natpis "DEMO".
 */
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const palette = [
  ['#C9A27E', '#8E5B3A'],
  ['#E8C07D', '#B5651D'],
  ['#9DB88A', '#4E7346'],
  ['#E39B7B', '#A2482E'],
  ['#D7B98E', '#7B5B3A'],
  ['#C27C7C', '#741B2B'],
  ['#E6D3A3', '#9C7A3C'],
  ['#B7C9A8', '#5E7A52'],
]

function hash(s: string) {
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h
}

function escapeXml(s: string) {
  return s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!)
}

export async function makeDemoImage(outDir: string, key: string, label: string, width = 1600, height = 1200) {
  fs.mkdirSync(outDir, { recursive: true })
  const file = path.join(outDir, `${key}.jpg`)
  if (fs.existsSync(file)) return file
  const h = hash(key)
  const [light, dark] = palette[h % palette.length]
  const cx = 30 + (h % 40)
  const cy = 35 + ((h >> 3) % 30)
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <radialGradient id="g" cx="${cx}%" cy="${cy}%" r="85%">
      <stop offset="0%" stop-color="${light}"/>
      <stop offset="100%" stop-color="${dark}"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <circle cx="${width * 0.5}" cy="${height * 0.52}" r="${height * 0.33}" fill="#fff" fill-opacity="0.85"/>
  <circle cx="${width * 0.5}" cy="${height * 0.52}" r="${height * 0.25}" fill="${light}" fill-opacity="0.9"/>
  <text x="50%" y="${height * 0.5}" text-anchor="middle" font-family="Georgia, serif" font-size="${height * 0.06}" fill="#262326">${escapeXml(label)}</text>
  <text x="50%" y="${height * 0.6}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${height * 0.045}" fill="#741B2B" letter-spacing="8">DEMO</text>
  <text x="${width - 24}" y="${height - 24}" text-anchor="end" font-family="Arial, sans-serif" font-size="22" fill="#fff" fill-opacity="0.9">Demonstracijska slika — nije fotografija jela</text>
</svg>`
  // Šum daje realističnu veličinu JPEG fajla (približno kao fotografija).
  const noise = await sharp({
    create: { width, height, channels: 3, background: { r: 128, g: 128, b: 128 }, noise: { type: 'gaussian', mean: 128, sigma: 28 } },
  })
    .png()
    .toBuffer()
  await sharp(Buffer.from(svg))
    .composite([{ input: noise, blend: 'soft-light' }])
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(file)
  return file
}
