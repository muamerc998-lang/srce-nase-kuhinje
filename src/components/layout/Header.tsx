import Link from 'next/link'
import { Search } from 'lucide-react'
import { getNavigation } from '@/data/site'
import { Logo } from '../brand/Logo'
import { SearchBox } from './SearchBox'
import { AccountLink, CookbookLink, DesktopNav, MobileControls } from './HeaderClient'

export async function Header() {
  const nav = await getNavigation()
  return (
    <header data-site-header className="sticky top-0 z-30 bg-[image:var(--gradient-brand)] bg-brand text-white shadow-[0_2px_12px_rgb(116_27_43/0.2)]">
      <div className="container-page relative flex h-16 items-center justify-between gap-4 xl:h-[4.75rem]">
        <Link href="/" className="shrink-0 rounded-md" aria-label="Srce naše kuhinje — početna">
          <Logo />
        </Link>
        <DesktopNav categories={nav.recipeMenu} />
        <div className="hidden items-center gap-2 xl:flex">
          <div className="hidden w-60 min-[1360px]:block">
            <SearchBox id="pretraga-header" />
          </div>
          <Link href="/recepti/#pretraga" className="icon-btn text-white hover:bg-white/15 min-[1360px]:hidden" aria-label="Pretraga recepata">
            <Search aria-hidden="true" className="h-5 w-5" />
          </Link>
          <CookbookLink withLabel />
          <AccountLink />
        </div>
        <MobileControls categories={nav.recipeMenu} />
        <noscript>
          <a href="#podnozje" className="font-semibold text-white underline xl:hidden">
            Meni
          </a>
        </noscript>
      </div>
      <span aria-hidden="true" className="logo-stripes logo-stripes-light" />
    </header>
  )
}
