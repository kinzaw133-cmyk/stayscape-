create extension if not exists pgcrypto;

create table if not exists hotels (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  city text not null,
  country text not null,
  description text not null default '',
  rating numeric(2,1) not null default 0 check (rating between 0 and 5),
  review_count int not null default 0,
  lat double precision not null,
  lng double precision not null,
  image_url text,
  amenities text[] not null default '{}',
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references hotels(id) on delete cascade,
  name text not null,
  price_per_night int not null check (price_per_night > 0),
  capacity int not null default 2 check (capacity > 0),
  beds text not null default '1 King Bed',
  quantity int not null default 1 check (quantity >= 0)
);

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

alter table hotels enable row level security;
alter table rooms enable row level security;
alter table newsletter_subscribers enable row level security;

create policy "Public reads published hotels" on hotels for select using (published);
create policy "Public reads rooms of published hotels" on rooms for select
  using (exists (select 1 from hotels h where h.id = hotel_id and h.published));
create policy "Anyone can subscribe" on newsletter_subscribers for insert with check (true);
