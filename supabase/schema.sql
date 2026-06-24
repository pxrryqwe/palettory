-- Palettory pilot — Supabase schema
-- Run once in Supabase SQL editor.

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  over_18 boolean not null default false,
  chosen_base text check (chosen_base in ('sweet','sour','warm','cool')),
  created_at timestamptz default now(),
  completed_at timestamptz
);

create table if not exists responses (
  id bigserial primary key,
  participant_id uuid references participants(id) on delete cascade,
  step text check (step in ('base','modifier')) not null,
  base_quality text,
  modifier text,
  round int default 1,
  h int not null,
  s int not null,
  b int not null,
  created_at timestamptz default now()
);

create index if not exists responses_participant_idx on responses(participant_id);

-- RLS: anonymous insert only. No public select.
alter table participants enable row level security;
alter table responses enable row level security;

drop policy if exists "anon insert participants" on participants;
create policy "anon insert participants"
  on participants for insert to anon
  with check (true);

drop policy if exists "anon update participants" on participants;
create policy "anon update participants"
  on participants for update to anon
  using (true) with check (true);

drop policy if exists "anon insert responses" on responses;
create policy "anon insert responses"
  on responses for insert to anon
  with check (true);
