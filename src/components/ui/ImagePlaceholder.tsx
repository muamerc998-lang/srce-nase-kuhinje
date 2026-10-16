import { LogoMark } from '../brand/Logo'

/** Neutralan placeholder kad fotografija nedostaje (u produkciji je to urednička prepreka objavi). */
export function ImagePlaceholder({ label = 'Fotografija još nije dodana' }: { label?: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-soft text-muted">
      <LogoMark className="h-12 w-12 opacity-40" />
      <span className="text-sm">{label}</span>
    </div>
  )
}
