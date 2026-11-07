/**
 * ESQUELETO - propriedade da PARTE 1 (Header + Hero).
 *
 * Versao minima para o site subir. A Parte 1 substitui por completo:
 * menu mobile com transicao de entrada e saida, comportamento no scroll,
 * estado ativo por secao. Mantenha o export <Header />.
 */

import Link from "next/link";

import { getSections, getSiteSettings } from "@/lib/data";
import { BotaoLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/brand/Logo";

/** Secoes que aparecem no menu principal. */
const NO_MENU = new Set(["servicos", "portfolio", "sobre", "contato"]);

export async function Header() {
  const [secoes, settings] = await Promise.all([
    getSections(),
    getSiteSettings(),
  ]);

  const itens = secoes.filter((s) => NO_MENU.has(s.id));

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-borda/60 bg-fundo/85 backdrop-blur-md">
      <Container largura="largo">
        <div className="flex h-18 items-center justify-between gap-6">
          <Link href="/" aria-label={settings.nome} className="shrink-0">
            <Logo variante="horizontal" altura={34} prioridade />
          </Link>

          <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
            {itens.map((item) => (
              <Link
                key={item.id}
                href={`#${item.id}`}
                className="text-sm text-texto-suave transition-colors duration-[180ms] hover:text-musgo"
              >
                {item.rotulo}
              </Link>
            ))}
          </nav>

          <BotaoLink href="#contato" tamanho="sm" className="hidden sm:inline-flex">
            Falar com especialista
          </BotaoLink>
        </div>
      </Container>
    </header>
  );
}
