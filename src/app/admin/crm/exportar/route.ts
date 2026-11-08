import { connection } from "next/server";

import { requireAuth } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

const TAMANHO_PAGINA = 1000;

function celulaCsv(value: unknown) {
  const texto = String(value ?? "").replace(/[\r\n]+/g, " ");
  const seguro = /^[\t ]*[=+\-@]/.test(texto) ? `'${texto}` : texto;
  return `"${seguro.replace(/"/g, '""')}"`;
}

export async function GET() {
  await connection();
  await requireAuth();
  const supabase = await createClient();
  const leads: Record<string, unknown>[] = [];

  for (let inicio = 0; ; inicio += TAMANHO_PAGINA) {
    const { data, error } = await supabase
      .from("leads")
      .select("nome,email,empresa,telefone,tipo_projeto,mensagem,origem,status,criado_em")
      .order("criado_em", { ascending: false })
      .range(inicio, inicio + TAMANHO_PAGINA - 1);
    if (error) throw new Error(`Falha ao exportar leads: ${error.message}`);
    leads.push(...(data ?? []));
    if (!data || data.length < TAMANHO_PAGINA) break;
  }

  const colunas = ["Nome", "E-mail", "Empresa", "Telefone", "Interesse", "Mensagem", "Origem", "Status", "Recebido em"];
  const linhas = leads.map((lead) => [
    lead.nome,
    lead.email,
    lead.empresa,
    lead.telefone,
    lead.tipo_projeto,
    lead.mensagem,
    lead.origem,
    lead.status,
    lead.criado_em,
  ]);
  const csv = [colunas, ...linhas]
    .map((linha) => linha.map(celulaCsv).join(";"))
    .join("\r\n");

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="arka-leads.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}
