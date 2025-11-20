-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Universities Table
create table public.universities (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  domain text not null unique,
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Profiles Table (Extends Supabase Auth)
create table public.profiles (
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
  vibe_score integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Posts Table
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text,
  image_url text,
  likes_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.universities enable row level security;
alter table public.profiles enable row level security;
alter table public.posts enable row level security;

-- Policies
-- Universities: Everyone can read, only service role can insert (for now)
create policy "Public universities are viewable by everyone."
  on public.universities for select
  using ( true );

-- Profiles: Public read, Users can update own
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

-- Posts: Public read, Authenticated create
create policy "Public posts are viewable by everyone."
  on public.posts for select
  using ( true );

create policy "Authenticated users can create posts."
  on public.posts for insert
  with check ( auth.role() = 'authenticated' );

-- SEED DATA: Dehradun Universities
insert into public.universities (name, domain, logo_url) values
  ('University of Petroleum and Energy Studies (UPES)', 'upes.ac.in', 'https://www.upes.ac.in/images/logo.png'),
  ('Graphic Era University', 'geu.ac.in', 'https://www.geu.ac.in/content/dam/geu/logos/geu-logo.png'),
  ('Doon University', 'doonuniversity.ac.in', 'https://www.doonuniversity.org/assets/img/logo.png'),
  ('Uttaranchal University', 'uttaranchaluniversity.ac.in', 'https://uttaranchaluniversity.ac.in/wp-content/uploads/2023/11/logo.png'),
  ('Dev Bhoomi Uttarakhand University', 'dbuu.ac.in', 'https://www.dbuu.ac.in/wp-content/uploads/2020/09/DBUU-Logo-min.png'),
  ('Swami Rama Himalayan University', 'srhu.edu.in', 'https://www.srhu.edu.in/wp-content/themes/srhu/images/logo.png'),
  ('IMS Unison University', 'iu.edu.in', 'https://iu.edu.in/assets/images/logo.png'),
  ('Uttarakhand Technical University', 'uktech.ac.in', 'https://uktech.ac.in/Upload/Logo/Header_Logo.png'),
  ('DIT University', 'dituniversity.edu.in', 'https://www.dituniversity.edu.in/images/logo.png'),
  ('Graphic Era Hill University', 'gehu.ac.in', 'https://www.gehu.ac.in/content/dam/gehu/logos/gehu-logo.png');
