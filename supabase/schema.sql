-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Universities Table
create table if not exists public.universities (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  domain text not null unique,
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Profiles Table (Extends Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  university_id uuid references public.universities(id),
  degree text,
  country text,
  state text,
  is_verified boolean default false,
  verification_status text default 'none', -- none, pending, verified, rejected
  id_card_url text,
  student_id text,
  vibe_score integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Posts Table
create table if not exists public.posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text,
  image_url text,
  likes_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Messages Table
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Follows Table
create table if not exists public.follows (
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (follower_id, following_id)
);

-- 6. Vibe Votes Table
create table if not exists public.vibe_votes (
  voter_id uuid references public.profiles(id) on delete cascade not null,
  target_id uuid references public.profiles(id) on delete cascade not null,
  vote_type text check (vote_type in ('up', 'down')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (voter_id, target_id)
);

-- 7. Calls Table (For WebRTC Signaling)
create table if not exists public.calls (
  id uuid default uuid_generate_v4() primary key,
  caller_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('offering', 'answered', 'ended')) not null,
  offer jsonb,
  answer jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.universities enable row level security;
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.messages enable row level security;
alter table public.follows enable row level security;
alter table public.vibe_votes enable row level security;
alter table public.calls enable row level security;

-- Enable Realtime Replication for Messages and Calls
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.calls;

-- Policies

-- Universities
create policy "Public universities are viewable by everyone."
  on public.universities for select
  using ( true );

-- Profiles
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id )
  with check ( auth.uid() = id );

-- Posts
create policy "Public posts are viewable by everyone."
  on public.posts for select
  using ( true );

create policy "Authenticated users can create posts."
  on public.posts for insert
  with check ( auth.role() = 'authenticated' );

-- Messages
create policy "Users can read their own messages."
  on public.messages for select
  using ( auth.uid() = sender_id or auth.uid() = receiver_id );

create policy "Authenticated users can send messages."
  on public.messages for insert
  with check ( auth.role() = 'authenticated' AND auth.uid() = sender_id );

-- Follows
create policy "Public follows are viewable by everyone."
  on public.follows for select
  using ( true );

create policy "Authenticated users can follow others."
  on public.follows for insert
  with check ( auth.uid() = follower_id );

create policy "Users can unfollow."
  on public.follows for delete
  using ( auth.uid() = follower_id );

-- Vibe Votes
create policy "Public vibe votes are viewable by everyone."
  on public.vibe_votes for select
  using ( true );

create policy "Authenticated users can vote."
  on public.vibe_votes for insert
  with check ( auth.uid() = voter_id );

create policy "Users can change their vote."
  on public.vibe_votes for update
  using ( auth.uid() = voter_id );

create policy "Users can remove their vote."
  on public.vibe_votes for delete
  using ( auth.uid() = voter_id );

-- Calls
create policy "Users can view their own calls."
  on public.calls for select
  using ( auth.uid() = caller_id or auth.uid() = receiver_id );

create policy "Authenticated users can start calls."
  on public.calls for insert
  with check ( auth.role() = 'authenticated' AND auth.uid() = caller_id );

create policy "Users can update their own calls."
  on public.calls for update
  using ( auth.uid() = caller_id or auth.uid() = receiver_id );

-- RPC Function for Vibe Score
create or replace function update_vibe_score(row_id uuid, score_delta int)
returns void
language plpgsql
security definer
as $$
begin
  update public.profiles
  set vibe_score = vibe_score + score_delta
  where id = row_id;
end;
$$;

-- AUTO-DELETE OLD MESSAGES (Requires pg_cron extension)
-- 1. Enable pg_cron extension
create extension if not exists pg_cron;

-- 2. Schedule a job to run every hour
-- This deletes messages older than 24 hours
select cron.schedule(
  'delete-old-messages', -- name of the job
  '0 * * * *',           -- every hour
  $$ delete from public.messages where created_at < now() - interval '24 hours' $$
);
