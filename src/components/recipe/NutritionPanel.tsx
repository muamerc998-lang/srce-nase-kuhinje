import type { NutritionEstimate } from '@/lib/nutrition/estimate'

/** Procjena kalorija i makronutrijenata po porciji (ili po komadu, za kolače, palačinke, sarme…). */
export function NutritionPanel({ nutrition, unit, id }: { nutrition: NutritionEstimate | null; unit: string; id: string }) {
  if (!nutrition) return null
  const per = /porc/i.test(unit) ? 'po porciji' : 'po komadu'
  const rows: Array<[string, number, string]> = [
    ['Proteini', nutrition.protein, 'g'],
    ['Ugljikohidrati', nutrition.carbs, 'g'],
    ['Masti', nutrition.fat, 'g'],
  ]
  return (
    <section aria-labelledby={id} className="rounded-2xl border border-line bg-white p-5">
      <h2 id={id} className="font-sans text-base font-bold">
        Nutritivne vrijednosti
      </h2>
      <p className="text-sm text-muted">Procjena {per}</p>
      <p className="mt-3 flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold text-brand">{nutrition.kcal}</span>
        <span className="font-semibold">kcal</span>
      </p>
      <dl className="mt-3 divide-y divide-line text-[0.95rem]">
        {rows.map(([label, value, u]) => (
          <div key={label} className="flex justify-between py-2 first:pt-0 last:pb-0">
            <dt className="text-muted">{label}</dt>
            <dd className="font-semibold">
              {value} {u}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs leading-snug text-muted">
        Izračunato iz prosječnih vrijednosti namirnica (USDA FoodData Central). Ne uključuje sastojke po ukusu i opcionalne dodatke. Stvarne
        vrijednosti zavise od proizvoda koje koristite.
      </p>
    </section>
  )
}
