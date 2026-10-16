import Link from 'next/link'
import { getInfoPages, getNavigation, getSiteSettings } from '@/data/site'
import { Logo } from '../brand/Logo'

const linkCls = 'inline-block py-1 text-white/85 hover:text-[#ffd9dd]'
const headCls = 'font-sans text-xs font-bold uppercase tracking-[0.14em] text-[#f3c7cc]'

export async function Footer() {
  const [nav, settings, pages] = await Promise.all([getNavigation(), getSiteSettings(), getInfoPages()])
  const portal = pages.filter((p) => p.group === 'portal' && p.slug !== 'kontakt')
  const legal = pages.filter((p) => p.group === 'pravno')
  return (
    <footer id="podnozje" data-site-footer className="mt-16 bg-wine text-white">
      <div className="h-1.5 bg-[linear-gradient(90deg,var(--color-brand)_0_70%,var(--color-brand-bright)_70%_100%)]" aria-hidden="true" />
      <div className="container-page grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <span className="inline-block rounded-2xl bg-white px-4 py-3">
            <Logo />
          </span>
          <p className="mt-4 max-w-xs text-white/80">{settings.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {settings.facebookUrl && (
              <a href={settings.facebookUrl} className="btn bg-white text-bordo hover:bg-soft" rel="noopener">
                Facebook stranica
              </a>
            )}
            {settings.facebookGroupUrl && (
              <a href={settings.facebookGroupUrl} className="btn border border-white/40 text-white hover:bg-white/10" rel="noopener">
                Facebook grupa
              </a>
            )}
          </div>
        </div>
        <nav aria-labelledby="footer-kategorije">
          <h2 id="footer-kategorije" className={headCls}>
            Recepti
          </h2>
          <ul className="mt-3 space-y-0.5">
            {[
              ['/dorucak/', 'Doručak'],
              ['/rucak/', 'Ručak'],
              ['/vecera/', 'Večera'],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className={`${linkCls} font-semibold`}>
                  {label}
                </Link>
              </li>
            ))}
            {nav.footerCategories.map((c) => (
              <li key={c.slug}>
                <Link href={`/kategorije/${c.slug}/`} className={linkCls}>
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/recepti/" className={linkCls}>
                Svi recepti
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-labelledby="footer-vodici">
          <h2 id="footer-vodici" className={headCls}>
            Savjeti i alati
          </h2>
          <ul className="mt-3 space-y-0.5">
            {nav.footerGuides.map((g) => (
              <li key={g.slug}>
                <Link href={`/savjeti/${g.slug}/`} className={linkCls}>
                  {g.title}
                </Link>
              </li>
            ))}
            {[
              ['/sta-danas-kuhati/', 'Šta danas kuhati?'],
              ['/namirnice/', 'Namirnice'],
              ['/moja-kuharica/', 'Moja kuharica'],
              ['/recepti-citalaca/', 'Recepti čitalaca'],
              ['/moji-recepti/', 'Pošaljite svoj recept'],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className={linkCls}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-labelledby="footer-portal">
          <h2 id="footer-portal" className={headCls}>
            O portalu
          </h2>
          <ul className="mt-3 space-y-0.5">
            {portal.map((p) => (
              <li key={p.slug}>
                <Link href={`/${p.slug}/`} className={linkCls}>
                  {p.title}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/autori/" className={linkCls}>
                Autori i uredništvo
              </Link>
            </li>
            <li>
              <Link href="/kontakt/" className={linkCls}>
                Kontakt
              </Link>
            </li>
            {legal.map((p) => (
              <li key={p.slug}>
                <Link href={`/${p.slug}/`} className={linkCls}>
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/15">
        <p className="container-page py-4 text-sm text-white/70">
          © {new Date().getFullYear()} {settings.siteName}. Recepti, tekstovi i fotografije ne smiju se preuzimati bez dozvole.
        </p>
      </div>
    </footer>
  )
}
