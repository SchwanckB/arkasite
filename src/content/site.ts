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

import { brand } from "./brand";

export const site: SiteSettings = {
  nome: "ARKA Technologies",
  tagline: brand.manifesto.assinatura,
  descricao: brand.sobre.curto,
  url: "https://arkatechnologies.com.br", // [CONFIRMAR] domínio oficial
  contato: {
    email: "contato@arkatechnologies.com.br", // [CONFIRMAR]
    whatsapp: "(51) 99513-9984",
    whatsappDigitos: "5551995139984",
    cidade: "Brasil", // [CONFIRMAR]
  },
  redes: {
    instagram: "https://instagram.com/technologiesarka",
  },
  seo: {
    titulo: brand.seo.home.titulo,
    descricao: brand.seo.home.descricao,
    imagemOg: "/og-image.png",
  },
  mensagemWhatsapp: brand.whatsapp.mensagemPadrao,
};
