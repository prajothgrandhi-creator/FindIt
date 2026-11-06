begin;

create table if not exists public.universities (
  id uuid primary key,
  name text not null check (length(btrim(name)) between 1 and 160),
  slug text not null unique check (slug = lower(slug) and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.universities (id, name, slug, is_active)
values ('7b1e4f5a-2c10-4e71-a85a-f87d4410c206', 'PES University', 'pes-university', true)
on conflict (id) do nothing;

create table if not exists public.student_roster (
  university_id uuid not null references public.universities(id) on delete restrict,
  normalized_srn text not null check (normalized_srn = upper(btrim(normalized_srn))),
  auth_email text not null unique check (auth_email = lower(btrim(auth_email)) and position('@' in auth_email) > 1),
  is_active boolean not null default true,
  imported_at timestamptz not null default now(),
  primary key (university_id, normalized_srn),
  constraint student_roster_srn_format check (normalized_srn ~ '^PES[0-9]UG[0-9]{2}[A-Z]{2,3}[0-9]{3}$')
);

comment on table public.student_roster is
  'Private, authorized campus roster import. Do not insert fictional or unapproved student records.';
comment on column public.student_roster.auth_email is
  'Private Auth destination from the authorized roster; never expose through a public query or API response.';

create table if not exists public.student_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  university_id uuid not null,
  normalized_srn text not null check (normalized_srn = upper(btrim(normalized_srn))),
  display_name text not null check (display_name = btrim(display_name) and length(display_name) between 1 and 100),
  verification_status text not null default 'pending' check (verification_status in ('pending', 'verified', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (university_id, normalized_srn),
  constraint student_profiles_roster_fk foreign key (university_id, normalized_srn)
    references public.student_roster(university_id, normalized_srn) on delete restrict
);

create index if not exists student_profiles_university_status_idx
  on public.student_profiles (university_id, verification_status);

create or replace function public.set_student_profile_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_student_profile_updated_at() from public, anon, authenticated;
grant execute on function public.set_student_profile_updated_at() to service_role;

drop trigger if exists student_profiles_set_updated_at on public.student_profiles;
create trigger student_profiles_set_updated_at
  before update on public.student_profiles
  for each row execute function public.set_student_profile_updated_at();

alter table public.universities enable row level security;
alter table public.student_roster enable row level security;
alter table public.student_profiles enable row level security;

revoke all on public.universities from public;
revoke all on public.student_roster from public, anon, authenticated;
revoke all on public.student_profiles from public, anon, authenticated;

grant select on public.universities to anon, authenticated;
grant select on public.student_profiles to authenticated;
grant select on public.universities to service_role;
grant select on public.student_roster to service_role;
grant select, insert on public.student_profiles to service_role;

drop policy if exists universities_active_read on public.universities;
create policy universities_active_read
  on public.universities for select to anon, authenticated
  using (is_active = true);

drop policy if exists student_profiles_read_own on public.student_profiles;
create policy student_profiles_read_own
  on public.student_profiles for select to authenticated
  using (id = (select auth.uid()));

commit;
