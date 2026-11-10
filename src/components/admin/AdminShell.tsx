"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { Icone } from "@/components/ui/Icone";
import { MENU_ADMIN, type ItemMenuAdmin } from "@/components/admin/nav";
import { sairAdmin } from "@/app/admin/actions";
import type { UsuarioAutenticado } from "@/lib/supabase/auth";
import { cn } from "@/lib/utils";

const ITENS_MENU = MENU_ADMIN.flatMap((grupo) => grupo.itens);
const HREFS_RAPIDOS = new Set([
  "/admin",
  "/admin/crm",
  "/admin/clientes",
  "/admin/financeiro",
  "/admin/tarefas",
]);

function IndicadorNavegacao() {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden="true"
      className={cn(
        "ml-auto h-2 w-2 shrink-0 rounded-full bg-musgo transition-opacity",
        pending ? "animate-pulse opacity-100" : "opacity-0",
      )}
    />
  );
}

function LinkMenu({
  item,
  ativo,
  aoNavegar,
}: {
  item: ItemMenuAdmin;
  ativo: boolean;
  aoNavegar?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={aoNavegar}
      aria-current={ativo ? "page" : undefined}
      className={cn(
        "group relative flex min-h-11 items-center gap-3 rounded-marca px-3 text-sm transition-[background-color,color,transform] duration-200 hover:-translate-y-px active:scale-[0.98]",
        ativo
          ? "bg-musgo/10 font-medium text-musgo"
          : "text-texto-suave hover:bg-areia-claro hover:text-grafite",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-2 left-0 w-0.5 rounded-full bg-musgo transition-opacity",
          ativo ? "opacity-100" : "opacity-0",
        )}
      />
      <Icone nome={item.icone} tamanho={18} />
      <span>{item.rotulo}</span>
      <IndicadorNavegacao />
    </Link>
  );
}

export function AdminShell({
  usuario,
  children,
}: {
  usuario: UsuarioAutenticado;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);
  const menu = usuario.papel === "staff"
    ? MENU_ADMIN.map((grupo) => ({
      ...grupo,
      itens: grupo.itens.filter((item) =>
        !["/admin/financeiro", "/admin/site", "/admin/portfolio", "/admin/aparencia", "/admin/configuracoes"].includes(item.href),
      ),
    })).filter((grupo) => grupo.itens.length > 0)
    : MENU_ADMIN;
  const linksRapidos = ITENS_MENU.filter(
    (item) => HREFS_RAPIDOS.has(item.href) &&
      (usuario.papel !== "staff" || item.href !== "/admin/financeiro"),
  );

  function itemAtivo(item: ItemMenuAdmin) {
    return item.href === "/admin"
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  return (
    <div className="min-h-screen bg-fundo-alt/50 lg:flex">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-borda bg-fundo px-4 py-5 lg:flex">
        <Link href="/admin" className="px-3">
          <span className="block font-display text-xl font-semibold text-musgo">
            ARKA
          </span>
          <span className="text-[11px] uppercase tracking-[0.16em] text-texto-suave">
            Painel administrativo
          </span>
        </Link>
        <nav aria-label="Painel administrativo" className="mt-8 flex-1 space-y-6">
          {menu.map((grupo) => (
            <section key={grupo.titulo} aria-label={grupo.titulo}>
              <h2 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-texto-suave">
                {grupo.titulo}
              </h2>
              <div className="space-y-1">
                {grupo.itens.map((item) => (
                  <LinkMenu
                    key={item.href}
                    item={item}
                    ativo={itemAtivo(item)}
                  />
                ))}
              </div>
            </section>
          ))}
        </nav>
        <div className="border-t border-borda pt-4">
          <p className="truncate px-3 text-sm font-medium text-grafite">
            {usuario.nome || usuario.email}
          </p>
          <p className="px-3 pt-1 text-xs capitalize text-texto-suave">
            {usuario.papel}
          </p>
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:pl-64">
        <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-borda bg-fundo/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-expanded={menuAberto}
              aria-controls="admin-menu-mobile"
              aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
              onClick={() => setMenuAberto((aberto) => !aberto)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-marca text-grafite transition-colors hover:bg-areia-claro active:scale-95 lg:hidden"
            >
              <Icone nome={menuAberto ? "X" : "Menu"} tamanho={20} />
            </button>
            <span className="font-display text-lg font-semibold text-musgo lg:hidden">
              ARKA
            </span>
            <span className="hidden text-sm text-texto-suave lg:block">
              Olá, {usuario.nome || usuario.email}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="inline-flex min-h-10 items-center gap-2 rounded-marca border border-borda px-3 text-sm font-medium text-grafite transition-colors hover:bg-areia-claro"
            >
              <Icone nome="ExternalLink" tamanho={16} />
              <span className="hidden sm:inline">Ver site</span>
            </Link>
            <form action={sairAdmin}>
              <button
                type="submit"
                className="inline-flex min-h-10 items-center gap-2 rounded-marca px-3 text-sm font-medium text-texto-suave transition-colors hover:bg-areia-claro hover:text-grafite"
              >
                <Icone nome="LogOut" tamanho={16} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </form>
          </div>
        </header>

        {menuAberto ? (
          <>
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={() => setMenuAberto(false)}
              className="fixed inset-x-0 top-16 bottom-16 z-10 bg-grafite/10 lg:hidden"
            />
            <nav
              id="admin-menu-mobile"
              aria-label="Navegação do painel"
              className="fixed inset-x-0 top-16 bottom-16 z-30 overflow-y-auto border-y border-borda bg-fundo p-4 shadow-media animate-admin-menu-enter lg:hidden"
            >
              {menu.map((grupo) => (
                <section key={grupo.titulo} className="mb-4 last:mb-0">
                  <h2 className="mb-1 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-texto-suave">
                    {grupo.titulo}
                  </h2>
                  {grupo.itens.map((item) => (
                    <LinkMenu
                      key={item.href}
                      item={item}
                      ativo={itemAtivo(item)}
                      aoNavegar={() => setMenuAberto(false)}
                    />
                  ))}
                </section>
              ))}
            </nav>
          </>
        ) : null}

        <main
          id="conteudo"
          className="mx-auto w-full max-w-7xl px-4 py-7 pb-24 sm:px-6 lg:px-8 lg:py-9"
        >
          <div key={pathname} className="admin-page-enter">
            {children}
          </div>
        </main>

        <nav
          aria-label="Atalhos do painel"
          className={cn(
            "fixed inset-x-0 bottom-0 z-20 grid border-t border-borda bg-fundo/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden",
            linksRapidos.length === 4 ? "grid-cols-4" : "grid-cols-5",
          )}
        >
          {linksRapidos.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.rotulo}
              aria-current={itemAtivo(item) ? "page" : undefined}
              className={cn(
                "relative flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] transition-[color,transform] duration-200 active:scale-95",
                itemAtivo(item) ? "font-medium text-musgo" : "text-texto-suave",
              )}
              onClick={() => setMenuAberto(false)}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-1 h-0.5 w-6 rounded-full bg-musgo transition-opacity",
                  itemAtivo(item) ? "opacity-100" : "opacity-0",
                )}
              />
              <Icone nome={item.icone} tamanho={19} />
              <span className="max-w-full truncate">{item.rotulo}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
