/** Skeleton recepta: odmah nakon klika prikazuje raspored stranice dok stiže sadržaj. */
export default function Loading() {
  return (
    <div className="container-page pt-5" aria-busy="true" aria-label="Učitavanje recepta">
      <div className="h-4 w-56 rounded bg-soft" />
      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="min-w-0">
          <div className="h-3 w-28 rounded bg-soft" />
          <div className="mt-3 h-10 w-3/4 rounded bg-soft" />
          <div className="mt-4 aspect-[4/3] rounded-3xl bg-soft sm:aspect-[16/10]" />
          <div className="mt-5 h-5 w-full rounded bg-soft" />
          <div className="mt-2 h-5 w-2/3 rounded bg-soft" />
        </div>
        <div className="hidden space-y-3 lg:block">
          <div className="h-3 w-20 rounded bg-soft" />
          <div className="h-96 rounded-2xl border border-line bg-white" />
        </div>
      </div>
    </div>
  )
}
