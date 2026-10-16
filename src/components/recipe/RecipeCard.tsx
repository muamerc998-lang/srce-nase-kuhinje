import Image from 'next/image'
import Link from 'next/link'
import { Clock, ChefHat } from 'lucide-react'
import type { RecipeCard as Card } from '@/data/mappers'
import { difficultyLabels } from '@/lib/recipes/time'
import { SaveButton } from './SaveButton'
import { ImagePlaceholder } from '../ui/ImagePlaceholder'

function Meta({ recipe, small = false }: { recipe: Card; small?: boolean }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-muted ${small ? 'text-[0.85rem]' : 'text-[0.92rem]'}`}>
      {recipe.timeLabel && (
        <span className="inline-flex items-center gap-1.5">
          <Clock aria-hidden="true" className="h-4 w-4 text-brand" />
          <span className="sr-only">Vrijeme: </span>
          {recipe.timeLabel}
        </span>
      )}
      <span className="inline-flex items-center gap-1.5">
        <ChefHat aria-hidden="true" className="h-4 w-4 text-brand" />
        <span className="sr-only">Težina: </span>
        {difficultyLabels[recipe.difficulty] ?? recipe.difficulty}
      </span>
    </p>
  )
}

const saveTarget = (r: Card) => ({ uid: r.uid, slug: r.slug, title: r.title, image: r.image?.url ?? null })

export function RecipeCard({
  recipe,
  size = 'normal',
  priority = false,
  headingLevel = 3,
  badge,
}: {
  recipe: Card
  size?: 'normal' | 'large'
  priority?: boolean
  headingLevel?: 2 | 3
  /** kratka oznaka na fotografiji, npr. "Danas izdvajamo" */
  badge?: string
}) {
  const H = `h${headingLevel}` as 'h2' | 'h3'
  const label = recipe.category?.name ?? recipe.tag
  const large = size === 'large'
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-[var(--shadow-card)] transition-shadow hover:shadow-[0_6px_24px_rgb(38_35_38/0.10)]">
      <div className={`relative overflow-hidden bg-soft ${large ? 'aspect-[4/3] lg:aspect-[16/11]' : 'aspect-[4/3]'}`}>
        {recipe.image ? (
          <Image
            src={recipe.image.url}
            alt=""
            fill
            priority={priority}
            sizes={large ? '(min-width: 1024px) 640px, 100vw' : '(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw'}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            style={{ objectPosition: `${recipe.image.focalX ?? 50}% ${recipe.image.focalY ?? 50}%` }}
          />
        ) : (
          <ImagePlaceholder />
        )}
        {badge && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold uppercase tracking-wider text-bordo shadow-sm">
            {badge}
          </span>
        )}
      </div>
      <div className={`flex flex-1 flex-col gap-2 ${large ? 'p-5 sm:p-6' : 'p-4'}`}>
        {label && <p className="eyebrow text-[0.7rem]">{label}</p>}
        <H className={`font-serif font-semibold leading-snug ${large ? 'text-[1.6rem] sm:text-[1.9rem]' : 'text-[1.18rem]'} line-clamp-2`}>
          <Link href={`/recepti/${recipe.slug}/`} className="after:absolute after:inset-0 after:content-[''] hover:text-bordo">
            {recipe.title}
          </Link>
        </H>
        <div className="mt-auto pt-1">
          <Meta recipe={recipe} />
        </div>
      </div>
      {/* srce je iznad razvučenog linka i ne otvara karticu */}
      <div className="absolute right-3 top-3 z-10">
        <SaveButton recipe={saveTarget(recipe)} />
      </div>
    </article>
  )
}

/** Horizontalna kartica za liste (izdvojeno, prijedlozi uz jelo). */
export function RecipeRow({ recipe, headingLevel = 3 }: { recipe: Card; headingLevel?: 2 | 3 }) {
  const H = `h${headingLevel}` as 'h2' | 'h3'
  const label = recipe.category?.name ?? recipe.tag
  return (
    <article className="group relative flex items-center gap-4 rounded-2xl border border-line bg-white p-3 shadow-[var(--shadow-card)]">
      <div className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-xl bg-soft sm:w-36">
        {recipe.image ? (
          <Image src={recipe.image.url} alt="" fill sizes="144px" className="object-cover" />
        ) : (
          <ImagePlaceholder label="" />
        )}
      </div>
      <div className="min-w-0 flex-1 pr-10">
        {label && <p className="eyebrow text-[0.68rem]">{label}</p>}
        <H className="mt-1 line-clamp-2 font-serif text-[1.08rem] font-semibold leading-snug">
          <Link href={`/recepti/${recipe.slug}/`} className="after:absolute after:inset-0 after:content-[''] group-hover:text-bordo">
            {recipe.title}
          </Link>
        </H>
        <div className="mt-1.5">
          <Meta recipe={recipe} small />
        </div>
      </div>
      <div className="absolute right-2 top-2 z-10">
        <SaveButton recipe={saveTarget(recipe)} />
      </div>
    </article>
  )
}

export function CardGrid({ children, cols = 3 }: { children: React.ReactNode; cols?: 2 | 3 | 4 }) {
  const c = cols === 4 ? 'lg:grid-cols-4' : cols === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'
  return <ul className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${c}`}>{children}</ul>
}
