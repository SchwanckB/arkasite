import { PageHeader } from "@/components/admin/PageHeader";
import { classeInput } from "@/components/admin/FormField";
import { AdminRestricted } from "@/components/admin/AdminRestricted";
import Link from "next/link";
import { connection } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { alternarVisibilidadePortfolio, excluirProjetoPortfolio, salvarProjetoPortfolio } from "../actions";

const botao = "inline-flex min-h-10 items-center justify-center rounded-marca bg-musgo px-4 text-sm font-medium text-white hover:bg-musgo-escuro";
const secundario = "inline-flex min-h-9 items-center justify-center rounded-marca border border-borda px-3 text-xs font-medium text-grafite hover:bg-areia-claro";

type PortfolioAdminPageProps = {
  searchParams: Promise<{ categoria?: string }>;
};

export default async function PortfolioAdminPage({ searchParams }: PortfolioAdminPageProps) {
  await connection();
  const usuario = await requireAuth();
  if (usuario.papel === "staff") return <AdminRestricted modulo="Portfólio" />;
  const supabase = await createClient();
  const [projetosResult, secaoResult, params] = await Promise.all([
    supabase.from("projects").select("*").order("ordem"),
    supabase.from("site_sections").select("*").eq("id", "portfolio").maybeSingle(),
    searchParams,
  ]);
  const { data: projetos, error } = projetosResult;
  if (error) throw new Error(`Falha ao carregar portfólio: ${error.message}`);
  if (secaoResult.error) throw new Error(`Falha ao carregar visibilidade do portfólio: ${secaoResult.error.message}`);
  const secao = secaoResult.data;
  const rascunho = secao?.rascunho && typeof secao.rascunho === "object" && !Array.isArray(secao.rascunho)
    ? secao.rascunho as Record<string, unknown>
    : null;
  const categorias = [...new Set((projetos ?? []).map((p) => p.categoria.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const categoriaAtiva = categorias.includes(params.categoria ?? "") ? params.categoria : "";
  const projetosVisiveis = (projetos ?? []).filter((p) => !categoriaAtiva || p.categoria === categoriaAtiva);

  return (
    <>
      <PageHeader titulo="Portfólio" descricao="Edite projetos-conceito e publique trabalhos reais somente com autorização escrita." />
      <section className="mb-6 rounded-marca-lg border border-borda bg-superficie p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg text-grafite">Exibição da seção no site</h2>
            {secao ? (
              <p className="mt-1 text-sm text-texto-suave">
                Estado publicado: <strong className="font-medium text-grafite">{secao.visivel ? "visível" : "oculta"}</strong>
                {rascunho ? " · existe um rascunho para esta seção" : ""}
              </p>
            ) : (
              <p className="mt-1 text-sm text-texto-suave">A seção ainda não existe no banco. Execute o seed do Supabase para habilitar o controle.</p>
            )}
          </div>
          <Link href="/admin/site" className={secundario}>Gerenciar conteúdo do site</Link>
        </div>
        {secao ? (
          <form action={alternarVisibilidadePortfolio} className="mt-4 flex flex-wrap items-end gap-3">
              <label className="grid gap-1 text-sm text-grafite">Visibilidade da seção
                <select name="visivel" defaultValue={String(secao.visivel)} className={classeInput()}>
                  <option value="true">Exibir portfólio</option>
                  <option value="false">Ocultar portfólio</option>
                </select>
              </label>
              <button className={botao}>Atualizar visibilidade</button>
          </form>
        ) : null}
      </section>
      <div className="mb-6 rounded-marca border border-areia bg-areia-claro p-4 text-sm text-grafite">A visibilidade da seção inteira é atualizada imediatamente. Para mostrar ou ocultar uma página individual, marque-a como publicada ou rascunho. As categorias são editáveis em cada projeto e aparecem no filtro público a partir dos projetos publicados. Antes de publicar trabalho de cliente real, confirme que a autorização por escrito está arquivada. Imagens com capa exigem texto alternativo.</div>
      <details className="mb-6 rounded-marca-lg border border-borda bg-superficie p-5">
        <summary className="cursor-pointer font-medium text-musgo">Adicionar projeto</summary>
        <form action={salvarProjetoPortfolio} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="slug-do-projeto" className={classeInput()} />
          <input name="nome" required maxLength={120} placeholder="Nome" className={classeInput()} />
          <input name="categoria" list="portfolio-categorias" maxLength={100} placeholder="Categoria" className={classeInput()} />
          <select name="dispositivo" className={classeInput()}><option value="desktop">Desktop</option><option value="tablet">Tablet</option><option value="mobile">Celular</option></select>
          <select name="variante" className={classeInput()}><option value="institucional">Institucional</option><option value="loja">Loja</option><option value="landing">Landing page</option><option value="servico">Serviço</option></select>
          <select name="is_concept" className={classeInput()}><option value="true">Projeto-conceito</option><option value="false">Projeto real</option></select>
          <input name="live_url" type="url" placeholder="URL publicada" className={classeInput()} />
          <input name="cover_url" type="url" placeholder="URL da capa (opcional)" className={classeInput()} />
          <input name="cover_alt" maxLength={300} placeholder="Texto alternativo da capa" className={classeInput()} />
          <input name="tags" placeholder="Tags separadas por vírgula" className={classeInput()} />
          <input name="ordem" type="number" min="0" defaultValue="0" placeholder="Ordem" className={classeInput()} />
          <select name="publicado" className={classeInput()}><option value="false">Rascunho</option><option value="true">Publicado</option></select>
          <textarea name="descricao" required maxLength={2000} placeholder="Descrição" className={`${classeInput()} sm:col-span-2 lg:col-span-3`} />
          <textarea name="gallery" maxLength={2000} placeholder="URLs da galeria, uma por linha" className={`${classeInput()} sm:col-span-2 lg:col-span-3`} />
          <label className="flex items-start gap-2 text-sm text-grafite sm:col-span-2 lg:col-span-3"><input type="checkbox" name="autorizacao" className="mt-1" />Tenho autorização por escrito para publicar este projeto real (obrigatório para projeto real público).</label>
          <button className={botao}>Salvar projeto</button>
        </form>
      </details>

      <datalist id="portfolio-categorias">{categorias.map((categoria) => <option key={categoria} value={categoria} />)}</datalist>
      <form method="get" className="mb-4 flex flex-wrap items-end gap-3 rounded-marca border border-borda bg-superficie p-4">
        <label className="grid gap-1 text-sm text-grafite">Filtrar por categoria
          <select name="categoria" defaultValue={categoriaAtiva} className={classeInput()}>
            <option value="">Todas as categorias ({projetos?.length ?? 0})</option>
            {categorias.map((categoria) => <option key={categoria} value={categoria}>{categoria} ({projetos?.filter((p) => p.categoria === categoria).length ?? 0})</option>)}
          </select>
        </label>
        <button className={secundario}>Filtrar</button>
        {categoriaAtiva ? <Link href="/admin/portfolio" className={secundario}>Limpar filtro</Link> : null}
        <p className="text-sm text-texto-suave">{projetosVisiveis.length} de {projetos?.length ?? 0} projetos</p>
      </form>

      <div className="space-y-3">
        {projetosVisiveis.map((p) => (
          <details key={p.id} className="rounded-marca-lg border border-borda bg-superficie p-5">
            <summary className="cursor-pointer font-medium text-grafite">{p.nome} <span className="text-xs font-normal text-texto-suave">· {p.is_concept ? "Conceito" : "Cliente"} · {p.publicado ? "Publicado" : "Rascunho"}</span></summary>
            <form action={salvarProjetoPortfolio} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <input type="hidden" name="id" value={p.id} />
              <input name="slug" required defaultValue={p.slug} aria-label="Slug" className={classeInput()} />
              <input name="nome" required defaultValue={p.nome} aria-label="Nome" className={classeInput()} />
              <input name="categoria" list="portfolio-categorias" defaultValue={p.categoria} aria-label="Categoria" className={classeInput()} />
              <select name="dispositivo" defaultValue={p.dispositivo} aria-label="Dispositivo" className={classeInput()}><option value="desktop">Desktop</option><option value="tablet">Tablet</option><option value="mobile">Celular</option></select>
              <select name="variante" defaultValue={p.variante} aria-label="Variante" className={classeInput()}><option value="institucional">Institucional</option><option value="loja">Loja</option><option value="landing">Landing page</option><option value="servico">Serviço</option></select>
              <select name="is_concept" defaultValue={String(p.is_concept)} aria-label="Tipo" className={classeInput()}><option value="true">Projeto-conceito</option><option value="false">Projeto real</option></select>
              <input name="live_url" type="url" defaultValue={p.live_url ?? ""} placeholder="URL publicada" aria-label="URL publicada" className={classeInput()} />
              <input name="cover_url" type="url" defaultValue={p.cover_url ?? ""} placeholder="URL da capa" aria-label="URL da capa" className={classeInput()} />
              <input name="cover_alt" defaultValue={p.cover_alt ?? ""} placeholder="Texto alternativo da capa" aria-label="Texto alternativo" className={classeInput()} />
              <input name="tags" defaultValue={(p.tags ?? []).join(", ")} aria-label="Tags separadas por vírgula" className={classeInput()} />
              <input name="ordem" type="number" min="0" defaultValue={p.ordem} aria-label="Ordem" className={classeInput()} />
              <select name="publicado" defaultValue={String(p.publicado)} aria-label="Publicação" className={classeInput()}><option value="false">Rascunho</option><option value="true">Publicado</option></select>
              <textarea name="descricao" required defaultValue={p.descricao} aria-label="Descrição" className={`${classeInput()} sm:col-span-2 lg:col-span-3`} />
              <textarea name="gallery" defaultValue={(p.gallery ?? []).join("\n")} aria-label="URLs da galeria, uma por linha" className={`${classeInput()} sm:col-span-2 lg:col-span-3`} />
              <label className="flex items-start gap-2 text-sm text-grafite sm:col-span-2 lg:col-span-3"><input type="checkbox" name="autorizacao" className="mt-1" />Confirmo autorização por escrito se for trabalho de cliente.</label>
              <button className={botao}>Salvar alterações</button>
              <button formAction={excluirProjetoPortfolio} name="id" value={p.id} className={secundario}>Excluir projeto</button>
            </form>
          </details>
        ))}
        {!projetos?.length ? <p className="rounded-marca border border-dashed border-borda p-6 text-sm text-texto-suave">O banco ainda não tem projetos. Aplique o seed do Supabase ou cadastre o primeiro conceito.</p> : null}
      </div>
    </>
  );
}
