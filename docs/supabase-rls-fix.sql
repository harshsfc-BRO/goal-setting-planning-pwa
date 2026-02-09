-- Run this once after docs/database-schema.sql
-- Reason: app creates/updates profile row after signup/login.

drop policy if exists "profiles_self_insert" on public.profiles;
create policy "profiles_self_insert"
on public.profiles for insert
with check (auth.uid() = id);
