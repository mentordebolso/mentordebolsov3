-- Mentor de Bolso: schema mínimo

create table if not exists public.user_settings (
  id uuid primary key default gen_random_uuid(),
  telegram_chat_id bigint unique not null,
  timezone text not null default 'America/Sao_Paulo',
  alerts_enabled boolean not null default true,
  alert_morning time not null default '09:00',
  alert_afternoon time not null default '14:00',
  alert_night time not null default '20:30',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_settings(id) on delete cascade,
  symbol text not null,
  kind text not null check (kind in ('crypto','stock_br','fii_br')),
  created_at timestamptz not null default now(),
  unique(user_id, symbol, kind)
);

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_settings(id) on delete cascade,
  alert_kind text not null check (alert_kind in ('morning','afternoon','night','manual')),
  title text not null,
  message text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.decisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_settings(id) on delete cascade,
  recommendation_id uuid references public.recommendations(id) on delete set null,
  decision text not null check (decision in ('done','skipped')),
  notes text,
  created_at timestamptz not null default now()
);

-- helper trigger to keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_user_settings_updated_at on public.user_settings;
create trigger trg_user_settings_updated_at
before update on public.user_settings
for each row execute function public.set_updated_at();
