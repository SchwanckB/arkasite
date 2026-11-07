/**
 * Os 5 servicos da ARKA.
 *
 * Textos escritos pela Parte C: duas frases por servico, a segunda sempre
 * dizendo o que o cliente recebe na pratica. Nenhum preco foi citado.
 *
 * [CONFIRMAR] a lista de servicos foi deduzida do brand board e do briefing.
 * Ver docs/PENDENCIAS.md, item 4.
 */

import type { Service } from "@/lib/data/types";

export const services: Service[] = [
  {
    id: "site-institucional",
    slug: "site-institucional",
    nome: "Site institucional",
    descricao:
      "A presença oficial da sua empresa na internet, com as informações que o cliente procura e um visual à altura da marca. Você recebe um site completo, pronto para ser encontrado no Google e fácil de atualizar sozinho.",
    entregas: [
      "Até 6 páginas",
      "Formulário de contato",
      "Otimização para busca",
      "Painel para editar textos",
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
      "Uma loja para vender online de verdade, com catálogo organizado e caminho curto até a compra. Você recebe o controle de produtos, estoque e pedidos em um painel só.",
    entregas: [
      "Catálogo de produtos",
      "Pagamento online",
      "Cálculo de frete",
      "Painel de pedidos",
    ],
    icone: "ShoppingBag",
    ordem: 2,
    publicado: true,
  },
  {
    id: "landing-page",
    slug: "landing-page",
    nome: "Landing page",
    descricao:
      "Uma página única e direta, feita para transformar visita em contato. Você recebe uma peça pronta para campanha, com medição de resultado desde o primeiro dia.",
    entregas: [
      "Página de alta conversão",
      "Integração com WhatsApp",
      "Medição de resultados",
      "Pronta para anúncios",
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
      "Painel, área do cliente ou automação construída para o jeito que a sua empresa trabalha. Você recebe uma ferramenta que elimina planilha e retrabalho, com acesso separado por pessoa.",
    entregas: [
      "Levantamento de requisitos",
      "Painel administrativo",
      "Acesso por usuário",
      "Treinamento de uso",
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
      "Seu site sempre no ar, atualizado e seguro, com alguém por perto quando precisar. Você recebe acompanhamento contínuo e pequenas alterações sem precisar abrir um novo projeto.",
    entregas: [
      "Atualizações e backups",
      "Pequenos ajustes",
      "Monitoramento",
      "Canal direto de suporte",
    ],
    icone: "Wrench",
    ordem: 5,
    publicado: true,
  },
];
