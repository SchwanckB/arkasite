"use client";

import { useActionState } from "react";

import { classeInput } from "@/components/admin/FormField";
import { entrar, type LoginState } from "./actions";

const ESTADO_INICIAL: LoginState = { erro: "" };

export function LoginForm({ proximo }: { proximo?: string }) {
  const [estado, acao, pendente] = useActionState(entrar, ESTADO_INICIAL);

  return (
    <form action={acao} className="mt-7 space-y-4">
      <input type="hidden" name="proximo" value={proximo ?? ""} />
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-grafite"
        >
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className={classeInput()}
        />
      </div>
      <div>
        <label
          htmlFor="senha"
          className="mb-1.5 block text-sm font-medium text-grafite"
        >
          Senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          className={classeInput()}
        />
      </div>
      {estado.erro ? (
        <p role="alert" className="rounded-marca bg-areia-claro p-3 text-sm text-grafite">
          {estado.erro}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pendente}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-marca bg-musgo px-5 text-sm font-medium text-off-white transition-colors hover:bg-musgo-escuro disabled:cursor-wait disabled:opacity-70"
      >
        {pendente ? "Entrando..." : "Entrar no painel"}
      </button>
    </form>
  );
}
