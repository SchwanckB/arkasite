-- Recursos necessarios para os modulos do painel:
-- atribuicao de papel pelo owner e biblioteca de midia no Storage.

create or replace function alterar_papel_equipe(
  usuario_alvo uuid,
  novo_papel papel_usuario
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from profiles
    where id = auth.uid() and papel = 'owner'::papel_usuario
  ) then
    raise exception 'Somente o owner pode alterar papeis da equipe.';
  end if;

  if novo_papel not in ('admin'::papel_usuario, 'staff'::papel_usuario) then
    raise exception 'O painel so pode atribuir os papeis admin e staff.';
  end if;

  if usuario_alvo = auth.uid() then
    raise exception 'O owner nao pode alterar o proprio papel.';
  end if;

  update profiles set papel = novo_papel where id = usuario_alvo;
  if not found then
    raise exception 'Perfil nao encontrado.';
  end if;
end;
$$;

revoke all on function alterar_papel_equipe(uuid, papel_usuario) from public;
grant execute on function alterar_papel_equipe(uuid, papel_usuario) to authenticated;

create or replace function resumo_financeiro()
returns table (
  account_id uuid,
  tipo text,
  status text,
  total_cents numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    transactions.account_id,
    transactions.tipo,
    transactions.status,
    coalesce(sum(transactions.amount_cents), 0)::numeric
  from transactions
  group by transactions.account_id, transactions.tipo, transactions.status;
$$;

revoke all on function resumo_financeiro() from public;
grant execute on function resumo_financeiro() to authenticated;

delete from differentials older
using differentials newer
where older.titulo = newer.titulo and older.id > newer.id;

create unique index if not exists differentials_titulo_unique
  on differentials (titulo);

delete from faq older
using faq newer
where older.pergunta = newer.pergunta and older.id > newer.id;

create unique index if not exists faq_pergunta_unique
  on faq (pergunta);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "equipe envia midia propria"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "equipe consulta biblioteca de midia"
  on storage.objects for select to authenticated
  using (bucket_id = 'media');

create policy "gestores removem midia"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and pode_gerenciar());
