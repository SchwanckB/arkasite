import { PageHeader } from "@/components/admin/PageHeader";

export function AdminRestricted({ modulo }: { modulo: string }) {
  return (
    <>
      <PageHeader titulo={modulo} />
      <div role="status" className="rounded-marca-lg border border-borda bg-superficie p-5 text-sm text-texto-suave">
        Esta área é restrita a owner e admin. Se você precisa de acesso, fale com o owner da conta.
      </div>
    </>
  );
}
