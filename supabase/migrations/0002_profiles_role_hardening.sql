-- Impede que um usuario owner/admin conceda a si mesmo ou a terceiros
-- outro papel alterando diretamente profiles.papel via PostgREST.
-- A gestao de papeis devera usar uma funcao RPC validada quando for implementada.

drop policy if exists "owner e admin editam perfis" on profiles;

create policy "equipe atualiza nomes de perfis"
  on profiles for update
  using (id = auth.uid() or pode_gerenciar())
  with check (id = auth.uid() or pode_gerenciar());

revoke update on table profiles from authenticated;
grant update (nome) on table profiles to authenticated;
