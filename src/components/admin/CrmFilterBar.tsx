"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { classeInput } from "@/components/admin/FormField";

type Filtros = {
  busca: string;
  status: string;
  origem: string;
  responsavel: string;
  prioridade: string;
  periodo: string;
};

type Opcao = { id: string; nome: string };

type CrmFilterBarProps = {
  filtrosIniciais: Filtros;
  origens: string[];
  responsaveis: Opcao[];
  quantidade: number;
};

const PERIODO = [
  { id: "30", nome: "Últimos 30 dias" },
  { id: "90", nome: "Últimos 90 dias" },
  { id: "365", nome: "Últimos 12 meses" },
  { id: "todos", nome: "Todo o período" },
];

export function CrmFilterBar({
  filtrosIniciais,
  origens,
  responsaveis,
  quantidade,
}: CrmFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [atualizando, startTransition] = useTransition();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const query = new URLSearchParams();
      for (const [chave, valor] of Object.entries(filtros)) {
        if (valor) query.set(chave, valor);
      }
      const busca = query.toString();
      startTransition(() => router.replace(busca ? `${pathname}?${busca}` : pathname, { scroll: false }));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [filtros, pathname, router]);

  function atualizar(chave: keyof Filtros, valor: string) {
    setFiltros((atuais) => ({ ...atuais, [chave]: valor }));
  }

  const query = new URLSearchParams();
  for (const [chave, valor] of Object.entries(filtros)) {
    if (valor) query.set(chave, valor);
  }
  const queryExportacao = query.toString();

  return (
    <div
      aria-busy={atualizando}
      className="mb-4 rounded-marca-lg border border-borda bg-superficie p-4 shadow-suave"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="sm:col-span-2 lg:col-span-1">
          <span className="mb-1.5 block text-xs font-medium text-texto-suave">Buscar contatos</span>
          <input
            type="search"
            value={filtros.busca}
            onChange={(event) => atualizar("busca", event.target.value)}
            placeholder="Nome, e-mail, empresa ou telefone"
            className={classeInput()}
          />
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-medium text-texto-suave">Status</span>
          <select value={filtros.status} onChange={(event) => atualizar("status", event.target.value)} className={classeInput()}>
            <option value="">Todos os status</option>
            <option value="novo">Novo</option>
            <option value="em_contato">Em contato</option>
            <option value="qualificado">Qualificado</option>
            <option value="convertido">Convertido</option>
            <option value="descartado">Descartado</option>
          </select>
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-medium text-texto-suave">Origem</span>
          <select value={filtros.origem} onChange={(event) => atualizar("origem", event.target.value)} className={classeInput()}>
            <option value="">Todas as origens</option>
            {origens.map((origem) => <option key={origem} value={origem}>{origem}</option>)}
          </select>
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-medium text-texto-suave">Responsável</span>
          <select value={filtros.responsavel} onChange={(event) => atualizar("responsavel", event.target.value)} className={classeInput()}>
            <option value="">Toda a equipe</option>
            <option value="__sem_responsavel__">Sem responsável</option>
            {responsaveis.map((membro) => <option key={membro.id} value={membro.id}>{membro.nome || membro.id}</option>)}
          </select>
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-medium text-texto-suave">Prioridade do follow-up</span>
          <select value={filtros.prioridade} onChange={(event) => atualizar("prioridade", event.target.value)} className={classeInput()}>
            <option value="">Todas as prioridades</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-medium text-texto-suave">Período</span>
          <select value={filtros.periodo} onChange={(event) => atualizar("periodo", event.target.value)} className={classeInput()}>
            {PERIODO.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-borda pt-3">
        <p aria-live="polite" className="text-xs text-texto-suave">
          {atualizando ? "Atualizando resultados..." : `${quantidade} contato(s) correspondem aos filtros.`}
        </p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setFiltros({ busca: "", status: "", origem: "", responsavel: "", prioridade: "", periodo: "todos" })} className="inline-flex min-h-11 items-center rounded-marca px-3 text-xs font-medium text-texto-suave transition-colors hover:bg-areia-claro hover:text-grafite">
            Limpar filtros
          </button>
          <Link
            href={`/admin/crm/exportar${queryExportacao ? `?${queryExportacao}` : ""}`}
            className="inline-flex min-h-11 items-center rounded-marca border border-borda px-3 text-xs font-medium text-grafite transition-colors hover:bg-areia-claro"
          >
            Exportar lista filtrada
          </Link>
        </div>
      </div>
    </div>
  );
}
