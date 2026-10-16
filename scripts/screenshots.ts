/**
 * Snimci ključnih stranica i provjera horizontalnog prelijevanja.
 *   npm run dev (ili npm start)  →  npx tsx scripts/screenshots.ts [baseUrl]
 * Rezultat: ./screenshots/<širina>/<stranica>.png i izvještaj u konzoli.
 */
import { chromium } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const base = process.argv[2] || 'http://localhost:3000'
const widths = [360, 390, 768, 1024, 1280, 1440]
const pages: Array<[string, string]> = [
  ['pocetna', '/'],
  ['arhiva', '/recepti/'],
  ['pretraga', '/recepti/?q=krumpir'],
  ['kategorija', '/kategorije/slatki-recepti/'],
  ['recept', '/recepti/musaka-s-krompirom/'],
  ['recept-torta', '/recepti/cokoladna-torta-bez-pecenja/'],
  ['kuharica', '/moja-kuharica/'],
  ['rucak', '/rucak/'],
  ['kolekcija', '/ideje/iz-jedne-posude/'],
  ['kontakt', '/kontakt/'],
  ['plan', '/moj-plan/'],
  ['lista', '/lista-za-kupovinu/'],
  ['namirnice', '/sta-danas-kuhati/?imam=jaja,glatko-brasno,mlijeko&osnovne=1'],
  ['vodic', '/savjeti/kako-raditi-s-korama-za-pitu/'],
  ['namirnica', '/namirnice/krompir/'],
  ['404', '/ne-postoji/'],
]

async function main() {
  const browser = await chromium.launch()
  const problems: string[] = []
  for (const w of widths) {
    const dir = path.resolve('screenshots', String(w))
    fs.mkdirSync(dir, { recursive: true })
    const ctx = await browser.newContext({ viewport: { width: w, height: w < 800 ? 800 : 900 }, deviceScaleFactor: 1 })
    const page = await ctx.newPage()
    // Kuharica s jednim receptom radi realnog prikaza
    await page.goto(`${base}/recepti/palacinke/`, { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: /^Sačuvaj/ }).first().click()
    for (const [name, url] of pages) {
      await page.goto(`${base}${url}`, { waitUntil: 'networkidle' })
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement
        const offenders: string[] = []
        if (doc.scrollWidth > doc.clientWidth + 1) {
          document.querySelectorAll('body *').forEach((el) => {
            const r = (el as HTMLElement).getBoundingClientRect()
            if (r.right > doc.clientWidth + 1 && r.width > 0 && getComputedStyle(el).position !== 'fixed') {
              offenders.push(`${el.tagName.toLowerCase()}.${String((el as HTMLElement).className).slice(0, 60)}`)
            }
          })
        }
        return { sw: doc.scrollWidth, cw: doc.clientWidth, offenders: offenders.slice(0, 5) }
      })
      if (overflow.sw > overflow.cw + 1) problems.push(`${w}px ${url}: scrollWidth ${overflow.sw} > ${overflow.cw} (${overflow.offenders.join(', ')})`)
      // lijeno učitane slike: proskrolati stranicu prije snimka
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y)
          await new Promise((r) => setTimeout(r, 100))
        }
        window.scrollTo(0, 0)
      })
      await page.waitForTimeout(500)
      await page.screenshot({ path: path.join(dir, `${name}.png`), fullPage: true })
    }
    await ctx.close()
  }
  await browser.close()
  console.log(problems.length ? `PRELIJEVANJE:\n${problems.join('\n')}` : `Bez horizontalnog prelijevanja na ${widths.join('/')} px.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
