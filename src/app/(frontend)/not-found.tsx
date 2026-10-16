import Link from 'next/link'
import { SearchBox } from '@/components/layout/SearchBox'

export default function NotFound() {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-xl text-center">
        <p className="font-semibold text-brand">Greška 404</p>
        <h1 className="mt-2 text-[2rem] font-semibold">Stranica nije pronađena</h1>
        <p className="mt-3 text-muted">Moguće je da je recept premješten ili uklonjen. Pokušajte ga potražiti:</p>
        <div className="mt-6 text-left">
          <SearchBox id="pretraga-404" large />
        </div>
        <p className="mt-6 flex flex-wrap justify-center gap-4">
          <Link href="/" className="link">
            Početna
          </Link>
          <Link href="/recepti/" className="link">
            Svi recepti
          </Link>
          <Link href="/moja-kuharica/" className="link">
            Moja kuharica
          </Link>
        </p>
      </div>
    </div>
  )
}
