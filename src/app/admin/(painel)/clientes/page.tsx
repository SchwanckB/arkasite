import { PageHeader } from "@/components/admin/PageHeader";
import { classeInput } from "@/components/admin/FormField";
import { connection } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import {
  excluirCliente,
  excluirContatoCliente,
  registrarInteracao,
  salvarCliente,
  salvarContatoCliente,
} from "../actions";

const botao = "inline-flex min-h-10 items-center justify-center rounded-marca bg-musgo px-4 text-sm font-medium text-white hover:bg-musgo-escuro";
const secundario = "inline-flex min-h-9 items-center justify-center rounded-marca border border-borda px-3 text-xs font-medium text-grafite hover:bg-areia-claro";

export default async function ClientesPage() {
  await connection();
  await requireAuth();
  const supabase = await createClient();
  const [clientesResult, interacoesResult, contatosResult] = await Promise.all([
    supabase.from("clients").select("*").order("criado_em", { ascending: false }),
    supabase.from("interactions").select("id,client_id,tipo,descricao,ocorreu_em").not("client_id", "is", null).order("ocorreu_em", { ascending: false }).limit(200),
    supabase.from("client_contacts").select("*").order("principal", { ascending: false }).order("nome"),
  ]);
  if (clientesResult.error) throw new Error(`Falha ao carregar clientes: ${clientesResult.error.message}`);
  if (interacoesResult.error) throw new Error(`Falha ao carregar histórico: ${interacoesResult.error.message}`);
  if (contatosResult.error) throw new Error(`Falha ao carregar contatos dos clientes: ${contatosResult.error.message}`);

  return (
    <>
      <PageHeader titulo="Clientes" descricao="Cadastre clientes e mantenha seus contatos e histórico em um só lugar." />
      <details className="mb-6 rounded-marca-lg border border-borda bg-superficie p-5">
        <summary className="cursor-pointer font-medium text-musgo">Adicionar cliente</summary>
        <form action={salvarCliente} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input name="empresa" required maxLength={200} placeholder="Empresa / nome" className={classeInput()} />
          <input name="responsavel" maxLength={120} placeholder="Pessoa responsável" className={classeInput()} />
          <input name="email" type="email" maxLength={200} placeholder="E-mail" className={classeInput()} />
          <input name="telefone" maxLength={50} placeholder="Telefone" className={classeInput()} />
          <input name="documento" maxLength={40} placeholder="CPF / CNPJ" className={classeInput()} />
          <input name="endereco" maxLength={500} placeholder="Endereço" className={classeInput()} />
          <textarea name="observacoes" maxLength={4000} placeholder="Observações" className={`${classeInput()} sm:col-span-2 lg:col-span-3`} />
          <button className={botao}>Salvar cliente</button>
        </form>
      </details>

      <div className="grid gap-4 xl:grid-cols-2">
        {(clientesResult.data ?? []).map((cliente) => {
          const historico = (interacoesResult.data ?? []).filter((item) => item.client_id === cliente.id);
          const contatos = (contatosResult.data ?? []).filter((item) => item.client_id === cliente.id);
          return (
            <article key={cliente.id} className="rounded-marca-lg border border-borda bg-superficie p-5">
              <form action={salvarCliente} className="grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="id" value={cliente.id} />
                <input name="empresa" required maxLength={200} defaultValue={cliente.empresa} aria-label="Empresa" className={classeInput()} />
                <input name="responsavel" maxLength={120} defaultValue={cliente.responsavel ?? ""} placeholder="Responsável" aria-label="Responsável" className={classeInput()} />
                <input name="email" type="email" maxLength={200} defaultValue={cliente.email ?? ""} placeholder="E-mail" aria-label="E-mail" className={classeInput()} />
                <input name="telefone" maxLength={50} defaultValue={cliente.telefone ?? ""} placeholder="Telefone" aria-label="Telefone" className={classeInput()} />
                <input name="documento" maxLength={40} defaultValue={cliente.documento ?? ""} placeholder="CPF / CNPJ" aria-label="CPF / CNPJ" className={classeInput()} />
                <input name="endereco" maxLength={500} defaultValue={cliente.endereco ?? ""} placeholder="Endereço" aria-label="Endereço" className={classeInput()} />
                <textarea name="observacoes" maxLength={4000} defaultValue={cliente.observacoes ?? ""} placeholder="Observações" aria-label="Observações" className={`${classeInput()} sm:col-span-2`} />
                <button className={secundario}>Salvar alterações</button>
                <button formAction={excluirCliente} name="id" value={cliente.id} className={secundario}>Excluir cliente</button>
              </form>
              <details className="mt-4 border-t border-borda pt-3">
                <summary className="cursor-pointer text-sm font-semibold text-grafite">Pessoas de contato ({contatos.length})</summary>
                <form action={salvarContatoCliente} className="mt-3 grid gap-2 sm:grid-cols-2">
                  <input type="hidden" name="client_id" value={cliente.id} />
                  <input name="nome" required maxLength={120} placeholder="Nome" className={classeInput()} />
                  <input name="cargo" maxLength={120} placeholder="Cargo" className={classeInput()} />
                  <input name="email" type="email" maxLength={200} placeholder="E-mail" className={classeInput()} />
                  <input name="telefone" maxLength={50} placeholder="Telefone" className={classeInput()} />
                  <select name="principal" className={classeInput()}><option value="false">Contato adicional</option><option value="true">Contato principal</option></select>
                  <button className={secundario}>Adicionar contato</button>
                </form>
                {contatos.length ? <ul className="mt-3 space-y-2">{contatos.map((contato) => <li key={contato.id} className="flex items-center justify-between gap-2 rounded-marca bg-fundo-alt px-3 py-2 text-sm"><span>{contato.nome}{contato.principal ? " · principal" : ""}{contato.cargo ? ` · ${contato.cargo}` : ""}{contato.email ? ` · ${contato.email}` : ""}</span><form action={excluirContatoCliente}><input type="hidden" name="id" value={contato.id} /><button className={secundario}>Remover</button></form></li>)}</ul> : null}
              </details>
              <div className="mt-5 border-t border-borda pt-4">
                <h3 className="text-sm font-semibold text-grafite">Histórico de contato</h3>
                <form action={registrarInteracao} className="mt-3 grid gap-2 sm:grid-cols-[130px_1fr_auto]">
                  <input type="hidden" name="lead_id" value="" /><input type="hidden" name="client_id" value={cliente.id} />
                  <select name="tipo" className={classeInput()}><option value="nota">Nota</option><option value="ligacao">Ligação</option><option value="whatsapp">WhatsApp</option><option value="reuniao">Reunião</option><option value="email">E-mail</option></select>
                  <input name="descricao" required maxLength={4000} placeholder="Registrar contato" className={classeInput()} />
                  <button className={secundario}>Adicionar</button>
                </form>
                {historico.length ? <ul className="mt-3 space-y-2">{historico.slice(0, 5).map((item) => (
                  <li key={item.id} className="rounded-marca bg-fundo-alt px-3 py-2 text-sm"><span className="font-medium text-musgo">{item.tipo}</span> · {item.descricao}<time className="ml-2 text-xs text-texto-suave">{new Date(item.ocorreu_em).toLocaleDateString("pt-BR")}</time></li>
                ))}</ul> : <p className="mt-3 text-xs text-texto-suave">Nenhuma interação registrada.</p>}
              </div>
            </article>
          );
        })}
      </div>
      {!clientesResult.data?.length ? <p className="rounded-marca border border-dashed border-borda p-6 text-sm text-texto-suave">Ainda não há clientes. Você também pode converter leads pelo CRM.</p> : null}
    </>
  );
}
