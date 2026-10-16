'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { BookHeart, ChevronDown, Coffee, Menu, Moon, Search, Soup, UserRound, X } from 'lucide-react'
import { useStore } from '@/lib/storage/hooks'
import { cookbookStore } from '@/lib/storage/stores'
import { SearchBox } from './SearchBox'
import { Logo } from '../brand/Logo'

export type MenuCategory = { name: string; slug: string; children: { name: string; slug: string }[] }

export const MEALS = [
  { href: '/dorucak/', label: 'Doručak', Icon: Coffee },
  { href: '/rucak/', label: 'Ručak', Icon: Soup },
  { href: '/vecera/', label: 'Večera', Icon: Moon },
]

const MAIN = [
  { href: '/sta-danas-kuhati/', label: 'Šta danas kuhati?' },
  { href: '/ideje/', label: 'Ideje' },
  { href: '/namirnice/', label: 'Namirnice' },
  { href: '/savjeti/', label: 'Savjeti iz kuhinje' },
]

export function CookbookLink({ withLabel }: { withLabel: boolean }) {
  const cb = useStore(cookbookStore)
  const n = cb.items.length
  return (
    <Link
      href="/moja-kuharica/"
      className={withLabel ? 'btn btn-heart min-h-11 px-3.5 text-[0.95rem]' : 'icon-btn text-white hover:bg-white/15'}
      aria-label={withLabel ? undefined : `Moja kuharica${n ? `, sačuvano: ${n}` : ''}`}
    >
      <span className="relative">
        <BookHeart aria-hidden="true" className={`h-6 w-6 ${withLabel ? 'text-brand' : 'text-white'}`} />
        {n > 0 && (
          <span className={`absolute -right-2 -top-2 min-w-5 rounded-full px-1 text-center text-xs font-bold leading-5 ${withLabel ? 'bg-brand text-white' : 'bg-white text-brand'}`} aria-hidden="true">
            {n > 99 ? '99+' : n}
          </span>
        )}
      </span>
      {withLabel && (
        <span className="whitespace-nowrap">
          Moja kuharica{n > 0 && <span className="sr-only">, sačuvano: {n}</span>}
        </span>
      )}
    </Link>
  )
}

export function AccountLink() {
  return (
    <Link href="/moji-recepti/" className="icon-btn ring-logo h-11 w-11 bg-white text-brand" aria-label="Moj profil i recepti čitalaca (prijava)" title="Pošaljite svoj recept">
      <UserRound aria-hidden="true" className="h-5 w-5" />
    </Link>
  )
}

