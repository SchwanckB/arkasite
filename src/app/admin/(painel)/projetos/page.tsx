import { PageHeader } from "@/components/admin/PageHeader";
import { classeInput } from "@/components/admin/FormField";
import { MoneyField } from "@/components/admin/MoneyField";
import { connection } from "next/server";
import { formatBRL } from "@/lib/money";
import { requireAuth } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { excluirProjetoCliente, salvarProjetoCliente } from "../actions";

const botao = "inline-flex min-h-10 items-center justify-center rounded-marca bg-musgo px-4 text-sm font-medium text-white hover:bg-musgo-escuro";
const secundario = "inline-flex min-h-9 items-center justify-center rounded-marca border border-borda px-3 text-xs font-medium text-grafite hover:bg-areia-claro";

export default async function ProjetosPage() {
  await connection();
  await requireAuth();
  const supabase = await createClient();
  const [clientesResult, projetosResult, etapasResult] = await Promise.all([
    supabase.from("clients").select("id,empresa").order("empresa"),
    supabase.from("client_projects").select("*,clients(empresa),process_steps(titulo,numero)").order("criado_em", { ascending: false }),
    supabase.from("process_steps").select("id,titulo,numero").order("numero"),
  ]);
  if (clientesResult.error) throw new Error(`Falha ao carregar clientes: ${clientesResult.error.message}`);
  if (projetosResult.error) throw new Error(`Falha ao carregar projetos: ${projetosResult.error.message}`);
  if (etapasResult.error) throw new Error(`Falha ao carregar etapas: ${etapasResult.error.message}`);
  const clientes = clientesResult.data ?? [];
  const etapas = etapasResult.data?.length ? etapasResult.data : [
    { id: "conversa", titulo: "Conversa", numero: 1 },
    { id: "planejamento", titulo: "Planejamento", numero: 2 },
    { id: "desenvolvimento", titulo: "Desenvolvimento", numero: 3 },
    { id: "entrega", titulo: "Entrega", numero: 4 },
  ];

  return (
    <>
      <PageHeader titulo="Projetos de clientes" descricao="Acompanhe escopo, etapa de trabalho, prazo e valor contratado." />
      <details className="mb-6 rounded-marca-lg border border-borda bg-superficie p-5">
        <summary className="cursor-pointer font-medium text-musgo">Novo projeto</summary>
        <form action={salvarProjetoCliente} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input name="nome" required maxLength={200} placeholder="Nome do projeto" className={classeInput()} />
          <select name="client_id" required className={classeInput()}><option value="">Selecione o cliente</option>{clientes.map((c) => <option key={c.id} value={c.id}>{c.empresa}</option>)}</select>
          <select name="etapa" className={classeInput()}>{etapas.map((e) => <option key={e.id} value={e.id}>{e.titulo}</option>)}</select>
          <select name="status" className={classeInput()}><option value="ativo">Ativo</option><option value="pausado">Pausado</option><option value="concluido">Concluído</option><option value="cancelado">Cancelado</option></select>
          <MoneyField name="valor_cents" label="Valor contratado" />
          <input name="prazo" type="date" aria-label="Prazo" className={classeInput()} />
          <button className={botao}>Criar projeto</button>
        </form>
        <p className="mt-2 text-xs text-texto-suave">Os valores são armazenados em centavos inteiros para evitar arredondamentos.</p>
      </details>

      <div className="space-y-3">
        {(projetosResult.data ?? []).map((projeto) => (
          <article key={projeto.id} className="rounded-marca-lg border border-borda bg-superficie p-5">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <div><h2 className="font-medium text-grafite">{projeto.nome}</h2><p className="text-sm text-texto-suave">{projeto.clients?.empresa ?? "Cliente"} · {formatBRL(Number(projeto.valor_cents))}</p></div>
              <span className="text-xs text-texto-suave">Criado em {new Date(projeto.criado_em).toLocaleDateString("pt-BR")}</span>
            </div>
            <form action={salvarProjetoCliente} className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
              <input type="hidden" name="id" value={projeto.id} />
              <input type="hidden" name="client_id" value={projeto.client_id} />
              <input name="nome" required defaultValue={projeto.nome} aria-label="Nome do projeto" className={classeInput()} />
              <select name="etapa" defaultValue={projeto.etapa} aria-label="Etapa" className={classeInput()}>{etapas.map((e) => <option key={e.id} value={e.id}>{e.titulo}</option>)}</select>
              <select name="status" defaultValue={projeto.status} aria-label="Status" className={classeInput()}><option value="ativo">Ativo</option><option value="pausado">Pausado</option><option value="concluido">Concluído</option><option value="cancelado">Cancelado</option></select>
              <MoneyField name="valor_cents" label="Valor contratado" initialCentavos={Number(projeto.valor_cents)} />
              <input name="prazo" type="date" defaultValue={projeto.prazo ?? ""} aria-label="Prazo" className={classeInput()} />
              <div className="flex gap-2"><button className={secundario}>Salvar</button><button formAction={excluirProjetoCliente} name="id" value={projeto.id} className={secundario}>Excluir</button></div>
            </form>
          </article>
        ))}
        {!projetosResult.data?.length ? <p className="rounded-marca border border-dashed border-borda p-6 text-sm text-texto-suave">Nenhum projeto de cliente cadastrado.</p> : null}
      </div>
    </>
  );
}
