import { PageHeader } from "@/components/admin/PageHeader";
import { classeInput } from "@/components/admin/FormField";
import { connection } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { alternarTarefa, excluirTarefa, salvarTarefa } from "../actions";

const botao = "inline-flex min-h-10 items-center justify-center rounded-marca bg-musgo px-4 text-sm font-medium text-white hover:bg-musgo-escuro";
const secundario = "inline-flex min-h-9 items-center justify-center rounded-marca border border-borda px-3 text-xs font-medium text-grafite hover:bg-areia-claro";

export default async function TarefasPage() {
  await connection();
  await requireAuth();
  const supabase = await createClient();
  const [tarefasResult, clientesResult, projetosResult, leadsResult] = await Promise.all([
    supabase.from("tasks").select("*,clients(empresa),client_projects(nome),leads(nome)").order("concluida").order("vence_em", { ascending: true }),
    supabase.from("clients").select("id,empresa").order("empresa"),
    supabase.from("client_projects").select("id,nome").order("nome"),
    supabase.from("leads").select("id,nome").order("criado_em", { ascending: false }).limit(300),
  ]);
  if (tarefasResult.error) throw new Error(`Falha ao carregar tarefas: ${tarefasResult.error.message}`);
  if (clientesResult.error) throw new Error(`Falha ao carregar clientes: ${clientesResult.error.message}`);
  if (projetosResult.error) throw new Error(`Falha ao carregar projetos: ${projetosResult.error.message}`);
  if (leadsResult.error) throw new Error(`Falha ao carregar leads: ${leadsResult.error.message}`);
  const tarefas = tarefasResult.data ?? [];
  const abertas = tarefas.filter((t) => !t.concluida);
  const concluidas = tarefas.filter((t) => t.concluida);

  return (
    <>
      <PageHeader titulo="Tarefas e follow-ups" descricao={`${abertas.length} em aberto · ${concluidas.length} concluídas`} />
      <details className="mb-6 rounded-marca-lg border border-borda bg-superficie p-5">
        <summary className="cursor-pointer font-medium text-musgo">Adicionar tarefa</summary>
        <form action={salvarTarefa} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input name="titulo" required maxLength={200} placeholder="Tarefa" className={classeInput()} />
          <input name="vence_em" type="date" aria-label="Prazo" className={classeInput()} />
          <select name="prioridade" className={classeInput()}><option value="media">Prioridade média</option><option value="baixa">Prioridade baixa</option><option value="alta">Prioridade alta</option></select>
          <select name="client_id" className={classeInput()}><option value="">Sem cliente vinculado</option>{(clientesResult.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.empresa}</option>)}</select>
          <select name="lead_id" className={classeInput()}><option value="">Sem lead vinculado</option>{(leadsResult.data ?? []).map((lead) => <option key={lead.id} value={lead.id}>{lead.nome}</option>)}</select>
          <select name="client_project_id" className={classeInput()}><option value="">Sem projeto vinculado</option>{(projetosResult.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</select>
          <textarea name="descricao" maxLength={4000} placeholder="Detalhes" className={classeInput()} />
          <button className={botao}>Criar tarefa</button>
        </form>
      </details>

      <div className="space-y-3">
        {tarefas.map((tarefa) => (
          <article key={tarefa.id} className={`rounded-marca-lg border border-borda bg-superficie p-4 ${tarefa.concluida ? "opacity-65" : ""}`}>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div className="flex gap-3">
                <form action={alternarTarefa} className="pt-1"><input type="hidden" name="id" value={tarefa.id} /><input type="hidden" name="concluida" value={String(tarefa.concluida)} />
                  <button type="submit" aria-label={tarefa.concluida ? "Reabrir tarefa" : "Concluir tarefa"} className="flex h-5 w-5 items-center justify-center rounded border border-musgo text-xs text-musgo">{tarefa.concluida ? "✓" : ""}</button>
                </form>
                <div><h2 className={`font-medium text-grafite ${tarefa.concluida ? "line-through" : ""}`}>{tarefa.titulo}</h2>
                  {tarefa.descricao ? <p className="mt-1 whitespace-pre-wrap text-sm text-texto-suave">{tarefa.descricao}</p> : null}
                  <p className="mt-2 text-xs text-texto-suave">{tarefa.leads?.nome ? `Lead: ${tarefa.leads.nome}` : tarefa.clients?.empresa ?? "Sem cliente"}{tarefa.client_projects?.nome ? ` · ${tarefa.client_projects.nome}` : ""} · prioridade {tarefa.prioridade}{tarefa.vence_em ? ` · prazo ${new Date(`${tarefa.vence_em}T12:00:00`).toLocaleDateString("pt-BR")}` : ""}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <details className="relative">
                  <summary className="cursor-pointer list-none"><span className={secundario}>Editar</span></summary>
                  <form action={salvarTarefa} className="absolute right-0 z-10 mt-2 grid w-72 gap-2 rounded-marca-lg border border-borda bg-superficie p-4 shadow-media">
                    <input type="hidden" name="id" value={tarefa.id} />
                    <input name="titulo" required maxLength={200} defaultValue={tarefa.titulo} aria-label="Título" className={classeInput()} />
                    <textarea name="descricao" maxLength={4000} defaultValue={tarefa.descricao ?? ""} aria-label="Descrição" className={classeInput()} />
                    <input name="vence_em" type="date" defaultValue={tarefa.vence_em ?? ""} aria-label="Prazo" className={classeInput()} />
                    <select name="prioridade" defaultValue={tarefa.prioridade} aria-label="Prioridade" className={classeInput()}><option value="baixa">Baixa</option><option value="media">Média</option><option value="alta">Alta</option></select>
                    <select name="client_id" defaultValue={tarefa.client_id ?? ""} aria-label="Cliente" className={classeInput()}><option value="">Sem cliente vinculado</option>{(clientesResult.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.empresa}</option>)}</select>
                    <select name="lead_id" defaultValue={tarefa.lead_id ?? ""} aria-label="Lead" className={classeInput()}><option value="">Sem lead vinculado</option>{(leadsResult.data ?? []).map((lead) => <option key={lead.id} value={lead.id}>{lead.nome}</option>)}</select>
                    <select name="client_project_id" defaultValue={tarefa.client_project_id ?? ""} aria-label="Projeto" className={classeInput()}><option value="">Sem projeto vinculado</option>{(projetosResult.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</select>
                    <button className={secundario}>Salvar tarefa</button>
                  </form>
                </details>
                <form action={excluirTarefa}><input type="hidden" name="id" value={tarefa.id} /><button className={secundario}>Excluir</button></form>
              </div>
            </div>
          </article>
        ))}
        {!tarefas.length ? <p className="rounded-marca border border-dashed border-borda p-6 text-sm text-texto-suave">Nenhuma tarefa cadastrada.</p> : null}
      </div>
    </>
  );
}
