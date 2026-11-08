import { PageHeader } from "@/components/admin/PageHeader";
import { classeInput } from "@/components/admin/FormField";
import { AdminRestricted } from "@/components/admin/AdminRestricted";
import { connection } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getBrand } from "@/lib/data";
import {
  excluirDiferencial,
  excluirFaq,
  excluirServico,
  publicarSecao,
  salvarTextosInstitucionais,
  salvarDiferencial,
  salvarEtapa,
  salvarFaq,
  salvarSecao,
  salvarServico,
} from "../actions";

const botao = "inline-flex min-h-10 items-center justify-center rounded-marca bg-musgo px-4 text-sm font-medium text-white hover:bg-musgo-escuro";
const secundario = "inline-flex min-h-9 items-center justify-center rounded-marca border border-borda px-3 text-xs font-medium text-grafite hover:bg-areia-claro";

export default async function ConteudoSitePage() {
  await connection();
  const usuario = await requireAuth();
  if (usuario.papel === "staff") return <AdminRestricted modulo="Conteúdo do site" />;
  const supabase = await createClient();
  const [secoes, servicos, diferenciais, etapas, faqs] = await Promise.all([
    supabase.from("site_sections").select("*").order("ordem"),
    supabase.from("services").select("*").order("ordem"),
    supabase.from("differentials").select("*").order("ordem"),
    supabase.from("process_steps").select("*").order("numero"),
    supabase.from("faq").select("*").order("ordem"),
  ]);
  const brand = await getBrand();
  if (secoes.error) throw new Error(`Falha ao carregar seções: ${secoes.error.message}`);
  if (servicos.error) throw new Error(`Falha ao carregar serviços: ${servicos.error.message}`);
  if (diferenciais.error) throw new Error(`Falha ao carregar diferenciais: ${diferenciais.error.message}`);
  if (etapas.error) throw new Error(`Falha ao carregar processo: ${etapas.error.message}`);
  if (faqs.error) throw new Error(`Falha ao carregar perguntas: ${faqs.error.message}`);

  return (
    <>
      <PageHeader titulo="Conteúdo do site" descricao="Edite seções, serviços, diferenciais, etapas e perguntas frequentes. Seções precisam ser publicadas." />
      <details className="mb-9 rounded-marca-lg border border-borda bg-superficie p-5">
        <summary className="cursor-pointer font-medium text-musgo">Textos institucionais (Sobre e marca)</summary>
        <p className="mt-2 text-sm text-texto-suave">Edite o objeto JSON. O formato deve manter manifesto, missão, visão, valores, sobre e indicadores. As perguntas frequentes são gerenciadas separadamente abaixo.</p>
        <form action={salvarTextosInstitucionais} className="mt-4 space-y-3">
          <textarea name="brand" required defaultValue={JSON.stringify({
            manifesto: brand.manifesto, missao: brand.missao, visao: brand.visao,
            valores: brand.valores, sobre: brand.sobre, indicadores: brand.indicadores,
          }, null, 2)} className={`${classeInput()} min-h-96 font-mono text-xs`} />
          <button className={botao}>Salvar textos institucionais</button>
        </form>
      </details>
      <section className="mb-9">
        <h2 className="mb-3 font-display text-lg text-grafite">Seções</h2>
        <div className="space-y-3">
          {(secoes.data ?? []).map((s) => {
            const draft = s.rascunho && typeof s.rascunho === "object" ? s.rascunho : null;
            const value = draft ?? s;
            return <details key={s.id} className="rounded-marca-lg border border-borda bg-superficie p-5">
              <summary className="cursor-pointer font-medium text-grafite">{s.rotulo} <span className="text-xs font-normal text-texto-suave">· {draft ? "Rascunho pendente" : "Publicado"}</span></summary>
              <form action={salvarSecao} className="mt-4 grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="id" value={s.id} />
                <input name="titulo" required maxLength={200} defaultValue={value.titulo ?? ""} placeholder="Título" className={classeInput()} />
                <input name="subtitulo" maxLength={300} defaultValue={value.subtitulo ?? ""} placeholder="Subtítulo" className={classeInput()} />
                <textarea name="descricao" maxLength={3000} defaultValue={value.descricao ?? ""} placeholder="Descrição" className={`${classeInput()} sm:col-span-2`} />
                <textarea name="conteudo" defaultValue={JSON.stringify(value.conteudo ?? {}, null, 2)} aria-label="Conteúdo adicional JSON" className={`${classeInput()} min-h-32 font-mono text-xs sm:col-span-2`} />
                <label className="flex items-center gap-2 text-sm">Visibilidade
                  <select name="visivel" defaultValue={String(Boolean(value.visivel))} className={classeInput()}><option value="true">Exibir no site</option><option value="false">Ocultar do site</option></select>
                </label>
                <input name="ordem" type="number" min="0" defaultValue={value.ordem ?? 0} aria-label="Ordem" className={classeInput()} />
                <button className={botao}>Salvar rascunho</button>
              </form>
              {draft ? <form action={publicarSecao} className="mt-2"><input type="hidden" name="id" value={s.id} /><button className={secundario}>Publicar alterações</button></form> : null}
            </details>;
          })}
          {!secoes.data?.length ? <p className="rounded-marca border border-dashed border-borda p-5 text-sm text-texto-suave">Nenhuma seção no banco. Execute o seed atualizado do Supabase.</p> : null}
        </div>
      </section>

      <section className="mb-9">
        <div className="mb-3 flex items-center justify-between"><h2 className="font-display text-lg text-grafite">Serviços</h2></div>
        <details className="mb-3 rounded-marca-lg border border-borda bg-superficie p-5">
          <summary className="cursor-pointer font-medium text-musgo">Adicionar serviço</summary>
          <form action={salvarServico} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input name="slug" required placeholder="slug-do-servico" className={classeInput()} /><input name="nome" required placeholder="Nome" className={classeInput()} />
            <input name="icone" defaultValue="Globe" placeholder="Ícone Lucide" className={classeInput()} /><input name="ordem" type="number" min="0" defaultValue="0" placeholder="Ordem" className={classeInput()} />
            <textarea name="descricao" required placeholder="Descrição" className={`${classeInput()} sm:col-span-2`} /><textarea name="entregas" placeholder="Entregas, uma por linha" className={`${classeInput()} sm:col-span-2`} />
            <select name="publicado" className={classeInput()}><option value="true">Publicado</option><option value="false">Rascunho</option></select><button className={botao}>Adicionar</button>
          </form>
        </details>
        <div className="space-y-2">{(servicos.data ?? []).map((s) => <details key={s.id} className="rounded-marca border border-borda bg-superficie p-4">
          <summary className="cursor-pointer text-sm font-medium text-grafite">{s.nome} · {s.publicado ? "Publicado" : "Rascunho"}</summary>
          <form action={salvarServico} className="mt-3 grid gap-2 sm:grid-cols-2">
            <input type="hidden" name="id" value={s.id} /><input name="slug" required defaultValue={s.slug} className={classeInput()} /><input name="nome" required defaultValue={s.nome} className={classeInput()} />
            <input name="icone" defaultValue={s.icone} className={classeInput()} /><input name="ordem" type="number" min="0" defaultValue={s.ordem} className={classeInput()} />
            <textarea name="descricao" required defaultValue={s.descricao} className={`${classeInput()} sm:col-span-2`} /><textarea name="entregas" defaultValue={(s.entregas ?? []).join("\n")} className={`${classeInput()} sm:col-span-2`} />
            <select name="publicado" defaultValue={String(s.publicado)} className={classeInput()}><option value="true">Publicado</option><option value="false">Rascunho</option></select>
            <div className="flex gap-2"><button className={secundario}>Salvar</button><button formAction={excluirServico} name="id" value={s.id} className={secundario}>Excluir</button></div>
          </form>
        </details>)}</div>
      </section>

      <section className="mb-9">
        <h2 className="mb-3 font-display text-lg text-grafite">Diferenciais</h2>
        <details className="mb-3 rounded-marca-lg border border-borda bg-superficie p-5"><summary className="cursor-pointer font-medium text-musgo">Adicionar diferencial</summary>
          <form action={salvarDiferencial} className="mt-4 grid gap-3 sm:grid-cols-2"><input name="titulo" required placeholder="Título" className={classeInput()} /><input name="icone" defaultValue="Circle" placeholder="Ícone" className={classeInput()} /><textarea name="descricao" required placeholder="Descrição" className={classeInput()} /><textarea name="apoio" placeholder="Frase de apoio" className={classeInput()} /><input name="ordem" type="number" min="0" defaultValue="0" className={classeInput()} /><button className={botao}>Adicionar</button></form>
        </details>
        <div className="grid gap-2 sm:grid-cols-2">{(diferenciais.data ?? []).map((d) => <form key={d.id} action={salvarDiferencial} className="grid gap-2 rounded-marca border border-borda bg-superficie p-4">
          <input type="hidden" name="id" value={d.id} /><input name="titulo" required defaultValue={d.titulo} className={classeInput()} /><input name="icone" defaultValue={d.icone} className={classeInput()} /><textarea name="descricao" required defaultValue={d.descricao} className={classeInput()} /><input name="apoio" defaultValue={d.apoio ?? ""} placeholder="Apoio" className={classeInput()} /><input name="ordem" type="number" min="0" defaultValue={d.ordem} className={classeInput()} /><div className="flex gap-2"><button className={secundario}>Salvar</button><button formAction={excluirDiferencial} name="id" value={d.id} className={secundario}>Excluir</button></div>
        </form>)}</div>
      </section>

      <section className="mb-9">
        <h2 className="mb-3 font-display text-lg text-grafite">Etapas do processo</h2>
        <div className="grid gap-2 sm:grid-cols-2">{(etapas.data ?? []).map((e) => <form key={e.id} action={salvarEtapa} className="grid gap-2 rounded-marca border border-borda bg-superficie p-4 sm:grid-cols-2">
          <input name="id" required defaultValue={e.id} aria-label="ID (usado pelos projetos)" className={classeInput()} /><input name="numero" type="number" min="1" defaultValue={e.numero} aria-label="Ordem" className={classeInput()} /><input name="titulo" required defaultValue={e.titulo} className={classeInput()} /><input name="icone" defaultValue={e.icone} className={classeInput()} /><textarea name="descricao" required defaultValue={e.descricao} className={`${classeInput()} sm:col-span-2`} /><textarea name="detalhe" defaultValue={e.detalhe ?? ""} className={`${classeInput()} sm:col-span-2`} /><button className={botao}>Salvar etapa</button>
        </form>)}</div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg text-grafite">Perguntas frequentes</h2>
        <details className="mb-3 rounded-marca-lg border border-borda bg-superficie p-5"><summary className="cursor-pointer font-medium text-musgo">Adicionar pergunta</summary>
          <form action={salvarFaq} className="mt-4 grid gap-3 sm:grid-cols-2"><input name="pergunta" required placeholder="Pergunta" className={classeInput()} /><input name="ordem" type="number" min="0" defaultValue="0" className={classeInput()} /><textarea name="resposta" required placeholder="Resposta" className={`${classeInput()} sm:col-span-2`} /><select name="publicado" className={classeInput()}><option value="true">Publicado</option><option value="false">Rascunho</option></select><button className={botao}>Adicionar</button></form>
        </details>
        <div className="space-y-2">{(faqs.data ?? []).map((f) => <form key={f.id} action={salvarFaq} className="grid gap-2 rounded-marca border border-borda bg-superficie p-4 sm:grid-cols-[1fr_1fr_90px_130px_auto]">
          <input type="hidden" name="id" value={f.id} /><input name="pergunta" required defaultValue={f.pergunta} className={classeInput()} /><textarea name="resposta" required defaultValue={f.resposta} className={classeInput()} /><input name="ordem" type="number" min="0" defaultValue={f.ordem} className={classeInput()} /><select name="publicado" defaultValue={String(f.publicado)} className={classeInput()}><option value="true">Publicado</option><option value="false">Rascunho</option></select><div className="flex gap-2"><button className={secundario}>Salvar</button><button formAction={excluirFaq} name="id" value={f.id} className={secundario}>Excluir</button></div>
        </form>)}</div>
      </section>
    </>
  );
}
