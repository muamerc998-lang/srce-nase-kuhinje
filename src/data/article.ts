/** Zajednički oblik članka s idejama (stranice obroka i kolekcije /ideje/). */
type Rel<T> = number | T | null | undefined

interface RawArticle {
  headline?: string | null
  author?: Rel<{ name: string; slug?: string | null; role?: string | null; isDemo?: boolean | null }>
  contentUpdatedAt?: string | null
  articleIntro?: string | null
  showOverview?: boolean | null
  sections?:
    | {
        title: string
        text?: string | null
        items?: { recipe: Rel<{ id: number }>; note?: string | null; mainIngredients?: string | null; makeAhead?: string | null }[] | null
      }[]
    | null
  closingTitle?: string | null
  closing?: string | null
  faq?: { question: string; answer: string }[] | null
  relatedGuides?: Rel<{ title: string; slug?: string | null; answer: string; _status?: string | null }>[] | null
  relatedCollections?: Rel<{ title: string; slug?: string | null; _status?: string | null }>[] | null
}

export const paragraphs = (t: string | null | undefined) =>
  (t ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

export function toArticleView(m: RawArticle | null | undefined, fallbackDate: string | null) {
  const obj = <T,>(x: Rel<T>): T | null => (x && typeof x === 'object' ? x : null)
  const author = obj(m?.author)
  return {
    headline: m?.headline || null,
    author: author ? { name: author.name, slug: author.slug ?? '', role: author.role ?? null, isDemo: !!author.isDemo } : null,
    updatedAt: m?.contentUpdatedAt ?? fallbackDate,
    intro: paragraphs(m?.articleIntro),
    showOverview: m?.showOverview ?? true,
    sections: (m?.sections ?? []).map((sec) => ({
      title: sec.title,
      text: paragraphs(sec.text),
      items: (sec.items ?? [])
        .map((it) => ({
          recipeId: obj(it.recipe)?.id ?? (it.recipe as number),
          note: paragraphs(it.note),
          mainIngredients: it.mainIngredients ?? null,
          makeAhead: it.makeAhead ?? null,
        }))
        .filter((it) => !!it.recipeId),
    })),
    closingTitle: m?.closingTitle || 'Kako odabrati',
    closing: paragraphs(m?.closing),
    faq: (m?.faq ?? []).map((q) => ({ question: q.question, answer: q.answer })),
    relatedGuides: (m?.relatedGuides ?? [])
      .map(obj)
      .filter((x): x is NonNullable<typeof x> => !!x && x._status === 'published')
      .map((x) => ({ title: x.title, slug: x.slug ?? '', answer: x.answer })),
    relatedCollectionSlugs: (m?.relatedCollections ?? [])
      .map(obj)
      .filter((x): x is NonNullable<typeof x> => !!x && x._status === 'published')
      .map((x) => x.slug ?? '')
      .filter(Boolean),
  }
}

export type ArticleView = ReturnType<typeof toArticleView>
