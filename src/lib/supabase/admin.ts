import "server-only";

/**
 * Cliente Supabase com a service role key: IGNORA o RLS.
 *
 * Uso extremamente restrito: so em Route Handlers/Server Actions que
 * precisam fazer algo que nenhum papel de usuario deveria fazer sozinho
 * (ex.: criar o primeiro usuario owner, operacoes de manutencao). Na
 * duvida, use src/lib/supabase/server.ts, que respeita RLS.
 *
 * `import "server-only"` garante erro de build se este arquivo for
 * importado, ainda que indiretamente, por codigo que roda no navegador.
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { supabaseAdminConfigurado } from "./env";

export function createAdminClient() {
  if (!supabaseAdminConfigurado()) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY nao configurada. Nunca exponha esta chave no cliente.",
    );
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
