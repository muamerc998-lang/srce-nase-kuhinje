'use client'
import Link from 'next/link'
import { History } from 'lucide-react'
import { useStore, useHydrated } from '@/lib/storage/hooks'
import { recentStore } from '@/lib/storage/stores'

/** Nedavno pregledani recepti (lokalno, ograničen broj). Prazan blok se ne prikazuje. */
export function RecentlyViewed({ excludeUid }: { excludeUid?: string }) {
  const items = useStore(recentStore).filter((i) => i.uid !== excludeUid)
  const hydrated = useHydrated()
  if (!hydrated || items.length === 0) return null
  return (
    <section aria-labelledby="nedavno" className="no-print">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 id="nedavno" className="flex items-center gap-2 text-[1.5rem] font-semibold">
          <History aria-hidden="true" className="h-6 w-6 text-brand" /> Nedavno pregledano
        </h2>
        <button type="button" className="btn btn-ghost text-[0.95rem]" onClick={() => recentStore.set([])}>
          Očisti
        </button>
      </div>
      <ul className="mt-3 flex gap-3 overflow-x-auto pb-2">
        {items.map((i) => (
          <li key={i.uid} className="shrink-0">
            <Link href={`/recepti/${i.slug}/`} className="chip max-w-[16rem] truncate">
              {i.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
