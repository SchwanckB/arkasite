import { connection } from "next/server";

import { requireAuth } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

function escaparIcs(valor: string) {
  return valor
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/([,;])/g, "\\$1");
}

function dobrarLinha(linha: string) {
  const encoder = new TextEncoder();
  let resultado = "";
  let trecho = "";
  let bytes = 0;
  for (const caractere of linha) {
    const tamanho = encoder.encode(caractere).length;
    if (bytes + tamanho > 75) {
      resultado += `${trecho}\r\n `;
      trecho = caractere;
      bytes = 1 + tamanho;
    } else {
      trecho += caractere;
      bytes += tamanho;
    }
  }
  return resultado + trecho;
}

export async function GET(request: Request) {
  await connection();
  await requireAuth();
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return new Response("Identificador de tarefa inválido.", { status: 400 });
  }

  const supabase = await createClient();
  const { data: tarefa, error } = await supabase.from("tasks")
    .select("id,titulo,descricao,vence_em")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Falha ao carregar tarefa para o calendário: ${error.message}`);
  if (!tarefa) return new Response("Tarefa não encontrada.", { status: 404 });
  if (!tarefa.vence_em) return new Response("Esta tarefa não tem prazo definido.", { status: 422 });

  const inicio = tarefa.vence_em.replaceAll("-", "");
  const fimDate = new Date(`${tarefa.vence_em}T00:00:00.000Z`);
  fimDate.setUTCDate(fimDate.getUTCDate() + 1);
  const fim = fimDate.toISOString().slice(0, 10).replaceAll("-", "");
  const linhas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ARKA//CRM//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${tarefa.id}@crm.arka`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
    `DTSTART;VALUE=DATE:${inicio}`,
    `DTEND;VALUE=DATE:${fim}`,
    `SUMMARY:${escaparIcs(tarefa.titulo)}`,
    ...(tarefa.descricao ? [`DESCRIPTION:${escaparIcs(tarefa.descricao)}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ].map(dobrarLinha);

  return new Response(`${linhas.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="follow-up-${tarefa.id}.ics"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
