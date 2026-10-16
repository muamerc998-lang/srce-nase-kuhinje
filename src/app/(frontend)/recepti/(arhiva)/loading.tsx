/** Skeleton arhive: stabilan raspored bez velikih pomjeranja. */
export default function Loading() {
  return (
    <div className="container-page pt-5" aria-busy="true" aria-label="Učitavanje recepata">
      <div className="h-4 w-40 rounded bg-soft" />
      <div className="mt-6 h-10 w-72 rounded bg-soft" />
      <div className="mt-3 h-5 w-full max-w-2xl rounded bg-soft" />
      <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="overflow-hidden rounded-[var(--radius-card)] border border-line">
            <div className="aspect-[4/3] bg-soft" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-24 rounded bg-soft" />
              <div className="h-6 w-3/4 rounded bg-soft" />
              <div className="h-4 w-1/2 rounded bg-soft" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
