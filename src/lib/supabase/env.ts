/**
 * Verificacao central de configuracao do Supabase.
 *
 * Toda a camada de dados (Parte 7) precisa saber, de forma barata e
 * sincrona, se o banco esta configurado, para cair na reserva de
 * src/content/* sem lancar excecao. Esta e a unica fonte dessa checagem.
 */

export function supabaseConfigurado(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function supabaseAdminConfigurado(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/** Le a URL e a chave publica, lancando so se alguem chamar sem checar antes. */
export function credenciaisPublicas() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase nao configurado. Chame supabaseConfigurado() antes de usar o cliente.",
    );
  }

  return { url, anonKey };
}