/** "Recepti" je link na sve recepte; strelica otvara uredan meni kategorija. */
export function RecipesMenu({ categories }: { categories: MenuCategory[] }) {
  const [open, setOpen] = useState(false)
  const btn = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    // zatvori meni pri promjeni stranice (bez efekta)
    setLastPath(pathname)
    setOpen(false)
  }
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        btn.current?.focus()
      }
    }
    const onDoc = (e: MouseEvent) => {
      if (!panel.current?.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDoc)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDoc)
    }
  }, [open])

  return (
    <div className="relative flex items-center">
      <Link href="/recepti/" className="rounded-md px-2 py-2 font-semibold text-white hover:text-[#ffd9dd]">
        Recepti
      </Link>
      <button
        ref={btn}
        type="button"
        className="inline-flex h-11 w-8 items-center justify-center rounded-md text-white hover:bg-white/15"
        aria-expanded={open}
        aria-controls="meni-kategorije"
        aria-label="Kategorije recepata"
        onClick={() => setOpen((o) => !o)}
      >
        <ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <div
        ref={panel}
        id="meni-kategorije"
        hidden={!open}
        className="absolute left-0 top-full z-40 mt-2 w-[min(40rem,90vw)] rounded-xl border border-line bg-white p-5 text-ink shadow-xl"
      >
        <ul className="mb-4 grid grid-cols-3 gap-2 border-b border-line pb-4">
          {MEALS.map(({ href, label, Icon }) => (
            <li key={href}>
              <Link href={href} className="flex items-center gap-2 rounded-lg bg-cream px-3 py-2.5 font-semibold hover:bg-soft hover:text-bordo">
                <Icon aria-hidden="true" className="h-5 w-5 text-brand" /> {label}
              </Link>
            </li>
          ))}
        </ul>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/kategorije/${c.slug}/`} className="block rounded-md px-2 py-2 font-semibold hover:bg-soft hover:text-bordo">
                {c.name}
              </Link>
              {c.children.length > 0 && (
                <ul className="mb-2 ml-2 border-l border-line pl-2">
                  {c.children.map((s) => (
                    <li key={s.slug}>
                      <Link href={`/kategorije/${s.slug}/`} className="block rounded-md px-2 py-1.5 text-[0.95rem] text-muted hover:bg-soft hover:text-bordo">
                        {s.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-4 flex flex-wrap gap-x-6 border-t border-line pt-3">
          <Link href="/recepti/" className="link font-semibold">
            Svi recepti
          </Link>
          <Link href="/recepti-citalaca/" className="link font-semibold">
            Recepti čitalaca
          </Link>
        </p>
      </div>
    </div>
  )
}

export function DesktopNav({ categories }: { categories: MenuCategory[] }) {
  const pathname = usePathname()
  return (
    <nav aria-label="Glavna navigacija" className="hidden items-center gap-1 xl:flex">
      <RecipesMenu categories={categories} />
      {MAIN.map((m) => (
        <Link
          key={m.href}
          href={m.href}
          aria-current={pathname.startsWith(m.href) ? 'page' : undefined}
          className="whitespace-nowrap rounded-md px-2.5 py-2 text-[0.98rem] font-semibold text-white hover:bg-white/10 aria-[current=page]:bg-bordo/60 xl:px-3"
        >
          {m.label}
        </Link>
      ))}
    </nav>
  )
}

/** Mobilni meni: dijalog s fokusom unutar, zatvara se Escape tipkom i vraća fokus na dugme. */
export function MobileControls({ categories }: { categories: MenuCategory[] }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const menuBtn = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setMenuOpen(false)
    setSearchOpen(false)
  }

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (menuOpen && !d.open) d.showModal()
    if (!menuOpen && d.open) d.close()
  }, [menuOpen])

  return (
    <>
      <div className="flex items-center gap-1 xl:hidden">
        <button
          type="button"
          className="icon-btn text-white hover:bg-white/15"
          aria-expanded={searchOpen}
          aria-controls="mobilna-pretraga"
          aria-label={searchOpen ? 'Zatvori pretragu' : 'Pretraga'}
          onClick={() => setSearchOpen((o) => !o)}
        >
          {searchOpen ? <X aria-hidden="true" className="h-6 w-6" /> : <Search aria-hidden="true" className="h-6 w-6" />}
        </button>
        <CookbookLink withLabel={false} />
        <button
          ref={menuBtn}
          type="button"
          className="icon-btn text-white hover:bg-white/15"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <Menu aria-hidden="true" className="h-6 w-6" />
          <span className="sr-only">Meni</span>
        </button>
      </div>
      {searchOpen && (
        <div id="mobilna-pretraga" className="absolute inset-x-0 top-full border-b border-line bg-white px-4 py-3 text-ink shadow-md xl:hidden">
          <SearchBox autoFocus />
        </div>
      )}
      <dialog
        ref={dialog}
        aria-label="Meni"
        onClose={() => {
          setMenuOpen(false)
          menuBtn.current?.focus()
        }}
        onClick={(e) => {
          if (e.target === dialog.current) setMenuOpen(false)
        }}
        className="m-0 ml-auto h-dvh max-h-dvh w-[min(22rem,88vw)] max-w-none overflow-y-auto bg-white p-0 text-ink backdrop:bg-black/40"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-2">
          <Logo compact />
          <button type="button" className="icon-btn hover:bg-soft" onClick={() => setMenuOpen(false)}>
            <X aria-hidden="true" className="h-6 w-6" />
            <span className="sr-only">Zatvori meni</span>
          </button>
        </div>
        <nav aria-label="Mobilna navigacija" className="px-2 py-3">
          <ul>
            <li className="mb-2 grid grid-cols-3 gap-2 px-1">
              {MEALS.map(({ href, label, Icon }) => (
                <Link key={href} href={href} className="flex flex-col items-center gap-1 rounded-xl bg-cream px-2 py-3 text-[0.95rem] font-semibold hover:bg-soft">
                  <Icon aria-hidden="true" className="h-6 w-6 text-brand" /> {label}
                </Link>
              ))}
            </li>
            <li>
              <Link href="/recepti/" className="block rounded-md px-3 py-3 text-lg font-semibold hover:bg-soft">
                Svi recepti
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/kategorije/${c.slug}/`} className="block rounded-md px-3 py-2.5 pl-6 hover:bg-soft">
                  {c.name}
                </Link>
              </li>
            ))}
            {MAIN.map((m) => (
              <li key={m.href} className="first:mt-2">
                <Link href={m.href} className="block rounded-md px-3 py-3 text-lg font-semibold hover:bg-soft">
                  {m.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/moja-kuharica/" className="block rounded-md px-3 py-3 text-lg font-semibold hover:bg-soft">
                Moja kuharica
              </Link>
            </li>
            <li>
              <Link href="/moj-plan/" className="block rounded-md px-3 py-3 hover:bg-soft">
                Moj plan
              </Link>
            </li>
            <li>
              <Link href="/lista-za-kupovinu/" className="block rounded-md px-3 py-3 hover:bg-soft">
                Lista za kupovinu
              </Link>
            </li>
            <li>
              <Link href="/recepti-citalaca/" className="block rounded-md px-3 py-3 hover:bg-soft">
                Recepti čitalaca
              </Link>
            </li>
            <li className="px-3 pt-2">
              <Link href="/moji-recepti/" className="btn btn-heart w-full">
                <UserRound aria-hidden="true" className="h-5 w-5" /> Pošalji svoj recept
              </Link>
            </li>
          </ul>
        </nav>
      </dialog>
    </>
  )
}
