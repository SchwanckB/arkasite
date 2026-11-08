import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { AdminRestricted } from "@/components/admin/AdminRestricted";
import { classeInput } from "@/components/admin/FormField";
import { MoneyField } from "@/components/admin/MoneyField";
import { connection } from "next/server";
import type { ResumoFinanceiro } from "@/lib/finance";
import { formatBRL } from "@/lib/money";
import { requireAuth } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import {
  atualizarStatusLancamento,
  alternarContaFinanceira,
  excluirLancamento,
  excluirCategoriaFinanceira,
  salvarCategoriaFinanceira,
  salvarContaFinanceira,
  salvarLancamento,
} from "../actions";

const botao = "inline-flex min-h-10 items-center justify-center rounded-marca bg-musgo px-4 text-sm font-medium text-white hover:bg-musgo-escuro";
const secundario = "inline-flex min-h-9 items-center justify-center rounded-marca border border-borda px-3 text-xs font-medium text-grafite hover:bg-areia-claro";

export default async function FinanceiroPage() {
  await connection();
  const usuario = await requireAuth();
  if (usuario.papel === "staff") return <AdminRestricted modulo="Financeiro" />;
  const supabase = await createClient();
  const [lancamentosResult, contasResult, categoriasResult, resumoResult, clientesResult, projetosResult] = await Promise.all([
    supabase.from("transactions").select("*,finance_accounts(nome),finance_categories(nome),clients(empresa),client_projects(nome)").order("competencia", { ascending: false }).limit(300),
    supabase.from("finance_accounts").select("*").order("ordem"),
    supabase.from("finance_categories").select("*").order("nome"),
    supabase.rpc("resumo_financeiro"),
    supabase.from("clients").select("id,empresa").order("empresa").limit(500),
    supabase.from("client_projects").select("id,nome,client_id").order("criado_em", { ascending: false }).limit(500),
  ]);
  if (lancamentosResult.error) throw new Error(`Falha ao carregar lançamentos: ${lancamentosResult.error.message}`);
  if (contasResult.error) throw new Error(`Falha ao carregar contas: ${contasResult.error.message}`);
  if (categoriasResult.error) throw new Error(`Falha ao carregar categorias: ${categoriasResult.error.message}`);
  if (resumoResult.error) throw new Error(`Falha ao carregar resumo financeiro: ${resumoResult.error.message}`);
  if (clientesResult.error) throw new Error(`Falha ao carregar clientes do financeiro: ${clientesResult.error.message}`);
  if (projetosResult.error) throw new Error(`Falha ao carregar projetos do financeiro: ${projetosResult.error.message}`);
  const lancamentos = lancamentosResult.data ?? [];
  const resumo: ResumoFinanceiro[] = resumoResult.data ?? [];
  const entradas = resumo.filter((l) => l.tipo === "in" && l.status === "paid").reduce((n, l) => n + Number(l.total_cents), 0);
  const saidas = resumo.filter((l) => l.tipo === "out" && l.status === "paid").reduce((n, l) => n + Number(l.total_cents), 0);
  const pendente = resumo.filter((l) => l.status !== "paid").reduce((n, l) => n + (l.tipo === "in" ? 1 : -1) * Number(l.total_cents), 0);

  return (
    <>
      <PageHeader titulo="Financeiro" descricao="Lançamentos, contas e categorias. Acesso restrito a owner e admin." />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard rotulo="Entradas pagas" valor={formatBRL(entradas)} icone="ArrowDownToLine" />
        <StatCard rotulo="Despesas pagas" valor={formatBRL(saidas)} icone="ArrowUpFromLine" />
        <StatCard rotulo="Saldo pendente" valor={formatBRL(pendente)} icone="Clock3" />
      </div>
      <div className="mb-6 grid gap-4 xl:grid-cols-2">
        <details className="rounded-marca-lg border border-borda bg-superficie p-5">
          <summary className="cursor-pointer font-medium text-musgo">Novo lançamento</summary>
          <form action={salvarLancamento} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="id" value="" />
            <input name="descricao" required maxLength={300} placeholder="Descrição" className={classeInput()} />
            <select name="tipo" className={classeInput()}><option value="in">Entrada</option><option value="out">Despesa</option></select>
            <MoneyField name="amount_cents" label="Valor" />
            <input name="competencia" type="date" required aria-label="Competência" className={classeInput()} />
            <input name="vencimento" type="date" aria-label="Vencimento" className={classeInput()} />
            <select name="status" className={classeInput()}><option value="pending">Pendente</option><option value="paid">Pago</option><option value="overdue">Atrasado</option></select>
            <select name="account_id" className={classeInput()}><option value="">Sem conta</option>{(contasResult.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select>
            <select name="category_id" className={classeInput()}><option value="">Sem categoria</option>{(categoriasResult.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.nome} ({c.tipo === "in" ? "entrada" : "despesa"})</option>)}</select>
            <select name="client_id" className={classeInput()}><option value="">Sem cliente vinculado</option>{(clientesResult.data ?? []).map((cliente) => <option key={cliente.id} value={cliente.id}>{cliente.empresa}</option>)}</select>
            <select name="client_project_id" className={classeInput()}><option value="">Sem projeto vinculado</option>{(projetosResult.data ?? []).map((projeto) => <option key={projeto.id} value={projeto.id}>{projeto.nome}</option>)}</select>
            <button className={`${botao} sm:col-span-2`}>Salvar lançamento</button>
          </form>
          <p className="mt-2 text-xs text-texto-suave">Os valores são armazenados em centavos inteiros para evitar arredondamentos.</p>
        </details>
        <div className="grid gap-4 sm:grid-cols-2">
          <details className="rounded-marca-lg border border-borda bg-superficie p-5">
            <summary className="cursor-pointer font-medium text-musgo">Contas</summary>
            <form action={salvarContaFinanceira} className="mt-4 space-y-3">
              <input type="hidden" name="id" value="" />
              <input name="nome" required maxLength={100} placeholder="Nome da conta" className={classeInput()} />
              <select name="tipo" className={classeInput()}><option value="banco">Banco</option><option value="caixa">Caixa</option><option value="carteira_digital">Carteira digital</option></select>
              <MoneyField name="saldo_inicial_cents" label="Saldo inicial" />
              <button className={botao}>Salvar conta</button>
            </form>
            <ul className="mt-4 space-y-3 text-sm text-texto-suave">{(contasResult.data ?? []).map((c) => {
              const movimento = resumo.filter((item) => item.account_id === c.id && item.status === "paid").reduce((saldo, item) => saldo + (item.tipo === "in" ? 1 : -1) * Number(item.total_cents), 0);
              return <li key={c.id} className="rounded-marca border border-borda p-3">
                <p className="mb-2 font-medium text-grafite">{c.nome} · saldo {formatBRL(Number(c.saldo_inicial_cents) + movimento)}{!c.ativo ? " · inativa" : ""}</p>
                <div className="flex flex-wrap gap-2">
                  <form action={salvarContaFinanceira} className="grid flex-1 gap-2 sm:grid-cols-3">
                    <input type="hidden" name="id" value={c.id} />
                    <input name="nome" required maxLength={100} defaultValue={c.nome} aria-label="Nome da conta" className={classeInput()} />
                    <select name="tipo" defaultValue={c.tipo} aria-label="Tipo da conta" className={classeInput()}><option value="banco">Banco</option><option value="caixa">Caixa</option><option value="carteira_digital">Carteira digital</option></select>
                    <MoneyField name="saldo_inicial_cents" label="Saldo inicial" initialCentavos={Number(c.saldo_inicial_cents)} />
                    <button className={secundario}>Salvar conta</button>
                  </form>
                  <form action={alternarContaFinanceira}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="ativo" value={String(c.ativo)} /><button className={secundario}>{c.ativo ? "Desativar" : "Ativar"}</button></form>
                </div>
              </li>;
            })}</ul>
          </details>
          <details className="rounded-marca-lg border border-borda bg-superficie p-5">
            <summary className="cursor-pointer font-medium text-musgo">Adicionar categoria</summary>
            <form action={salvarCategoriaFinanceira} className="mt-4 space-y-3">
              <input type="hidden" name="id" value="" />
              <input name="nome" required maxLength={100} placeholder="Nome da categoria" className={classeInput()} />
              <select name="tipo" className={classeInput()}><option value="in">Entrada</option><option value="out">Despesa</option></select>
              <button className={botao}>Salvar categoria</button>
            </form>
            <ul className="mt-4 space-y-2 text-sm text-texto-suave">{(categoriasResult.data ?? []).map((c) => <li key={c.id} className="flex flex-wrap items-center justify-between gap-2">
              <form action={salvarCategoriaFinanceira} className="flex flex-1 gap-2"><input type="hidden" name="id" value={c.id} /><input name="nome" required maxLength={100} defaultValue={c.nome} aria-label="Nome da categoria" className={classeInput()} /><select name="tipo" defaultValue={c.tipo} aria-label="Tipo" className={classeInput()}><option value="in">Entrada</option><option value="out">Despesa</option></select><button className={secundario}>Salvar</button></form>
              <form action={excluirCategoriaFinanceira}><input type="hidden" name="id" value={c.id} /><button className={secundario}>Excluir</button></form>
            </li>)}</ul>
          </details>
        </div>
      </div>

      <section>
        <h2 className="mb-3 font-display text-lg text-grafite">Lançamentos</h2>
        <p className="mb-3 text-xs text-texto-suave">Exibindo os 300 lançamentos mais recentes; os totais acima consideram todos os registros.</p>
        <div className="space-y-2">
          {lancamentos.map((item) => (
            <article key={item.id} className="flex flex-col justify-between gap-3 rounded-marca border border-borda bg-superficie p-4 sm:flex-row sm:items-center">
              <div><p className="font-medium text-grafite">{item.tipo === "in" ? "+" : "−"} {formatBRL(Number(item.amount_cents))} · {item.descricao}</p>
                <p className="mt-1 text-xs text-texto-suave">{item.finance_categories?.nome ?? "Sem categoria"} · {item.finance_accounts?.nome ?? "Sem conta"} · {item.clients?.empresa ?? "Sem cliente"}{item.client_projects?.nome ? ` · ${item.client_projects.nome}` : ""} · competência {new Date(`${item.competencia}T12:00:00`).toLocaleDateString("pt-BR")}{item.vencimento ? ` · vence ${new Date(`${item.vencimento}T12:00:00`).toLocaleDateString("pt-BR")}` : ""}</p></div>
              <div className="flex items-center gap-2">
                <details className="relative">
                  <summary className="cursor-pointer list-none"><span className={secundario}>Editar</span></summary>
                  <form action={salvarLancamento} className="absolute right-0 z-10 mt-2 grid w-72 gap-2 rounded-marca-lg border border-borda bg-superficie p-4 shadow-media">
                    <input type="hidden" name="id" value={item.id} />
                    <input name="descricao" required maxLength={300} defaultValue={item.descricao} aria-label="Descrição" className={classeInput()} />
                    <select name="tipo" defaultValue={item.tipo} className={classeInput()}><option value="in">Entrada</option><option value="out">Despesa</option></select>
                    <MoneyField name="amount_cents" label="Valor" initialCentavos={Number(item.amount_cents)} />
                    <input name="competencia" type="date" required defaultValue={item.competencia} aria-label="Competência" className={classeInput()} />
                    <input name="vencimento" type="date" defaultValue={item.vencimento ?? ""} aria-label="Vencimento" className={classeInput()} />
                    <select name="status" defaultValue={item.status} className={classeInput()}><option value="pending">Pendente</option><option value="paid">Pago</option><option value="overdue">Atrasado</option></select>
                    <select name="account_id" defaultValue={item.account_id ?? ""} className={classeInput()}><option value="">Sem conta</option>{(contasResult.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select>
                    <select name="category_id" defaultValue={item.category_id ?? ""} className={classeInput()}><option value="">Sem categoria</option>{(categoriasResult.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select>
                    <select name="client_id" defaultValue={item.client_id ?? ""} className={classeInput()}><option value="">Sem cliente vinculado</option>{(clientesResult.data ?? []).map((cliente) => <option key={cliente.id} value={cliente.id}>{cliente.empresa}</option>)}</select>
                    <select name="client_project_id" defaultValue={item.client_project_id ?? ""} className={classeInput()}><option value="">Sem projeto vinculado</option>{(projetosResult.data ?? []).map((projeto) => <option key={projeto.id} value={projeto.id}>{projeto.nome}</option>)}</select>
                    <button className={secundario}>Salvar edição</button>
                  </form>
                </details>
                <form action={atualizarStatusLancamento} className="flex gap-2"><input type="hidden" name="id" value={item.id} />
                  <select name="status" defaultValue={item.status} aria-label="Status" className={classeInput("min-w-32")}><option value="pending">Pendente</option><option value="paid">Pago</option><option value="overdue">Atrasado</option></select><button className={secundario}>Atualizar</button>
                </form>
                <form action={excluirLancamento}><input type="hidden" name="id" value={item.id} /><button className={secundario}>Excluir</button></form>
              </div>
            </article>
          ))}
          {!lancamentos.length ? <p className="rounded-marca border border-dashed border-borda p-6 text-sm text-texto-suave">Nenhum lançamento registrado.</p> : null}
        </div>
      </section>
    </>
  );
}
