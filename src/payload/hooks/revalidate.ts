import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'
import { revalidateTag } from 'next/cache'

/**
 * Javne stranice keširaju podatke pod tagovima (vidi src/data/*). Nakon objave,
 * izmjene ili brisanja tagove odmah poništavamo ({ expire: 0 }), da povučen
 * sadržaj ne ostane vidljiv. Izvan Next servera (seed/import skripte) poziv nije
 * moguć i tiho se preskače.
 */
export function revalidateTags(tags: string[]) {
  for (const tag of tags) {
    try {
      revalidateTag(tag, { expire: 0 })
    } catch {
      // izvan Next.js konteksta (CLI skripte)
    }
  }
}

export const revalidateCollection =
  (base: string): CollectionAfterChangeHook =>
  ({ doc, previousDoc }) => {
    const tags = [base]
    if (doc?.slug) tags.push(`${base}:${doc.slug}`)
    if (previousDoc?.slug && previousDoc.slug !== doc?.slug) tags.push(`${base}:${previousDoc.slug}`)
    revalidateTags(tags)
    return doc
  }

export const revalidateCollectionDelete =
  (base: string): CollectionAfterDeleteHook =>
  ({ doc }) => {
    revalidateTags([base, doc?.slug ? `${base}:${doc.slug}` : base])
    return doc
  }

export const revalidateGlobal =
  (tag: string): GlobalAfterChangeHook =>
  ({ doc }) => {
    revalidateTags([tag])
    return doc
  }
