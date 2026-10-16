'use client'
import { useEffect, useRef, useState } from 'react'
import { ArrowDown, BookOpen, ListOrdered, Heart, Printer, Share2 } from 'lucide-react'
import { useStore, useHydrated } from '@/lib/storage/hooks'
import { cookbookStore, recentStore, RECENT_LIMIT } from '@/lib/storage/stores'
import { SaveButton, toggleSaved, type SaveTarget } from './SaveButton'
import { announce } from '../ui/Announcer'

export function PrintButton() {
  const [open, setOpen] = useState(false)
  const print = (photo: boolean) => {
    document.documentElement.dataset.printPhoto = photo ? 'da' : 'ne'
    setOpen(false)
    setTimeout(() => window.print(), 50)
  }
  return (
    <div className="relative">
      <button type="button" className="btn btn-secondary" aria-expanded={open} aria-controls="opcije-stampe" onClick={() => setOpen((o) => !o)}>
        <Printer aria-hidden="true" className="h-5 w-5" /> Štampaj
      </button>
      <div id="opcije-stampe" hidden={!open} className="absolute left-0 top-full z-30 mt-1 w-56 rounded-lg border border-line bg-white p-1 shadow-lg">
        <button type="button" className="block w-full rounded-md px-3 py-2.5 text-left hover:bg-soft" onClick={() => print(true)}>
          S fotografijom
        </button>
        <button type="button" className="block w-full rounded-md px-3 py-2.5 text-left hover:bg-soft" onClick={() => print(false)}>
          Bez fotografije (manje tinte)
        </button>
      </div>
    </div>
  )
}

export function ShareButton({ title, url }: { title: string; url: string }) {
  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={async () => {
        if (navigator.share) {
          try {
            await navigator.share({ title, url })
            return
          } catch (e) {
            if ((e as Error).name === 'AbortError') return
          }
        }
        try {
          await navigator.clipboard.writeText(url)
          announce('Link na recept je kopiran.')
        } catch {
          announce('Kopiranje nije uspjelo. Link možete kopirati iz adresne trake.', { tone: 'error' })
        }
      }}
    >
      <Share2 aria-hidden="true" className="h-5 w-5" /> Podijeli
    </button>
  )
}

export function RecipeActions({ recipe, canonical }: { recipe: SaveTarget; canonical: string }) {
  return (
    <div id="radnje-recepta" className="no-print flex flex-wrap gap-2">
      <a href="#recept" className="btn btn-primary">
        <ArrowDown aria-hidden="true" className="h-5 w-5" /> Idi na recept
      </a>
      <SaveButton recipe={recipe} variant="full" />
      <PrintButton />
      <ShareButton title={recipe.title} url={canonical} />
    </div>
  )
}

/**
 * Donja traka na telefonu: pojavljuje se tek kad gornje radnje nisu vidljive,
 * skriva se u načinu kuhanja i dok je tastatura otvorena (fokus u polju),
 * a stranica dobija donji razmak da traka ne prekriva tekst.
 */
export function MobileRecipeBar({ recipe }: { recipe: SaveTarget }) {
  const [visible, setVisible] = useState(false)
  const [typing, setTyping] = useState(false)
  const cb = useStore(cookbookStore)
  const hydrated = useHydrated()
  const saved = hydrated && cb.items.some((i) => i.uid === recipe.uid)
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const target = document.getElementById('radnje-recepta')
    if (!target || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([e]) => setVisible(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 })
    io.observe(target)
    const onFocusIn = (e: FocusEvent) => {
      const el = e.target as HTMLElement
      setTyping(['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) && (el as HTMLInputElement).type !== 'checkbox')
    }
    const onFocusOut = () => setTyping(false)
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    return () => {
      io.disconnect()
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
    }
  }, [])

  const show = visible && !typing
  useEffect(() => {
    document.body.classList.toggle('pb-16', show)
    document.body.classList.toggle('lg:pb-0', show)
    return () => document.body.classList.remove('pb-16', 'lg:pb-0')
  }, [show])

  return (
    <div
      ref={bar}
      className={`no-print fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur transition-transform lg:hidden [html[data-cooking='1']_&]:hidden ${
        show ? 'translate-y-0' : 'pointer-events-none translate-y-full'
      }`}
      aria-hidden={!show}
      inert={!show}
    >
      <nav aria-label="Brzi skok na recept" className="grid grid-cols-3">
        <a href="#sastojci" className="flex min-h-14 flex-col items-center justify-center text-sm font-semibold">
          <BookOpen aria-hidden="true" className="h-5 w-5 text-brand" /> Sastojci
        </a>
        <a href="#priprema" className="flex min-h-14 flex-col items-center justify-center text-sm font-semibold">
          <ListOrdered aria-hidden="true" className="h-5 w-5 text-brand" /> Koraci
        </a>
        <button type="button" className="flex min-h-14 flex-col items-center justify-center text-sm font-semibold" aria-pressed={saved} onClick={() => toggleSaved(recipe)}>
          <Heart aria-hidden="true" className="h-5 w-5 text-brand" fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Sačuvano' : 'Sačuvaj'}
        </button>
      </nav>
    </div>
  )
}

export function RecentTracker({ recipe }: { recipe: SaveTarget }) {
  useEffect(() => {
    recentStore.set((items) => [
      { uid: recipe.uid, slug: recipe.slug, title: recipe.title, image: recipe.image, viewedAt: new Date().toISOString() },
      ...items.filter((i) => i.uid !== recipe.uid),
    ].slice(0, RECENT_LIMIT))
  }, [recipe.uid, recipe.slug, recipe.title, recipe.image])
  return null
}
