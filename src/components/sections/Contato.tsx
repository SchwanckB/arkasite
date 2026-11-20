/**
 * Secao de contato.
 *
 * Os tres caminhos diretos: Instagram (contato principal da marca), WhatsApp
 * e e-mail. Todos passam por <LinkContato />, que registra a conversao - antes
 * nenhum deles disparava evento nenhum e o Google Ads nao conseguia otimizar.
 */

import { getSection, getSiteSettings, getTracking } from "@/lib/data";
import { Icone } from "@/components/ui/Icone";
import { LinkContato } from "@/components/contato/LinkContato";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { instagramHandle, linkWhatsapp } from "@/lib/utils";

/*
  Os tres botoes compartilham altura e alinhamento. O e-mail nao usa mais o
  endereco inteiro como rotulo: ele era uma palavra so, nao cabia em 375px e
  virava um alvo desproporcional ao lado dos outros dois.
*/
const BOTAO_BASE =
  "inline-flex min-h-13 items-center justify-center gap-2 rounded-marca px-8 text-base font-medium " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-[180ms] " +
  "ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-px active:translate-y-0 " +
  "motion-reduce:transform-none motion-reduce:transition-none";

const BOTAO_PRIMARIO = `${BOTAO_BASE} bg-musgo text-off-white shadow-suave hover:bg-musgo-escuro hover:shadow-media`;
const BOTAO_SECUNDARIO = `${BOTAO_BASE} border border-musgo/25 text-musgo hover:border-musgo/60 hover:bg-musgo/5`;

/** Fundo da secao. A pagina alterna claro/areia para dar ritmo. */
type FundoSecao = "claro" | "alternado";

export async function Contato({ fundo = "claro" }: { fundo?: FundoSecao } = {}) {
  const [secao, settings, tracking] = await Promise.all([
    getSection("contato"),
    getSiteSettings(),
    getTracking(),
  ]);
  const instagram = settings.redes.instagram;
  const usuarioInstagram = instagram ? instagramHandle(instagram) : null;

  if (!secao?.visivel) return null;

  return (
    <Section fundo={fundo} id="contato" largura="largo">
      <SectionHeading
        sobretitulo={secao.subtitulo}
        titulo={secao.titulo}
        descricao={secao.descricao}
      />

      <Reveal className="mt-12 flex flex-wrap gap-3">
        {instagram ? (
          <LinkContato
            href={instagram}
            evento="contato_whatsapp"
            origem="secao_contato_instagram"
            conversao={tracking.googleAdsConversao}
            className={BOTAO_PRIMARIO}
          >
            <Icone nome="AtSign" tamanho={18} />
            {usuarioInstagram ? `Instagram @${usuarioInstagram}` : "Instagram"}
          </LinkContato>
        ) : null}

        <LinkContato
          href={linkWhatsapp(
            settings.contato.whatsappDigitos,
            settings.mensagemWhatsapp,
          )}
          evento="contato_whatsapp"
          origem="secao_contato"
          conversao={tracking.googleAdsConversao}
          className={BOTAO_SECUNDARIO}
        >
          <Icone nome="MessageCircle" tamanho={18} />
          WhatsApp
        </LinkContato>

        <LinkContato
          href={`mailto:${settings.contato.email}`}
          evento="contato_email"
          origem="secao_contato"
          conversao={tracking.googleAdsConversao}
          externo={false}
          className={BOTAO_SECUNDARIO}
        >
          <Icone nome="Mail" tamanho={18} />
          Enviar e-mail
        </LinkContato>
      </Reveal>

      {/* O endereco fica legivel aqui, fora do rotulo do botao, e continua
          selecionavel para quem quiser copiar. */}
      <Reveal className="mt-4">
        <p className="text-sm text-texto-suave">
          Ou escreva direto para{" "}
          <span className="break-all font-medium text-grafite">
            {settings.contato.email}
          </span>
          . Respondemos em até um dia útil.
        </p>
      </Reveal>
    </Section>
  );
}
