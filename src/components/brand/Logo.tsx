import Image from 'next/image'

/**
 * Logo iz originalnog fajla (brand/original/logo-facebook.jpg), izdvojen s providnom
 * pozadinom skriptom scripts/brand-assets.mjs. Kad stigne vektorski original, zamijeniti PNG-ove.
 */
export function LogoMark({ className = 'h-10 w-10' }: { className?: string }) {
  return <Image src="/brand/znak.png" alt="" width={258} height={256} className={`${className} object-contain`} priority />
}

/** Logo = samo znak (srce s viljuškom i kašikom), u bijelom krugu s dvostrukom crvenom linijom. */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-white ${compact ? 'h-11 w-11' : 'h-12 w-12 xl:h-14 xl:w-14'}`}
      style={{ boxShadow: '0 0 0 2px #b91c2c, 0 0 0 4px #fff, 0 0 0 5.5px #e3202a' }}
    >
      <LogoMark className={compact ? 'h-8 w-8' : 'h-9 w-9 xl:h-10 xl:w-10'} />
      <span className="sr-only">Srce naše kuhinje</span>
    </span>
  )
}
