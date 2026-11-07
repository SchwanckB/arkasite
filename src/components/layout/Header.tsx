/**
 * Cabecalho do site - PARTE 1 (Header + Hero).
 *
 * Server Component: busca secoes e configuracoes via @/lib/data e repassa so
 * o necessario para o <HeaderBar />, que concentra toda a interatividade
 * (scroll, secao ativa, menu mobile).
 */

import { getSections, getSiteSettings } from "@/lib/data";
import { HeaderBar } from "@/components/layout/HeaderBar";

/**
 * Secoes que ganham atalho no menu principal.
 *
 * Nem toda secao visivel da pagina precisa de item no menu: o hero e o topo
 * da propria pagina, e a faixa de "cta" repete o mesmo convite que ja esta
 * no botao de contato sempre visivel. "diferenciais" e "processo" ficam de
 * fora para manter o menu curto - quem rola a pagina passa por elas de
 * qualquer forma. "faq" entrou porque e um destino de busca direta (duvida
 * de prazo, pagamento etc.) que o visitante costuma procurar no menu.
 */
const NO_MENU = new Set(["sobre", "servicos", "portfolio", "faq", "contato"]);

export async function Header() {
  const [secoes, settings] = await Promise.all([
    getSections(),
    getSiteSettings(),
  ]);

  const itens = secoes
    .filter((s) => NO_MENU.has(s.id))
    .map((s) => ({ id: s.id, rotulo: s.rotulo }));

  return <HeaderBar itens={itens} nomeSite={settings.nome} />;
}
