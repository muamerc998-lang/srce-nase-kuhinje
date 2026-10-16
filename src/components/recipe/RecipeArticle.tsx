import Link from 'next/link'
import { ArrowDown } from 'lucide-react'
import { parseInline, type TextBlock } from '@/lib/content/article-text'

export interface ArticleSection {
  level: 'h2' | 'h3'
  title: string | null
  id: string
  blocks: TextBlock[]
}

function Inline({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((p, i) =>
        p.type === 'link' ? (
          <Link key={i} href={p.href} className="link">
            {p.text}
          </Link>
        ) : (
          p.text
        ),
      )}
    </>
  )
}

function Blocks({ blocks }: { blocks: TextBlock[] }) {
  return (
    <>
      {blocks.map((b, i) =>
        b.type === 'p' ? (
          <p key={i} className="mt-4">
            <Inline text={b.text} />
          </p>
        ) : (
          <ul key={i} className="mt-4 list-disc space-y-1.5 pl-6 marker:text-brand">
            {b.items.map((it, j) => (
              <li key={j}>
                <Inline text={it} />
              </li>
            ))}
          </ul>
        ),
      )}
    </>
  )
}

/** Urednički tekst recepta (iznad kartice recepta). Struktura dolazi iz sadržaja, ne iz šablona. */
export function RecipeArticle({ sections, recipeTitle }: { sections: ArticleSection[]; recipeTitle: string }) {
  if (!sections.length) return null
  const toc = sections.filter((s) => s.level === 'h2' && s.title)
  return (
    <section aria-label={`O receptu: ${recipeTitle}`} className="no-print mt-10 max-w-3xl text-[1.06rem] leading-relaxed sm:text-[1.1rem]">
      {toc.length >= 3 && (
        <nav aria-labelledby="sadrzaj-teksta" className="mb-8 rounded-2xl border border-line bg-white p-5">
          <h2 id="sadrzaj-teksta" className="font-sans text-base font-bold">
            U ovom tekstu
          </h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            {toc.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="link">
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
          <a href="#recept" className="mt-3 inline-flex items-center gap-1.5 font-semibold text-brand hover:text-bordo">
            <ArrowDown aria-hidden="true" className="h-4 w-4" /> Preskočite na recept
          </a>
        </nav>
      )}
      {sections.map((s) => {
        const Heading = s.level
        return (
          <div key={s.id} className={s.title ? (s.level === 'h2' ? 'mt-10' : 'mt-7') : 'mt-0'}>
            {s.title && (
              <Heading
                id={s.id}
                className={`scroll-mt-24 font-semibold leading-tight ${s.level === 'h2' ? 'text-[1.6rem] sm:text-[1.85rem]' : 'text-[1.25rem] sm:text-[1.35rem]'}`}
              >
                {s.title}
              </Heading>
            )}
            <Blocks blocks={s.blocks} />
          </div>
        )
      })}
    </section>
  )
}
