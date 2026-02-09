-- Goal Setting & Planning PWA
-- Initial Postgres schema (designed for Supabase)

-- Extensions
create extension if not exists "pgcrypto";

-- Profiles (mapped to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'user' check (role in ('user', 'coach_admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Yearly goals
create table if not exists public.yearly_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  category text,
  year int not null,
  smart_statement text not null,
  benefits_text text,
  obstacles_text text,
  solutions_text text,
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'archived')),
  progress_percent int not null default 0 check (progress_percent between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_yearly_goals_user_year on public.yearly_goals(user_id, year);

-- Milestones for yearly goals
create table if not exists public.goal_milestones (
  id uuid primary key default gen_random_uuid(),
  yearly_goal_id uuid not null references public.yearly_goals(id) on delete cascade,
  title text not null,
  target_date date,
  is_completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_goal_milestones_goal on public.goal_milestones(yearly_goal_id);

-- Monthly goals
create table if not exists public.monthly_goals (
  id uuid primary key default gen_random_uuid(),
  yearly_goal_id uuid not null references public.yearly_goals(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  month_date date not null, -- first day of month (e.g., 2026-02-01)
  title text not null,
  objective_text text,
  success_metric text,
  review_notes text,
  status text not null default 'planned' check (status in ('planned', 'active', 'completed', 'carried_forward')),
  progress_percent int not null default 0 check (progress_percent between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (yearly_goal_id, month_date)
);

create index if not exists idx_monthly_goals_user_month on public.monthly_goals(user_id, month_date);

-- Weekly goals
create table if not exists public.weekly_goals (
  id uuid primary key default gen_random_uuid(),
  monthly_goal_id uuid not null references public.monthly_goals(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_start_date date not null,
  title text not null,
  objective_text text,
  obstacle_plan text,
  status text not null default 'planned' check (status in ('planned', 'active', 'completed', 'missed')),
  progress_percent int not null default 0 check (progress_percent between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_weekly_goals_user_week on public.weekly_goals(user_id, week_start_date);

-- Baby steps (tasks)
create table if not exists public.baby_steps (
  id uuid primary key default gen_random_uuid(),
  weekly_goal_id uuid not null references public.weekly_goals(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  notes text,
  due_date date,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_baby_steps_weekly_goal on public.baby_steps(weekly_goal_id);
create index if not exists idx_baby_steps_user_status on public.baby_steps(user_id, status);

-- Wheel of Life snapshots
create table if not exists public.wheel_of_life_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  entry_date date not null default current_date,
  health_score int not null check (health_score between 1 and 10),
  career_score int not null check (career_score between 1 and 10),
  finance_score int not null check (finance_score between 1 and 10),
  relationships_score int not null check (relationships_score between 1 and 10),
  growth_score int not null check (growth_score between 1 and 10),
  fun_score int not null check (fun_score between 1 and 10),
  contribution_score int not null check (contribution_score between 1 and 10),
  spirituality_score int not null check (spirituality_score between 1 and 10),
  reflection_notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_wheel_entries_user_date on public.wheel_of_life_entries(user_id, entry_date desc);

-- Coach comments
create table if not exists public.coach_comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  coach_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('yearly_goal', 'monthly_goal', 'weekly_goal')),
  target_id uuid not null,
  comment_text text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_coach_comments_target on public.coach_comments(target_type, target_id);

-- Updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_yearly_goals_updated_at on public.yearly_goals;
create trigger trg_yearly_goals_updated_at
before update on public.yearly_goals
for each row execute function public.set_updated_at();

drop trigger if exists trg_monthly_goals_updated_at on public.monthly_goals;
create trigger trg_monthly_goals_updated_at
before update on public.monthly_goals
for each row execute function public.set_updated_at();

drop trigger if exists trg_weekly_goals_updated_at on public.weekly_goals;
create trigger trg_weekly_goals_updated_at
before update on public.weekly_goals
for each row execute function public.set_updated_at();

drop trigger if exists trg_baby_steps_updated_at on public.baby_steps;
create trigger trg_baby_steps_updated_at
before update on public.baby_steps
for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.yearly_goals enable row level security;
alter table public.goal_milestones enable row level security;
alter table public.monthly_goals enable row level security;
alter table public.weekly_goals enable row level security;
alter table public.baby_steps enable row level security;
alter table public.wheel_of_life_entries enable row level security;
alter table public.coach_comments enable row level security;

-- Basic owner policies
drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update"
on public.profiles for update
using (auth.uid() = id);

drop policy if exists "yearly_goals_owner_all" on public.yearly_goals;
create policy "yearly_goals_owner_all"
on public.yearly_goals for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "goal_milestones_owner_all" on public.goal_milestones;
create policy "goal_milestones_owner_all"
on public.goal_milestones for all
using (
  exists (
    select 1 from public.yearly_goals yg
    where yg.id = goal_milestones.yearly_goal_id
      and yg.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.yearly_goals yg
    where yg.id = goal_milestones.yearly_goal_id
      and yg.user_id = auth.uid()
  )
);

drop policy if exists "monthly_goals_owner_all" on public.monthly_goals;
create policy "monthly_goals_owner_all"
on public.monthly_goals for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "weekly_goals_owner_all" on public.weekly_goals;
create policy "weekly_goals_owner_all"
on public.weekly_goals for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "baby_steps_owner_all" on public.baby_steps;
create policy "baby_steps_owner_all"
on public.baby_steps for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "wheel_entries_owner_all" on public.wheel_of_life_entries;
create policy "wheel_entries_owner_all"
on public.wheel_of_life_entries for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Coach can comment if marked coach_admin
drop policy if exists "coach_comments_read_user_or_coach" on public.coach_comments;
create policy "coach_comments_read_user_or_coach"
on public.coach_comments for select
using (auth.uid() = user_id or auth.uid() = coach_id);

drop policy if exists "coach_comments_insert_coach" on public.coach_comments;
create policy "coach_comments_insert_coach"
on public.coach_comments for insert
with check (
  auth.uid() = coach_id
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'coach_admin'
  )
);
