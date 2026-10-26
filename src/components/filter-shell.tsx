export function FilterShell({ children }: { children: React.ReactNode }) {
  return (
    <details className="filters-details">
      <summary className="filter-toggle mb-3 flex min-h-11 cursor-pointer list-none items-center justify-between rounded-[10px] border border-black/10 bg-white px-4 text-sm font-semibold text-ink">
        Filtri in razvrščanje
      </summary>
      <div className="filters-body">{children}</div>
    </details>
  );
}
