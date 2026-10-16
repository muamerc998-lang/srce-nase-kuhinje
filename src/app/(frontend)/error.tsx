'use client'
import Link from 'next/link'
import { useEffect } from 'react'

/** Privremena greška: bez tehničkih detalja za posjetioca, uz mogućnost ponovnog pokušaja. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-[2rem] font-semibold">Stranica se trenutno ne može učitati</h1>
        <p className="mt-3 text-muted">
          Došlo je do privremene greške. Vaša kuharica, plan i lista za kupovinu su sačuvani u pregledniku i nisu izgubljeni.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" className="btn btn-primary" onClick={() => reset()}>
            Pokušaj ponovo
          </button>
          <Link href="/moja-kuharica/" className="btn btn-secondary">
            Moja kuharica
          </Link>
        </div>
        {error.digest && <p className="mt-6 text-xs text-muted">Oznaka greške: {error.digest}</p>}
      </div>
    </div>
  )
}
