import { ShareButton } from '../recipe/RecipeActions'

/** Dijeljenje bez Facebook skripti: običan link na sharer + Web Share / kopiranje. */
export function ShareLinks({ url, title }: { url: string; title: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary"
      >
        Podijeli na Facebooku
      </a>
      <ShareButton title={title} url={url} />
    </div>
  )
}
