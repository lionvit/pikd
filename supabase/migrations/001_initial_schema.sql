-- ============================================================
-- Pikd — Initial Schema
-- Apply to: Supabase SQL Editor (staging first, then production)
-- ============================================================

-- ============================================================
-- Tables
-- ============================================================

create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  avatar_url text,
  created_at timestamptz default now() not null
);

create table public.photos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  storage_path text not null,
  caption text,
  vote_count int default 0 not null,
  expires_at timestamptz default (now() + interval '24 hours') not null,
  created_at timestamptz default now() not null
);

create table public.votes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  photo_id uuid references public.photos(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique (user_id, photo_id)
);

-- ============================================================
-- Indexes
-- ============================================================

create index photos_expires_at_idx on public.photos(expires_at desc);
create index photos_vote_count_idx on public.photos(vote_count desc);
create index photos_user_id_idx on public.photos(user_id);
create index votes_photo_id_idx on public.votes(photo_id);
create index votes_user_id_idx on public.votes(user_id);

-- ============================================================
-- Triggers
-- ============================================================

-- Auto-create profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Increment vote_count when a vote is inserted
create or replace function public.handle_vote_insert()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  update public.photos
  set vote_count = vote_count + 1
  where id = new.photo_id;
  return new;
end;
$$;

create trigger on_vote_inserted
  after insert on public.votes
  for each row execute procedure public.handle_vote_insert();

-- Decrement vote_count when a vote is deleted
create or replace function public.handle_vote_delete()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  update public.photos
  set vote_count = greatest(vote_count - 1, 0)
  where id = old.photo_id;
  return old;
end;
$$;

create trigger on_vote_deleted
  after delete on public.votes
  for each row execute procedure public.handle_vote_delete();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.photos enable row level security;
alter table public.votes enable row level security;

-- profiles: anyone can read, only owner can update
create policy "profiles_read_all" on public.profiles
  for select using (true);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- photos: read only active (not expired), insert/delete own
create policy "photos_read_active" on public.photos
  for select using (expires_at > now());

create policy "photos_insert_own" on public.photos
  for insert with check (auth.uid() = user_id);

create policy "photos_delete_own" on public.photos
  for delete using (auth.uid() = user_id);

-- votes: anyone can read, insert/delete own
create policy "votes_read_all" on public.votes
  for select using (true);

create policy "votes_insert_own" on public.votes
  for insert with check (auth.uid() = user_id);

create policy "votes_delete_own" on public.votes
  for delete using (auth.uid() = user_id);

-- ============================================================
-- Storage
-- ============================================================
-- Run these in Supabase Dashboard > Storage after creating the bucket:
--
-- 1. Create bucket named "photos" (public)
--
-- 2. Storage policies (run in SQL editor):

insert into storage.buckets (id, name, public) values ('photos', 'photos', true)
  on conflict (id) do nothing;

-- Anyone can read public photos
create policy "storage_photos_read" on storage.objects
  for select using (bucket_id = 'photos');

-- Authenticated users can upload to their own folder
create policy "storage_photos_insert" on storage.objects
  for insert with check (
    bucket_id = 'photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own photos
create policy "storage_photos_delete" on storage.objects
  for delete using (
    bucket_id = 'photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
