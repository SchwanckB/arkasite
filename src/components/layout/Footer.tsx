/**
 * ESQUELETO - propriedade da PARTE 5 (Contato + Footer).
 * Mantenha o export <Footer />.
 */

import { cacheLife } from "next/cache";
import Link from "next/link";

import { getSiteSettings } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/brand/Logo";

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

export async function Footer() {
  const [settings, ano] = await Promise.all([getSiteSettings(), getAnoAtual()]);

  return (
    <footer className="border-t border-borda bg-fundo-alt py-14">
      <Container largura="largo">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Logo variante="horizontal-tagline" altura={56} />
          </div>

          <div className="flex flex-col gap-2 text-sm text-texto-suave">
            <Link
              href={`mailto:${settings.contato.email}`}
              className="transition-colors duration-[180ms] hover:text-musgo"
            >
              {settings.contato.email}
            </Link>
            {settings.redes.instagram ? (
              <Link
                href={settings.redes.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-[180ms] hover:text-musgo"
              >
                Instagram
              </Link>
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
