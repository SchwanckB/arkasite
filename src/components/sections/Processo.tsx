/**
 * Secao "Processo" - PARTE 2.
 *
 * Server Component assincrono com as 4 etapas de getProcessSteps. O destaque
 * e a linha de conexao entre as etapas (ver ./processo/LinhaConexao.tsx):
 * horizontal no desktop, vertical no mobile, desenhando-se conforme a secao
 * entra na tela.
 *
 * Duas estruturas sao renderizadas (uma lista empilhada para mobile/tablet,
 * uma grade para o desktop) e alternadas por classes responsivas (`hidden` /
 * `lg:hidden`), porque o jeito de conectar as etapas e fisicamente diferente
 * nos dois layouts - no mobile a conexao acompanha a altura real de cada
 * cartao; no desktop e um traco unico atras dos 4 badges, que ficam todos na
 * mesma linha.
 */

import type { ProcessStep } from "@/lib/data";
import { getProcessSteps, getSection } from "@/lib/data";
import { Icone } from "@/components/ui/Icone";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

import {
  LinhaConexaoHorizontal,
  LinhaConexaoVertical,
} from "./processo/LinhaConexao";

export async function Processo() {
  const [secao, etapas] = await Promise.all([
    getSection("processo"),
    getProcessSteps(),
  ]);

  if (!secao?.visivel) return null;

  return (
    <Section id="processo" fundo="alternado" largura="largo">
      <SectionHeading
        sobretitulo={secao.subtitulo}
        titulo={secao.titulo}
        descricao={secao.descricao}
      />

      {/* Mobile/tablet: lista vertical com um segmento de linha entre cada etapa. */}
      <Reveal comoLista className="mt-14 flex flex-col lg:hidden">
        {etapas.map((etapa, indice) => (
          <div key={etapa.id}>
            <RevealItem>
              <EtapaCard etapa={etapa} />
            </RevealItem>
            {indice < etapas.length - 1 ? <LinhaConexaoVertical /> : null}
          </div>
        ))}
      </Reveal>

      {/* Desktop: grade com uma unica linha horizontal atras das 4 etapas. */}
      <Reveal
        comoLista
        className="relative mt-14 hidden lg:grid lg:grid-cols-4 lg:gap-8"
      >
        <LinhaConexaoHorizontal />
        {etapas.map((etapa) => (
          <RevealItem key={etapa.id} className="relative">
            <EtapaCard etapa={etapa} />
          </RevealItem>
        ))}
      </Reveal>
    </Section>
  );
}

/** Conteudo de uma etapa: badge numerado, icone, titulo, descricao e detalhe. */
function EtapaCard({ etapa }: { etapa: ProcessStep }) {
  return (
    <div className="relative z-10">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-musgo text-sm font-semibold text-off-white">
          {etapa.numero}
        </span>
        <Icone nome={etapa.icone} tamanho={20} className="text-salvia" />
      </div>
      <h3 className="mt-5 font-display text-lg text-grafite">{etapa.titulo}</h3>
      <p className="mt-2 text-sm leading-relaxed text-texto-suave">
        {etapa.descricao}
      </p>
      {etapa.detalhe ? (
        <p className="mt-3 text-sm leading-relaxed text-texto-suave">
          {etapa.detalhe}
        </p>
      ) : null}
    </div>
  );
}
