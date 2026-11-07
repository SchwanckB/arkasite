/**
 * As 4 etapas do processo da ARKA.
 *
 * Os mesmos ids sao usados pelo modulo de projetos do painel (Parte 10),
 * onde cada projeto de cliente anda por estas etapas. Nao renomeie ids
 * sem combinar com a Parte 10.
 */

import type { ProcessStep } from "@/lib/data/types";

export const processSteps: ProcessStep[] = [
  {
    id: "conversa",
    numero: 1,
    titulo: "Conversa",
    descricao: "Entendemos o seu negócio, o público e o objetivo do projeto.",
    detalhe:
      "Uma conversa sem compromisso para alinhar expectativa, prazo e orçamento.",
    icone: "MessageCircle",
  },
  {
    id: "planejamento",
    numero: 2,
    titulo: "Planejamento",
    descricao: "Definimos a estrutura, o conteúdo e a direção visual do site.",
    detalhe:
      "Você aprova o mapa de páginas e o rascunho visual antes de escrevermos código.",
    icone: "PenTool",
  },
  {
    id: "desenvolvimento",
    numero: 3,
    titulo: "Desenvolvimento",
    descricao: "Construímos o site com atenção à performance e aos detalhes.",
    detalhe:
      "Acompanhamento por um ambiente de testes, com ajustes durante o caminho.",
    icone: "Code",
  },
  {
    id: "entrega",
    numero: 4,
    titulo: "Entrega",
    descricao:
      "Publicamos, testamos em todos os aparelhos e seguimos por perto.",
    detalhe: "Treinamento de uso, ajustes finais e suporte após a publicação.",
    icone: "Rocket",
  },
];
