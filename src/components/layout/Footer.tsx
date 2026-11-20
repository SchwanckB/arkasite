/**
 * Rodape do site.
 *
 * Antes era so logo, e-mail e Instagram. Quem rolava a pagina inteira e
 * chegava aqui nao tinha para onde ir - nem de volta para uma secao, nem
 * para a conversa. Agora tem tres colunas: navegacao, servicos e contato.
 *
 * Os links de servico tambem ajudam o Google a entender a estrutura da
 * pagina, que hoje e uma URL so.
 */

import { cacheLife } from "next/cache";
import Link from "next/link";

import { getProjects, getServices, getSiteSettings, getTracking } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { Icone } from "@/components/ui/Icone";
import { LinkContato } from "@/components/contato/LinkContato";
import { Logo } from "@/components/brand/Logo";
import { instagramHandle, linkWhatsapp } from "@/lib/utils";

/**
 * O ano do aviso de direitos autorais.
 *
 * Precisa ser cacheado explicitamente: com Cache Components ligado, ler a
 * data atual durante a prerenderizacao e um erro de build. Um dia de cache
 * e de sobra para um valor que muda uma vez por ano.
 */
async function getAnoAtual() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

/**
 * Atalhos de navegacao. Espelha o menu do cabecalho.
 *
 * "Portfólio" so entra quando ha projeto publicado: sem isso a secao nao e
 * renderizada e o link cairia numa ancora que nao existe.
 */
const NAVEGACAO = [
  { href: "/#sobre", rotulo: "Sobre" },
  { href: "/#servicos", rotulo: "Serviços" },
  { href: "/#processo", rotulo: "Processo" },
  { href: "/#portfolio", rotulo: "Portfólio", exigeProjetos: true },
  { href: "/#faq", rotulo: "Dúvidas" },
  { href: "/#contato", rotulo: "Contato" },
];

const LINK =
  "inline-flex min-h-11 items-center text-sm text-texto-suave transition-colors duration-[180ms] hover:text-musgo";

const TITULO_COLUNA =
  "text-rotulo font-semibold uppercase tracking-[0.18em] text-musgo";

export async function Footer() {
  const [settings, servicos, projetos, tracking, ano] = await Promise.all([
    getSiteSettings(),
    getServices(),
    getProjects(),
    getTracking(),
    getAnoAtual(),
  ]);

  const navegacao = NAVEGACAO.filter(
    (item) => !item.exigeProjetos || projetos.length > 0,
  );

  const usuarioInstagram = settings.redes.instagram
    ? instagramHandle(settings.redes.instagram)
    : null;

  return (
    // Off-white como o resto da pagina: o que separa o rodape do conteudo
    // e a borda superior, nao uma faixa de cor.
    <footer className="border-t border-borda bg-fundo py-14">
      <Container largura="largo">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-8">
          {/* Marca e assinatura. */}
          <div className="flex flex-col gap-4">
            <Logo variante="horizontal-tagline" altura={56} />
            <p className="max-w-xs text-pretty text-sm leading-relaxed text-texto-suave">
              {settings.descricao}
            </p>
          </div>

          {/* Navegacao. */}
          <nav aria-label="Rodapé" className="flex flex-col gap-3">
            <h2 className={TITULO_COLUNA}>Navegação</h2>
            <ul className="flex flex-col gap-0.5">
              {navegacao.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={LINK}>
                    {item.rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Servicos: os mesmos cadastrados no painel. */}
          <div className="flex flex-col gap-3">
            <h2 className={TITULO_COLUNA}>Serviços</h2>
            {servicos.length > 0 ? (
              <ul className="flex flex-col gap-0.5">
                {servicos.map((servico) => (
                  <li key={servico.id}>
                    <Link href="/#servicos" className={LINK}>
                      {servico.nome}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* Contato: ultima chance de conversa antes de a pagina acabar. */}
          <div className="flex flex-col gap-3">
            <h2 className={TITULO_COLUNA}>Contato</h2>
            <div className="flex flex-col gap-0.5">
              <LinkContato
                href={linkWhatsapp(
                  settings.contato.whatsappDigitos,
                  settings.mensagemWhatsapp,
                )}
                evento="contato_whatsapp"
                origem="rodape"
                conversao={tracking.googleAdsConversao}
                className={`${LINK} gap-2`}
              >
                <Icone nome="MessageCircle" tamanho={16} className="text-musgo" />
                WhatsApp {settings.contato.whatsapp}
              </LinkContato>

              <LinkContato
                href={`mailto:${settings.contato.email}`}
                evento="contato_email"
                origem="rodape"
                conversao={tracking.googleAdsConversao}
                externo={false}
                className={`${LINK} gap-2`}
              >
                <Icone nome="Mail" tamanho={16} className="text-musgo" />
                <span className="break-all">{settings.contato.email}</span>
              </LinkContato>

              {settings.redes.instagram ? (
                <LinkContato
                  href={settings.redes.instagram}
                  evento="contato_whatsapp"
                  origem="rodape_instagram"
                  conversao={tracking.googleAdsConversao}
                  className={`${LINK} gap-2`}
                >
                  <Icone nome="AtSign" tamanho={16} className="text-musgo" />
                  {usuarioInstagram
                    ? `Instagram @${usuarioInstagram}`
                    : "Instagram"}
                </LinkContato>
              ) : null}
            </div>

            {settings.contato.cidade ? (
              <p className="mt-1 text-sm text-texto-suave">
                Atendimento remoto · {settings.contato.cidade}
              </p>
            ) : null}
          </div>
        </div>

        <p className="mt-12 border-t border-borda pt-6 text-xs text-texto-suave">
          &copy; {ano} {settings.nome}. Todos os direitos reservados.
        </p>
      </Container>
    </footer>
  );
}
