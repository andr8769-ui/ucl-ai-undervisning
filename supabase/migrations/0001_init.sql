-- UCL AI-undervisning. Skema og adgangsregler.
-- Al adgang går gennem appens server. Hver forespørgsel skal have headeren
-- x-app-secret med den værdi, der ligger i private.app_config. Uden den kan
-- publishable-nøglen hverken læse eller skrive noget.

create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.app_config (
  key text primary key,
  value text not null
);

-- Funktionen ligger i private-skemaet, som ikke er eksponeret i API'et.
create or replace function private.has_app_secret()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (nullif(current_setting('request.headers', true), '')::json ->> 'x-app-secret')
      = (select value from private.app_config where key = 'app_secret'),
    false
  );
$$;
revoke all on function private.has_app_secret() from public;
grant usage on schema private to anon;
grant execute on function private.has_app_secret() to anon;

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  programme text not null check (programme in ('proces', 'handel', 'service')),
  class_name text not null check (char_length(class_name) between 1 and 60),
  session_date date not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  username text not null check (char_length(username) between 2 and 24),
  created_at timestamptz not null default now(),
  unique (session_id, username)
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  kind text not null default 'find_fejlen',
  answers jsonb not null default '{}'::jsonb,
  submitted_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (participant_id, kind)
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  participant_id uuid references public.participants(id) on delete set null,
  username text not null,
  body text not null check (char_length(body) between 1 and 500),
  status text not null default 'new' check (status in ('new', 'shown', 'done')),
  created_at timestamptz not null default now()
);

create index if not exists participants_session_idx on public.participants(session_id);
create index if not exists submissions_session_idx on public.submissions(session_id);
create index if not exists questions_session_idx on public.questions(session_id, created_at);
create index if not exists questions_participant_idx on public.questions(participant_id, created_at);

alter table public.sessions enable row level security;
alter table public.participants enable row level security;
alter table public.submissions enable row level security;
alter table public.questions enable row level security;

create policy "kun appen" on public.sessions for all to anon using (private.has_app_secret()) with check (private.has_app_secret());
create policy "kun appen" on public.participants for all to anon using (private.has_app_secret()) with check (private.has_app_secret());
create policy "kun appen" on public.submissions for all to anon using (private.has_app_secret()) with check (private.has_app_secret());
create policy "kun appen" on public.questions for all to anon using (private.has_app_secret()) with check (private.has_app_secret());

grant select, insert, update, delete on public.sessions, public.participants, public.submissions, public.questions to anon;

-- Til sidst sættes hemmeligheden (samme værdi som APP_SECRET i Vercel):
-- insert into private.app_config (key, value) values ('app_secret', '<APP_SECRET>');
