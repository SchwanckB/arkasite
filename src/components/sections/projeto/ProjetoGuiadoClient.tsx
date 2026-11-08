"use client";

import { useState } from "react";

import { Icone } from "@/components/ui/Icone";
import { Section } from "@/components/ui/Section";
import { registrarConversao } from "@/lib/conversoes";
import { linkWhatsapp } from "@/lib/utils";

const OBJETIVOS = [
  {
    id: "presenca",
    icone: "Globe",
    titulo: "Apresentar meu negócio",
    descricao: "Explicar o que faço, mostrar serviços e facilitar o contato.",
    solucao: "um site institucional",
  },
  {
    id: "vendas",
    icone: "ShoppingBag",
    titulo: "Vender pela internet",
    descricao: "Organizar produtos e oferecer um caminho simples até a compra.",
    solucao: "uma loja virtual",
  },
  {
    id: "campanha",
    icone: "Target",
    titulo: "Divulgar uma oferta",
    descricao: "Levar a pessoa a entender a oferta e dar o próximo passo.",
    solucao: "uma landing page",
  },
  {
    id: "processos",
    icone: "LayoutDashboard",
    titulo: "Simplificar processos",
    descricao: "Entender uma rotina e avaliar uma ferramenta sob medida.",
    solucao: "um sistema sob medida",
  },
] as const;

type ProjetoGuiadoClientProps = {
  whatsappDigitos: string;
  instagramUrl: string;
  instagramHandle: string;
  googleAdsConversao: string | null;
};

export function ProjetoGuiadoClient({
  whatsappDigitos,
  instagramUrl,
  instagramHandle,
  googleAdsConversao,
}: ProjetoGuiadoClientProps) {
  const [objetivo, setObjetivo] = useState<(typeof OBJETIVOS)[number]["id"] | null>(null);
  const selecionado = OBJETIVOS.find((item) => item.id === objetivo);
  const mensagem = selecionado
    ? `Olá! Vim pelo site da ARKA. Quero conversar sobre ${selecionado.solucao}. Meu objetivo é: ${selecionado.descricao}`
    : "";

  return (
    <Section id="projeto-guiado" fundo="alternado" largura="largo">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-salvia">
            Um bom começo
          </p>
          <h2 className="mt-4 text-balance font-display text-3xl leading-tight text-grafite sm:text-4xl">
            Qual é o próximo passo do seu negócio?
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-texto-suave">
            Escolha o que você quer resolver. A gente indica um ponto de partida
            para a conversa — sem formulário longo e sem compromisso.
          </p>

          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-texto-suave">
            <span className="inline-flex items-center gap-2">
              <Icone nome="Check" tamanho={16} className="text-musgo" />
              Conversa direta
            </span>
            <span className="inline-flex items-center gap-2">
              <Icone nome="Check" tamanho={16} className="text-musgo" />
              Sem pacote engessado
            </span>
          </div>
        </div>

        <div className="rounded-marca-lg border border-borda bg-superficie p-5 shadow-suave sm:p-7">
          <h3 className="font-display text-lg text-grafite">
            O que você precisa fazer?
          </h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {OBJETIVOS.map((item) => {
              const ativo = objetivo === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => setObjetivo(item.id)}
                  className={`group rounded-marca border p-4 text-left transition-[border-color,background-color,box-shadow] duration-[180ms] ${
                    ativo
                      ? "border-musgo bg-areia-claro/70 shadow-suave"
                      : "border-borda bg-fundo hover:border-musgo/40 hover:bg-areia-claro/40"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-marca ${
                      ativo ? "bg-musgo text-white" : "bg-areia-claro text-musgo"
                    }`}>
                      <Icone nome={item.icone} tamanho={19} />
                    </span>
                    <span className="font-medium text-grafite">{item.titulo}</span>
                  </span>
                  <span className="mt-3 block text-sm leading-relaxed text-texto-suave">
                    {item.descricao}
                  </span>
                </button>
              );
            })}
          </div>

          {selecionado ? (
            <div className="mt-5 rounded-marca bg-fundo p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-salvia">
                Um ponto de partida
              </p>
              <p className="mt-2 text-sm leading-relaxed text-texto-suave">
                Pelo que você descreveu, vale conversar sobre{" "}
                <strong className="font-semibold text-grafite">{selecionado.solucao}</strong>.
                A recomendação final depende dos detalhes do seu negócio.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <a
                  href={linkWhatsapp(whatsappDigitos, mensagem)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => registrarConversao("contato_whatsapp", { placement: "project_guide" }, googleAdsConversao)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-marca bg-musgo px-5 text-sm font-medium text-white transition-colors hover:bg-musgo-escuro"
                >
                  <Icone nome="MessageCircle" tamanho={17} />
                  Continuar pelo WhatsApp
                  <span className="sr-only">(abre em nova aba)</span>
                </a>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-musgo underline-offset-4 hover:underline"
                >
                  Prefiro o Instagram @{instagramHandle}
                  <span className="sr-only"> (abre em nova aba)</span>
                </a>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-texto-suave">
              Se preferir, fale direto com a ARKA pelo{" "}
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-musgo underline-offset-4 hover:underline"
              >
                Instagram @{instagramHandle}
                <span className="sr-only"> (abre em nova aba)</span>
              </a>
              .
            </p>
          )}
        </div>
      </div>
    </Section>
  );
}
