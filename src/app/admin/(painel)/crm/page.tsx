import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { classeInput } from "@/components/admin/FormField";
import { CrmFilterBar } from "@/components/admin/CrmFilterBar";
import { MoneyField } from "@/components/admin/MoneyField";
import { connection } from "next/server";
import { formatBRL } from "@/lib/money";
import { requireAuth } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import {
  atualizarLead,
  converterLead,
  excluirNegocio,
  registrarInteracao,
  salvarLead,
  salvarNegocio,
  salvarTarefa,
  alternarTarefa,
  atualizarLeadsEmLote,
} from "../actions";

const botao = "inline-flex min-h-11 items-center justify-center rounded-marca bg-musgo px-4 text-sm font-medium text-white transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:bg-musgo-escuro hover:shadow-suave active:translate-y-0 active:scale-[0.98]";
const secundario = "inline-flex min-h-11 items-center justify-center rounded-marca border border-borda px-3 text-xs font-medium text-grafite transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-borda-forte hover:bg-areia-claro hover:shadow-suave active:translate-y-0 active:scale-[0.98]";

const etapas = [
  { id: "novo", nome: "Nova" },
  { id: "contato_feito", nome: "Contato feito" },
  { id: "proposta_enviada", nome: "Proposta enviada" },
  { id: "negociacao", nome: "Negociação" },
  { id: "ganho", nome: "Ganha" },
  { id: "perdido", nome: "Perdida" },
] as const;

const statusLeads = [
  { id: "novo", nome: "Novo" },
  { id: "em_contato", nome: "Em contato" },
  { id: "qualificado", nome: "Qualificado" },
  { id: "convertido", nome: "Convertido" },
  { id: "descartado", nome: "Descartado" },
] as const;

function dataHora(valor: string) {
  return new Date(valor).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  });
}

function linkWhatsApp(telefone: string | null, nome: string) {
  const digitos = telefone?.replace(/\D/g, "") ?? "";
  if (!digitos) return null;
  const numero = digitos.length === 10 || digitos.length === 11 ? `55${digitos}` : digitos;
  return `https://wa.me/${numero}?text=${encodeURIComponent(`Olá, ${nome}! Estou entrando em contato sobre sua solicitação à ARKA.`)}`;
}

function rotuloEvento(
  evento: string,
  detalhes: Record<string, unknown>,
  nomesEquipe: Map<string, string>,
) {
  const responsavel = (id: unknown) =>
    typeof id === "string" ? nomesEquipe.get(id) ?? "membro da equipe" : "Sem responsável";
  const rotulosStatus: Record<string, string> = {
    novo: "Novo",
    em_contato: "Em contato",
    qualificado: "Qualificado",
    convertido: "Convertido",
    descartado: "Descartado",
  };
  const rotulosEtapa: Record<string, string> = {
    novo: "Nova",
    contato_feito: "Contato feito",
    proposta_enviada: "Proposta enviada",
    negociacao: "Negociação",
    ganho: "Ganha",
    perdido: "Perdida",
  };
  switch (evento) {
    case "interacao":
      return `${String(detalhes.tipo ?? "nota")}: ${String(detalhes.descricao ?? "")}`;
    case "lead_criado":
      return "Lead cadastrado";
    case "lead_excluido":
      return "Lead excluído";
    case "lead_atualizado":
      return "Dados do lead atualizados";
    case "status_lead":
      return `Status alterado de ${rotulosStatus[String(detalhes.antes)] ?? String(detalhes.antes)} para ${rotulosStatus[String(detalhes.depois)] ?? String(detalhes.depois)}`;
    case "responsavel_lead":
      return `Responsável alterado de ${responsavel(detalhes.antes)} para ${responsavel(detalhes.depois)}`;
    case "negocio_criado":
      return `Oportunidade criada: ${String(detalhes.titulo ?? "")}`;
    case "negocio_excluido":
      return `Oportunidade excluída: ${String(detalhes.titulo ?? "")}`;
    case "negocio_atualizado":
      return "Dados da oportunidade atualizados";
    case "etapa_negocio":
      return `Etapa alterada de ${rotulosEtapa[String(detalhes.antes)] ?? String(detalhes.antes)} para ${rotulosEtapa[String(detalhes.depois)] ?? String(detalhes.depois)}`;
    case "responsavel_negocio":
      return `Responsável alterado de ${responsavel(detalhes.antes)} para ${responsavel(detalhes.depois)}`;
    case "valor_negocio":
      return `Valor estimado alterado de ${formatBRL(Number(detalhes.antes))} para ${formatBRL(Number(detalhes.depois))}`;
    default:
      return "Atividade registrada";
  }
}

