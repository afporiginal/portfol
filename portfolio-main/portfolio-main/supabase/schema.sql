create table if not exists public.site_content (
  key text primary key check (key in (
    'heroTitleLead',
    'heroTitleHighlight',
    'heroDescription',
    'projectsTitle',
    'projectsDescription',
    'aboutSectionTitle',
    'aboutTitleLead',
    'aboutTitleHighlight',
    'aboutParagraphOne',
    'aboutParagraphTwo'
  )),
  value text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.hidden_projects (
  repo_id bigint primary key,
  repo_name text not null,
  hidden_at timestamptz not null default now()
);

alter table public.site_content enable row level security;
alter table public.hidden_projects enable row level security;

grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;
grant select on public.hidden_projects to anon, authenticated;
grant insert, update, delete on public.hidden_projects to authenticated;

drop policy if exists "Public can read site content" on public.site_content;
create policy "Public can read site content"
  on public.site_content for select to anon, authenticated
  using (true);

drop policy if exists "Admin can manage site content" on public.site_content;
create policy "Admin can manage site content"
  on public.site_content for all to authenticated
  using ((auth.jwt() ->> 'email') = 'arthurluz.principal@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'arthurluz.principal@gmail.com');

drop policy if exists "Public can read hidden project ids" on public.hidden_projects;
create policy "Public can read hidden project ids"
  on public.hidden_projects for select to anon, authenticated
  using (true);

drop policy if exists "Admin can manage hidden projects" on public.hidden_projects;
create policy "Admin can manage hidden projects"
  on public.hidden_projects for all to authenticated
  using ((auth.jwt() ->> 'email') = 'arthurluz.principal@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'arthurluz.principal@gmail.com');