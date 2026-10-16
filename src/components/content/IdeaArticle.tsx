import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, ChefHat, CircleHelp, Clock } from 'lucide-react'
import type { ArticleView } from '@/data/article'
import type { RecipeCard } from '@/data/mappers'
import { ImagePlaceholder } from '../ui/ImagePlaceholder'
import { difficultyLabels } from '@/lib/recipes/time'
import { headingId } from '@/lib/content/lexical'
import { absolute } from '@/lib/seo/meta'

export function resolveSections(a: ArticleView, cards: RecipeCard[]) {
  const byId = new Map(cards.map((c) => [c.id, c]))
  return a.sections
    .map((s) => ({
      ...s,
      id: headingId(s.title),
      items: s.items.map((i) => ({ ...i, card: byId.get(i.recipeId) })).filter((i): i is typeof i & { card: RecipeCard } => !!i.card),
    }))
    .filter((s) => s.items.length > 0)
}
export type ResolvedSection = ReturnType<typeof resolveSections>[number]

/** ItemList za JSON-LD članka. */
export const itemListLd = (sections: ResolvedSection[]) => ({
  '@type': 'ItemList',
  itemListElement: sections
    .flatMap((s) => s.items)
    .map((it, i) => ({ '@type': 'ListItem', position: i + 1, url: absolute(`/recepti/${it.card.slug}/`), name: it.card.title })),
})

interface Props {
  article: ArticleView
  sections: ResolvedSection[]
  /** Sidro i tekst za listu recepata ispod članka. */
  recipesAnchor: { id: string; label: string }
  related?: { slug: string; title: string; intro: string }[]
}