export default async function CrmPage({
  searchParams,
}: {
  searchParams: Promise<{
    busca?: string;
    status?: string;
    origem?: string;
    responsavel?: string;
    prioridade?: string;
    periodo?: string;
  }>;
}) {
  await connection();
  const usuario = await requireAuth();
  const params = await searchParams;
  const supabase = await createClient();
  const [leadsResult, dealsResult, interactionsResult, tasksResult, clientsResult, activityResult, teamResult] = await Promise.all([
    supabase.from("leads").select("*").order("criado_em", { ascending: false }).limit(300),
    supabase.from("deals").select("*,leads(nome,email),clients(empresa)").order("criado_em", { ascending: false }).limit(300),
    supabase.from("interactions").select("id,lead_id,tipo,descricao,ocorreu_em,criado_por").not("lead_id", "is", null).order("ocorreu_em", { ascending: false }).limit(500),
    supabase.from("tasks").select("id,lead_id,titulo,vence_em,prioridade,concluida,responsavel").not("lead_id", "is", null).order("vence_em", { ascending: true, nullsFirst: false }).limit(300),
    supabase.from("clients").select("id,empresa,lead_id").order("empresa").limit(500),
    supabase.from("crm_activity").select("id,lead_id,deal_id,actor_id,evento,detalhes,created_at").order("created_at", { ascending: false }).limit(1000),
    supabase.from("profiles").select("id,nome,papel").order("nome"),
  ]);
  if (leadsResult.error) throw new Error(`Falha ao carregar leads: ${leadsResult.error.message}`);
  if (dealsResult.error) throw new Error(`Falha ao carregar oportunidades: ${dealsResult.error.message}`);
  if (interactionsResult.error) throw new Error(`Falha ao carregar interações: ${interactionsResult.error.message}`);
  if (tasksResult.error) throw new Error(`Falha ao carregar follow-ups: ${tasksResult.error.message}`);
  if (clientsResult.error) throw new Error(`Falha ao carregar clientes: ${clientsResult.error.message}`);
  if (activityResult.error) throw new Error(`Falha ao carregar histórico do CRM: ${activityResult.error.message}`);
  if (teamResult.error) throw new Error(`Falha ao carregar responsáveis da equipe: ${teamResult.error.message}`);

  const leads = leadsResult.data ?? [];
  const deals = dealsResult.data ?? [];
  const clientes = clientsResult.data ?? [];
  const equipe = teamResult.data ?? [];
  const nomeEquipe = new Map(equipe.map((membro) => [membro.id, membro.nome || "Membro da equipe"]));
  const clientePorLead = new Map<string, (typeof clientes)[number]>();
  for (const cliente of clientes) {
    if (cliente.lead_id) clientePorLead.set(cliente.lead_id, cliente);
  }
  const tarefasPorLead = new Map<string, typeof tasksResult.data>();
  for (const tarefa of tasksResult.data ?? []) {
    if (!tarefa.lead_id) continue;
    const tarefas = tarefasPorLead.get(tarefa.lead_id) ?? [];
    tarefas.push(tarefa);
    tarefasPorLead.set(tarefa.lead_id, tarefas);
  }

  const busca = (params.busca ?? "").trim().toLocaleLowerCase("pt-BR");
  const statusFiltro = statusLeads.some((status) => status.id === params.status) ? params.status : "";
  const origens = [...new Set(leads.map((lead) => lead.origem).filter(Boolean))].sort();
  const origemFiltro = origens.includes(params.origem ?? "") ? params.origem : "";
  const membroFiltro = params.responsavel === "__sem_responsavel__"
    ? params.responsavel
    : equipe.some((membro) => membro.id === params.responsavel) ? params.responsavel : "";
  const prioridadeFiltro = ["alta", "media", "baixa"].includes(params.prioridade ?? "") ? params.prioridade : "";
  const periodoFiltro = ["30", "90", "365", "todos"].includes(params.periodo ?? "") ? params.periodo ?? "todos" : "todos";
  const dataInicio = periodoFiltro === "todos" ? null : new Date();
  if (dataInicio) dataInicio.setDate(dataInicio.getDate() - Number(periodoFiltro));
  const dentroDoPeriodo = (data: string) => !dataInicio || new Date(data) >= dataInicio;
  const leadsFiltrados = leads.filter((lead) => {
    const texto = [lead.nome, lead.email, lead.empresa, lead.telefone, lead.tipo_projeto, lead.origem]
      .filter(Boolean).join(" ").toLocaleLowerCase("pt-BR");
    return (!busca || texto.includes(busca))
      && (!statusFiltro || lead.status === statusFiltro)
      && (!origemFiltro || lead.origem === origemFiltro)
      && (!membroFiltro || (membroFiltro === "__sem_responsavel__" ? !lead.responsavel : lead.responsavel === membroFiltro))
      && (!prioridadeFiltro || (tarefasPorLead.get(lead.id) ?? []).some((task) => !task.concluida && task.prioridade === prioridadeFiltro))
      && dentroDoPeriodo(lead.criado_em);
  });

  const leadsPeriodo = leads.filter((lead) => dentroDoPeriodo(lead.criado_em));
  const dealsPeriodo = deals.filter((deal) => dentroDoPeriodo(deal.criado_em));
  const oportunidadesAbertas = dealsPeriodo.filter((deal) => deal.etapa !== "ganho" && deal.etapa !== "perdido");
  const valorAberto = oportunidadesAbertas.reduce((total, deal) => total + Number(deal.valor_cents), 0);
  const ganhos = dealsPeriodo.filter((deal) => deal.etapa === "ganho");
  const encerradas = ganhos.length + dealsPeriodo.filter((deal) => deal.etapa === "perdido").length;
  const taxaGanho = encerradas ? Math.round((ganhos.length / encerradas) * 100) : 0;
  const hoje = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
  const tarefasAtrasadas = (tasksResult.data ?? []).filter((task) =>
    !task.concluida && task.vence_em && task.vence_em < hoje,
  ).length;
  const atividadesPorLead = new Map<string, Array<{
    id: string;
    evento: string;
    detalhes: Record<string, unknown>;
    created_at: string;
    actor_id: string | null;
  }>>();
  const atividadesPorNegocio = new Map<string, Array<{
    id: string;
    evento: string;
    detalhes: Record<string, unknown>;
    created_at: string;
    actor_id: string | null;
  }>>();
  for (const activity of activityResult.data ?? []) {
    const registro = {
      id: activity.id,
      evento: activity.evento,
      detalhes: activity.detalhes && typeof activity.detalhes === "object"
        ? activity.detalhes as Record<string, unknown>
        : {},
      created_at: activity.created_at,
      actor_id: activity.actor_id,
    };
    if (activity.lead_id) {
      const atividades = atividadesPorLead.get(activity.lead_id) ?? [];
      atividades.push(registro);
      atividadesPorLead.set(activity.lead_id, atividades);
    }
    if (activity.deal_id) {
      const atividades = atividadesPorNegocio.get(activity.deal_id) ?? [];
      atividades.push(registro);
      atividadesPorNegocio.set(activity.deal_id, atividades);
    }
  }
  for (const interaction of interactionsResult.data ?? []) {
    if (!interaction.lead_id) continue;
    const atividades = atividadesPorLead.get(interaction.lead_id) ?? [];
    atividades.push({
      id: interaction.id,
      evento: "interacao",
      detalhes: { tipo: interaction.tipo, descricao: interaction.descricao },
      created_at: interaction.ocorreu_em,
      actor_id: interaction.criado_por,
    });
    atividadesPorLead.set(interaction.lead_id, atividades);
  }
  for (const atividades of [...atividadesPorLead.values(), ...atividadesPorNegocio.values()]) {
    atividades.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  const porOrigem = new Map<string, { total: number; convertidos: number }>();
  for (const lead of leadsPeriodo) {
    const agregado = porOrigem.get(lead.origem) ?? { total: 0, convertidos: 0 };
    agregado.total += 1;
    if (lead.status === "convertido") agregado.convertidos += 1;
    porOrigem.set(lead.origem, agregado);
  }
  const porEtapa = etapas.map((etapa) => ({
    ...etapa,
    total: dealsPeriodo.filter((deal) => deal.etapa === etapa.id).length,
    valor: dealsPeriodo.filter((deal) => deal.etapa === etapa.id)
      .reduce((total, deal) => total + Number(deal.valor_cents), 0),
  }));
  const valoresPorEtapa = Math.max(1, ...porEtapa.map((etapa) => etapa.total));

  return (
    <>
      <PageHeader
        titulo="CRM e funil de vendas"
        descricao="Acompanhe contatos, oportunidades, follow-ups e a passagem para clientes e financeiro."
      />

      <section aria-label="Resumo comercial" className="admin-stagger mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { rotulo: "Leads no período", valor: String(leadsPeriodo.length), detalhe: `${leads.filter((lead) => !["convertido", "descartado"].includes(lead.status) && dentroDoPeriodo(lead.criado_em)).length} ativos` },
          { rotulo: "Oportunidades abertas", valor: String(oportunidadesAbertas.length), detalhe: formatBRL(valorAberto) },
          { rotulo: "Negócios ganhos", valor: String(ganhos.length), detalhe: formatBRL(ganhos.reduce((total, deal) => total + Number(deal.valor_cents), 0)) },
          { rotulo: "Taxa de ganho", valor: `${taxaGanho}%`, detalhe: `${tarefasAtrasadas} follow-up(s) atrasado(s) · até 300 registros recentes` },
        ].map((item) => (
          <article key={item.rotulo} className="rounded-marca-lg border border-borda bg-superficie p-4 shadow-suave transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-borda-forte hover:shadow-media">
            <p className="text-xs font-medium uppercase tracking-wide text-texto-suave">{item.rotulo}</p>
            <p className="mt-2 font-display text-2xl text-grafite">{item.valor}</p>
            <p className="mt-1 text-xs text-texto-suave">{item.detalhe}</p>
          </article>
        ))}
      </section>

      <section aria-labelledby="desempenho-titulo" className="mb-8 rounded-marca-lg border border-borda bg-superficie p-5 shadow-suave sm:p-6">
        <div className="mb-5">
          <h2 id="desempenho-titulo" className="font-display text-lg text-grafite">Desempenho comercial</h2>
          <p className="mt-1 text-xs text-texto-suave">Conversões por origem e oportunidades por etapa, considerando o período selecionado e até 300 registros recentes.</p>
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-grafite">Conversão por origem</h3>
            {porOrigem.size ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[22rem] text-left text-sm">
                  <thead><tr className="border-b border-borda text-xs text-texto-suave"><th scope="col" className="pb-2 font-medium">Origem</th><th scope="col" className="pb-2 text-right font-medium">Leads</th><th scope="col" className="pb-2 pl-4 font-medium">Conversão</th></tr></thead>
                  <tbody className="divide-y divide-borda">
                    {[...porOrigem.entries()].sort((a, b) => b[1].total - a[1].total).map(([origem, dados]) => {
                      const taxa = Math.round((dados.convertidos / dados.total) * 100);
                      return (
                        <tr key={origem}>
                          <th scope="row" className="py-2.5 pr-3 font-medium text-grafite">{origem}</th>
                          <td className="py-2.5 text-right tabular-nums text-texto-suave">{dados.total}</td>
                          <td className="py-2.5 pl-4">
                            <div className="flex items-center gap-2">
                              <div role="progressbar" aria-label={`${taxa}% de conversão para ${origem}`} aria-valuenow={taxa} aria-valuemin={0} aria-valuemax={100} className="h-2 min-w-16 flex-1 overflow-hidden rounded-full bg-areia-claro">
                                <span className="block h-full rounded-full bg-musgo transition-[width] duration-500" style={{ width: `${taxa}%` }} />
                              </div>
                              <span className="w-10 text-right text-xs tabular-nums text-texto-suave">{taxa}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : <p className="rounded-marca border border-dashed border-borda p-4 text-sm text-texto-suave">Sem leads no período selecionado.</p>}
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-grafite">Oportunidades por etapa</h3>
            <ol className="space-y-3">
              {porEtapa.map((etapa) => (
                <li key={etapa.id}>
                  <div className="mb-1 flex justify-between gap-3 text-xs">
                    <span className="font-medium text-grafite">{etapa.nome} <span className="text-texto-suave">({etapa.total})</span></span>
                    <span className="text-texto-suave">{formatBRL(etapa.valor)}</span>
                  </div>
                  <div role="progressbar" aria-label={`${etapa.total} oportunidades na etapa ${etapa.nome}`} aria-valuenow={etapa.total} aria-valuemin={0} aria-valuemax={valoresPorEtapa} className="h-2 overflow-hidden rounded-full bg-areia-claro">
                    <span className="block h-full rounded-full bg-salvia transition-[width] duration-500" style={{ width: `${(etapa.total / valoresPorEtapa) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <details className="mb-6 rounded-marca-lg border border-borda bg-superficie p-5">
        <summary className="cursor-pointer font-medium text-musgo">Cadastrar lead manualmente</summary>
        <form action={salvarLead} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input type="hidden" name="id" value="" />
          <input name="nome" required maxLength={120} placeholder="Nome do contato" className={classeInput()} />
          <input name="email" type="email" required maxLength={200} placeholder="E-mail" className={classeInput()} />
          <input name="empresa" maxLength={200} placeholder="Empresa" className={classeInput()} />
          <input name="telefone" maxLength={50} placeholder="Telefone / WhatsApp" className={classeInput()} />
          <input name="tipo_projeto" maxLength={120} placeholder="Serviço ou projeto de interesse" className={classeInput()} />
          <input name="origem" required maxLength={80} defaultValue="indicacao" placeholder="Origem do contato" className={classeInput()} />
          <select name="responsavel" defaultValue="" aria-label="Responsável pelo lead" className={classeInput()}>
            <option value="">Sem responsável</option>
            {equipe.map((membro) => <option key={membro.id} value={membro.id}>{membro.nome || "Membro da equipe"}</option>)}
          </select>
          <select name="status" defaultValue="novo" className={classeInput()}>
            {statusLeads.filter((status) => status.id !== "convertido").map((status) => <option key={status.id} value={status.id}>{status.nome}</option>)}
          </select>
          <textarea name="mensagem" maxLength={4000} placeholder="Necessidade, contexto e observações iniciais" className={`${classeInput()} sm:col-span-2 lg:col-span-3`} />
          <button className={botao}>Adicionar lead</button>
        </form>
      </details>

      <section className="mb-8">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg text-grafite">Funil de oportunidades</h2>
            <p className="text-xs text-texto-suave">Valores são previsões comerciais; registre recebimentos reais no Financeiro.</p>
          </div>
          {usuario.papel === "owner" || usuario.papel === "admin"
            ? <Link href="/admin/financeiro" className={secundario}>Abrir financeiro</Link>
            : null}
        </div>
        <details className="mb-4 rounded-marca-lg border border-borda bg-superficie p-5">
          <summary className="cursor-pointer font-medium text-musgo">Criar oportunidade</summary>
          <form action={salvarNegocio} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input type="hidden" name="id" value="" />
            <input name="titulo" required maxLength={200} placeholder="O que será vendido?" className={classeInput()} />
              <select name="responsavel" defaultValue="" aria-label="Responsável pela oportunidade" className={classeInput()}>
                <option value="">Sem responsável</option>
                {equipe.map((membro) => <option key={membro.id} value={membro.id}>{membro.nome || "Membro da equipe"}</option>)}
              </select>
            <select name="lead_id" defaultValue="" aria-label="Lead vinculado" className={classeInput()}>
              <option value="">Lead vinculado (opcional)</option>
              {leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.nome} · {lead.email}</option>)}
            </select>
            <select name="client_id" defaultValue="" aria-label="Cliente vinculado" className={classeInput()}>
              <option value="">Cliente vinculado (opcional)</option>
              {clientes.map((cliente) => <option key={cliente.id} value={cliente.id}>{cliente.empresa}</option>)}
            </select>
            <select name="etapa" defaultValue="novo" className={classeInput()}>
              {etapas.map((etapa) => <option key={etapa.id} value={etapa.id}>{etapa.nome}</option>)}
            </select>
            <MoneyField name="valor_cents" label="Valor estimado" />
            <input name="motivo_perda" maxLength={1000} placeholder="Motivo da perda (se aplicável)" className={classeInput()} />
            <button className={botao}>Salvar oportunidade</button>
          </form>
          <p className="mt-2 text-xs text-texto-suave">É possível vincular o lead e o cliente correspondente. Os valores do funil são estimativas e não geram lançamentos financeiros automaticamente.</p>
        </details>

        <div aria-label="Etapas do funil; deslize para visualizar todas" className="grid auto-cols-[minmax(16rem,1fr)] grid-flow-col snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-4">
          {etapas.map((etapa) => {
            const oportunidades = dealsPeriodo.filter((deal) => deal.etapa === etapa.id);
            return (
              <section key={etapa.id} aria-label={`Etapa ${etapa.nome}`} className="min-w-[16rem] snap-start rounded-marca-lg border border-borda bg-fundo-alt p-3">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-grafite">{etapa.nome}</h3>
                  <span className="rounded-full bg-superficie px-2 py-0.5 text-xs text-texto-suave">{oportunidades.length}</span>
                </div>
                <p className="mb-3 text-xs text-texto-suave">{formatBRL(oportunidades.reduce((total, deal) => total + Number(deal.valor_cents), 0))}</p>
                <div className="space-y-3">
                  {oportunidades.map((deal) => (
                    <article key={deal.id} className="rounded-marca border border-borda bg-superficie p-3">
                      <h4 className="font-medium text-grafite">{deal.titulo}</h4>
                      <p className="mt-1 text-xs text-texto-suave">
                        {deal.leads?.nome ?? deal.clients?.empresa ?? "Sem contato vinculado"}
                      </p>
                      <p className="mt-1 text-xs text-texto-suave">
                        Responsável: {deal.responsavel ? nomeEquipe.get(deal.responsavel) ?? "Membro da equipe" : "Não atribuído"}
                      </p>
                      {deal.client_id ? (
                        <Link href={`/admin/clientes#cliente-${deal.client_id}`} className="mt-1 inline-flex text-xs font-medium text-musgo underline-offset-4 hover:underline">
                          Abrir cliente
                        </Link>
                      ) : null}
                      <p className="mt-2 font-semibold text-musgo">{formatBRL(Number(deal.valor_cents))}</p>
                      {deal.etapa === "perdido" && deal.motivo_perda
                        ? <p className="mt-1 text-xs text-texto-suave">Perda: {deal.motivo_perda}</p>
                        : null}
                      <details className="mt-3 border-t border-borda pt-2">
                        <summary className="cursor-pointer text-xs font-medium text-musgo">Editar oportunidade</summary>
                        <form action={salvarNegocio} className="mt-2 grid gap-2">
                          <input type="hidden" name="id" value={deal.id} />
                          <input name="titulo" required maxLength={200} defaultValue={deal.titulo} aria-label="Título da oportunidade" className={classeInput()} />
                          <select name="responsavel" defaultValue={deal.responsavel ?? ""} aria-label="Responsável pela oportunidade" className={classeInput()}>
                            <option value="">Sem responsável</option>
                            {equipe.map((membro) => <option key={membro.id} value={membro.id}>{membro.nome || "Membro da equipe"}</option>)}
                          </select>
                          <select name="etapa" defaultValue={deal.etapa} aria-label="Etapa" className={classeInput()}>
                            {etapas.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
                          </select>
                          <select name="lead_id" defaultValue={deal.lead_id ?? ""} aria-label="Lead vinculado" className={classeInput()}>
                            <option value="">Sem lead vinculado</option>
                            {leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.nome}</option>)}
                          </select>
                          <select name="client_id" defaultValue={deal.client_id ?? ""} aria-label="Cliente vinculado" className={classeInput()}>
                            <option value="">Sem cliente vinculado</option>
                            {clientes.map((cliente) => <option key={cliente.id} value={cliente.id}>{cliente.empresa}</option>)}
                          </select>
                          <MoneyField name="valor_cents" label="Valor estimado" initialCentavos={Number(deal.valor_cents)} />
                          <textarea name="motivo_perda" maxLength={1000} defaultValue={deal.motivo_perda ?? ""} placeholder="Motivo da perda" aria-label="Motivo da perda" className={classeInput()} />
                          <button className={secundario}>Salvar alterações</button>
                        </form>
                        <form action={excluirNegocio} className="mt-2">
                          <input type="hidden" name="id" value={deal.id} />
                          <button className={secundario}>Excluir oportunidade</button>
                        </form>
                      </details>
                      {(atividadesPorNegocio.get(deal.id) ?? []).length ? (
                        <details className="mt-3 border-t border-borda pt-2">
                          <summary className="cursor-pointer text-xs font-medium text-musgo">Histórico da oportunidade ({atividadesPorNegocio.get(deal.id)?.length})</summary>
                          <ol className="mt-2 space-y-2">
                            {(atividadesPorNegocio.get(deal.id) ?? []).slice(0, 5).map((activity) => (
                              <li key={activity.id} className="rounded-marca bg-fundo-alt px-3 py-2 text-xs text-grafite">
                                <span>{rotuloEvento(activity.evento, activity.detalhes, nomeEquipe)}</span>
                                <time className="mt-1 block text-texto-suave">{dataHora(activity.created_at)}{activity.actor_id ? ` · ${nomeEquipe.get(activity.actor_id) ?? "Equipe"}` : ""}</time>
                              </li>
                            ))}
                          </ol>
                        </details>
                      ) : null}
                    </article>
                  ))}
                  {!oportunidades.length
                    ? <p className="rounded-marca border border-dashed border-borda p-3 text-xs text-texto-suave">Nenhuma oportunidade nesta etapa.</p>
                    : null}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg text-grafite">Leads e atividades</h2>
            <p className="text-xs text-texto-suave">Exibindo até 300 contatos recentes · ordenados pelos mais novos.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/tarefas" className={secundario}>Ver todas as tarefas</Link>
          </div>
        </div>
        <CrmFilterBar
          filtrosIniciais={{
            busca: params.busca ?? "",
            status: statusFiltro ?? "",
            origem: origemFiltro ?? "",
            responsavel: membroFiltro ?? "",
            prioridade: prioridadeFiltro ?? "",
            periodo: periodoFiltro,
          }}
          origens={origens}
          responsaveis={equipe.map(({ id, nome }) => ({ id, nome }))}
          quantidade={leadsFiltrados.length}
        />
        <form id="crm-bulk-update" action={atualizarLeadsEmLote} className="mb-4 flex flex-col gap-3 rounded-marca-lg border border-borda bg-fundo-alt p-4 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-grafite">Ações em lote</p>
            <p className="mt-1 text-xs text-texto-suave">Marque os contatos desejados e escolha status e/ou responsável.</p>
          </div>
          <label className="sm:w-48">
            <span className="mb-1 block text-xs font-medium text-texto-suave">Status</span>
            <select name="status" defaultValue="__manter__" className={classeInput()}>
              <option value="__manter__">Manter status atual</option>
              {statusLeads.filter((status) => status.id !== "convertido").map((status) => <option key={status.id} value={status.id}>{status.nome}</option>)}
            </select>
          </label>
          <label className="sm:w-48">
            <span className="mb-1 block text-xs font-medium text-texto-suave">Responsável</span>
            <select name="responsavel" defaultValue="__manter__" className={classeInput()}>
              <option value="__manter__">Manter responsável</option>
              <option value="">Remover responsável</option>
              {equipe.map((membro) => <option key={membro.id} value={membro.id}>{membro.nome || "Membro da equipe"}</option>)}
            </select>
          </label>
          <button className={botao}>Aplicar aos selecionados</button>
        </form>

        <div className="space-y-3">
          {leadsFiltrados.map((lead) => {
            const atividadesLead = atividadesPorLead.get(lead.id) ?? [];
            const tarefasLead = tarefasPorLead.get(lead.id) ?? [];
            const whatsapp = linkWhatsApp(lead.telefone, lead.nome);
            return (
              <article id={`lead-${lead.id}`} key={lead.id} className="scroll-mt-24 rounded-marca-lg border border-borda bg-superficie p-4 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-borda-forte hover:shadow-suave sm:p-5">
                <div className="flex flex-col justify-between gap-4 lg:flex-row">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center rounded-marca transition-colors hover:bg-musgo/10">
                        <input type="checkbox" name="lead_ids" value={lead.id} form="crm-bulk-update" aria-label={`Selecionar ${lead.nome}`} className="h-5 w-5 rounded border-borda accent-musgo" />
                      </label>
                      <h3 className="font-medium text-grafite">{lead.nome}{lead.empresa ? ` · ${lead.empresa}` : ""}</h3>
                      <span className="rounded-full bg-areia-claro px-2 py-1 text-xs text-grafite">
                        {statusLeads.find((status) => status.id === lead.status)?.nome ?? lead.status}
                      </span>
                    </div>
                    <p className="mt-1 break-words text-sm text-texto-suave">
                      {lead.email}{lead.telefone ? ` · ${lead.telefone}` : ""}{lead.tipo_projeto ? ` · ${lead.tipo_projeto}` : ""}
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm text-grafite">{lead.mensagem || "Sem mensagem."}</p>
                    <p className="mt-2 text-xs text-texto-suave">Recebido em {dataHora(lead.criado_em)} · origem: {lead.origem}</p>
                    <p className="mt-1 text-xs text-texto-suave">
                      Responsável: {lead.responsavel ? nomeEquipe.get(lead.responsavel) ?? "Membro da equipe" : "Não atribuído"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a href={`mailto:${encodeURIComponent(lead.email)}`} className={secundario}>Enviar e-mail</a>
                      {whatsapp ? <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={secundario}>Abrir WhatsApp</a> : null}
                      {lead.status !== "convertido" ? (
                        <form action={converterLead}>
                          <input type="hidden" name="id" value={lead.id} />
                          <input type="hidden" name="empresa" value={lead.empresa || lead.nome} />
                          <input type="hidden" name="responsavel" value={lead.nome} />
                          <button className={secundario}>Converter em cliente</button>
                        </form>
                      ) : clientePorLead.has(lead.id) ? (
                        <Link href={`/admin/clientes#cliente-${clientePorLead.get(lead.id)?.id}`} className={secundario}>
                          Abrir cadastro do cliente
                        </Link>
                      ) : null}
                    </div>
                  </div>
                  <div className="grid shrink-0 gap-2 sm:grid-cols-2 lg:w-[360px] lg:grid-cols-1">
                    {lead.status !== "convertido" ? (
                      <form action={atualizarLead} className="flex gap-2">
                        <input type="hidden" name="id" value={lead.id} />
                        <select name="status" defaultValue={lead.status} aria-label={`Status de ${lead.nome}`} className={classeInput()}>
                          {statusLeads.filter((status) => status.id !== "convertido").map((status) => <option key={status.id} value={status.id}>{status.nome}</option>)}
                        </select>
                        <select name="responsavel" defaultValue={lead.responsavel ?? ""} aria-label={`Responsável de ${lead.nome}`} className={classeInput()}>
                          <option value="">Sem responsável</option>
                          {equipe.map((membro) => <option key={membro.id} value={membro.id}>{membro.nome || "Membro da equipe"}</option>)}
                        </select>
                        <button className={secundario}>Atualizar</button>
                      </form>
                    ) : <p className="text-xs text-texto-suave">Convertido em cliente; o status é controlado pela conversão.</p>}
                    <details>
                      <summary className={`${secundario} cursor-pointer`}>Editar dados do lead</summary>
                      <form action={salvarLead} className="mt-2 grid gap-2 rounded-marca border border-borda p-3">
                        <input type="hidden" name="id" value={lead.id} />
                        <input name="nome" required maxLength={120} defaultValue={lead.nome} aria-label="Nome" className={classeInput()} />
                        <input name="email" type="email" required maxLength={200} defaultValue={lead.email} aria-label="E-mail" className={classeInput()} />
                        <input name="empresa" maxLength={200} defaultValue={lead.empresa ?? ""} aria-label="Empresa" className={classeInput()} />
                        <input name="telefone" maxLength={50} defaultValue={lead.telefone ?? ""} aria-label="Telefone" className={classeInput()} />
                        <input name="tipo_projeto" maxLength={120} defaultValue={lead.tipo_projeto ?? ""} aria-label="Interesse" className={classeInput()} />
                        <input name="origem" required maxLength={80} defaultValue={lead.origem} aria-label="Origem" className={classeInput()} />
                        <select name="responsavel" defaultValue={lead.responsavel ?? ""} aria-label="Responsável" className={classeInput()}>
                          <option value="">Sem responsável</option>
                          {equipe.map((membro) => <option key={membro.id} value={membro.id}>{membro.nome || "Membro da equipe"}</option>)}
                        </select>
                        {lead.status === "convertido"
                          ? <input type="hidden" name="status" value="convertido" />
                          : <select name="status" defaultValue={lead.status} aria-label="Status" className={classeInput()}>
                            {statusLeads.filter((status) => status.id !== "convertido").map((status) => <option key={status.id} value={status.id}>{status.nome}</option>)}
                          </select>}
                        <textarea name="mensagem" maxLength={4000} defaultValue={lead.mensagem} aria-label="Mensagem" className={classeInput()} />
                        <button className={secundario}>Salvar contato</button>
                      </form>
                    </details>
                  </div>
                </div>

                <details className="mt-4 border-t border-borda pt-3">
                  <summary className="cursor-pointer text-sm font-semibold text-grafite">
                    Follow-ups e atividades ({tarefasLead.filter((task) => !task.concluida).length} pendentes · {atividadesLead.length} registros)
                  </summary>
                  <div className="mt-3 grid gap-4 xl:grid-cols-2">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-texto-suave">Agendar próximo passo</h4>
                      <form action={salvarTarefa} className="mt-2 grid gap-2 sm:grid-cols-2">
                        <input type="hidden" name="lead_id" value={lead.id} />
                        <input type="hidden" name="client_id" value="" />
                        <input type="hidden" name="client_project_id" value="" />
                        <input name="titulo" required maxLength={200} defaultValue={`Retornar: ${lead.nome}`} aria-label="Tarefa" className={`${classeInput()} sm:col-span-2`} />
                        <input name="vence_em" type="date" aria-label="Data do follow-up" className={classeInput()} />
                        <select name="prioridade" defaultValue="media" aria-label="Prioridade" className={classeInput()}>
                          <option value="baixa">Prioridade baixa</option><option value="media">Prioridade média</option><option value="alta">Prioridade alta</option>
                        </select>
                        <textarea name="descricao" maxLength={4000} placeholder="Pauta ou contexto do retorno" className={`${classeInput()} sm:col-span-2`} />
                        <button className={secundario}>Agendar follow-up</button>
                      </form>
                      {tarefasLead.length ? (
                        <ul className="mt-3 space-y-2">
                          {tarefasLead.map((task) => {
                            const atrasada = !task.concluida && task.vence_em && task.vence_em < hoje;
                            return (
                              <li key={task.id} className={`flex items-center justify-between gap-3 rounded-marca border border-borda px-3 py-2 text-sm ${task.concluida ? "opacity-60" : ""}`}>
                                <div className="min-w-0">
                                  <p className={`break-words font-medium text-grafite ${task.concluida ? "line-through" : ""}`}>{task.titulo}</p>
                                  <p className={`mt-1 text-xs ${atrasada ? "font-medium text-red-700" : "text-texto-suave"}`}>
                                    {task.concluida ? "Concluída" : atrasada ? "Atrasada" : task.vence_em ? `Prazo ${new Date(`${task.vence_em}T12:00:00`).toLocaleDateString("pt-BR")}` : "Sem prazo"} · prioridade {task.prioridade}
                                  </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                  {task.vence_em ? (
                                    <a href={`/admin/tarefas/calendario?id=${task.id}`} aria-label={`Adicionar ${task.titulo} ao calendário`} className="inline-flex min-h-11 items-center rounded-marca px-2 text-xs font-medium text-musgo underline-offset-2 transition-colors hover:bg-musgo/10 hover:underline">
                                      Calendário
                                    </a>
                                  ) : null}
                                  <form action={alternarTarefa}>
                                    <input type="hidden" name="id" value={task.id} />
                                    <input type="hidden" name="concluida" value={String(task.concluida)} />
                                    <button
                                      type="submit"
                                      aria-label={task.concluida ? `Reabrir tarefa: ${task.titulo}` : `Concluir tarefa: ${task.titulo}`}
                                      title={task.concluida ? "Reabrir tarefa" : "Concluir tarefa"}
                                      className={`flex min-h-11 min-w-11 items-center justify-center rounded-marca border transition-[background-color,border-color,transform] duration-200 hover:-translate-y-px active:scale-95 ${task.concluida ? "border-borda bg-fundo-alt text-texto-suave hover:border-borda-forte" : "border-musgo text-musgo hover:bg-musgo/10"}`}
                                    >
                                      <span aria-hidden="true">{task.concluida ? "↺" : "✓"}</span>
                                    </button>
                                  </form>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-texto-suave">Histórico de relacionamento</h4>
                      <form action={registrarInteracao} className="mt-2 grid gap-2 sm:grid-cols-[140px_1fr_auto]">
                        <input type="hidden" name="lead_id" value={lead.id} />
                        <input type="hidden" name="client_id" value="" />
                        <select name="tipo" className={classeInput()}>
                          <option value="nota">Nota</option><option value="ligacao">Ligação</option><option value="whatsapp">WhatsApp</option><option value="reuniao">Reunião</option><option value="email">E-mail</option>
                        </select>
                        <input name="descricao" required maxLength={4000} placeholder="Resumo do contato ou próximo passo" className={classeInput()} />
                        <button className={secundario}>Registrar</button>
                      </form>
                      {atividadesLead.length ? (
                        <ol className="mt-3 space-y-2">
                              {atividadesLead.slice(0, 10).map((activity) => (
                                <li key={activity.id} className="rounded-marca bg-fundo-alt px-3 py-2 text-sm">
                                  <p className="text-grafite">{rotuloEvento(activity.evento, activity.detalhes, nomeEquipe)}</p>
                                  <time className="mt-1 block text-xs text-texto-suave">{dataHora(activity.created_at)}{activity.actor_id ? ` · ${nomeEquipe.get(activity.actor_id) ?? "Equipe"}` : ""}</time>
                            </li>
                          ))}
                        </ol>
                      ) : <p className="mt-3 text-xs text-texto-suave">Nenhuma atividade registrada até o momento.</p>}
                    </div>
                  </div>
                </details>
              </article>
            );
          })}
          {!leadsFiltrados.length
            ? <p className="rounded-marca border border-dashed border-borda p-6 text-sm text-texto-suave">Nenhum lead corresponde aos filtros atuais.</p>
            : null}
        </div>
      </section>
    </>
  );
}
