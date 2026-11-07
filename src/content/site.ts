/**
 * Configuracoes e textos gerais do site.
 *
 * ATENCAO: os TEXTOS deste arquivo pertencem a Parte C (copy da marca).
 * A Parte 0 deixou aqui uma versao base, tirada do brand board, para o
 * site funcionar de imediato. A Parte C substitui os textos mantendo as chaves.
 *
 * Dados marcados com [CONFIRMAR] precisam ser validados pelo dono antes
 * de o site ir ao ar. Ver docs/PENDENCIAS.md.
 */

import type { SiteSettings } from "@/lib/data/types";

export const site: SiteSettings = {
  nome: "ARKA Technologies",
  tagline: "Tecnologia que conecta sua marca ao futuro.",
  descricao:
    "Criamos sites modernos, rápidos e pensados para gerar resultado para o seu negócio.",
  url: "https://arkatechnologies.com.br", // [CONFIRMAR] domínio oficial
  contato: {
    email: "contato@arkatechnologies.com.br", // [CONFIRMAR]
    whatsapp: "(00) 00000-0000", // [CONFIRMAR]
    whatsappDigitos: "5500000000000", // [CONFIRMAR]
    cidade: "Brasil", // [CONFIRMAR]
  },
  redes: {
    instagram: "https://instagram.com/arkatechnologies", // [CONFIRMAR]
  },
  seo: {
    titulo: "ARKA Technologies | Sites modernos que geram resultado",
    descricao:
      "Sites institucionais, lojas virtuais e landing pages feitos sob medida. Design atual, performance e suporte próximo.",
    imagemOg: "/og-image.png",
  },
  mensagemWhatsapp:
    "Olá! Vim pelo site da ARKA e gostaria de falar sobre um projeto.",
};
