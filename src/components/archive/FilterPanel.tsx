'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SlidersHorizontal, X } from 'lucide-react'
import type { SearchState } from '@/lib/search/params'

export interface FilterOptions {
  categories: Array<{ slug: string; name: string; count: number; depth: number }>
  ingredients: Array<{ slug: string; name: string; count: number }>
  methods: ReadonlyArray<{ value: string; label: string }>
  difficulties: ReadonlyArray<{ value: string; label: string }>
  diets: ReadonlyArray<{ value: string; label: string }>
  meals: ReadonlyArray<{ value: string; label: string }>
  times: readonly number[]
  tags: Array<{ slug: string; name: string; count: number; group: string }>
  /** koje grupe prikazati */
  groups: Array<'kategorija' | 'obrok' | 'meso' | 'sastojci' | 'bez' | 'vrijeme' | 'metoda' | 'tezina' | 'ishrana' | 'glavna' | 'tijesto'>
}

function Check({ name, value, label, checked, count }: { name: string; value: string; label: string; checked: boolean; count?: number }) {
  return (
    <label className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-1 hover:bg-soft">
      <input type="checkbox" name={name} value={value} defaultChecked={checked} className="h-5 w-5 shrink-0 accent-[var(--color-brand)]" />
      <span className="flex-1">{label}</span>
      {count != null && <span className="text-sm text-muted">{count}</span>}
    </label>
  )
}

function Group({ title, children, open = true }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details open={open} className="border-b border-line py-3">
      <summary className="flex min-h-11 cursor-pointer items-center font-semibold">{title}</summary>
      <div className="mt-1">{children}</div>
    </details>
  )
}

function FilterableList({
  items,
  name,
  selected,
  label,
}: {
  items: FilterOptions['ingredients']
  name: string
  selected: string[]
  label: string
}) {
  const [q, setQ] = useState('')
  const shown = items.filter((i) => selected.includes(i.slug) || !q || i.name.toLowerCase().includes(q.toLowerCase()))
  return (
    <div>
      <label className="sr-only" htmlFor={`trazi-${name}`}>
        {label}
      </label>
      <input
        id={`trazi-${name}`}
        type="search"
        className="field mb-2 min-h-10 py-1.5 text-[0.95rem]"
        placeholder="Nađi namirnicu…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="max-h-60 overflow-y-auto pr-1">
        {shown.map((i) => (
          <Check key={i.slug} name={name} value={i.slug} label={i.name} checked={selected.includes(i.slug)} count={i.count} />
        ))}
      </div>
    </div>
  )
}

