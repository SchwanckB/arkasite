/**
 * Diferenciais - os quatro pilares da faixa da identidade.
 *
 * Eram quatro cartoes identicos com borda, raio e sombra no hover. Cartao e
 * para conteudo que se abre ou se clica; estes sao afirmacoes curtas, nao
 * destinos. Sem a moldura eles respiram e o olho corre pelos quatro de uma
 * vez, que e exatamente como a faixa do brand board apresenta.
 *
 * A regra superior em musgo substitui a borda do cartao: divide sem cercar.
 * Nenhuma numeracao - os quatro sao simultaneos, nao uma sequencia. (A
 * sequencia de verdade e o Processo, e la os numeros aparecem.)
 */

import { getDifferentials, getSection } from "@/lib/data";
import { Icone } from "@/components/ui/Icone";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Fundo da secao. Hoje o site inteiro e off-white. */
type FundoSecao = "claro" | "alternado";

export async function Diferenciais({
  fundo = "claro",
}: { fundo?: FundoSecao } = {}) {
  const [secao, itens] = await Promise.all([
    getSection("diferenciais"),
    getDifferentials(),
  ]);

  if (!secao?.visivel) return null;

  return (
    <Section fundo={fundo} id="diferenciais" largura="largo">
      <SectionHeading
        sobretitulo={secao.subtitulo}
        titulo={secao.titulo}
        descricao={secao.descricao}
      />

      <Reveal comoLista className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {itens.map((item) => (
          <RevealItem key={item.id}>
            <div className="flex h-full flex-col border-t-2 border-musgo pt-5">
              <Icone nome={item.icone} tamanho={24} className="text-musgo" />

              <h3 className="mt-4 font-display text-lg font-semibold tracking-[-0.01em] text-grafite">
                {item.titulo}
              </h3>

              <p className="mt-2 text-pretty text-sm leading-relaxed text-texto-suave">
                {item.descricao}
              </p>

              {/* A prova concreta do pilar. Recuada, para ler como nota. */}
              {item.apoio ? (
                <p className="mt-auto border-l border-areia pl-3 pt-4 text-xs leading-relaxed text-texto-suave">
                  {item.apoio}
                </p>
              ) : null}
            </div>
          </RevealItem>
        ))}
      </Reveal>
    </Section>
  );
}
