import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { JsonLd } from '../seo/JsonLd'
import { siteUrl } from '@/data/payload'

export type Crumb = { name: string; href: string }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all = [{ name: 'Početna', href: '/' }, ...items]
  return (
    <>
      <nav aria-label="Putanja" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          {all.map((c, i) => (
            <li key={c.href} className="inline-flex items-center gap-1.5">
              {i > 0 && <span aria-hidden="true">/</span>}
              {i === all.length - 1 ? (
                <span aria-current="page">{c.name}</span>
              ) : (
                <Link href={c.href} className="py-1 underline-offset-2 hover:text-brand hover:underline">
                  {c.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: all.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: c.name,
            item: `${siteUrl()}${c.href}`,
          })),
        }}
      />
    </>
  )
}

/** Linkovana paginacija (svaka stranica ima vlastiti URL). */
export function Pagination({ page, totalPages, hrefFor }: { page: number; totalPages: number; hrefFor: (p: number) => string }) {
  if (totalPages <= 1) return null
  const pages: (number | '…')[] = []
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) pages.push(p)
    else if (pages[pages.length - 1] !== '…') pages.push('…')
  }
  return (
    <nav aria-label="Stranice rezultata" className="mt-10 flex justify-center">
      <ul className="flex flex-wrap items-center gap-1">
        <li>
          {page > 1 ? (
            <Link href={hrefFor(page - 1)} className="btn btn-ghost" rel="prev">
              <ChevronLeft aria-hidden="true" className="h-5 w-5" /> Prethodna
            </Link>
          ) : null}
        </li>
        {pages.map((p, i) => (
          <li key={i}>
            {p === '…' ? (
              <span className="px-2 text-muted">…</span>
            ) : p === page ? (
              <span aria-current="page" className="btn min-w-11 bg-brand text-white">
                {p}
              </span>
            ) : (
              <Link href={hrefFor(p)} className="btn btn-ghost min-w-11" aria-label={`Stranica ${p}`}>
                {p}
              </Link>
            )}
          </li>
        ))}
        <li>
          {page < totalPages ? (
            <Link href={hrefFor(page + 1)} className="btn btn-ghost" rel="next">
              Sljedeća <ChevronRight aria-hidden="true" className="h-5 w-5" />
            </Link>
          ) : null}
        </li>
      </ul>
    </nav>
  )
}

export function DemoNotice({ what = 'Ovaj sadržaj' }: { what?: string }) {
  return (
    <p className="no-print rounded-lg border border-[#e9d48a] bg-warning-bg px-4 py-3 text-warning-ink">
      <strong>Demonstracijski sadržaj.</strong> {what} služi samo za razvoj i nije odobren za javnu objavu.
    </p>
  )
}
