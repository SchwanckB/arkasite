import Image from "next/image";
import { connection } from "next/server";

import { PageHeader } from "@/components/admin/PageHeader";
import { classeInput } from "@/components/admin/FormField";
import { requireAuth } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { atualizarAltMidia, excluirMidia, enviarMidia } from "../actions";

const botao = "inline-flex min-h-10 items-center justify-center rounded-marca bg-musgo px-4 text-sm font-medium text-white hover:bg-musgo-escuro";
const secundario = "inline-flex min-h-9 items-center justify-center rounded-marca border border-borda px-3 text-xs font-medium text-grafite hover:bg-areia-claro";

export default async function MidiaPage() {
  await connection();
  const usuario = await requireAuth();
  const supabase = await createClient();
  const { data: arquivos, error } = await supabase.from("media").select("*").order("criado_em", { ascending: false });
  if (error) throw new Error(`Falha ao carregar biblioteca de mídia: ${error.message}`);

  return (
    <>
      <PageHeader titulo="Biblioteca de mídia" descricao="Envie imagens para o Storage e reutilize seus links no portfólio." />
      <form action={enviarMidia} encType="multipart/form-data" className="mb-7 grid gap-3 rounded-marca-lg border border-borda bg-superficie p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-grafite">Imagem (JPG, PNG, WebP ou AVIF; até 10 MB)
          <input name="arquivo" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required className={classeInput()} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-grafite">Texto alternativo
          <input name="alt" required maxLength={300} placeholder="Descreva a imagem" className={classeInput()} />
        </label>
        <button className={botao}>Enviar arquivo</button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {(arquivos ?? []).map((arquivo) => (
          <article key={arquivo.id} className="overflow-hidden rounded-marca-lg border border-borda bg-superficie">
            <div className="relative aspect-[4/3] bg-fundo-alt">
              <Image src={arquivo.url} alt={arquivo.alt} fill unoptimized sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" />
            </div>
            <div className="p-3">
              <form action={atualizarAltMidia} className="mt-2 flex gap-2"><input type="hidden" name="id" value={arquivo.id} /><input name="alt" required maxLength={300} defaultValue={arquivo.alt} aria-label="Texto alternativo" className={classeInput()} /><button className={secundario}>Salvar</button></form>
              <p className="mt-1 text-xs text-texto-suave">{arquivo.tipo} · {Math.ceil(Number(arquivo.tamanho) / 1024)} KB</p>
              <input readOnly value={arquivo.url} aria-label={`URL de ${arquivo.alt}`} className={`${classeInput()} mt-2 text-xs`} />
              {usuario.papel !== "staff" ? <form action={excluirMidia} className="mt-2"><input type="hidden" name="id" value={arquivo.id} /><button className={secundario}>Excluir mídia</button></form> : null}
            </div>
          </article>
        ))}
      </div>
      {!arquivos?.length ? <p className="rounded-marca border border-dashed border-borda p-6 text-sm text-texto-suave">Nenhum arquivo na biblioteca.</p> : null}
      <p className="mt-6 text-xs text-texto-suave">O bucket público exibe imagens publicadas; somente usuários autenticados podem enviar e somente gestores podem excluir.</p>
    </>
  );
}
