import { PageHeader } from "@/components/admin/PageHeader";
import { classeInput } from "@/components/admin/FormField";
import { AdminRestricted } from "@/components/admin/AdminRestricted";
import { connection } from "next/server";
import { requireAuth } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { salvarAparencia } from "../actions";

export default async function AparenciaPage() {
  await connection();
  const usuario = await requireAuth();
  if (usuario.papel === "staff") return <AdminRestricted modulo="Aparência" />;
  const supabase = await createClient();
  const { data, error } = await supabase.from("site_settings").select("valor").eq("chave", "aparencia").maybeSingle();
  if (error) throw new Error(`Falha ao carregar aparência: ${error.message}`);
  const valor = data?.valor as { tema?: unknown } | null;
  const tema = valor?.tema === "grafite" ? "grafite" : "musgo";

  return (
    <>
      <PageHeader titulo="Aparência" descricao="Escolha uma variação de cor dentro da identidade visual oficial." />
      <section className="max-w-2xl rounded-marca-lg border border-borda bg-superficie p-5 sm:p-7">
        <form action={salvarAparencia} className="space-y-5">
          <label className="flex flex-col gap-2 text-sm font-medium text-grafite">
            Cor de destaque
            <select name="tema" defaultValue={tema} className={classeInput()}>
              <option value="musgo">Verde musgo (padrão ARKA)</option>
              <option value="grafite">Grafite (alto contraste)</option>
            </select>
          </label>
          <div className="rounded-marca bg-areia-claro p-4 text-sm text-grafite">
            A opção escolhida altera os botões e destaques do site. As cores continuam limitadas à paleta oficial da marca.
          </div>
          <button className="inline-flex min-h-11 items-center justify-center rounded-marca bg-musgo px-5 text-sm font-medium text-white hover:bg-musgo-escuro">Salvar aparência</button>
        </form>
      </section>
    </>
  );
}
