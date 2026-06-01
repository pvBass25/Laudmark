create extension if not exists pgcrypto;

-- OWNERS ----------------------------------------------------------
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null,
  plan            text not null default 'free' check (plan in ('free','pro','studio')),
  stripe_customer_id text,
  brand_name      text,
  brand_logo_url  text,
  brand_color     text default '#111111',
  niche           text default 'coach',
  created_at      timestamptz not null default now()
);

-- COLLECTION PAGES ------------------------------------------------
create table public.collection_pages (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  slug            text not null unique,
  title           text not null default 'Leave a testimonial',
  prompt_questions text[] not null default '{}',
  created_at      timestamptz not null default now()
);

-- TESTIMONIALS ----------------------------------------------------
create table public.testimonials (
  id              uuid primary key default gen_random_uuid(),
  page_id         uuid not null references public.collection_pages(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  type            text not null check (type in ('video','text')),
  author_name     text not null,
  author_title    text,
  author_photo_url text,
  rating          int check (rating between 1 and 5),
  raw_text        text,            -- original typed text or transcript
  clean_text      text,            -- Claude-polished
  pull_quote      text,
  video_url       text,
  captions_vtt    text,
  themes          text[] default '{}',
  sentiment       text,
  status          text not null default 'pending' check (status in ('pending','approved','hidden')),
  consent         boolean not null default false,
  consent_ts      timestamptz,
  consent_ip      text,
  created_at      timestamptz not null default now()
);
create index on public.testimonials (user_id, status);
create index on public.testimonials (page_id);

-- WALLS -----------------------------------------------------------
create table public.walls (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  name            text not null default 'Wall of Love',
  layout          text not null default 'grid' check (layout in ('grid','carousel','list')),
  testimonial_ids uuid[] not null default '{}',
  created_at      timestamptz not null default now()
);

-- REQUEST AUTOMATION ---------------------------------------------
create table public.requests (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  page_id         uuid not null references public.collection_pages(id) on delete cascade,
  recipient_email text not null,
  recipient_name  text,
  sequence_step   int not null default 0,    -- 0,1,2 = three nudges
  status          text not null default 'active' check (status in ('active','done','stopped')),
  scheduled_at    timestamptz not null default now(),
  created_at      timestamptz not null default now()
);
create index on public.requests (status, scheduled_at);

-- RLS -------------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.collection_pages enable row level security;
alter table public.testimonials     enable row level security;
alter table public.walls            enable row level security;
alter table public.requests         enable row level security;

-- Owners manage only their own rows.
create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own pages" on public.collection_pages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own testimonials" on public.testimonials
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own walls" on public.walls
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own requests" on public.requests
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
