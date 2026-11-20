"use client";

/**
 * <ConfirmarAcao /> - porta obrigatoria de toda acao destrutiva do painel.
 *
 * Envolve uma Server Action e so a executa depois de uma confirmacao explicita.
 * Antes disto, 13 acoes apagavam registro em definitivo no primeiro clique, com
 * o botao "Excluir" usando exatamente a mesma classe do "Salvar" ao lado.
 *
 * Como usar:
 *
 *   <ConfirmarAcao
 *     acao={excluirCliente}
 *     campos={{ id: cliente.id }}
 *     rotulo="Excluir cliente"
 *     titulo="Excluir este cliente?"
 *     descricao="O cadastro sai do painel."
 *     consequencias={["Contatos", "Projetos", "Tarefas", "Historico"]}
 *     confirmarTexto={cliente.empresa}
 *   />
 *
 * `confirmarTexto` liga a trava mais forte: a pessoa precisa digitar o nome do
 * registro. Reserve para o que apaga em cascata (cliente) ou mexe em dinheiro
 * (lancamento). Para o resto, a confirmacao simples ja basta.
 *
 * O dialogo usa <dialog modal>, que o navegador ja entrega com foco preso,
 * Esc para fechar e inerte no resto da pagina - nada disso precisa de JS nosso.
 */

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { Icone } from "@/components/ui/Icone";
import { cn } from "@/lib/utils";

type ConfirmarAcaoProps = {
  /** Server Action que efetivamente executa a exclusao. */
  acao: (formData: FormData) => void | Promise<void>;
  /** Campos ocultos enviados para a action (normalmente o id). */
  campos: Record<string, string>;
  /** Texto do botao que abre a confirmacao. */
  rotulo: string;
  /** Pergunta do dialogo. Termine com "?". */
  titulo: string;
  /** Uma frase dizendo o que acontece. */
  descricao: string;
  /** O que sai junto por cascata no banco. Vira lista no dialogo. */
  consequencias?: string[];
  /**
   * Quando informado, exige digitar exatamente este texto para liberar o botao.
   * Use no que apaga em cascata ou mexe em dinheiro.
   */
  confirmarTexto?: string;
  /** Rotulo do botao de confirmacao dentro do dialogo. */
  confirmarRotulo?: string;
  /** Variante visual do gatilho. "texto" para dentro de listas densas. */
  aparencia?: "botao" | "texto";
  className?: string;
};

function BotaoConfirmar({
  rotulo,
  desabilitado,
}: {
  rotulo: string;
  desabilitado: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={desabilitado || pending}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-marca bg-erro px-4 text-sm font-medium text-off-white transition-colors hover:bg-erro-forte disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Excluindo..." : rotulo}
    </button>
  );
}

export function ConfirmarAcao({
  acao,
  campos,
  rotulo,
  titulo,
  descricao,
  consequencias,
  confirmarTexto,
  confirmarRotulo = "Sim, excluir",
  aparencia = "botao",
  className,
}: ConfirmarAcaoProps) {
  const dialogoRef = useRef<HTMLDialogElement>(null);
  const [digitado, setDigitado] = useState("");

  const liberado = !confirmarTexto
    || digitado.trim().toLocaleLowerCase("pt-BR")
      === confirmarTexto.trim().toLocaleLowerCase("pt-BR");

  function abrir() {
    setDigitado("");
    dialogoRef.current?.showModal();
  }

  function fechar() {
    dialogoRef.current?.close();
  }

  // Travar a rolagem do fundo enquanto o dialogo estiver aberto.
  useEffect(() => {
    const dialogo = dialogoRef.current;
    if (!dialogo) return;

    function aoAbrirOuFechar() {
      document.body.style.overflow = dialogo?.open ? "hidden" : "";
    }

    const observador = new MutationObserver(aoAbrirOuFechar);
    observador.observe(dialogo, { attributes: true, attributeFilter: ["open"] });
    return () => {
      observador.disconnect();
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        className={cn(
          aparencia === "botao"
            ? "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-marca border border-erro/30 px-3 text-xs font-medium text-erro transition-colors hover:border-erro/60 hover:bg-erro-suave"
            : "inline-flex min-h-11 items-center gap-1.5 rounded-marca px-2 text-xs font-medium text-erro underline-offset-2 transition-colors hover:bg-erro-suave hover:underline",
          className,
        )}
      >
        <Icone nome="Trash2" tamanho={14} />
        {rotulo}
      </button>

      <dialog
        ref={dialogoRef}
        aria-labelledby={`${rotulo}-titulo`}
        onClose={() => setDigitado("")}
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-marca-lg border border-borda bg-superficie p-0 text-texto shadow-alta backdrop:bg-grafite/50"
      >
        <form action={acao} className="flex flex-col gap-4 p-5 sm:p-6">
          {Object.entries(campos).map(([nome, valor]) => (
            <input key={nome} type="hidden" name={nome} value={valor} />
          ))}

          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-marca bg-erro-suave text-erro">
              <Icone nome="TriangleAlert" tamanho={20} />
            </span>
            <div className="min-w-0">
              <h2
                id={`${rotulo}-titulo`}
                className="font-display text-base text-grafite"
              >
                {titulo}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-texto-suave">
                {descricao} Esta ação não pode ser desfeita.
              </p>
            </div>
          </div>

          {consequencias?.length ? (
            <div className="rounded-marca border border-erro/20 bg-erro-suave px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-erro">
                Também será apagado
              </p>
              <ul className="mt-2 flex flex-col gap-1 text-sm text-grafite">
                {consequencias.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Icone
                      nome="Minus"
                      tamanho={14}
                      className="mt-1 shrink-0 text-erro"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {confirmarTexto ? (
            <label className="flex flex-col gap-1.5 text-sm font-medium text-grafite">
              Para confirmar, digite{" "}
              <strong className="font-semibold text-erro">
                {confirmarTexto}
              </strong>
              <input
                type="text"
                value={digitado}
                onChange={(evento) => setDigitado(evento.target.value)}
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-marca border border-borda bg-superficie px-3.5 py-2.5 text-sm text-grafite transition-colors focus:border-erro focus:outline-none focus:ring-2 focus:ring-erro/20"
              />
            </label>
          ) : null}

          <div className="flex flex-wrap justify-end gap-2 border-t border-borda pt-4">
            <button
              type="button"
              onClick={fechar}
              className="inline-flex min-h-11 items-center justify-center rounded-marca border border-borda px-4 text-sm font-medium text-grafite transition-colors hover:bg-areia-claro"
            >
              Cancelar
            </button>
            <BotaoConfirmar rotulo={confirmarRotulo} desabilitado={!liberado} />
          </div>
        </form>
      </dialog>
    </>
  );
}
