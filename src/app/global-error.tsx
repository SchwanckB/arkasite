"use client";

/**
 * Ultima rede de seguranca: erro no proprio layout raiz.
 *
 * O global-error substitui o <html> inteiro, entao nao tem acesso ao
 * globals.css nem as fontes carregadas pelo layout. Por isso o estilo aqui e
 * inline e usa os valores literais da paleta (docs/BRAND.md) em vez dos
 * tokens - e o unico lugar do projeto onde isso e correto.
 *
 * Deve ser raro a ponto de nunca aparecer. Existe para que, se aparecer, a
 * pessoa ainda veja algo em portugues e com um caminho de volta.
 */

import { useEffect } from "react";

export default function ErroGlobal({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[site] Erro no layout raiz.", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1.25rem",
          backgroundColor: "#f4f3f0",
          color: "#252626",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          lineHeight: 1.6,
        }}
      >
        <main style={{ maxWidth: "32rem", textAlign: "center" }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#4e5a46",
            }}
          >
            ARKA Technologies
          </p>

          <h1
            style={{
              margin: "1rem 0 0",
              fontSize: "1.75rem",
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
            }}
          >
            O site não carregou
          </h1>

          <p style={{ margin: "1rem 0 0", color: "#5b5c5c" }}>
            Tente recarregar a página. Se continuar assim, fale com a gente
            pelo WhatsApp (51) 99513-9984 — o atendimento não depende do site.
          </p>

          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2rem",
              minHeight: "2.75rem",
              padding: "0 1.5rem",
              border: 0,
              borderRadius: "0.75rem",
              backgroundColor: "#4e5a46",
              color: "#f4f3f0",
              fontSize: "0.875rem",
              fontWeight: 500,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            Recarregar
          </button>
        </main>
      </body>
    </html>
  );
}
