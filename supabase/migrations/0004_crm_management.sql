-- Responsaveis e trilha de auditoria do CRM.
alter table public.leads
  add column responsavel uuid references public.profiles (id) on delete set null;

alter table public.deals
  add column responsavel uuid references public.profiles (id) on delete set null;

create index leads_responsavel_criado_em_idx
  on public.leads (responsavel, criado_em desc);

create index deals_responsavel_criado_em_idx
  on public.deals (responsavel, criado_em desc);

create policy "equipe autenticada consulta perfis da equipe"
  on public.profiles for select
  using (esta_autenticado());

create table public.crm_activity (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads (id) on delete set null,
  deal_id uuid references public.deals (id) on delete set null,
  actor_id uuid references public.profiles (id) on delete set null,
  evento text not null,
  detalhes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index crm_activity_lead_created_idx
  on public.crm_activity (lead_id, created_at desc);

create index crm_activity_deal_created_idx
  on public.crm_activity (deal_id, created_at desc);

alter table public.crm_activity enable row level security;

create policy "equipe autenticada consulta historico crm"
  on public.crm_activity for select
  using (esta_autenticado());

grant select on public.crm_activity to authenticated;

create or replace function public.registrar_atividade_crm()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_lead uuid;
  v_deal uuid;
begin
  if tg_table_name = 'leads' then
    v_lead := case when tg_op = 'DELETE' then old.id else new.id end;

    if tg_op = 'INSERT' then
      insert into public.crm_activity (lead_id, actor_id, evento, detalhes)
      values (v_lead, v_actor, 'lead_criado', jsonb_build_object('nome', new.nome));
      return new;
    elsif tg_op = 'DELETE' then
      insert into public.crm_activity (lead_id, actor_id, evento, detalhes)
      values (v_lead, v_actor, 'lead_excluido', jsonb_build_object('nome', old.nome));
      return old;
    end if;

    if old.status is distinct from new.status then
      insert into public.crm_activity (lead_id, actor_id, evento, detalhes)
      values (v_lead, v_actor, 'status_lead', jsonb_build_object('antes', old.status, 'depois', new.status));
    end if;
    if old.responsavel is distinct from new.responsavel then
      insert into public.crm_activity (lead_id, actor_id, evento, detalhes)
      values (v_lead, v_actor, 'responsavel_lead', jsonb_build_object('antes', old.responsavel, 'depois', new.responsavel));
    end if;
    if old.nome is distinct from new.nome
      or old.email is distinct from new.email
      or old.empresa is distinct from new.empresa
      or old.telefone is distinct from new.telefone
      or old.tipo_projeto is distinct from new.tipo_projeto
      or old.mensagem is distinct from new.mensagem
      or old.origem is distinct from new.origem then
      insert into public.crm_activity (lead_id, actor_id, evento)
      values (v_lead, v_actor, 'lead_atualizado');
    end if;
    return new;
  end if;

  v_deal := case when tg_op = 'DELETE' then old.id else new.id end;

  if tg_op = 'INSERT' then
    insert into public.crm_activity (lead_id, deal_id, actor_id, evento, detalhes)
    values (new.lead_id, v_deal, v_actor, 'negocio_criado', jsonb_build_object('titulo', new.titulo));
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.crm_activity (lead_id, deal_id, actor_id, evento, detalhes)
    values (old.lead_id, v_deal, v_actor, 'negocio_excluido', jsonb_build_object('titulo', old.titulo));
    return old;
  end if;

  if old.etapa is distinct from new.etapa then
    insert into public.crm_activity (lead_id, deal_id, actor_id, evento, detalhes)
    values (new.lead_id, v_deal, v_actor, 'etapa_negocio', jsonb_build_object('antes', old.etapa, 'depois', new.etapa));
  end if;
  if old.responsavel is distinct from new.responsavel then
    insert into public.crm_activity (lead_id, deal_id, actor_id, evento, detalhes)
    values (new.lead_id, v_deal, v_actor, 'responsavel_negocio', jsonb_build_object('antes', old.responsavel, 'depois', new.responsavel));
  end if;
  if old.valor_cents is distinct from new.valor_cents then
    insert into public.crm_activity (lead_id, deal_id, actor_id, evento, detalhes)
    values (new.lead_id, v_deal, v_actor, 'valor_negocio', jsonb_build_object('antes', old.valor_cents, 'depois', new.valor_cents));
  end if;
  if old.titulo is distinct from new.titulo
    or old.lead_id is distinct from new.lead_id
    or old.client_id is distinct from new.client_id
    or old.motivo_perda is distinct from new.motivo_perda then
    insert into public.crm_activity (lead_id, deal_id, actor_id, evento)
    values (new.lead_id, v_deal, v_actor, 'negocio_atualizado');
  end if;
  return new;
end;
$$;

create trigger leads_registrar_atividade
  after insert or update or delete on public.leads
  for each row execute function public.registrar_atividade_crm();

create trigger deals_registrar_atividade
  after insert or update or delete on public.deals
  for each row execute function public.registrar_atividade_crm();

revoke all on function public.registrar_atividade_crm() from public, anon, authenticated;
