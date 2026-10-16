import Link from 'next/link'
import { ArrowRight, CalendarClock, CookingPot, Package, Timer, Utensils, type LucideIcon } from 'lucide-react'

/** Naslov sekcije: mala oznaka iznad, naslov i opcionalni link desno. */
export function SectionHead({
  id,
  eyebrow,
  title,
  text,
  href,
  linkLabel,
  invert = false,
}: {
  id: string
  eyebrow?: string
  title: string
  text?: string
  href?: string
  linkLabel?: string
  invert?: boolean
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="max-w-2xl">
        {eyebrow && <p className={`eyebrow ${invert ? 'text-[#f3c7cc]' : ''}`}>{eyebrow}</p>}
        <h2 id={id} className={`mt-2 text-[1.75rem] font-semibold leading-tight sm:text-[2.1rem] ${invert ? 'text-white' : ''}`}>
          {title}
        </h2>
        {text && <p className={`mt-2 ${invert ? 'text-white/85' : 'text-muted'}`}>{text}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className={`inline-flex min-h-11 items-center gap-1.5 font-semibold ${invert ? 'text-white hover:text-[#f3c7cc]' : 'text-brand hover:text-bordo'}`}
        >
          {linkLabel} <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}

/** Ikona za brzi izbor prema nazivu kolekcije (bez emoji ikona). */
export function quickIcon(label: string): LucideIcon {
  const l = label.toLowerCase()
  if (l.includes('minut') || l.includes('brz')) return Timer
  if (l.includes('posud') || l.includes('lonc') || l.includes('tepsij')) return CookingPot
  if (l.includes('ponijeti')) return Package
  if (l.includes('sutra')) return CalendarClock
  return Utensils
}
