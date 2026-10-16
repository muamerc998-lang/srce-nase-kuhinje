import { RichText as LexicalRichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { headingId } from '@/lib/content/lexical'

/** Lexical renderer; naslovi dobijaju stabilne id-jeve za sadržaj članka. */
const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  heading: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children })
    const text = (node.children ?? []).map((c) => ('text' in c ? (c as { text: string }).text : '')).join('')
    const Tag = node.tag as 'h2' | 'h3' | 'h4'
    return (
      <Tag id={headingId(text)} className="scroll-mt-24">
        {children}
      </Tag>
    )
  },
})

export function RichText({ data }: { data: unknown }) {
  if (!data) return null
  return <LexicalRichText data={data as SerializedEditorState} converters={converters} className="rich-text" disableContainer={false} />
}
