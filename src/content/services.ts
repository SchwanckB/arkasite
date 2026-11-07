/**
 * Os 5 servicos da ARKA.
 *
 * TEXTOS pertencem a Parte C, que vai ampliar cada descricao para 2 frases
 * e detalhar o que o cliente recebe. Estrutura e ids pertencem a Parte 0.
 *
 * Os servicos aqui foram deduzidos do brand board e do briefing. O dono
 * precisa confirmar a lista final - ver docs/PENDENCIAS.md.
 */

import type { Service } from "@/lib/data/types";

export const services: Service[] = [
  {
    id: "site-institucional",
    slug: "site-institucional",
    nome: "Site institucional",
    descricao:
      "A presença oficial da sua empresa na internet, com as informações que o cliente procura e um visual à altura da marca.",
    entregas: [
      "Até 6 páginas",
      "Formulário de contato",
      "Otimização para busca",
    ],
    icone: "Globe",
    ordem: 1,
    publicado: true,
  },
  {
    id: "loja-virtual",
    slug: "loja-virtual",
    nome: "Loja virtual",
    descricao:
      "Uma loja completa para vender online, com catálogo organizado e checkout simples.",
    entregas: ["Catálogo de produtos", "Pagamento online", "Painel de pedidos"],
    icone: "ShoppingBag",
    ordem: 2,
    publicado: true,
  },
  {
    id: "landing-page",
    slug: "landing-page",
    nome: "Landing page",
    descricao:
      "Uma página única e direta, feita para transformar visita em contato.",
    entregas: [
      "Página de alta conversão",
      "Integração com WhatsApp",
      "Medição de resultados",
    ],
    icone: "Target",
    ordem: 3,
    publicado: true,
  },
  {
    id: "sistemas-sob-medida",
    slug: "sistemas-sob-medida",
    nome: "Sistemas sob medida",
    descricao:
      "Painel, área do cliente ou automação feita para o jeito que a sua empresa trabalha.",
    entregas: [
      "Levantamento de requisitos",
      "Painel administrativo",
      "Acesso por usuário",
    ],
    icone: "LayoutDashboard",
    ordem: 4,
    publicado: true,
  },
  {
    id: "manutencao-e-suporte",
    slug: "manutencao-e-suporte",
    nome: "Manutenção e suporte",
    descricao:
      "Seu site sempre no ar, atualizado e seguro, com alguém por perto quando precisar.",
    entregas: ["Atualizações e backups", "Pequenos ajustes", "Monitoramento"],
    icone: "Wrench",
    ordem: 5,
    publicado: true,
  },
];
