/**
 * Uvoz recepata i namirnica iz JSON-a (format "srce-nase-kuhinje/v1").
 *
 *   npm run content:import -- <datoteka.json>                 → PROBNI uvoz (dry-run), ništa se ne zapisuje
 *   npm run content:import -- <datoteka.json> --primijeni     → stvarni uvoz; recepti nastaju kao DRAFT
 *   ... --primijeni --update-drafts                            → postojećim receptima dodaje novu draft verziju
 *   ... --primijeni --objavi                                   → novi recepti se odmah objavljuju (urednik je odobrio)
 *
 * Postojeće objave se nikad ne prepisuju tiho. Slike: putanje relativno na datoteku.
 * Opis formata: docs/content-model.md
 */
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { runImport, formatReport } from '../src/payload/importer'

async function main() {
  const file = process.argv.slice(2).find((a) => !a.startsWith('--'))
  if (!file) {
    console.error('Navedite datoteku: npm run content:import -- putanja/do/uvoza.json [--primijeni] [--update-drafts]')
    process.exit(2)
  }
  const apply = process.argv.includes('--primijeni')
  const updateDrafts = process.argv.includes('--update-drafts')
  const publish = apply && process.argv.includes('--objavi')
  let data: unknown
  try {
    data = JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (e) {
    console.error(`Datoteka se ne može pročitati kao JSON: ${(e as Error).message}`)
    process.exit(2)
  }
  const payload = await getPayload({ config })
  const report = await runImport(payload, data, { dryRun: !apply, updateDrafts, publish, baseDir: path.dirname(path.resolve(file)) })
  console.log(formatReport(report))
  if (!apply && report.ok) console.log('\nZa stvarni uvoz ponovite naredbu s --primijeni.')
  process.exit(report.ok ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
