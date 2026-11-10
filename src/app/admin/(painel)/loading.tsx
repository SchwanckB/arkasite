export default function LoadingPainel() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="space-y-6"
    >
      <span className="sr-only">Carregando seção do painel...</span>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <div className="admin-skeleton h-7 w-48 rounded-marca" />
          <div className="admin-skeleton h-4 w-full max-w-lg rounded-marca" />
        </div>
        <div className="admin-skeleton h-10 w-32 rounded-marca" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            aria-hidden="true"
            className="rounded-marca-lg border border-borda bg-superficie p-5"
          >
            <div className="admin-skeleton h-3 w-24 rounded-marca" />
            <div className="admin-skeleton mt-4 h-7 w-20 rounded-marca" />
            <div className="admin-skeleton mt-3 h-3 w-32 rounded-marca" />
          </div>
        ))}
      </div>
      <div className="rounded-marca-lg border border-borda bg-superficie p-4">
        <div className="flex flex-wrap gap-2">
          <div className="admin-skeleton h-10 min-w-48 flex-1 rounded-marca" />
          <div className="admin-skeleton h-10 w-36 rounded-marca" />
          <div className="admin-skeleton h-10 w-36 rounded-marca" />
          <div className="admin-skeleton h-10 w-24 rounded-marca" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            aria-hidden="true"
            className="rounded-marca-lg border border-borda bg-superficie p-5"
          >
            <div className="admin-skeleton h-4 w-48 rounded-marca" />
            <div className="admin-skeleton mt-3 h-3 w-full max-w-xl rounded-marca" />
            <div className="admin-skeleton mt-5 h-9 w-40 rounded-marca" />
          </div>
        ))}
      </div>
    </div>
  );
}
