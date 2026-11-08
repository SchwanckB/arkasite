import { PageHeader } from "@/components/admin/PageHeader";
import { classeInput } from "@/components/admin/FormField";
import { AdminRestricted } from "@/components/admin/AdminRestricted";
import { connection } from "next/server";
import { site } from "@/content/site";
import { requireAuth } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import {
  alterarPapelEquipe,
  atualizarNomePerfil,
  salvarConfiguracaoSite,
} from "../actions";

const botao = "inline-flex min-h-10 items-center justify-center rounded-marca bg-musgo px-4 text-sm font-medium text-white hover:bg-musgo-escuro";
const secundario = "inline-flex min-h-9 items-center justify-center rounded-marca border border-borda px-3 text-xs font-medium text-grafite hover:bg-areia-claro";

type SettingsRow = { chave: string; valor: Record<string, unknown> };
function ler(rows: SettingsRow[], chave: string): Record<string, unknown> {
  return rows.find((row) => row.chave === chave)?.valor ?? {};
}
function texto(obj: Record<string, unknown>, campo: string, fallback = ""): string {
  const value = obj[campo];
  return typeof value === "string" ? value : fallback;
}

export default async function ConfiguracoesPage() {
  await connection();
  const usuario = await requireAuth();
  if (usuario.papel === "staff") return <AdminRestricted modulo="Configurações" />;
  const supabase = await createClient();
  const [settingsResult, profilesResult] = await Promise.all([
    supabase.from("site_settings").select("chave,valor"),
    supabase.from("profiles").select("id,nome,papel,criado_em").order("criado_em"),
  ]);
  if (settingsResult.error) throw new Error(`Falha ao carregar configurações: ${settingsResult.error.message}`);
  if (profilesResult.error) throw new Error(`Falha ao carregar equipe: ${profilesResult.error.message}`);
  const settings = (settingsResult.data ?? []) as SettingsRow[];
  const geral = ler(settings, "geral");
  const contato = ler(settings, "contato");
  const redes = ler(settings, "redes");
  const seo = ler(settings, "seo");
  const tracking = ler(settings, "rastreamento");

  return (
    <>
      <PageHeader titulo="Configurações" descricao="Dados públicos, contatos, SEO, rastreamento e acessos da equipe." />
      <form action={salvarConfiguracaoSite} className="mb-5 rounded-marca-lg border border-borda bg-superficie p-5 sm:p-6">
        <input type="hidden" name="chave" value="geral" />
        <h2 className="font-display text-lg text-grafite">Dados da empresa</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2"><input name="nome" required defaultValue={texto(geral, "nome", site.nome)} placeholder="Nome da empresa" className={classeInput()} /><input name="url" type="url" required defaultValue={texto(geral, "url", site.url)} placeholder="URL oficial" className={classeInput()} /><input name="tagline" defaultValue={texto(geral, "tagline", site.tagline)} placeholder="Assinatura" className={`${classeInput()} sm:col-span-2`} /><textarea name="descricao" defaultValue={texto(geral, "descricao", site.descricao)} placeholder="Descrição" className={`${classeInput()} sm:col-span-2`} /><button className={botao}>Salvar dados</button></div>
      </form>

      <form action={salvarConfiguracaoSite} className="mb-5 rounded-marca-lg border border-borda bg-superficie p-5 sm:p-6">
        <input type="hidden" name="chave" value="contato" /><h2 className="font-display text-lg text-grafite">Contato</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2"><input name="email" type="email" required defaultValue={texto(contato, "email", site.contato.email)} placeholder="E-mail" className={classeInput()} /><input name="whatsapp" required defaultValue={texto(contato, "whatsapp", site.contato.whatsapp)} placeholder="WhatsApp formatado" className={classeInput()} /><input name="whatsapp_digitos" required inputMode="numeric" defaultValue={texto(contato, "whatsapp_digitos", site.contato.whatsappDigitos)} placeholder="WhatsApp: apenas dígitos internacionais" className={classeInput()} /><input name="cidade" defaultValue={texto(contato, "cidade", site.contato.cidade ?? "")} placeholder="Cidade" className={classeInput()} /><textarea name="mensagem_whatsapp" maxLength={500} defaultValue={texto(contato, "mensagem_whatsapp", site.mensagemWhatsapp)} placeholder="Mensagem predefinida do WhatsApp" className={`${classeInput()} sm:col-span-2`} /><button className={botao}>Salvar contato</button></div>
      </form>

      <form action={salvarConfiguracaoSite} className="mb-5 rounded-marca-lg border border-borda bg-superficie p-5 sm:p-6">
        <input type="hidden" name="chave" value="redes" /><h2 className="font-display text-lg text-grafite">Redes sociais</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2"><input name="instagram" type="url" defaultValue={texto(redes, "instagram", site.redes.instagram ?? "")} placeholder="URL do Instagram" className={classeInput()} /><input name="linkedin" type="url" defaultValue={texto(redes, "linkedin", site.redes.linkedin ?? "")} placeholder="URL do LinkedIn" className={classeInput()} /><input name="facebook" type="url" defaultValue={texto(redes, "facebook", site.redes.facebook ?? "")} placeholder="URL do Facebook" className={classeInput()} /><button className={botao}>Salvar redes</button></div>
      </form>

      <form action={salvarConfiguracaoSite} className="mb-5 rounded-marca-lg border border-borda bg-superficie p-5 sm:p-6">
        <input type="hidden" name="chave" value="seo" /><h2 className="font-display text-lg text-grafite">SEO e compartilhamento</h2>
        <p className="mt-2 text-sm leading-relaxed text-texto-suave">Título, descrição e imagem de compartilhamento vão para os metadados. O código abaixo é o conteúdo do atributo <code>content</code> da meta tag HTML do Google Search Console; não cole a tag inteira.</p>
        <div className="mt-4 grid gap-3"><label className="grid gap-1 text-sm text-grafite">Título para buscadores<input name="titulo" required maxLength={200} defaultValue={texto(seo, "titulo", site.seo.titulo)} placeholder="Título SEO" className={classeInput()} /></label><label className="grid gap-1 text-sm text-grafite">Descrição para buscadores<textarea name="descricao" required maxLength={500} defaultValue={texto(seo, "descricao", site.seo.descricao)} placeholder="Descrição SEO" className={classeInput()} /></label><label className="grid gap-1 text-sm text-grafite">Imagem para compartilhamento (URL ou caminho)<input name="imagem_og" required defaultValue={texto(seo, "imagem_og", site.seo.imagemOg)} placeholder="/og-image.png" className={classeInput()} /></label><label className="grid gap-1 text-sm text-grafite">Verificação do Google Search Console<input name="google_verification" maxLength={200} defaultValue={texto(seo, "google_verification", site.seo.googleVerification)} placeholder="Código fornecido pelo Search Console" className={classeInput()} /></label><button className={botao}>Salvar SEO</button></div>
      </form>

      <form action={salvarConfiguracaoSite} className="mb-5 rounded-marca-lg border border-borda bg-superficie p-5 sm:p-6">
        <input type="hidden" name="chave" value="rastreamento" /><h2 className="font-display text-lg text-grafite">Google Analytics, Ads e Tag Manager</h2>
        <p className="mt-1 text-sm text-texto-suave">Os campos vazios não carregam scripts. Não cole chaves secretas aqui; somente IDs públicos de tags.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2"><input name="google_ads_id" defaultValue={texto(tracking, "google_ads_id")} placeholder="Google Ads: AW-..." className={classeInput()} /><input name="google_ads_conversao" defaultValue={texto(tracking, "google_ads_conversao")} placeholder="Conversão: AW-.../..." className={classeInput()} /><input name="google_analytics_id" defaultValue={texto(tracking, "google_analytics_id")} placeholder="Analytics: G-..." className={classeInput()} /><input name="gtm_id" defaultValue={texto(tracking, "gtm_id")} placeholder="Tag Manager: GTM-..." className={classeInput()} /><select name="ativo" defaultValue={tracking.ativo === false ? "false" : "true"} className={classeInput()}><option value="true">Rastreamento ativo</option><option value="false">Rastreamento desligado</option></select><button className={botao}>Salvar rastreamento</button></div>
      </form>

      <section className="mb-5 rounded-marca-lg border border-borda bg-superficie p-5 sm:p-6">
        <h2 className="font-display text-lg text-grafite">Seu perfil</h2>
        <form action={atualizarNomePerfil} className="mt-4 flex flex-wrap gap-3"><input name="nome" required maxLength={120} defaultValue={usuario.nome} placeholder="Seu nome" className={classeInput("max-w-md")} /><button className={botao}>Atualizar nome</button></form>
      </section>

      <section className="rounded-marca-lg border border-borda bg-superficie p-5 sm:p-6">
        <h2 className="font-display text-lg text-grafite">Equipe</h2>
        <p className="mt-1 text-sm text-texto-suave">Crie os usuários em Supabase → Authentication → Users. Somente o owner pode atribuir papel de admin; contas novas começam como staff.</p>
        <ul className="mt-4 divide-y divide-borda">
          {(profilesResult.data ?? []).map((p) => <li key={p.id} className="flex flex-col justify-between gap-2 py-3 sm:flex-row sm:items-center">
            <div><p className="font-medium text-grafite">{p.nome || "Sem nome"} {p.id === usuario.id ? "(você)" : ""}</p><p className="break-all font-mono text-xs text-texto-suave">ID {p.id} · {p.papel}</p></div>
            {usuario.papel === "owner" && p.papel !== "owner" ? <form action={alterarPapelEquipe} className="flex gap-2"><input type="hidden" name="id" value={p.id} /><select name="papel" defaultValue={p.papel} className={classeInput()}><option value="staff">Staff</option><option value="admin">Admin</option></select><button className={secundario}>Alterar papel</button></form> : null}
          </li>)}
        </ul>
      </section>
    </>
  );
}
