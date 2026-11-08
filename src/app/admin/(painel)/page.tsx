import Link from "next/link";
import { connection } from "next/server";

import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { MENU_ADMIN } from "@/components/admin/nav";
import type { ResumoFinanceiro } from "@/lib/finance";
import { formatBRL } from "@/lib/money";
import { getUsuarioAtual } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  await connection();
  const usuario = await getUsuarioAtual();
  if (!usuario) throw new Error("Sua sessão expirou. Entre novamente.");
  const supabase = await createClient();
  const hoje = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
  const [leads, projetos, tarefas, tarefasAbertas, proximasTarefas] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "novo"),
    supabase.from("client_projects").select("id", { count: "exact", head: true }).eq("status", "ativo"),
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("concluida", false).lt("vence_em", hoje),
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("concluida", false),
    supabase.from("tasks").select("id,titulo,vence_em,prioridade").eq("concluida", false).order("vence_em", { ascending: true }).limit(5),
  ]);
  if (leads.error) throw new Error(`Falha ao carregar o total de leads: ${leads.error.message}`);
  if (projetos.error) throw new Error(`Falha ao carregar projetos ativos: ${projetos.error.message}`);
  if (tarefas.error) throw new Error(`Falha ao carregar tarefas atrasadas: ${tarefas.error.message}`);
  if (tarefasAbertas.error) throw new Error(`Falha ao carregar tarefas abertas: ${tarefasAbertas.error.message}`);
  if (proximasTarefas.error) throw new Error(`Falha ao carregar próximas tarefas: ${proximasTarefas.error.message}`);

  let entradas = "Restrito";
  let saidas = "Restrito";
  if (usuario.papel === "owner" || usuario.papel === "admin") {
    const { data: lancamentos, error } = await supabase.rpc("resumo_financeiro");
    if (error) throw new Error(`Falha ao carregar resumo financeiro: ${error.message}`);
    const resumo: ResumoFinanceiro[] = lancamentos ?? [];
    entradas = formatBRL(resumo.filter((item) => item.status === "paid" && item.tipo === "in").reduce((sum, item) => sum + Number(item.total_cents), 0));
    saidas = formatBRL(resumo.filter((item) => item.status === "paid" && item.tipo === "out").reduce((sum, item) => sum + Number(item.total_cents), 0));
  }

  const atalhos = MENU_ADMIN.flatMap((grupo) => grupo.itens).filter((item) =>
    ["/admin/crm", "/admin/financeiro", "/admin/portfolio"].includes(item.href),
  );
  const quantidadeAtrasada = tarefas.count ?? 0;

  return (
    <>
      <PageHeader titulo="Visão geral" descricao="Acompanhe contatos, projetos, prazos e movimentações da empresa." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard rotulo="Leads novos" valor={String(leads.count ?? 0)} icone="Inbox" />
        <StatCard rotulo="Projetos ativos" valor={String(projetos.count ?? 0)} icone="Briefcase" />
        <StatCard rotulo="Tarefas atrasadas" valor={String(quantidadeAtrasada)} icone="AlarmClock" />
        <StatCard rotulo="Entradas pagas" valor={entradas} icone="ArrowDownToLine" />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <StatCard rotulo="Despesas pagas" valor={saidas} icone="ArrowUpFromLine" />
        <StatCard rotulo="Tarefas abertas" valor={String(tarefasAbertas.count ?? 0)} icone="ListChecks" />
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-marca-lg border border-borda bg-superficie p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3"><h2 className="font-display text-lg text-grafite">Próximas tarefas</h2><Link href="/admin/tarefas" className="text-sm font-medium text-musgo hover:underline">Ver todas</Link></div>
          {proximasTarefas.data?.length ? <ul className="mt-4 divide-y divide-borda">{proximasTarefas.data.map((task) => <li key={task.id} className="flex justify-between gap-3 py-3 text-sm"><span className="font-medium text-grafite">{task.titulo}</span><span className={`shrink-0 ${task.vence_em && task.vence_em < new Date().toISOString().slice(0, 10) ? "text-red-700" : "text-texto-suave"}`}>{task.vence_em ? new Date(`${task.vence_em}T12:00:00`).toLocaleDateString("pt-BR") : "Sem prazo"}</span></li>)}</ul> : <p className="mt-4 text-sm text-texto-suave">Nenhuma tarefa em aberto.</p>}
        </section>
        <section className="rounded-marca-lg border border-borda bg-superficie p-5 sm:p-6">
          <h2 className="font-display text-lg text-grafite">Acesso rápido</h2>
          <div className="mt-4 grid gap-2">{atalhos.map((item) => <Link key={item.href} href={item.href} className="flex min-h-11 items-center justify-between rounded-marca border border-borda px-3 text-sm font-medium text-musgo transition-colors hover:bg-areia-claro">{item.rotulo}<span aria-hidden>→</span></Link>)}</div>
          {usuario.papel === "staff" ? <p className="mt-4 text-xs text-texto-suave">Os valores financeiros são visíveis somente para owner e admin.</p> : null}
        </section>
      </div>
    </>
  );
}