/** Članak s idejama: uvod, sadržaj, pregledna tabela, numerisani prijedlozi, savjet, pitanja i veze. */
export function IdeaArticle({ article: a, sections, recipesAnchor, related = [] }: Props) {
  const all = sections.flatMap((s) => s.items)
  let n = 0
  return (
    <article className="container-page py-10">
      <div className="mx-auto max-w-3xl">
        <div className="space-y-4 text-[1.08rem] leading-relaxed sm:text-lg">
          {a.intro.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <nav aria-labelledby="sadrzaj-clanka" className="mt-8 rounded-2xl border border-line bg-white p-5">
          <h2 id="sadrzaj-clanka" className="font-sans text-base font-bold">
            Sadržaj
          </h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            {a.showOverview && all.length > 1 && (
              <li>
                <a href="#brzi-pregled" className="link">
                  Brzi pregled
                </a>
              </li>
            )}
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="link">
                  {s.title}
                </a>
              </li>
            ))}
            {a.closing.length > 0 && (
              <li>
                <a href="#kako-odabrati" className="link">
                  {a.closingTitle}
                </a>
              </li>
            )}
            {a.faq.length > 0 && (
              <li>
                <a href="#pitanja" className="link">
                  Česta pitanja
                </a>
              </li>
            )}
            <li>
              <a href={`#${recipesAnchor.id}`} className="link">
                {recipesAnchor.label}
              </a>
            </li>
          </ol>
        </nav>

        {a.showOverview && all.length > 1 && (
          <section aria-labelledby="brzi-pregled" className="mt-10">
            <h2 id="brzi-pregled" className="scroll-mt-24 text-[1.6rem] font-semibold">
              Brzi pregled
            </h2>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-white">
              <table className="w-full min-w-[34rem] text-left text-[0.95rem]">
                <thead className="bg-sand text-[0.85rem] uppercase tracking-wide text-bordo">
                  <tr>
                    <th scope="col" className="p-3">Jelo</th>
                    <th scope="col" className="p-3">Glavne namirnice</th>
                    <th scope="col" className="p-3">Ukupno vrijeme</th>
                    <th scope="col" className="p-3">Unaprijed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {all.map((it) => (
                    <tr key={it.card.id}>
                      <th scope="row" className="p-3 font-semibold">
                        <Link href={`/recepti/${it.card.slug}/`} className="hover:text-brand">
                          {it.card.title}
                        </Link>
                      </th>
                      <td className="p-3 text-muted">{it.mainIngredients || '—'}</td>
                      <td className="p-3 whitespace-nowrap">{it.card.timeLabel || '—'}</td>
                      <td className="p-3 text-muted">{it.makeAhead || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {sections.map((s) => (
          <section key={s.id} aria-labelledby={s.id} className="mt-12">
            <h2 id={s.id} className="scroll-mt-24 text-[1.7rem] font-semibold leading-tight sm:text-[2rem]">
              {s.title}
            </h2>
            {s.text.map((p, i) => (
              <p key={i} className="mt-3 text-[1.05rem] text-muted">
                {p}
              </p>
            ))}
            <ol className="mt-6 space-y-6">
              {s.items.map((it) => {
                n++
                const c = it.card
                return (
                  <li key={`${s.id}-${c.id}`} className="group relative grid gap-4 rounded-2xl border border-line bg-white p-4 shadow-[var(--shadow-card)] sm:grid-cols-[11rem_minmax(0,1fr)] sm:p-5">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-soft">
                      {c.image ? <Image src={c.image.url} alt="" fill sizes="(min-width: 640px) 176px, 100vw" className="object-cover" /> : <ImagePlaceholder label="" />}
                      <span className="icon-badge absolute left-2 top-2 h-8 w-8 font-serif text-sm font-semibold">{n}</span>
                    </div>
                    <div>
                      <h3 className="font-serif text-[1.35rem] font-semibold leading-snug">
                        <Link href={`/recepti/${c.slug}/`} className="after:absolute after:inset-0 after:content-[''] group-hover:text-bordo">
                          {c.title}
                        </Link>
                      </h3>
                      <p className="mt-1 flex flex-wrap gap-x-4 text-[0.9rem] text-muted">
                        {c.timeLabel && (
                          <span className="inline-flex items-center gap-1.5">
                            <Clock aria-hidden="true" className="h-4 w-4 text-brand" /> {c.timeLabel}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5">
                          <ChefHat aria-hidden="true" className="h-4 w-4 text-brand" /> {difficultyLabels[c.difficulty]}
                        </span>
                      </p>
                      {it.note.map((p, i) => (
                        <p key={i} className="mt-2">
                          {p}
                        </p>
                      ))}
                      <p className="mt-2 inline-flex items-center gap-1 font-semibold text-brand">
                        Pogledajte recept <ArrowRight aria-hidden="true" className="h-4 w-4" />
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>
        ))}

        {a.closing.length > 0 && (
          <section aria-labelledby="kako-odabrati" className="mt-12 rounded-2xl bg-sand p-6">
            <h2 id="kako-odabrati" className="scroll-mt-24 text-[1.6rem] font-semibold">
              {a.closingTitle}
            </h2>
            {a.closing.map((p, i) => (
              <p key={i} className="mt-2">
                {p}
              </p>
            ))}
          </section>
        )}

        {a.faq.length > 0 && (
          <section aria-labelledby="pitanja" className="mt-12">
            <h2 id="pitanja" className="scroll-mt-24 text-[1.6rem] font-semibold">
              Česta pitanja
            </h2>
            <div className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white">
              {a.faq.map((f, i) => (
                <details key={i} className="p-4" open={i === 0}>
                  <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 font-semibold">
                    <CircleHelp aria-hidden="true" className="h-5 w-5 shrink-0 text-brand" /> {f.question}
                  </summary>
                  <p className="mt-2 pl-7">{f.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section aria-labelledby="povezane-ideje" className="mt-12">
            <h2 id="povezane-ideje" className="text-[1.4rem] font-semibold">
              Još ideja
            </h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {related.map((c) => (
                <li key={c.slug}>
                  <Link href={`/ideje/${c.slug}/`} className="ring-logo group flex h-full items-start gap-3 rounded-xl bg-white p-4">
                    <span className="flex-1">
                      <span className="block font-serif text-lg font-semibold group-hover:text-bordo">{c.title}</span>
                      <span className="mt-1 line-clamp-2 block text-muted">{c.intro}</span>
                    </span>
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 text-muted group-hover:text-brand" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {a.relatedGuides.length > 0 && (
          <section aria-labelledby="vodici-clanak" className="mt-12">
            <h2 id="vodici-clanak" className="text-[1.4rem] font-semibold">
              Korisni savjeti
            </h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {a.relatedGuides.map((g) => (
                <li key={g.slug} className="rounded-xl border border-line bg-white p-4">
                  <Link href={`/savjeti/${g.slug}/`} className="font-serif text-lg font-semibold hover:text-brand">
                    {g.title}
                  </Link>
                  <p className="mt-1 line-clamp-2 text-muted">{g.answer}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  )
}
