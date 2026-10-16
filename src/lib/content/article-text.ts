/**
 * Jednostavan tekst uredničkog članka recepta → blokovi za prikaz.
 * Pasusi su odvojeni praznim redom; uzastopni redovi koji počinju s „- “ čine listu.
 */
export type TextBlock = { type: 'p'; text: string } | { type: 'ul'; items: string[] }

export function parseTextBlocks(body: string | null | undefined): TextBlock[] {
  const blocks: TextBlock[] = []
  for (const chunk of (body ?? '').replace(/\r\n/g, '\n').split(/\n\s*\n/)) {
    const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean)
    let para: string[] = []
    let list: string[] = []
    const flushPara = () => {
      if (para.length) blocks.push({ type: 'p', text: para.join(' ') })
      para = []
    }
    const flushList = () => {
      if (list.length) blocks.push({ type: 'ul', items: list })
      list = []
    }
    for (const line of lines) {
      const item = line.match(/^[-–•]\s+(.*)$/)
      if (item) {
        flushPara()
        list.push(item[1])
      } else {
        flushList()
        para.push(line)
      }
    }
    flushPara()
    flushList()
  }
  return blocks
}

/** Broj riječi (za kontrolu dužine pri pisanju). */
export const wordCount = (texts: string[]) => texts.map((t) => plainText(t)).join(' ').split(/\s+/).filter(Boolean).length

/**
 * Interni linkovi u tekstu: `[tekst](/recepti/slug/)`. Prihvataju se samo putanje sajta (počinju s „/“),
 * sve ostalo ostaje običan tekst.
 */
export type InlinePart = { type: 'text'; text: string } | { type: 'link'; text: string; href: string }

export function parseInline(text: string): InlinePart[] {
  const parts: InlinePart[] = []
  const re = /\[([^\]]+)\]\((\/[^\s)]*)\)/g
  let last = 0
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > last) parts.push({ type: 'text', text: text.slice(last, m.index) })
    parts.push({ type: 'link', text: m[1], href: m[2] })
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push({ type: 'text', text: text.slice(last) })
  return parts
}

/** Tekst bez oznaka linkova (za brojanje riječi i opise). */
export const plainText = (text: string) => parseInline(text).map((p) => p.text).join('')
