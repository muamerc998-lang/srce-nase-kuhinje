import Image from 'next/image'
import Link from 'next/link'
import { Clock, Flame, Hourglass, Users, ChefHat, Ruler, Thermometer, CircleHelp } from 'lucide-react'
import type { RecipeView } from '@/data/recipes'
import { difficultyLabels, formatDuration } from '@/lib/recipes/time'
import { StepTimerButton } from './TimerDock'

const ovenLabels: Record<string, string> = {
  'gornji-donji': 'gornji i donji grijač',
  ventilator: 'ventilator',
  donji: 'donji grijač',
  gornji: 'gornji grijač',
}

export function RecipeFacts({ recipe }: { recipe: RecipeView }) {
  const t = recipe.times
  const facts: Array<{ icon: React.ReactNode; label: string; value: string }> = []
  if (t.prepMinutes) facts.push({ icon: <Clock className="h-5 w-5" />, label: 'Priprema', value: formatDuration(t.prepMinutes) })
  if (t.cookMinutes) facts.push({ icon: <Flame className="h-5 w-5" />, label: recipe.methods.includes('pecenje') ? 'Pečenje' : 'Kuhanje', value: formatDuration(t.cookMinutes) })
  if (t.restMinutes)
    facts.push({ icon: <Hourglass className="h-5 w-5" />, label: t.restLabel ? `Čekanje (${t.restLabel})` : 'Čekanje', value: formatDuration(t.restMinutes) })
  if (t.totalMinutes) facts.push({ icon: <Clock className="h-5 w-5" />, label: 'Ukupno', value: formatDuration(t.totalMinutes) })
  if (recipe.yield.servings) facts.push({ icon: <Users className="h-5 w-5" />, label: 'Količina', value: `${recipe.yield.servings} ${recipe.yield.unit}` })
  facts.push({ icon: <ChefHat className="h-5 w-5" />, label: 'Težina', value: difficultyLabels[recipe.difficulty] ?? recipe.difficulty })
  if (recipe.equipment.panSize) facts.push({ icon: <Ruler className="h-5 w-5" />, label: 'Kalup', value: recipe.equipment.panSize })
  if (recipe.equipment.temperature)
    facts.push({
      icon: <Thermometer className="h-5 w-5" />,
      label: 'Temperatura',
      value: `${recipe.equipment.temperature} °C${recipe.equipment.ovenMode ? `, ${ovenLabels[recipe.equipment.ovenMode]}` : ''}`,
    })
  return (
    <section aria-label="Osnovni podaci" className="avoid-break rounded-2xl border border-line bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
        {facts.map((f) => (
          <div key={f.label}>
            <dt className="flex items-center gap-2 text-sm text-muted">
              <span aria-hidden="true" className="text-brand">
                {f.icon}
              </span>
              {f.label}
            </dt>
            <dd className="pl-7 font-semibold">{f.value}</dd>
          </div>
        ))}
      </dl>
      {t.totalMinutes && (t.prepMinutes ?? 0) + (t.cookMinutes ?? 0) + (t.restMinutes ?? 0) > t.totalMinutes && (
        <p className="mt-3 text-sm text-muted">Ukupno vrijeme je kraće od zbira jer se neke radnje rade istovremeno.</p>
      )}
      {recipe.equipment.other && <p className="mt-3 text-sm text-muted">Oprema: {recipe.equipment.other}</p>}
    </section>
  )
}

export function StepsList({ recipe }: { recipe: RecipeView }) {
  let n = 0
  return (
    <div className="space-y-6">
      {recipe.stepGroups.map((g) => (
        <div key={g.id}>
          {g.title && <h3 className="mb-3 font-sans text-base font-bold uppercase tracking-wide text-bordo">{g.title}</h3>}
          <ol className="space-y-5">
            {g.steps.map((s) => {
              n++
              return (
                <li key={s.id} className="avoid-break flex gap-4">
                  <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand font-serif text-lg font-semibold text-white">
                    {n}
                  </span>
                  <div className="min-w-0 flex-1 pt-1">
                    <span className="sr-only">Korak {n}. </span>
                    {s.title && <p className="font-semibold">{s.title}</p>}
                    <p className="text-[1.0625rem] leading-relaxed sm:text-lg">{s.text}</p>
                    {s.image && (
                      <Image
                        src={s.image.url}
                        alt={s.image.alt}
                        width={s.image.width}
                        height={s.image.height}
                        sizes="(min-width: 1024px) 640px, 100vw"
                        loading="lazy"
                        className="print-photo mt-3 rounded-lg"
                      />
                    )}
                    {s.timerMinutes ? (
                      <StepTimerButton
                        recipeUid={recipe.uid}
                        recipeTitle={recipe.title}
                        recipeSlug={recipe.slug}
                        stepId={s.id}
                        stepNumber={n}
                        minutes={s.timerMinutes}
                        label={s.timerLabel}
                      />
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      ))}
    </div>
  )
}

export function TipsBlock({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null
  return (
    <section className="avoid-break" aria-labelledby={`b-${title}`}>
      <h2 id={`b-${title}`} className="text-2xl font-semibold">
        {title}
      </h2>
      <ul className="mt-3 space-y-2">
        {items.map((t, i) => (
          <li key={i} className="flex gap-3">
            <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function FaqBlock({ faq }: { faq: RecipeView['faq'] }) {
  if (!faq.length) return null
  return (
    <section aria-labelledby="pitanja" className="no-print">
      <h2 id="pitanja" className="text-2xl font-semibold">
        Česta pitanja
      </h2>
      <div className="mt-3 divide-y divide-line rounded-xl border border-line">
        {faq.map((f, i) => (
          <details key={i} className="group p-4">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 font-semibold">
              <CircleHelp aria-hidden="true" className="h-5 w-5 shrink-0 text-brand" />
              {f.question}
            </summary>
            <p className="mt-2 pl-7">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

export function RelatedGuides({ guides }: { guides: RecipeView['relatedGuides'] }) {
  if (!guides.length) return null
  return (
    <section aria-labelledby="vodici" className="no-print">
      <h2 id="vodici" className="text-2xl font-semibold">
        Korisni savjeti
      </h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {guides.map((g) => (
          <li key={g.slug} className="rounded-xl border border-line p-4">
            <Link href={`/savjeti/${g.slug}/`} className="font-serif text-lg font-semibold hover:text-brand">
              {g.title}
            </Link>
            <p className="mt-1 line-clamp-2 text-muted">{g.answer}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function AdSlot({ slot, enabled }: { slot: string; enabled: boolean }) {
  if (!enabled) return null
  // Rezervisan prostor; oglasna skripta se ne učitava dok nije odabrana i dok nema consent rješenja.
  return (
    <aside aria-label="Oglas" data-ad-slot={slot} className="ad-slot no-print my-8">
      Oglas
    </aside>
  )
}
