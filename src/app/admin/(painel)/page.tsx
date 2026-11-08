import Link from "next/link";

import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { MENU_ADMIN } from "@/components/admin/nav";

const PRIMEIROS_PASSOS = [
  "Revise os contatos e os dados da empresa.",
  "Cadastre seus primeiros serviços e conceitos do portfólio.",
  "Convide sua equipe depois de criar os usuários no Supabase.",
];

export default function AdminDashboardPage() {
  const atalhos = MENU_ADMIN.flatMap((grupo) => grupo.itens).filter((item) =>
    ["/admin/crm", "/admin/financeiro", "/admin/portfolio"].includes(item.href),
  );

  return (
    <>
      <PageHeader
        titulo="Visão geral"
        descricao="Organize os contatos, acompanhe os projetos e cuide do site em um só lugar."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard rotulo="Leads novos" valor="—" icone="Inbox" />
        <StatCard rotulo="Projetos ativos" valor="—" icone="Briefcase" />
        <StatCard rotulo="A receber" valor="—" icone="ArrowDownToLine" />
        <StatCard rotulo="A pagar" valor="—" icone="ArrowUpFromLine" />
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-marca-lg border border-borda bg-superficie p-5 sm:p-6">
          <h2 className="font-display text-lg text-grafite">Primeiros passos</h2>
          <p className="mt-1 text-sm text-texto-suave">
            Quando os módulos forem conectados, seus dados aparecem aqui.
          </p>
          <ol className="mt-5 space-y-3">
            {PRIMEIROS_PASSOS.map((passo, indice) => (
              <li key={passo} className="flex items-start gap-3 text-sm text-grafite">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-areia-claro text-xs font-semibold text-musgo">
                  {indice + 1}
                </span>
                <span className="pt-0.5">{passo}</span>
              </li>
            ))}
          </ol>
        </section>
        <section className="rounded-marca-lg border border-borda bg-superficie p-5 sm:p-6">
          <h2 className="font-display text-lg text-grafite">Acesso rápido</h2>
          <div className="mt-4 grid gap-2">
            {atalhos.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-11 items-center justify-between rounded-marca border border-borda px-3 text-sm font-medium text-musgo transition-colors hover:bg-areia-claro"
              >
                {item.rotulo}
                <span aria-hidden>→</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
