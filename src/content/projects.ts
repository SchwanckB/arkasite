/**
 * Portfolio de reserva.
 *
 * Todos marcados como CONCEITO (isConcept: true): sao demonstracoes criadas
 * pela ARKA, nao trabalhos de clientes reais. Projeto de cliente real so
 * entra aqui com autorizacao por escrito do cliente.
 *
 * Quando o banco estiver configurado (Parte 7), o portfolio real vem de la
 * e esta lista passa a ser apenas a reserva.
 */

import type { Project } from "@/lib/data/types";

export const projects: Project[] = [
  {
    id: "conceito-bistro",
    slug: "bistro-conceito",
    nome: "Bistrô",
    categoria: "Gastronomia",
    descricao:
      "Site de restaurante com cardápio, reservas e localização, pensado para quem acessa do celular na rua.",
    dispositivo: "mobile",
    variante: "institucional",
    isConcept: true,
    tags: ["Institucional", "Cardápio", "Reservas"],
    publicado: true,
    ordem: 1,
  },
  {
    id: "conceito-atelie",
    slug: "atelie-conceito",
    nome: "Ateliê",
    categoria: "Moda",
    descricao:
      "Loja virtual enxuta para uma marca autoral, com catálogo visual e checkout curto.",
    dispositivo: "desktop",
    variante: "loja",
    isConcept: true,
    tags: ["Loja virtual", "Catálogo"],
    publicado: true,
    ordem: 2,
  },
  {
    id: "conceito-clinica",
    slug: "clinica-conceito",
    nome: "Clínica",
    categoria: "Saúde",
    descricao:
      "Site de clínica com especialidades, equipe e agendamento direto pelo WhatsApp.",
    dispositivo: "desktop",
    variante: "servico",
    isConcept: true,
    tags: ["Institucional", "Agendamento"],
    publicado: true,
    ordem: 3,
  },
  {
    id: "conceito-construtora",
    slug: "construtora-conceito",
    nome: "Construtora",
    categoria: "Construção",
    descricao:
      "Apresentação de empreendimentos com galeria, plantas e formulário de interesse.",
    dispositivo: "desktop",
    variante: "institucional",
    isConcept: true,
    tags: ["Institucional", "Galeria"],
    publicado: true,
    ordem: 4,
  },
  {
    id: "conceito-curso",
    slug: "curso-conceito",
    nome: "Curso online",
    categoria: "Educação",
    descricao:
      "Landing page de lançamento com módulos, depoimentos e inscrição em uma tela.",
    dispositivo: "tablet",
    variante: "landing",
    isConcept: true,
    tags: ["Landing page", "Conversão"],
    publicado: true,
    ordem: 5,
  },
  {
    id: "conceito-petshop",
    slug: "petshop-conceito",
    nome: "Pet shop",
    categoria: "Serviços",
    descricao:
      "Site de bairro com serviços, preços e botão de agendamento sempre visível.",
    dispositivo: "mobile",
    variante: "servico",
    isConcept: true,
    tags: ["Serviços", "Agendamento"],
    publicado: true,
    ordem: 6,
  },
  {
    id: "conceito-imobiliaria",
    slug: "imobiliaria-conceito",
    nome: "Imobiliária",
    categoria: "Imóveis",
    descricao:
      "Demonstração de uma vitrine imobiliária com busca de imóveis, fichas detalhadas e contato rápido com a equipe.",
    dispositivo: "desktop",
    variante: "institucional",
    isConcept: true,
    tags: ["Imóveis", "Busca", "Captação"],
    publicado: true,
    ordem: 7,
  },
  {
    id: "conceito-arquitetura",
    slug: "arquitetura-conceito",
    nome: "Estúdio de arquitetura",
    categoria: "Arquitetura",
    descricao:
      "Demonstração de um portfólio visual para apresentar projetos, processo criativo e formas de iniciar uma conversa.",
    dispositivo: "tablet",
    variante: "servico",
    isConcept: true,
    tags: ["Portfólio", "Projetos", "Contato"],
    publicado: true,
    ordem: 8,
  },
  {
    id: "conceito-consultoria",
    slug: "consultoria-conceito",
    nome: "Consultoria",
    categoria: "Negócios",
    descricao:
      "Demonstração de uma landing page para explicar um serviço especializado e gerar pedidos de conversa.",
    dispositivo: "mobile",
    variante: "landing",
    isConcept: true,
    tags: ["Landing page", "Serviços", "Conversão"],
    publicado: true,
    ordem: 9,
  },
];
