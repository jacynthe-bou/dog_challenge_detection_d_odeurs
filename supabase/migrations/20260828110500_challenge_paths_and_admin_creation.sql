alter table public.challenges add column if not exists search_mode text not null default 'odor';
alter table public.challenges add column if not exists is_monthly boolean not null default false;
alter table public.challenges add column if not exists monthly_start date;
alter table public.challenges add column if not exists monthly_end date;

update public.challenges set search_mode='odor' where search_mode is null;

alter table public.challenges drop constraint if exists challenges_search_mode_check;
alter table public.challenges add constraint challenges_search_mode_check check (search_mode in ('food','odor'));

alter table public.challenges drop constraint if exists challenges_level_check;
alter table public.challenges add constraint challenges_level_check check (level between 1 and 4);

alter table public.challenges drop constraint if exists challenges_category_check;
alter table public.challenges add constraint challenges_category_check check (category in ('Intérieur','Extérieur','Lieu public'));

alter table public.challenges drop constraint if exists challenges_monthly_dates_check;
alter table public.challenges add constraint challenges_monthly_dates_check check (monthly_end is null or monthly_start is null or monthly_end >= monthly_start);

create index if not exists challenges_path_idx on public.challenges(search_mode, level, category, published, sort_order);
create index if not exists challenges_monthly_idx on public.challenges(is_monthly, monthly_start, monthly_end) where is_monthly=true;
