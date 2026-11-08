import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { classeInput } from "@/components/admin/FormField";
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
} from "../actions";

const botao = "inline-flex min-h-10 items-center justify-center rounded-marca bg-musgo px-4 text-sm font-medium text-white hover:bg-musgo-escuro";
const secundario = "inline-flex min-h-9 items-center justify-center rounded-marca border border-borda px-3 text-xs font-medium text-grafite hover:bg-areia-claro";

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

export default async function CrmPage({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string; status?: string; origem?: string }>;
}) {
  await connection();
  const usuario = await requireAuth();
  const params = await searchParams;
  const supabase = await createClient();
  const [leadsResult, dealsResult, interactionsResult, tasksResult, clientsResult] = await Promise.all([
    supabase.from("leads").select("*").order("criado_em", { ascending: false }).limit(300),
    supabase.from("deals").select("*,leads(nome,email),clients(empresa)").order("criado_em", { ascending: false }).limit(300),
    supabase.from("interactions").select("id,lead_id,tipo,descricao,ocorreu_em").not("lead_id", "is", null).order("ocorreu_em", { ascending: false }).limit(500),
    supabase.from("tasks").select("id,lead_id,titulo,vence_em,prioridade,concluida").not("lead_id", "is", null).order("vence_em", { ascending: true, nullsFirst: false }).limit(300),
    supabase.from("clients").select("id,empresa").order("empresa").limit(500),
  ]);
  if (leadsResult.error) throw new Error(`Falha ao carregar leads: ${leadsResult.error.message}`);
  if (dealsResult.error) throw new Error(`Falha ao carregar oportunidades: ${dealsResult.error.message}`);
  if (interactionsResult.error) throw new Error(`Falha ao carregar interações: ${interactionsResult.error.message}`);
  if (tasksResult.error) throw new Error(`Falha ao carregar follow-ups: ${tasksResult.error.message}`);
  if (clientsResult.error) throw new Error(`Falha ao carregar clientes: ${clientsResult.error.message}`);

  const leads = leadsResult.data ?? [];
  const deals = dealsResult.data ?? [];
  const clientes = clientsResult.data ?? [];
  const interacoesPorLead = new Map<string, typeof interactionsResult.data>();
  for (const interacao of interactionsResult.data ?? []) {
    if (!interacao.lead_id) continue;
    const historico = interacoesPorLead.get(interacao.lead_id) ?? [];
    historico.push(interacao);
    interacoesPorLead.set(interacao.lead_id, historico);
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
  const leadsFiltrados = leads.filter((lead) => {
    const texto = [lead.nome, lead.email, lead.empresa, lead.telefone, lead.tipo_projeto, lead.origem]
      .filter(Boolean).join(" ").toLocaleLowerCase("pt-BR");
    return (!busca || texto.includes(busca))
      && (!statusFiltro || lead.status === statusFiltro)
      && (!origemFiltro || lead.origem === origemFiltro);
  });

  const oportunidadesAbertas = deals.filter((deal) => deal.etapa !== "ganho" && deal.etapa !== "perdido");
  const valorAberto = oportunidadesAbertas.reduce((total, deal) => total + Number(deal.valor_cents), 0);
  const ganhos = deals.filter((deal) => deal.etapa === "ganho");
  const encerradas = ganhos.length + deals.filter((deal) => deal.etapa === "perdido").length;
  const taxaGanho = encerradas ? Math.round((ganhos.length / encerradas) * 100) : 0;
  const hoje = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
  const tarefasAtrasadas = (tasksResult.data ?? []).filter((task) =>
    !task.concluida && task.vence_em && task.vence_em < hoje,
  ).length;

  return (
    <>
      <PageHeader
        titulo="CRM e funil de vendas"
        descricao="Acompanhe contatos, oportunidades, follow-ups e a passagem para clientes e financeiro."
      />

      <section aria-label="Resumo comercial" className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { rotulo: "Leads ativos", valor: String(leads.filter((lead) => !["convertido", "descartado"].includes(lead.status)).length), detalhe: `${leads.length} contatos recentes` },
          { rotulo: "Oportunidades abertas", valor: String(oportunidadesAbertas.length), detalhe: formatBRL(valorAberto) },
          { rotulo: "Negócios ganhos", valor: String(ganhos.length), detalhe: formatBRL(ganhos.reduce((total, deal) => total + Number(deal.valor_cents), 0)) },
          { rotulo: "Taxa de ganho", valor: `${taxaGanho}%`, detalhe: `${tarefasAtrasadas} follow-up(s) atrasado(s)` },
        ].map((item) => (
          <article key={item.rotulo} className="rounded-marca-lg border border-borda bg-superficie p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-texto-suave">{item.rotulo}</p>
            <p className="mt-2 font-display text-2xl text-grafite">{item.valor}</p>
            <p className="mt-1 text-xs text-texto-suave">{item.detalhe}</p>
          </article>
        ))}
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

        <div className="grid gap-3 overflow-x-auto pb-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {etapas.map((etapa) => {
            const oportunidades = deals.filter((deal) => deal.etapa === etapa.id);
            return (
              <section key={etapa.id} aria-label={`Etapa ${etapa.nome}`} className="min-w-0 rounded-marca-lg border border-borda bg-fundo-alt p-3">
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
                      <p className="mt-2 font-semibold text-musgo">{formatBRL(Number(deal.valor_cents))}</p>
                      {deal.etapa === "perdido" && deal.motivo_perda
                        ? <p className="mt-1 text-xs text-texto-suave">Perda: {deal.motivo_perda}</p>
                        : null}
                      <details className="mt-3 border-t border-borda pt-2">
                        <summary className="cursor-pointer text-xs font-medium text-musgo">Editar oportunidade</summary>
                        <form action={salvarNegocio} className="mt-2 grid gap-2">
                          <input type="hidden" name="id" value={deal.id} />
                          <input name="titulo" required maxLength={200} defaultValue={deal.titulo} aria-label="Título da oportunidade" className={classeInput()} />
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
            <p className="text-xs text-texto-suave">Exibindo até 300 contatos recentes · {leadsFiltrados.length} correspondem aos filtros.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/tarefas" className={secundario}>Ver todas as tarefas</Link>
            <a href="/admin/crm/exportar" className={secundario}>Exportar leads CSV</a>
          </div>
        </div>
        <form method="get" className="mb-4 grid gap-2 rounded-marca-lg border border-borda bg-superficie p-4 sm:grid-cols-2 lg:grid-cols-[1fr_180px_180px_auto_auto]">
          <input name="busca" defaultValue={params.busca ?? ""} placeholder="Buscar nome, e-mail, empresa, telefone..." aria-label="Buscar leads" className={classeInput()} />
          <select name="status" defaultValue={statusFiltro} aria-label="Filtrar por status" className={classeInput()}>
            <option value="">Todos os status</option>
            {statusLeads.map((status) => <option key={status.id} value={status.id}>{status.nome}</option>)}
          </select>
          <select name="origem" defaultValue={origemFiltro} aria-label="Filtrar por origem" className={classeInput()}>
            <option value="">Todas as origens</option>
            {origens.map((origem) => <option key={origem} value={origem}>{origem}</option>)}
          </select>
          <button className={secundario}>Filtrar</button>
          <Link href="/admin/crm" className={`${secundario} text-center`}>Limpar</Link>
        </form>

        <div className="space-y-3">
          {leadsFiltrados.map((lead) => {
            const historico = interacoesPorLead.get(lead.id) ?? [];
            const tarefasLead = tarefasPorLead.get(lead.id) ?? [];
            const whatsapp = linkWhatsApp(lead.telefone, lead.nome);
            return (
              <article key={lead.id} className="rounded-marca-lg border border-borda bg-superficie p-4 sm:p-5">
                <div className="flex flex-col justify-between gap-4 lg:flex-row">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
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
                    Follow-ups e atividades ({tarefasLead.filter((task) => !task.concluida).length} pendentes · {historico.length} registros)
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
                          {tarefasLead.map((task) => (
                            <li key={task.id} className={`rounded-marca border border-borda px-3 py-2 text-sm ${task.concluida ? "opacity-60" : ""}`}>
                              <span className="font-medium text-grafite">{task.titulo}</span>
                              <span className="ml-2 text-xs text-texto-suave">
                                {task.concluida ? "Concluída" : task.vence_em ? `Prazo ${new Date(`${task.vence_em}T12:00:00`).toLocaleDateString("pt-BR")}` : "Sem prazo"} · prioridade {task.prioridade}
                              </span>
                            </li>
                          ))}
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
                      {historico.length ? (
                        <ol className="mt-3 space-y-2">
                          {historico.slice(0, 10).map((item) => (
                            <li key={item.id} className="rounded-marca bg-fundo-alt px-3 py-2 text-sm">
                              <span className="font-medium text-musgo">{item.tipo}</span> · {item.descricao}
                              <time className="ml-2 text-xs text-texto-suave">{dataHora(item.ocorreu_em)}</time>
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