export function FilterForm({ state, options, hiddenScope }: { state: SearchState; options: FilterOptions; hiddenScope?: string }) {
  const g = new Set(options.groups)
  return (
    <>
      {state.q && <input type="hidden" name="q" value={state.q} />}
      {state.sort !== (state.q ? 'relevantnost' : 'najnovije') && <input type="hidden" name="sort" value={state.sort} />}
      {hiddenScope && <input type="hidden" name="opseg" value={hiddenScope} />}
      {g.has('kategorija') && options.categories.length > 0 && (
        <Group title="Kategorija">
          {options.categories.map((c) => (
            <div key={c.slug} style={{ paddingLeft: c.depth * 16 }}>
              <Check name="kategorija" value={c.slug} label={c.name} count={c.count} checked={state.kategorija.includes(c.slug)} />
            </div>
          ))}
        </Group>
      )}
      {g.has('obrok') && (
        <Group title="Obrok">
          {options.meals.map((m) => (
            <Check key={m.value} name="obrok" value={m.value} label={m.label} checked={state.obrok.includes(m.value)} />
          ))}
        </Group>
      )}
      {g.has('meso') && (
        <Group title="Meso">
          {[
            ['', 'Svejedno'],
            ['da', 'S mesom'],
            ['ne', 'Bez mesa'],
          ].map(([v, l]) => (
            <label key={v} className="flex min-h-10 items-center gap-2.5 px-1">
              <input type="radio" name="meso" value={v} defaultChecked={(state.meso ?? '') === v} className="h-5 w-5 accent-[var(--color-brand)]" />
              {l}
            </label>
          ))}
        </Group>
      )}
      {g.has('vrijeme') && (
        <Group title="Ukupno vrijeme">
          <label className="flex min-h-10 items-center gap-2.5 px-1">
            <input type="radio" name="vrijeme" value="" defaultChecked={!state.vrijeme} className="h-5 w-5 accent-[var(--color-brand)]" />
            Bilo koje
          </label>
          {options.times.map((t) => (
            <label key={t} className="flex min-h-10 items-center gap-2.5 px-1">
              <input type="radio" name="vrijeme" value={t} defaultChecked={state.vrijeme === t} className="h-5 w-5 accent-[var(--color-brand)]" />
              do {t < 60 ? `${t} min` : `${t / 60} h`}
            </label>
          ))}
        </Group>
      )}
      {g.has('sastojci') && options.ingredients.length > 0 && (
        <Group title="Sa sastojcima" open={state.sastojci.length > 0}>
          <fieldset className="mb-2">
            <legend className="text-sm text-muted">Kad odaberete više namirnica, recept treba sadržavati:</legend>
            <label className="mr-4 inline-flex min-h-10 items-center gap-2">
              <input type="radio" name="nacin" value="sve" defaultChecked={state.sastojciNacin === 'sve'} className="h-5 w-5 accent-[var(--color-brand)]" />
              sve odabrane
            </label>
            <label className="inline-flex min-h-10 items-center gap-2">
              <input type="radio" name="nacin" value="bilo" defaultChecked={state.sastojciNacin === 'bilo'} className="h-5 w-5 accent-[var(--color-brand)]" />
              bilo koju
            </label>
          </fieldset>
          <FilterableList items={options.ingredients} name="sastojci" selected={state.sastojci} label="Pretraži namirnice za uključivanje" />
        </Group>
      )}
      {g.has('bez') && options.ingredients.length > 0 && (
        <Group title="Bez sastojka" open={state.bez.length > 0}>
          <p className="mb-2 text-sm text-muted">Isključuje recepte u kojima je namirnica obavezna i nezamjenjiva.</p>
          <FilterableList items={options.ingredients} name="bez" selected={state.bez} label="Pretraži namirnice za isključivanje" />
        </Group>
      )}
      {g.has('glavna') && options.tags.some((t) => t.group === 'namirnica') && (
        <Group title="Glavna namirnica" open={state.oznaka.length > 0}>
          <FilterableList items={options.tags.filter((t) => t.group === 'namirnica')} name="oznaka" selected={state.oznaka} label="Pretraži glavne namirnice" />
        </Group>
      )}
      {g.has('tijesto') && options.tags.some((t) => t.group === 'tijesto') && (
        <Group title="Vrsta tijesta" open={options.tags.some((t) => t.group === 'tijesto' && state.oznaka.includes(t.slug))}>
          {options.tags
            .filter((t) => t.group === 'tijesto')
            .map((t) => (
              <Check key={t.slug} name="oznaka" value={t.slug} label={t.name} count={t.count} checked={state.oznaka.includes(t.slug)} />
            ))}
        </Group>
      )}
      {g.has('metoda') && (
        <Group title="Način pripreme" open={state.metoda.length > 0}>
          {options.methods.map((m) => (
            <Check key={m.value} name="metoda" value={m.value} label={m.label} checked={state.metoda.includes(m.value)} />
          ))}
        </Group>
      )}
      {g.has('tezina') && (
        <Group title="Težina" open={state.tezina.length > 0}>
          {options.difficulties.map((m) => (
            <Check key={m.value} name="tezina" value={m.value} label={m.label} checked={state.tezina.includes(m.value)} />
          ))}
        </Group>
      )}
      {g.has('ishrana') && (
        <Group title="Prehrambena svojstva" open={state.ishrana.length > 0}>
          <p className="mb-1 text-sm text-muted">Recept mora imati sva odabrana svojstva.</p>
          {options.diets.map((m) => (
            <Check key={m.value} name="ishrana" value={m.value} label={m.label} checked={state.ishrana.includes(m.value)} />
          ))}
        </Group>
      )}
      <noscript>
        <button type="submit" className="btn btn-primary mt-4 w-full">
          Primijeni filtere
        </button>
      </noscript>
    </>
  )
}

/** Normalizuje FormData u query string (višestruke vrijednosti → zarez), bez praznih polja. */
function formToQuery(form: HTMLFormElement): string {
  const fd = new FormData(form)
  const map = new Map<string, string[]>()
  fd.forEach((v, k) => {
    const s = String(v).trim()
    if (!s) return
    map.set(k, [...(map.get(k) ?? []), s])
  })
  if ((map.get('sastojci')?.length ?? 0) < 2 || map.get('nacin')?.[0] === 'sve') map.delete('nacin')
  const p = new URLSearchParams()
  for (const [k, v] of map) p.set(k, v.join(','))
  return p.toString().replace(/%2C/g, ',')
}

