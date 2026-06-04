-- Team notes/internal notes for projects
-- Allows team members to add notes visible to team, all employees, or specific visibility levels

create table if not exists public.project_team_notes (
  id bigserial primary key,
  project_id bigint not null,
  author text not null,
  content text not null,
  visibility text not null check (visibility in ('team', 'all-employees', 'managers', 'admin')),
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_project_team_notes_project_id on public.project_team_notes(project_id);
create index if not exists idx_project_team_notes_created_at on public.project_team_notes(created_at desc);
create index if not exists idx_project_team_notes_visibility on public.project_team_notes(visibility);

create or replace function public.set_team_notes_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_project_team_notes_set_updated_at on public.project_team_notes;
create trigger trg_project_team_notes_set_updated_at
before update on public.project_team_notes
for each row
execute function public.set_team_notes_updated_at();
