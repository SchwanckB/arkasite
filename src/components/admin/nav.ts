/**
 * Estrutura do menu do painel, agrupada como pedido no adendo: Visão geral,
 * Relacionamento, Financeiro, Site. Fonte unica para a sidebar (desktop) e
 * a gaveta/barra inferior (mobile) - os dois consomem o mesmo array.
 */

import type { NomeIcone } from "@/lib/data/types";

export type ItemMenuAdmin = {
  href: string;
  rotulo: string;
  icone: NomeIcone;
};

export type GrupoMenuAdmin = {
  titulo: string;
  itens: ItemMenuAdmin[];
};

export const MENU_ADMIN: GrupoMenuAdmin[] = [
  {
    titulo: "Visão geral",
    itens: [{ href: "/admin", rotulo: "Painel", icone: "LayoutDashboard" }],
  },
  {
    titulo: "Relacionamento",
    itens: [
      { href: "/admin/crm", rotulo: "Funil", icone: "GitBranch" },
      { href: "/admin/clientes", rotulo: "Clientes", icone: "Users" },
      { href: "/admin/projetos", rotulo: "Projetos", icone: "Briefcase" },
      { href: "/admin/tarefas", rotulo: "Tarefas", icone: "ListChecks" },
    ],
  },
  {
    titulo: "Financeiro",
    itens: [{ href: "/admin/financeiro", rotulo: "Financeiro", icone: "Wallet" }],
  },
  {
    titulo: "Site",
    itens: [
      { href: "/admin/site", rotulo: "Conteúdo do site", icone: "FileText" },
      { href: "/admin/portfolio", rotulo: "Portfólio", icone: "Image" },
      { href: "/admin/aparencia", rotulo: "Aparência", icone: "Palette" },
      { href: "/admin/midia", rotulo: "Mídia", icone: "Images" },
      { href: "/admin/configuracoes", rotulo: "Configurações", icone: "Settings" },
    ],
  },
];

/** Lista achatada, util para destacar o item ativo por prefixo de rota. */
export const ITENS_ADMIN_ACHATADOS: ItemMenuAdmin[] = MENU_ADMIN.flatMap(
  (g) => g.itens,
);
