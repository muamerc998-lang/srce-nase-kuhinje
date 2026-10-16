'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useRef, useState } from 'react'
import { Download, Heart, Plus, Trash2, Upload, AlertTriangle } from 'lucide-react'
import { useStore, useHydrated } from '@/lib/storage/hooks'
import { cookbookStore, exportCookbook, importCookbook, DEFAULT_LISTS } from '@/lib/storage/stores'
import { newId } from '@/lib/storage/store'
import { normalizeText } from '@/lib/text/normalize'
import { announce } from '../ui/Announcer'
import { useRemoteRecipes } from './useRemoteRecipes'

export function Cookbook() {
  const cb = useStore(cookbookStore)
  const hydrated = useHydrated()
  const remote = useRemoteRecipes(cb.items.map((i) => i.uid))
  const [q, setQ] = useState('')
  const [list, setList] = useState<string>('sve')
  const [newList, setNewList] = useState('')
  const [importError, setImportError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const visible = useMemo(() => {
    const nq = normalizeText(q)
    return cb.items.filter((i) => (list === 'sve' || i.lists.includes(list)) && (!nq || normalizeText(i.title).includes(nq)))
  }, [cb.items, q, list])

  if (!hydrated) {
    return <p className="mt-8 text-muted">Učitavam vašu kuharicu…</p>
  }

  const persistent = cookbookStore.persistent()
  const error = cookbookStore.lastError()

  const remove = (uid: string) => {
    const item = cb.items.find((i) => i.uid === uid)
    if (!item) return
    cookbookStore.set((c) => ({ ...c, items: c.items.filter((i) => i.uid !== uid) }))
    announce(`„${item.title}“ je uklonjen iz kuharice.`, { undo: () => cookbookStore.set((c) => ({ ...c, items: [...c.items, item] })) })
  }
  const toggleList = (uid: string, listId: string) =>
    cookbookStore.set((c) => ({
      ...c,
      items: c.items.map((i) => (i.uid === uid ? { ...i, lists: i.lists.includes(listId) ? i.lists.filter((l) => l !== listId) : [...i.lists, listId] } : i)),
    }))

  const doExport = () => {
    const blob = new Blob([exportCookbook(cb)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `moja-kuharica-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
    announce('Kuharica je izvezena u datoteku.')
  }

  const doImport = async (file: File) => {
    setImportError(null)
    const text = await file.text()
    const r = importCookbook(text, cookbookStore.get())
    if (!r.ok) {
      setImportError(r.error)
      return
    }
    cookbookStore.set(r.cookbook)
    announce(`Uvoz završen: dodano ${r.added} recepata.`)
  }

  return (
    <div className="mt-6">
      {!persistent && (
        <p role="alert" className="mb-4 flex gap-2 rounded-lg bg-warning-bg p-4 text-warning-ink">
          <AlertTriangle aria-hidden="true" className="h-5 w-5 shrink-0" />
          Vaš preglednik trenutno ne dozvoljava lokalno čuvanje (npr. privatni način ili blokirani podaci). Sačuvani recepti važe samo dok je
          stranica otvorena.
        </p>
      )}
      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-warning-bg p-4 text-warning-ink">
          {error} Rezervna kopija starih podataka je sačuvana u pregledniku.
        </p>
      )}

      {cb.items.length === 0 ? (
        <div className="rounded-2xl border border-line bg-cream p-8 text-center">
          <Heart aria-hidden="true" className="mx-auto h-10 w-10 text-brand" />
          <h2 className="mt-3 text-2xl font-semibold">Vaša kuharica je prazna</h2>
          <p className="mx-auto mt-2 max-w-md text-muted">
            Kliknite srce na kartici ili stranici recepta i recept će se pojaviti ovdje — bez registracije.
          </p>
          <Link href="/recepti/" className="btn btn-primary mt-5">
            Istražite recepte
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <aside>
            <h2 className="font-sans text-base font-bold">Moje kolekcije</h2>
            <ul className="mt-2 space-y-1">
              {[{ id: 'sve', name: 'Sve sačuvano' }, ...cb.lists].map((l) => {
                const n = l.id === 'sve' ? cb.items.length : cb.items.filter((i) => i.lists.includes(l.id)).length
                const custom = !DEFAULT_LISTS.some((d) => d.id === l.id) && l.id !== 'sve'
                return (
                  <li key={l.id} className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-pressed={list === l.id}
                      onClick={() => setList(l.id)}
                      className={`flex min-h-11 flex-1 items-center justify-between rounded-md px-3 text-left ${list === l.id ? 'bg-soft font-semibold text-bordo' : 'hover:bg-soft'}`}
                    >
                      {l.name} <span className="text-sm text-muted">{n}</span>
                    </button>
                    {custom && (
                      <button
                        type="button"
                        className="icon-btn h-9 w-9 hover:bg-soft"
                        aria-label={`Obriši kolekciju ${l.name}`}
                        onClick={() => {
                          cookbookStore.set((c) => ({ lists: c.lists.filter((x) => x.id !== l.id), items: c.items.map((i) => ({ ...i, lists: i.lists.filter((x) => x !== l.id) })) }))
                          setList('sve')
                        }}
                      >
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                const name = newList.trim().slice(0, 60)
                if (!name) return
                cookbookStore.set((c) => ({ ...c, lists: [...c.lists, { id: newId(), name }] }))
                setNewList('')
                announce(`Kolekcija „${name}“ je napravljena.`)
              }}
            >
              <label htmlFor="nova-kolekcija" className="sr-only">
                Nova kolekcija
              </label>
              <input id="nova-kolekcija" className="field min-h-10 py-1" placeholder="Nova kolekcija" value={newList} onChange={(e) => setNewList(e.target.value)} maxLength={60} />
              <button type="submit" className="icon-btn border border-line" aria-label="Dodaj kolekciju">
                <Plus aria-hidden="true" className="h-5 w-5" />
              </button>
            </form>
          </aside>

          <div>
            <div className="max-w-sm">
              <label htmlFor="trazi-kuharicu" className="label">
                Pretraži sačuvano
              </label>
              <input id="trazi-kuharicu" type="search" className="field" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            {remote.status === 'offline' && (
              <p className="mt-3 text-sm text-muted">Niste povezani na internet — prikazujemo lokalno sačuvane podatke.</p>
            )}
            <p className="mt-4 font-semibold" role="status">
              {visible.length} od {cb.items.length}
            </p>
            {visible.length === 0 ? (
              <p className="mt-3 text-muted">Nema recepata u ovom izboru.</p>
            ) : (
              <ul className="mt-3 grid gap-4 sm:grid-cols-2">
                {visible.map((item) => {
                  const r = remote.byUid.get(item.uid)
                  const missing = remote.missing.has(item.uid)
                  const img = r?.card.image?.url ?? item.image
                  return (
                    <li key={item.uid} className={`flex gap-3 rounded-xl border p-3 ${missing ? 'border-dashed border-[#cdbfc1] bg-cream' : 'border-line bg-white'}`}>
                      <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-lg bg-soft">
                        {img && !missing && <Image src={img} alt="" fill sizes="112px" className="object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        {missing ? (
                          <>
                            <p className="font-semibold">{item.title}</p>
                            <p className="text-sm text-muted">Ovaj recept više nije dostupan.</p>
                          </>
                        ) : (
                          <Link href={`/recepti/${r?.card.slug ?? item.slug}/`} className="font-serif text-lg font-semibold hover:text-brand">
                            {r?.card.title ?? item.title}
                          </Link>
                        )}
                        {!missing && cb.lists.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label={`Kolekcije za ${item.title}`}>
                            {cb.lists.map((l) => (
                              <button
                                key={l.id}
                                type="button"
                                aria-pressed={item.lists.includes(l.id)}
                                onClick={() => toggleList(item.uid, l.id)}
                                className={`chip min-h-9 text-sm ${item.lists.includes(l.id) ? 'border-brand bg-soft font-semibold text-bordo' : ''}`}
                              >
                                {l.name}
                              </button>
                            ))}
                          </div>
                        )}
                        <button type="button" className="mt-2 inline-flex min-h-10 items-center gap-1 text-sm text-muted hover:text-brand" onClick={() => remove(item.uid)}>
                          <Trash2 aria-hidden="true" className="h-4 w-4" /> Ukloni
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      <section aria-labelledby="sigurnosna-kopija" className="mt-12 rounded-2xl border border-line p-5">
        <h2 id="sigurnosna-kopija" className="text-xl font-semibold">
          Sigurnosna kopija kuharice
        </h2>
        <p className="mt-2 text-muted">
          Kuharica se čuva samo u ovom pregledniku i na ovom uređaju. Brisanjem podataka preglednika može nestati. Izvezite je u datoteku i
          uvezite na drugom uređaju ili pregledniku.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="btn btn-secondary" onClick={doExport} disabled={cb.items.length === 0}>
            <Download aria-hidden="true" className="h-5 w-5" /> Izvezi kuharicu
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => fileRef.current?.click()}>
            <Upload aria-hidden="true" className="h-5 w-5" /> Uvezi iz datoteke
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            tabIndex={-1}
            aria-label="Odaberite datoteku za uvoz kuharice"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void doImport(f)
              e.target.value = ''
            }}
          />
        </div>
        {importError && (
          <p role="alert" className="mt-3 rounded-lg bg-soft px-4 py-3 text-bordo">
            Uvoz nije uspio: {importError}
          </p>
        )}
      </section>
    </div>
  )
}
