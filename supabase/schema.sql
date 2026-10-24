-- Lumen: esquema do banco no Supabase.
-- Cole este arquivo inteiro em Supabase > SQL Editor > New query > Run.
-- Pode rodar mais de uma vez sem estragar nada.

-- ---------- Perfil: um registro por pessoa ----------
create table if not exists public.perfil (
  user_id        uuid primary key references auth.users (id) on delete cascade,
  -- ofensiva, terços rezados, línguas, lembretes. Fica legível para o servidor
  -- (precisa ser, para o aviso saber se a pessoa já rezou hoje).
  dados          jsonb       not null default '{}'::jsonb,
  atualizado_em  timestamptz not null default now(),
  -- lista de confissão e anotações: texto cifrado NO APARELHO. O servidor não tem a chave.
  cofre          text,
  cofre_salt     text,
  cofre_em       timestamptz
);

alter table public.perfil enable row level security;

drop policy if exists "perfil: dono lê" on public.perfil;
drop policy if exists "perfil: dono cria" on public.perfil;
drop policy if exists "perfil: dono altera" on public.perfil;
drop policy if exists "perfil: dono apaga" on public.perfil;

create policy "perfil: dono lê"    on public.perfil for select using (auth.uid() = user_id);
create policy "perfil: dono cria"  on public.perfil for insert with check (auth.uid() = user_id);
create policy "perfil: dono altera" on public.perfil for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "perfil: dono apaga" on public.perfil for delete using (auth.uid() = user_id);

-- ---------- Inscrições de notificação (um registro por aparelho) ----------
create table if not exists public.push_inscricoes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  hora_terco text,            -- 'HH:MM' no fuso da pessoa; vazio = sem lembrete
  fuso       text not null default 'America/Sao_Paulo',
  criado_em  timestamptz not null default now()
);

alter table public.push_inscricoes enable row level security;

drop policy if exists "push: dono lê" on public.push_inscricoes;
drop policy if exists "push: dono cria" on public.push_inscricoes;
drop policy if exists "push: dono altera" on public.push_inscricoes;
drop policy if exists "push: dono apaga" on public.push_inscricoes;

create policy "push: dono lê"    on public.push_inscricoes for select using (auth.uid() = user_id);
create policy "push: dono cria"  on public.push_inscricoes for insert with check (auth.uid() = user_id);
create policy "push: dono altera" on public.push_inscricoes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "push: dono apaga" on public.push_inscricoes for delete using (auth.uid() = user_id);

-- ---------- Apagar a própria conta ----------
-- Apaga o usuário; perfil e inscrições somem junto (on delete cascade).
create or replace function public.apagar_minha_conta()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'sem sessão';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.apagar_minha_conta() from public, anon;
grant execute on function public.apagar_minha_conta() to authenticated;
