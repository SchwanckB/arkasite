import { connection } from "next/server";

import { requireAuth } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

const TAMANHO_PAGINA = 1000;

function celulaCsv(value: unknown) {
  const texto = String(value ?? "").replace(/[\r\n]+/g, " ");
  const seguro = /^[\t ]*[=+\-@]/.test(texto) ? `'${texto}` : texto;
  return `"${seguro.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  await connection();
  await requireAuth();
  const supabase = await createClient();
  const leads: Record<string, unknown>[] = [];
  const searchParams = new URL(request.url).searchParams;
  const busca = (searchParams.get("busca") ?? "").trim().toLocaleLowerCase("pt-BR");
  const status = searchParams.get("status") ?? "";
  const origem = searchParams.get("origem") ?? "";
  const responsavel = searchParams.get("responsavel") ?? "";
  const prioridade = searchParams.get("prioridade") ?? "";
  const periodo = searchParams.get("periodo") ?? "todos";
  const statuses = ["novo", "em_contato", "qualificado", "convertido", "descartado"];
  const prioridades = ["baixa", "media", "alta"];
  const periodos = ["30", "90", "365", "todos"];
  const filtroStatus = statuses.includes(status) ? status : "";
  const filtroPrioridade = prioridades.includes(prioridade) ? prioridade : "";
  const filtroPeriodo = periodos.includes(periodo) ? periodo : "todos";
  const dataInicio = filtroPeriodo === "todos"
    ? null
    : new Date();
  if (dataInicio) dataInicio.setDate(dataInicio.getDate() - Number(filtroPeriodo));

  for (let offset = 0; ; offset += TAMANHO_PAGINA) {
    const { data, error } = await supabase
      .from("leads")
      .select("id,nome,email,empresa,telefone,tipo_projeto,mensagem,origem,status,criado_em,responsavel")
      .order("criado_em", { ascending: false })
      .range(offset, offset + TAMANHO_PAGINA - 1);
    if (error) throw new Error(`Falha ao exportar leads: ${error.message}`);
    leads.push(...(data ?? []));
    if (!data || data.length < TAMANHO_PAGINA) break;
  }

  const tarefas: Array<{ lead_id: string | null; prioridade: string; concluida: boolean }> = [];
  for (let offset = 0; ; offset += TAMANHO_PAGINA) {
    const { data, error } = await supabase
      .from("tasks")
      .select("lead_id,prioridade,concluida")
      .not("lead_id", "is", null)
      .order("id", { ascending: true })
      .range(offset, offset + TAMANHO_PAGINA - 1);
    if (error) throw new Error(`Falha ao carregar follow-ups para a exportação: ${error.message}`);
    tarefas.push(...(data ?? []));
    if (!data || data.length < TAMANHO_PAGINA) break;
  }
  const prioridadePorLead = new Map<string, Set<string>>();
  for (const tarefa of tarefas) {
    if (!tarefa.lead_id || tarefa.concluida) continue;
    const prioridadesLead = prioridadePorLead.get(tarefa.lead_id) ?? new Set<string>();
    prioridadesLead.add(tarefa.prioridade);
    prioridadePorLead.set(tarefa.lead_id, prioridadesLead);
  }

  const equipeResult = await supabase.from("profiles").select("id,nome");
  if (equipeResult.error) throw new Error(`Falha ao carregar responsáveis para a exportação: ${equipeResult.error.message}`);
  const nomeEquipe = new Map((equipeResult.data ?? []).map((membro) => [membro.id, membro.nome]));
  const filtrados = leads.filter((lead) => {
    const texto = [lead.nome, lead.email, lead.empresa, lead.telefone, lead.tipo_projeto, lead.origem]
      .filter(Boolean).join(" ").toLocaleLowerCase("pt-BR");
    const dataLead = typeof lead.criado_em === "string" ? new Date(lead.criado_em) : null;
    return (!busca || texto.includes(busca))
      && (!filtroStatus || lead.status === filtroStatus)
      && (!origem || lead.origem === origem)
      && (!responsavel || (responsavel === "__sem_responsavel__"
        ? !lead.responsavel
        : lead.responsavel === responsavel))
      && (!filtroPrioridade || (typeof lead.id === "string" && prioridadePorLead.get(lead.id)?.has(filtroPrioridade)))
      && (!dataInicio || Boolean(dataLead && dataLead >= dataInicio));
  });

  const colunas = ["Nome", "E-mail", "Empresa", "Telefone", "Interesse", "Mensagem", "Origem", "Status", "Responsável", "Recebido em"];
  const linhas = filtrados.map((lead) => [
    lead.nome,
    lead.email,
    lead.empresa,
    lead.telefone,
    lead.tipo_projeto,
    lead.mensagem,
    lead.origem,
    lead.status,
    typeof lead.responsavel === "string" ? nomeEquipe.get(lead.responsavel) ?? "Membro da equipe" : "",
    lead.criado_em,
  ]);
  const csv = [colunas, ...linhas]
    .map((linha) => linha.map(celulaCsv).join(";"))
    .join("\r\n");

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="arka-leads-filtrados.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}
