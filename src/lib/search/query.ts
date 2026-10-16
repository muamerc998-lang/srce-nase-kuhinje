import { normalizeText, stem, tokenize } from '../text/normalize'

/**
 * Za svaki token upita vraća skup alternativa (osnova riječi + sinonimi).
 * Recept odgovara ako za SVAKI token sadrži bar jednu alternativu.
 */
export function expandQuery(q: string, synonymGroups: string[][]): string[][] {
  const tokens = tokenize(q).filter((t) => t.length >= 2).slice(0, 8)
  const normalizedQuery = normalizeText(q)
  return tokens.map((token) => {
    const alts = new Set<string>([stem(token)])
    for (const group of synonymGroups) {
      const hit = group.some((term) => {
        if (term === token || term === normalizedQuery) return true
        const termTokens = term.split(' ')
        return termTokens.length === 1 && stem(term) === stem(token)
      })
      if (hit) {
        for (const term of group) {
          // višeriječni sinonim se dodaje kao cjelina (npr. "bijeli luk")
          alts.add(term.includes(' ') ? term : stem(term))
        }
      }
    }
    // ukloni alternative koje su nadskup druge (dovoljna je kraća osnova)
    const list = [...alts].filter(Boolean)
    return list.filter((a) => !list.some((b) => b !== a && a.includes(b) && !b.includes(' ')))
  })
}

/**
 * Relevantnost: tačan naslov > naslov počinje upitom > sve riječi u naslovu
 * > dio riječi u naslovu > podudaranje samo po namirnicama/kategoriji.
 */
export function relevanceScore(searchTitle: string, q: string, expanded: string[][]): number {
  const nq = normalizeText(q)
  if (!nq) return 0
  const titles = searchTitle.split(' | ')
  let score = 0
  if (titles.includes(nq)) score = Math.max(score, 1000)
  if (titles.some((t) => t.startsWith(nq))) score = Math.max(score, 600)
  const inTitle = expanded.filter((alts) => alts.some((a) => searchTitle.includes(a))).length
  if (expanded.length && inTitle === expanded.length) {
    const wordStart = expanded.every((alts) =>
      alts.some((a) => titles.some((t) => t.split(' ').some((w) => w.startsWith(a)))),
    )
    score = Math.max(score, wordStart ? 400 : 300)
  } else if (inTitle > 0) {
    score = Math.max(score, Math.round((100 * inTitle) / expanded.length))
  }
  return score
}
