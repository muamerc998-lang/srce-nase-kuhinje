// Iz originalnog logotipa (brand/original/logo-facebook.jpg) pravi providne PNG verzije za web.
// Siva pozadina (~#F2F2F2) se pretvara u alfa kanal ("color to alpha").
import sharp from 'sharp'
import fs from 'node:fs'
const SRC = 'brand/original/logo-facebook.jpg'
const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true })
const W = info.width, H = info.height, BG = [242, 242, 242]
const out = Buffer.alloc(W * H * 4)
for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
  const c = [data[i], data[i + 1], data[i + 2]]
  let a = Math.max(...c.map((v, k) => (BG[k] - v) / BG[k]))
  a = Math.min(1, Math.max(0, (a - 0.03) / 0.97))
  for (let k = 0; k < 3; k++) out[j + k] = a > 0 ? Math.max(0, Math.min(255, Math.round((c[k] - BG[k] * (1 - a)) / a))) : 0
  out[j + 3] = Math.round(a * 255)
}
const alpha = (x, y) => out[(y * W + x) * 4 + 3]
const bbox = (y0, y1) => {
  let x0 = W, x1 = 0, ty0 = H, ty1 = 0
  for (let y = y0; y < y1; y++) for (let x = 0; x < W; x++) if (alpha(x, y) > 40) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); ty0 = Math.min(ty0, y); ty1 = Math.max(ty1, y) }
  return { left: Math.max(0, x0 - 6), top: Math.max(0, ty0 - 6), width: Math.min(W, x1 + 7) - Math.max(0, x0 - 6), height: Math.min(H, ty1 + 7) - Math.max(0, ty0 - 6) }
}
const full = () => sharp(out, { raw: { width: W, height: H, channels: 4 } })
fs.mkdirSync('public/brand', { recursive: true })
const heart = bbox(100, 940), word = bbox(950, 1130)
await full().extract(heart).resize({ height: 256 }).png({ compressionLevel: 9 }).toFile('public/brand/znak.png')
await full().extract(word).resize({ height: 96 }).png({ compressionLevel: 9 }).toFile('public/brand/natpis.png')
await full().extract(heart).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile('src/app/icon.png')
await full().extract(heart).resize(180, 180, { fit: 'contain', background: '#ffffff' }).flatten({ background: '#ffffff' }).png().toFile('src/app/apple-icon.png')
// OG/organizacija: cijeli logo na bijeloj
await sharp(SRC).resize(600, 600).jpeg({ quality: 88 }).toFile('public/brand/logo-kvadrat.jpg')
const m1 = await sharp('public/brand/znak.png').metadata(), m2 = await sharp('public/brand/natpis.png').metadata()
console.log('znak', m1.width, m1.height, 'natpis', m2.width, m2.height)
