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
  salvarNegocio,
} from "../actions";

const botao = "inline-flex min-h-10 items-center justify-center rounded-marca bg-musgo px-4 text-sm font-medium text-white hover:bg-musgo-escuro";
const secundario = "inline-flex min-h-9 items-center justify-center rounded-marca border border-borda px-3 text-xs font-medium text-grafite hover:bg-areia-claro";

export default async function CrmPage() {
  await connection();
  await requireAuth();
  const supabase = await createClient();
  const [leadsResult, dealsResult, interactionsResult] = await Promise.all([
    supabase.from("leads").select("*").order("criado_em", { ascending: false }).limit(100),
    supabase.from("deals").select("*,leads(nome),clients(empresa)").order("criado_em", { ascending: false }).limit(100),
    supabase.from("interactions").select("id,lead_id,tipo,descricao,ocorreu_em").not("lead_id", "is", null).order("ocorreu_em", { ascending: false }).limit(300),
  ]);
  if (leadsResult.error) throw new Error(`Falha ao carregar leads: ${leadsResult.error.message}`);
  if (dealsResult.error) throw new Error(`Falha ao carregar oportunidades: ${dealsResult.error.message}`);
  if (interactionsResult.error) throw new Error(`Falha ao carregar interações: ${interactionsResult.error.message}`);
  const leads = leadsResult.data ?? [];
  const deals = dealsResult.data ?? [];

  return (
    <>
      <PageHeader titulo="Funil de vendas" descricao="Gerencie os contatos recebidos e acompanhe cada oportunidade." />
      <section className="mb-8 rounded-marca-lg border border-borda bg-superficie p-5 sm:p-6">
        <h2 className="font-display text-lg text-grafite">Nova oportunidade</h2>
        <form action={salvarNegocio} className="mt-4 grid gap-3 md:grid-cols-5">
          <input name="titulo" required maxLength={200} placeholder="Título da oportunidade" className={classeInput()} />
          <select name="lead_id" className={classeInput()}>
            <option value="">Sem lead vinculado</option>
            {leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.nome} · {lead.email}</option>)}
          </select>
          <select name="etapa" className={classeInput()}>
            <option value="novo">Novo</option><option value="contato_feito">Contato feito</option>
            <option value="proposta_enviada">Proposta enviada</option><option value="negociacao">Negociação</option>
            <option value="ganho">Ganho</option><option value="perdido">Perdido</option>
          </select>
          <MoneyField name="valor_cents" label="Valor estimado" />
          <button className={botao}>Criar oportunidade</button>
        </form>
        <p className="mt-2 text-xs text-texto-suave">O painel exibe reais; os valores são armazenados em centavos inteiros para evitar arredondamentos.</p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-display text-lg text-grafite">Oportunidades ({deals.length})</h2>
        {deals.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {deals.map((deal) => (
              <article key={deal.id} className="rounded-marca-lg border border-borda bg-superficie p-4">
                <div className="flex items-start justify-between gap-3">
                  <div><h3 className="font-medium text-grafite">{deal.titulo}</h3>
                    <p className="mt-1 text-sm text-texto-suave">{deal.leads?.nome ?? deal.clients?.empresa ?? "Sem contato vinculado"} · {formatBRL(Number(deal.valor_cents))}</p></div>
                  <form action={excluirNegocio}><input type="hidden" name="id" value={deal.id} /><button className={secundario}>Excluir</button></form>
                </div>
                <form action={salvarNegocio} className="mt-3 grid gap-2 sm:grid-cols-4">
                  <input type="hidden" name="id" value={deal.id} />
                  <input name="titulo" required defaultValue={deal.titulo} aria-label="Título" className={classeInput()} />
                  <select name="etapa" defaultValue={deal.etapa} aria-label="Etapa" className={classeInput()}>
                    <option value="novo">Novo</option><option value="contato_feito">Contato feito</option>
                    <option value="proposta_enviada">Proposta enviada</option><option value="negociacao">Negociação</option>
                    <option value="ganho">Ganho</option><option value="perdido">Perdido</option>
                  </select>
                  <MoneyField name="valor_cents" label="Valor estimado" initialCentavos={Number(deal.valor_cents)} />
                  <input type="hidden" name="lead_id" value={deal.lead_id ?? ""} />
                  <input type="hidden" name="motivo_perda" value={deal.motivo_perda ?? ""} />
                  <button className={secundario}>Salvar</button>
                </form>
              </article>
            ))}
          </div>
        ) : <p className="rounded-marca border border-dashed border-borda p-6 text-sm text-texto-suave">Nenhuma oportunidade cadastrada.</p>}
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg text-grafite">Leads recebidos ({leads.length})</h2>
        <div className="space-y-3">
          {leads.map((lead) => (
            <article key={lead.id} className="rounded-marca-lg border border-borda bg-superficie p-4 sm:p-5">
              {(() => {
                const history = (interactionsResult.data ?? []).filter((item) => item.lead_id === lead.id);
                return history.length ? <ul className="mb-4 space-y-1 border-l-2 border-areia pl-3 text-xs text-texto-suave">{history.slice(0, 3).map((item) => <li key={item.id}><strong>{item.tipo}</strong> · {item.descricao} · {new Date(item.ocorreu_em).toLocaleDateString("pt-BR")}</li>)}</ul> : null;
              })()}
              <div className="flex flex-col justify-between gap-3 md:flex-row">
                <div className="min-w-0">
                  <h3 className="font-medium text-grafite">{lead.nome}{lead.empresa ? ` · ${lead.empresa}` : ""}</h3>
                  <p className="mt-1 text-sm text-texto-suave">{lead.email}{lead.telefone ? ` · ${lead.telefone}` : ""}{lead.tipo_projeto ? ` · ${lead.tipo_projeto}` : ""}</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-grafite">{lead.mensagem || "Sem mensagem."}</p>
                  <p className="mt-2 text-xs text-texto-suave">Recebido em {new Date(lead.criado_em).toLocaleString("pt-BR")} · origem: {lead.origem}</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-start gap-2">
                  <form action={atualizarLead} className="flex gap-2">
                    <input type="hidden" name="id" value={lead.id} />
                    <select name="status" defaultValue={lead.status} aria-label="Status do lead" className={classeInput("min-w-36")}>
                      <option value="novo">Novo</option><option value="em_contato">Em contato</option>
                      <option value="qualificado">Qualificado</option><option value="convertido">Convertido</option>
                      <option value="descartado">Descartado</option>
                    </select><button className={secundario}>Atualizar</button>
                  </form>
                  {lead.status !== "convertido" ? <form action={converterLead} className="flex gap-2">
                    <input type="hidden" name="id" value={lead.id} />
                    <input type="hidden" name="empresa" value={lead.empresa || lead.nome} />
                    <input type="hidden" name="responsavel" value={lead.nome} />
                    <button className={secundario}>Converter em cliente</button>
                  </form> : null}
                </div>
              </div>
              <form action={registrarInteracao} className="mt-4 grid gap-2 sm:grid-cols-[150px_1fr_auto]">
                <input type="hidden" name="lead_id" value={lead.id} />
                <input type="hidden" name="client_id" value="" />
                <select name="tipo" className={classeInput()}><option value="nota">Nota</option><option value="ligacao">Ligação</option><option value="whatsapp">WhatsApp</option><option value="reuniao">Reunião</option><option value="email">E-mail</option></select>
                <input name="descricao" required maxLength={4000} placeholder="Registrar interação ou próximo passo" className={classeInput()} />
                <button className={secundario}>Adicionar nota</button>
              </form>
            </article>
          ))}
          {!leads.length ? <p className="rounded-marca border border-dashed border-borda p-6 text-sm text-texto-suave">Os novos contatos enviados pelo formulário do site aparecerão aqui.</p> : null}
        </div>
      </section>
    </>
  );
}
