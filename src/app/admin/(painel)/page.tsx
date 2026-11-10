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
  const [leads, projetos, tarefas, tarefasHoje, tarefasAbertas, proximasTarefas] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "novo"),
    supabase.from("client_projects").select("id", { count: "exact", head: true }).eq("status", "ativo"),
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("concluida", false).lt("vence_em", hoje),
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("concluida", false).eq("vence_em", hoje),
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("concluida", false),
    supabase.from("tasks").select("id,titulo,vence_em,prioridade,lead_id,leads(nome)").eq("concluida", false).not("vence_em", "is", null).order("vence_em", { ascending: true }).limit(8),
  ]);
  if (leads.error) throw new Error(`Falha ao carregar o total de leads: ${leads.error.message}`);
  if (projetos.error) throw new Error(`Falha ao carregar projetos ativos: ${projetos.error.message}`);
  if (tarefas.error) throw new Error(`Falha ao carregar tarefas atrasadas: ${tarefas.error.message}`);
  if (tarefasHoje.error) throw new Error(`Falha ao carregar tarefas de hoje: ${tarefasHoje.error.message}`);
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
        <StatCard rotulo="Retornos para hoje" valor={String(tarefasHoje.count ?? 0)} icone="CalendarCheck" />
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-marca-lg border border-borda bg-superficie p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3"><div><h2 className="font-display text-lg text-grafite">Retornos e prazos</h2><p className="mt-1 text-xs text-texto-suave">Vencidos e próximos, em ordem de urgência.</p></div><Link href="/admin/tarefas" className="text-sm font-medium text-musgo hover:underline">Ver todas</Link></div>
          {proximasTarefas.data?.length ? (
            <ul className="mt-4 divide-y divide-borda">
              {proximasTarefas.data.map((task) => {
                const atrasada = Boolean(task.vence_em && task.vence_em < hoje);
                const paraHoje = task.vence_em === hoje;
                return (
                  <li key={task.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium text-grafite">{task.titulo}</p>
                      {task.leads?.[0]?.nome ? <p className="mt-0.5 text-xs text-texto-suave">Lead: {task.leads[0].nome}</p> : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {atrasada || paraHoje ? (
                        <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${atrasada ? "bg-red-50 text-red-800" : "bg-musgo/10 text-musgo"}`}>
                          {atrasada ? "Atrasada" : "Hoje"}
                        </span>
                      ) : null}
                      <span className={`text-xs tabular-nums ${atrasada ? "font-medium text-red-800" : paraHoje ? "font-medium text-musgo" : "text-texto-suave"}`}>
                        {task.vence_em ? new Date(`${task.vence_em}T12:00:00`).toLocaleDateString("pt-BR") : "Sem prazo"}
                      </span>
                      <a href={`/admin/tarefas/calendario?id=${task.id}`} aria-label={`Adicionar ${task.titulo} ao calendário`} className="inline-flex min-h-11 items-center rounded-marca px-2 text-xs font-medium text-musgo underline-offset-2 transition-colors hover:bg-musgo/10 hover:underline">
                        Calendário
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : <p className="mt-4 text-sm text-texto-suave">Nenhuma tarefa com prazo definido.</p>}
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
