-- Publish status for walls: a wall is built privately as a 'draft' and only
-- served publicly (hosted wall page + embed) once 'published'.
alter table public.walls
  add column if not exists status text not null default 'draft'
  check (status in ('draft','published'));

-- Existing walls predate this column; keep them publicly visible.
update public.walls set status = 'published' where status = 'draft';
