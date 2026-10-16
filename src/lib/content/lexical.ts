/** Minimalni graditelj Lexical JSON sadržaja (za seed i uvoz vodiča). */

type Block = { h2: string } | { h3: string } | { p: string } | { ul: string[] } | { ol: string[] }

const text = (t: string) => ({ type: 'text', text: t, format: 0, detail: 0, mode: 'normal', style: '', version: 1 })
const base = { format: '', indent: 0, version: 1, direction: 'ltr' as const }

function list(items: string[], ordered: boolean) {
  return {
    ...base,
    type: 'list',
    listType: ordered ? 'number' : 'bullet',
    start: 1,
    tag: ordered ? 'ol' : 'ul',
    children: items.map((t, i) => ({ ...base, type: 'listitem', value: i + 1, children: [text(t)] })),
  }
}

export function lexicalFromBlocks(blocks: Block[]) {
  return {
    root: {
      ...base,
      type: 'root',
      children: blocks.map((b) => {
        if ('h2' in b) return { ...base, type: 'heading', tag: 'h2', children: [text(b.h2)] }
        if ('h3' in b) return { ...base, type: 'heading', tag: 'h3', children: [text(b.h3)] }
        if ('ul' in b) return list(b.ul, false)
        if ('ol' in b) return list(b.ol, true)
        return { ...base, type: 'paragraph', textFormat: 0, textStyle: '', children: [text(b.p)] }
      }),
    },
  }
}

/** Naslovi H2/H3 iz Lexical sadržaja (za sadržaj članka). */
export function extractHeadings(content: unknown): Array<{ id: string; text: string; level: 2 | 3 }> {
  const out: Array<{ id: string; text: string; level: 2 | 3 }> = []
  const root = (content as { root?: { children?: unknown[] } })?.root
  for (const node of (root?.children ?? []) as Array<{ type?: string; tag?: string; children?: Array<{ text?: string }> }>) {
    if (node.type === 'heading' && (node.tag === 'h2' || node.tag === 'h3')) {
      const t = (node.children ?? []).map((c) => c.text ?? '').join('')
      out.push({ id: headingId(t), text: t, level: node.tag === 'h2' ? 2 : 3 })
    }
  }
  return out
}

export function headingId(t: string): string {
  return (
    t
      .toLowerCase()
      .replace(/đ/g, 'dj')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'odjeljak'
  )
}
