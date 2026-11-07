/**
 * Diferenciais - os 4 pilares da faixa da identidade visual.
 *
 * Titulo e descricao vieram do brand board. A frase de `apoio` foi escrita
 * pela Parte C para dar prova concreta a cada pilar.
 */

import type { Differential } from "@/lib/data/types";

export const differentials: Differential[] = [
  {
    id: "sites-modernos",
    titulo: "Sites modernos",
    descricao: "Design atual e funcional para a sua empresa.",
    apoio:
      "Layout pensado para o seu público, não um tema pronto adaptado às pressas.",
    icone: "Monitor",
    ordem: 1,
  },
  {
    id: "responsivos",
    titulo: "Responsivos",
    descricao: "Perfeito em qualquer dispositivo.",
    apoio:
      "Testamos de verdade em celular, tablet e computador antes de publicar.",
    icone: "Smartphone",
    ordem: 2,
  },
  {
    id: "foco-em-resultados",
    titulo: "Focados em resultados",
    descricao: "Mais visibilidade, mais clientes, mais crescimento.",
    apoio:
      "Cada página tem um objetivo claro: receber uma ligação, um orçamento ou uma compra.",
    icone: "TrendingUp",
    ordem: 3,
  },
  {
    id: "suporte-dedicado",
    titulo: "Suporte dedicado",
    descricao: "Atendimento próximo e soluções sob medida.",
    apoio:
      "Depois da entrega, você continua falando com quem construiu o seu site.",
    icone: "Headset",
    ordem: 4,
  },
];
