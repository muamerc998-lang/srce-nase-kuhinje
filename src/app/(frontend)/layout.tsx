import type { Metadata, Viewport } from 'next'
import { Lora, Source_Sans_3 } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Announcer } from '@/components/ui/Announcer'
import { TimerDock } from '@/components/recipe/TimerDock'
import { siteUrl, indexingAllowed, isProduction } from '@/data/payload'
import { getSiteSettings } from '@/data/site'
import './globals.css'

// next/font preuzima fontove pri buildu i poslužuje ih s vlastite domene (bez poziva prema Googleu u pregledniku).
const lora = Lora({ subsets: ['latin', 'latin-ext'], variable: '--font-lora', display: 'swap', preload: false, weight: ['500', '600', '700'] })
const sourceSans = Source_Sans_3({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-source-sans',
  display: 'swap',
  weight: ['400', '600', '700'],
})

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings()
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: `${s.siteName} — domaći recepti`, template: `%s | ${s.siteName}` },
    description: s.description,
    applicationName: s.siteName,
    robots: indexingAllowed() ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: { siteName: s.siteName, locale: 'bs_BA', type: 'website' },
    twitter: { card: 'summary_large_image' },
  }
}

export const viewport: Viewport = {
  themeColor: '#B91C2C',
  width: 'device-width',
  initialScale: 1,
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bs" className={`${lora.variable} ${sourceSans.variable}`}>
      <body>
        <a
          href="#sadrzaj"
          className="sr-only-focusable absolute left-2 top-2 z-[60] rounded-md bg-brand px-4 py-3 font-semibold text-white"
        >
          Preskoči na sadržaj
        </a>
        {!isProduction() && (
          <div className="no-print bg-warning-bg px-4 py-1.5 text-center text-sm text-warning-ink">
            Razvojna verzija — prikazani sadržaj je demonstracijski i nije odobren za javnu objavu.
          </div>
        )}
        <Header />
        <main id="sadrzaj" tabIndex={-1} className="focus:outline-none">
          {children}
        </main>
        <Footer />
        <TimerDock />
        <Announcer />
      </body>
    </html>
  )
}
