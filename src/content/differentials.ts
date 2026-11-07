/**
 * Diferenciais - os 4 pilares que aparecem na faixa da identidade visual.
 * Textos base vindos do brand board. A Parte C refina.
 */

import type { Differential } from "@/lib/data/types";

export const differentials: Differential[] = [
  {
    id: "sites-modernos",
    titulo: "Sites modernos",
    descricao: "Design atual e funcional para a sua empresa.",
    icone: "Monitor",
    ordem: 1,
  },
  {
    id: "responsivos",
    titulo: "Responsivos",
    descricao: "Perfeito em qualquer dispositivo.",
    icone: "Smartphone",
    ordem: 2,
  },
  {
    id: "foco-em-resultados",
    titulo: "Focados em resultados",
    descricao: "Mais visibilidade, mais clientes, mais crescimento.",
    icone: "TrendingUp",
    ordem: 3,
  },
  {
    id: "suporte-dedicado",
    titulo: "Suporte dedicado",
    descricao: "Atendimento próximo e soluções sob medida.",
    icone: "Headset",
    ordem: 4,
  },
];
