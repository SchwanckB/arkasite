/**
 * Secoes do site: titulos, subtitulos e ordem.
 *
 * TEXTOS pertencem a Parte C. ESTRUTURA (ids, ordem, chaves de conteudo)
 * pertence a Parte 0 - as secoes dependem destas chaves.
 */

import type { Section } from "@/lib/data/types";

export const sections: Section[] = [
  {
    id: "hero",
    rotulo: "Início",
    titulo: "Soluções digitais para impulsionar seu comércio",
    subtitulo: "Tecnologia que conecta sua marca ao futuro.",
    descricao:
      "Sites modernos, rápidos e feitos sob medida para o seu negócio aparecer e vender mais.",
    visivel: true,
    ordem: 1,
    conteudo: {
      botaoPrimario: "Falar com especialista",
      botaoSecundario: "Ver portfólio",
    },
  },
  {
    id: "sobre",
    rotulo: "Sobre",
    titulo: "Sobre a ARKA",
    subtitulo: "Quem constrói o seu projeto",
    descricao:
      "Somos um estúdio de tecnologia focado em presença digital. Unimos design cuidadoso e código bem feito para entregar sites que funcionam bem e envelhecem bem.",
    visivel: true,
    ordem: 2,
  },
  {
    id: "diferenciais",
    rotulo: "Diferenciais",
    titulo: "Por que a ARKA",
    subtitulo: "O que você encontra aqui",
    visivel: true,
    ordem: 3,
  },
  {
    id: "servicos",
    rotulo: "Serviços",
    titulo: "O que fazemos",
    subtitulo: "Serviços",
    descricao:
      "Do primeiro site à loja completa, com acompanhamento em cada etapa.",
    visivel: true,
    ordem: 4,
  },
  {
    id: "processo",
    rotulo: "Processo",
    titulo: "Como trabalhamos",
    subtitulo: "Processo",
    descricao: "Quatro etapas claras, do primeiro contato à entrega.",
    visivel: true,
    ordem: 5,
  },
  {
    id: "portfolio",
    rotulo: "Portfólio",
    titulo: "Projetos",
    subtitulo: "Portfólio",
    descricao:
      "Alguns projetos e conceitos que mostram o nosso jeito de trabalhar.",
    visivel: true,
    ordem: 6,
  },
  {
    id: "cta",
    rotulo: "Começar",
    titulo: "Pronto para colocar seu negócio no ar?",
    descricao:
      "Conte o que você precisa. A primeira conversa é sem compromisso.",
    visivel: true,
    ordem: 7,
    conteudo: { botao: "Falar com especialista" },
  },
  {
    id: "contato",
    rotulo: "Contato",
    titulo: "Vamos conversar",
    subtitulo: "Contato",
    descricao:
      "Conte um pouco sobre o seu projeto e retornamos em até um dia útil.",
    visivel: true,
    ordem: 8,
  },
];
