/**
 * Normalizacija teksta za pretragu i slugove.
 * - mala slova, bez dijakritike (č ć š ž → c c s z; đ → d; "dj" → "d")
 * - samo slova/brojevi i pojedinačni razmaci
 * Isto pravilo se primjenjuje na indeksirani tekst i na upit, pa "dzem", "džem",
 * "Đuveč" i "djuvec" završavaju u istom obliku.
 */
export function normalizeText(input: string | null | undefined): string {
  if (!input) return ''
  return input
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/dj/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function tokenize(input: string | null | undefined): string[] {
  const n = normalizeText(input)
  return n ? n.split(' ') : []
}

/**
 * Vrlo blago "skraćivanje" padežnih nastavaka kako bi "krompira", "pite" ili
 * "palačinkama" pronašli "krompir", "pita" i "palačinke". Namjerno konzervativno:
 * osnova nikad nije kraća od 3 znaka.
 */
const SUFFIXES = ['ama', 'ima', 'om', 'em', 'og', 'ih', 'a', 'e', 'i', 'u', 'o']

export function stem(token: string): string {
  if (token.length < 4 || /^\d+$/.test(token)) return token
  for (const s of SUFFIXES) {
    if (token.endsWith(s) && token.length - s.length >= 3) {
      return token.slice(0, -s.length)
    }
  }
  return token
}

/** Slug za URL: bosanska slova se transliteriraju (đ → dj radi čitljivosti URL-a). */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/đ/g, 'dj')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}