export function FilterPanel({
  state,
  options,
  action,
  total,
  activeCount,
  scope,
}: {
  state: SearchState
  options: FilterOptions
  action: string
  total: number
  activeCount: number
  scope?: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState<number | null>(total)
  const dialog = useRef<HTMLDialogElement>(null)
  const btn = useRef<HTMLButtonElement>(null)
  const mobileForm = useRef<HTMLFormElement>(null)
  const abort = useRef<AbortController | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  const recount = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      if (!mobileForm.current) return
      abort.current?.abort()
      const ctrl = new AbortController()
      abort.current = ctrl
      try {
        const qs = formToQuery(mobileForm.current)
        const res = await fetch(`/api/site/count/?${qs}${scope ? `&${scope}` : ''}`, { signal: ctrl.signal })
        const data = await res.json()
        setCount(typeof data.count === 'number' ? data.count : null)
      } catch {
        /* zanemari */
      }
    }, 300)
  }

  const submit = (form: HTMLFormElement) => {
    const qs = formToQuery(form)
    setOpen(false)
    router.push(`${action}${qs ? `?${qs}` : ''}`)
  }

  return (
    <>
      {/* Desktop: bočni obrazac */}
      <form
        action={action}
        method="get"
        className="filters-form hidden lg:block"
        aria-label="Filteri"
        onSubmit={(e) => {
          e.preventDefault()
          submit(e.currentTarget)
        }}
      >
        <h2 className="font-sans text-lg font-bold">Filteri</h2>
        <FilterForm state={state} options={options} />
        <button type="submit" className="btn btn-primary mt-4 w-full">
          Primijeni filtere
        </button>
      </form>
      <noscript>
        <style>{'.filters-form{display:block!important}'}</style>
      </noscript>

      {/* Mobilno: dugme + panel */}
      <button ref={btn} type="button" className="btn btn-secondary lg:hidden" aria-haspopup="dialog" onClick={() => setOpen(true)}>
        <SlidersHorizontal aria-hidden="true" className="h-5 w-5" /> Filteri{activeCount > 0 ? ` (${activeCount})` : ''}
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="filteri-naslov"
        onClose={() => {
          setOpen(false)
          btn.current?.focus()
        }}
        className="m-0 mt-auto max-h-[90dvh] w-full max-w-none rounded-t-2xl bg-white p-0 backdrop:bg-black/40 lg:hidden"
      >
        <form
          ref={mobileForm}
          action={action}
          method="get"
          className="flex max-h-[90dvh] flex-col"
          onChange={recount}
          onSubmit={(e) => {
            e.preventDefault()
            submit(e.currentTarget)
          }}
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-2">
            <h2 id="filteri-naslov" className="font-sans text-lg font-bold">
              Filteri
            </h2>
            <button type="button" className="icon-btn hover:bg-soft" onClick={() => setOpen(false)}>
              <X aria-hidden="true" className="h-6 w-6" />
              <span className="sr-only">Zatvori filtere</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4">
            {open && <FilterForm state={state} options={options} />}
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-line p-3">
            <a href={`${action}${state.q ? `?q=${encodeURIComponent(state.q)}` : ''}`} className="btn btn-secondary">
              Očisti
            </a>
            <button type="submit" className="btn btn-primary">
              Primijeni{count != null ? ` (${count})` : ''}
            </button>
          </div>
        </form>
      </dialog>
    </>
  )
}

export function SortSelect({ state, action }: { state: SearchState; action: string }) {
  const options = [
    ...(state.q ? [{ v: 'relevantnost', l: 'Najrelevantnije' }] : []),
    { v: 'najnovije', l: 'Najnovije' },
    { v: 'najbrze', l: 'Najkraće ukupno vrijeme' },
  ]
  return (
    <form action={action} method="get" className="flex items-center gap-2">
      {Object.entries({
        q: state.q,
        kategorija: state.kategorija.join(','),
        sastojci: state.sastojci.join(','),
        nacin: state.sastojci.length > 1 && state.sastojciNacin === 'bilo' ? 'bilo' : '',
        bez: state.bez.join(','),
        vrijeme: state.vrijeme ? String(state.vrijeme) : '',
        metoda: state.metoda.join(','),
        tezina: state.tezina.join(','),
        obrok: state.obrok.join(','),
        meso: state.meso ?? '',
        ishrana: state.ishrana.join(','),
        oznaka: state.oznaka.join(','),
      })
        .filter(([, v]) => v)
        .map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
      <label htmlFor="sortiranje" className="text-[0.95rem] text-muted">
        Poredaj:
      </label>
      <select
        id="sortiranje"
        name="sort"
        defaultValue={state.sort}
        className="field w-auto py-1.5"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
      <noscript>
        <button type="submit" className="btn btn-secondary">
          U redu
        </button>
      </noscript>
    </form>
  )
}
