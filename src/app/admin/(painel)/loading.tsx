export default function LoadingPainel() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="space-y-6"
    >
      <span className="sr-only">Carregando seção do painel…</span>
      <div className="space-y-2">
        <div className="h-7 w-48 animate-pulse rounded-marca bg-areia" />
        <div className="h-4 w-full max-w-lg animate-pulse rounded-marca bg-areia-claro" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-marca-lg border border-borda bg-superficie"
          />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-marca-lg border border-borda bg-superficie"
          />
        ))}
      </div>
    </div>
  );
}
