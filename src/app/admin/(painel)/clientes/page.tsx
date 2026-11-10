import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { classeInput } from "@/components/admin/FormField";
import { connection } from "next/server";
import { formatBRL } from "@/lib/money";
import { requireAuth } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import {
  excluirCliente,
  excluirContatoCliente,
  registrarInteracao,
  salvarCliente,
  salvarContatoCliente,
} from "../actions";

const botao = "inline-flex min-h-10 items-center justify-center rounded-marca bg-musgo px-4 text-sm font-medium text-white hover:bg-musgo-escuro";
const secundario = "inline-flex min-h-9 items-center justify-center rounded-marca border border-borda px-3 text-xs font-medium text-grafite hover:bg-areia-claro";

const etapasNegocio: Record<string, string> = {
  novo: "Nova",
  contato_feito: "Contato feito",
  proposta_enviada: "Proposta enviada",
  negociacao: "Negociação",
  ganho: "Ganha",
  perdido: "Perdida",
};

const statusProjeto: Record<string, string> = {
  ativo: "Ativo",
  pausado: "Pausado",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export default async function ClientesPage() {
  await connection();
  await requireAuth();
  const supabase = await createClient();
  const [clientesResult, interacoesResult, contatosResult, projetosResult, negociosResult] = await Promise.all([
    supabase.from("clients").select("*").order("criado_em", { ascending: false }),
    supabase.from("interactions").select("id,client_id,tipo,descricao,ocorreu_em").not("client_id", "is", null).order("ocorreu_em", { ascending: false }).limit(200),
    supabase.from("client_contacts").select("*").order("principal", { ascending: false }).order("nome"),
    supabase.from("client_projects").select("id,client_id,nome,etapa,status,valor_cents,prazo").order("criado_em", { ascending: false }),
    supabase.from("deals").select("id,client_id,titulo,etapa,valor_cents,lead_id").not("client_id", "is", null).order("criado_em", { ascending: false }),
  ]);
  if (clientesResult.error) throw new Error(`Falha ao carregar clientes: ${clientesResult.error.message}`);
  if (interacoesResult.error) throw new Error(`Falha ao carregar histórico: ${interacoesResult.error.message}`);
  if (contatosResult.error) throw new Error(`Falha ao carregar contatos dos clientes: ${contatosResult.error.message}`);
  if (projetosResult.error) throw new Error(`Falha ao carregar projetos dos clientes: ${projetosResult.error.message}`);
  if (negociosResult.error) throw new Error(`Falha ao carregar oportunidades dos clientes: ${negociosResult.error.message}`);

  const clientes = clientesResult.data ?? [];
  const idsLeads = [...new Set(clientes.flatMap((cliente) => cliente.lead_id ? [cliente.lead_id] : []))];
  const leadsResult = idsLeads.length
    ? await supabase.from("leads").select("id,nome,email,status").in("id", idsLeads)
    : null;
  if (leadsResult?.error) throw new Error(`Falha ao carregar leads vinculados: ${leadsResult.error.message}`);

  const leadsPorId = new Map((leadsResult?.data ?? []).map((lead) => [lead.id, lead]));
  const projetosPorCliente = new Map<string, NonNullable<typeof projetosResult.data>>();
  for (const projeto of projetosResult.data ?? []) {
    const projetos = projetosPorCliente.get(projeto.client_id) ?? [];
    projetos.push(projeto);
    projetosPorCliente.set(projeto.client_id, projetos);
  }
  const negociosPorCliente = new Map<string, NonNullable<typeof negociosResult.data>>();
  for (const negocio of negociosResult.data ?? []) {
    if (!negocio.client_id) continue;
    const negocios = negociosPorCliente.get(negocio.client_id) ?? [];
    negocios.push(negocio);
    negociosPorCliente.set(negocio.client_id, negocios);
  }
  const projetosAtivos = (projetosResult.data ?? []).filter((projeto) => projeto.status === "ativo").length;
  const negociosAbertos = (negociosResult.data ?? []).filter((negocio) =>
    negocio.etapa !== "ganho" && negocio.etapa !== "perdido",
  );
  const valorAberto = negociosAbertos.reduce((total, negocio) => total + Number(negocio.valor_cents), 0);

  return (
    <>
      <PageHeader
        titulo="Clientes"
        descricao="Acompanhe o relacionamento, as oportunidades comerciais e a entrega dos projetos de cada cliente."
        acoes={
          <>
            <Link href="/admin/crm" className={secundario}>Abrir funil de vendas</Link>
            <Link href="/admin/projetos" className={secundario}>Gerenciar projetos</Link>
          </>
        }
      />
      <section aria-label="Resumo da carteira" className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { rotulo: "Clientes", valor: String(clientes.length), detalhe: "contas cadastradas" },
          { rotulo: "Projetos ativos", valor: String(projetosAtivos), detalhe: `${(projetosResult.data ?? []).length} projetos no total` },
          { rotulo: "Oportunidades abertas", valor: String(negociosAbertos.length), detalhe: formatBRL(valorAberto) },
          { rotulo: "Leads convertidos", valor: String(clientes.filter((cliente) => cliente.lead_id).length), detalhe: "com origem registrada no CRM" },
        ].map((item) => (
          <article key={item.rotulo} className="rounded-marca-lg border border-borda bg-superficie p-4 transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-borda-forte hover:shadow-suave">
            <p className="text-xs font-medium uppercase tracking-wide text-texto-suave">{item.rotulo}</p>
            <p className="mt-2 font-display text-2xl text-grafite">{item.valor}</p>
            <p className="mt-1 text-xs text-texto-suave">{item.detalhe}</p>
          </article>
        ))}
      </section>
      <details className="mb-6 rounded-marca-lg border border-borda bg-superficie p-5">
        <summary className="cursor-pointer font-medium text-musgo">Adicionar cliente</summary>
        <form action={salvarCliente} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input name="empresa" required maxLength={200} placeholder="Empresa / nome" className={classeInput()} />
          <input name="responsavel" maxLength={120} placeholder="Pessoa responsável" className={classeInput()} />
          <input name="email" type="email" maxLength={200} placeholder="E-mail" className={classeInput()} />
          <input name="telefone" maxLength={50} placeholder="Telefone" className={classeInput()} />
          <input name="documento" maxLength={40} placeholder="CPF / CNPJ" className={classeInput()} />
          <input name="endereco" maxLength={500} placeholder="Endereço" className={classeInput()} />
          <textarea name="observacoes" maxLength={4000} placeholder="Observações" className={`${classeInput()} sm:col-span-2 lg:col-span-3`} />
          <button className={botao}>Salvar cliente</button>
        </form>
      </details>

      <div className="grid gap-4 xl:grid-cols-2">
        {clientes.map((cliente) => {
          const historico = (interacoesResult.data ?? []).filter((item) => item.client_id === cliente.id);
          const contatos = (contatosResult.data ?? []).filter((item) => item.client_id === cliente.id);
          const projetos = projetosPorCliente.get(cliente.id) ?? [];
          const negocios = negociosPorCliente.get(cliente.id) ?? [];
          const lead = cliente.lead_id ? leadsPorId.get(cliente.lead_id) : undefined;
          return (
            <article id={`cliente-${cliente.id}`} key={cliente.id} className="scroll-mt-24 rounded-marca-lg border border-borda bg-superficie p-5 transition-[border-color,box-shadow] duration-200 hover:border-borda-forte hover:shadow-suave">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="break-words font-display text-lg text-grafite">{cliente.empresa}</h2>
                  <p className="mt-1 text-sm text-texto-suave">
                    {cliente.responsavel || cliente.email || "Sem pessoa responsável cadastrada"}
                  </p>
                  {lead ? (
                    <Link href={`/admin/crm#lead-${lead.id}`} className="mt-2 inline-flex text-xs font-medium text-musgo underline-offset-4 hover:underline">
                      Lead de origem: {lead.nome} · {lead.status.replaceAll("_", " ")}
                    </Link>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-areia-claro px-2.5 py-1 text-grafite">{projetos.length} projeto(s)</span>
                  <span className="rounded-full bg-musgo/10 px-2.5 py-1 text-musgo">{negocios.length} oportunidade(s)</span>
                </div>
              </div>
              <form action={salvarCliente} className="grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="id" value={cliente.id} />
                <input name="empresa" required maxLength={200} defaultValue={cliente.empresa} aria-label="Empresa" className={classeInput()} />
                <input name="responsavel" maxLength={120} defaultValue={cliente.responsavel ?? ""} placeholder="Responsável" aria-label="Responsável" className={classeInput()} />
                <input name="email" type="email" maxLength={200} defaultValue={cliente.email ?? ""} placeholder="E-mail" aria-label="E-mail" className={classeInput()} />
                <input name="telefone" maxLength={50} defaultValue={cliente.telefone ?? ""} placeholder="Telefone" aria-label="Telefone" className={classeInput()} />
                <input name="documento" maxLength={40} defaultValue={cliente.documento ?? ""} placeholder="CPF / CNPJ" aria-label="CPF / CNPJ" className={classeInput()} />
                <input name="endereco" maxLength={500} defaultValue={cliente.endereco ?? ""} placeholder="Endereço" aria-label="Endereço" className={classeInput()} />
                <textarea name="observacoes" maxLength={4000} defaultValue={cliente.observacoes ?? ""} placeholder="Observações" aria-label="Observações" className={`${classeInput()} sm:col-span-2`} />
                <button className={secundario}>Salvar alterações</button>
                <button formAction={excluirCliente} name="id" value={cliente.id} className={secundario}>Excluir cliente</button>
              </form>
              <section className="mt-5 grid gap-4 border-t border-borda pt-4 sm:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-grafite">Projetos</h3>
                    <Link href="/admin/projetos" className="text-xs font-medium text-musgo hover:underline">Abrir gestão</Link>
                  </div>
                  {projetos.length ? (
                    <ul className="mt-2 space-y-2">
                      {projetos.slice(0, 4).map((projeto) => (
                        <li key={projeto.id} className="rounded-marca bg-fundo-alt px-3 py-2 text-sm">
                          <span className="font-medium text-grafite">{projeto.nome}</span>
                          <span className="mt-0.5 block text-xs text-texto-suave">
                            {statusProjeto[projeto.status] ?? projeto.status} · {projeto.etapa} · {formatBRL(Number(projeto.valor_cents))}
                            {projeto.prazo ? ` · prazo ${new Date(`${projeto.prazo}T12:00:00`).toLocaleDateString("pt-BR")}` : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="mt-2 text-xs text-texto-suave">Nenhum projeto vinculado.</p>}
                </div>
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-grafite">Oportunidades</h3>
                    <Link href="/admin/crm" className="text-xs font-medium text-musgo hover:underline">Abrir funil</Link>
                  </div>
                  {negocios.length ? (
                    <ul className="mt-2 space-y-2">
                      {negocios.slice(0, 4).map((negocio) => (
                        <li key={negocio.id} className="rounded-marca bg-fundo-alt px-3 py-2 text-sm">
                          <span className="font-medium text-grafite">{negocio.titulo}</span>
                          <span className="mt-0.5 block text-xs text-texto-suave">
                            {etapasNegocio[negocio.etapa] ?? negocio.etapa} · {formatBRL(Number(negocio.valor_cents))}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="mt-2 text-xs text-texto-suave">Nenhuma oportunidade vinculada.</p>}
                </div>
              </section>
              <details className="mt-4 border-t border-borda pt-3">
                <summary className="cursor-pointer text-sm font-semibold text-grafite">Pessoas de contato ({contatos.length})</summary>
                <form action={salvarContatoCliente} className="mt-3 grid gap-2 sm:grid-cols-2">
                  <input type="hidden" name="client_id" value={cliente.id} />
                  <input name="nome" required maxLength={120} placeholder="Nome" className={classeInput()} />
                  <input name="cargo" maxLength={120} placeholder="Cargo" className={classeInput()} />
                  <input name="email" type="email" maxLength={200} placeholder="E-mail" className={classeInput()} />
                  <input name="telefone" maxLength={50} placeholder="Telefone" className={classeInput()} />
                  <select name="principal" className={classeInput()}><option value="false">Contato adicional</option><option value="true">Contato principal</option></select>
                  <button className={secundario}>Adicionar contato</button>
                </form>
                {contatos.length ? <ul className="mt-3 space-y-2">{contatos.map((contato) => <li key={contato.id} className="flex items-center justify-between gap-2 rounded-marca bg-fundo-alt px-3 py-2 text-sm"><span>{contato.nome}{contato.principal ? " · principal" : ""}{contato.cargo ? ` · ${contato.cargo}` : ""}{contato.email ? ` · ${contato.email}` : ""}</span><form action={excluirContatoCliente}><input type="hidden" name="id" value={contato.id} /><button className={secundario}>Remover</button></form></li>)}</ul> : null}
              </details>
              <div className="mt-5 border-t border-borda pt-4">
                <h3 className="text-sm font-semibold text-grafite">Histórico de contato</h3>
                <form action={registrarInteracao} className="mt-3 grid gap-2 sm:grid-cols-[130px_1fr_auto]">
                  <input type="hidden" name="lead_id" value="" /><input type="hidden" name="client_id" value={cliente.id} />
                  <select name="tipo" className={classeInput()}><option value="nota">Nota</option><option value="ligacao">Ligação</option><option value="whatsapp">WhatsApp</option><option value="reuniao">Reunião</option><option value="email">E-mail</option></select>
                  <input name="descricao" required maxLength={4000} placeholder="Registrar contato" className={classeInput()} />
                  <button className={secundario}>Adicionar</button>
                </form>
                {historico.length ? <ul className="mt-3 space-y-2">{historico.slice(0, 5).map((item) => (
                  <li key={item.id} className="rounded-marca bg-fundo-alt px-3 py-2 text-sm"><span className="font-medium text-musgo">{item.tipo}</span> · {item.descricao}<time className="ml-2 text-xs text-texto-suave">{new Date(item.ocorreu_em).toLocaleDateString("pt-BR")}</time></li>
                ))}</ul> : <p className="mt-3 text-xs text-texto-suave">Nenhuma interação registrada.</p>}
              </div>
            </article>
          );
        })}
      </div>
      {!clientes.length ? <p className="rounded-marca border border-dashed border-borda p-6 text-sm text-texto-suave">Ainda não há clientes. Você também pode converter leads pelo CRM.</p> : null}
    </>
  );
}
