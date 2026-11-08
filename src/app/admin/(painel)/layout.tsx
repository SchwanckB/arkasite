import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { AdminShell } from "@/components/admin/AdminShell";
import { getUsuarioAtual } from "@/lib/supabase/auth";
import { supabaseConfigurado } from "@/lib/supabase/env";

export default async function PainelLayout({
  children,
}: {
  children: ReactNode;
}) {
  await connection();
  if (!supabaseConfigurado()) return children;

  const usuario = await getUsuarioAtual();
  if (!usuario) redirect("/admin/login");

  return <AdminShell usuario={usuario}>{children}</AdminShell>;
}
