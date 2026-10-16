import { Refrigerator } from 'lucide-react'
import { IngredientPicker } from './IngredientPicker'

/**
 * Traženje po namirnicama na početnoj: običan GET obrazac prema /sta-danas-kuhati/
 * (radi i bez JavaScripta preko brzih izbora), s autocompleteom kad je JS uključen.
 */
export function PantryHero({ quick, title, text }: { quick: Array<{ slug: string; name: string }>; title: string; text: string }) {
  return (
    <section aria-labelledby="frizider" className="card-stripes relative overflow-hidden rounded-3xl border border-line bg-white p-6 pt-8 shadow-[0_10px_36px_rgb(91_26_38/0.10)] sm:p-8 sm:pt-10">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border-[14px] border-[#fbe9eb]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 rounded-full border-[10px] border-[#f6d3d7]" />
      <div className="relative flex items-center gap-3">
        <span className="icon-badge h-11 w-11 shrink-0">
          <Refrigerator aria-hidden="true" className="h-5 w-5" />
        </span>
        <p className="eyebrow">Kuhajte s onim što imate</p>
      </div>
      <h2 id="frizider" className="relative mt-4 text-[1.9rem] font-semibold leading-tight sm:text-[2.2rem]">
        {title}
      </h2>
      <p className="relative mt-2 text-muted">{text}</p>
      <form action="/sta-danas-kuhati/" method="get" className="relative mt-5 rounded-2xl bg-cream p-4 text-ink sm:p-5">
        <IngredientPicker name="imam" label="Imam ove namirnice" initial={[]} />
        {quick.length > 0 && (
          <fieldset className="mt-3">
            <legend className="text-sm text-muted">Brzi izbor:</legend>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {quick.map((q) => (
                <label key={q.slug} className="chip min-h-9 cursor-pointer text-[0.9rem] font-semibold hover:border-[#e7b9be] has-[:checked]:border-transparent has-[:checked]:bg-[image:var(--gradient-brand)] has-[:checked]:text-white">
                  <input type="checkbox" name="imam" value={q.slug} className="sr-only" />
                  {q.name}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <label className="mt-3 flex min-h-10 items-center gap-2 text-[0.95rem]">
          <input type="checkbox" name="osnovne" value="1" defaultChecked className="h-5 w-5 accent-[var(--color-brand)]" />
          Imam osnovne namirnice (so, ulje, voda…)
        </label>
        <button type="submit" className="btn btn-primary mt-3 w-full">
          Pronađi recepte
        </button>
      </form>
    </section>
  )
}
