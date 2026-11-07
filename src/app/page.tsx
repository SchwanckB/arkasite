/**
 * Pagina inicial.
 *
 * Monta as secoes na ordem definida pelo conteudo/banco. Cada secao decide
 * sozinha se aparece (campo `visivel`), entao ligar e desligar uma secao pelo
 * painel (Parte 8) nao exige mexer neste arquivo.
 *
 * Proprietario: Parte 0 (a composicao). O conteudo de cada secao pertence
 * a parte correspondente - ver docs/ARCHITECTURE.md.
 */

import { CTA } from "@/components/sections/CTA";
import { Contato } from "@/components/sections/Contato";
import { Diferenciais } from "@/components/sections/Diferenciais";
import { Hero } from "@/components/sections/Hero";
import { Portfolio } from "@/components/sections/Portfolio";
import { Processo } from "@/components/sections/Processo";
import { Servicos } from "@/components/sections/Servicos";
import { Sobre } from "@/components/sections/Sobre";

export default function Home() {
  return (
    <>
      <Hero />
      <Sobre />
      <Diferenciais />
      <Servicos />
      <Processo />
      <Portfolio />
      <CTA />
      <Contato />
    </>
  );
}
