-- Migration corrective pour la base Supabase existante de Sniff and Fun Challenge.
-- Elle ne crée, ne supprime et ne modifie aucune donnée métier.

-- Le trigger constitue une protection en profondeur : même si la politique
-- "users update own profile" autorise l'UPDATE de la ligne, une requête cliente
-- ne peut jamais modifier la colonne sensible role.
create or replace function public.prevent_client_role_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.role is distinct from new.role and (select auth.uid()) is not null then
    raise exception 'profiles.role ne peut pas être modifié depuis une session cliente'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke all on function public.prevent_client_role_change() from public, anon, authenticated;

drop trigger if exists protect_profiles_role_from_clients on public.profiles;
create trigger protect_profiles_role_from_clients
  before update of role on public.profiles
  for each row
  execute function public.prevent_client_role_change();

-- Sort is_admin de l'API RPC publique sans casser les politiques existantes.
-- PostgreSQL conserve l'OID de la fonction lors du changement de schéma : les
-- expressions RLS existantes continuent donc de référencer la même fonction.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

do $$
begin
  if to_regprocedure('private.is_admin()') is null
     and to_regprocedure('public.is_admin()') is not null then
    alter function public.is_admin() set schema private;
  elsif to_regprocedure('private.is_admin()') is not null
        and to_regprocedure('public.is_admin()') is not null then
    raise exception 'is_admin() existe dans public et private; migration ambiguë interrompue';
  elsif to_regprocedure('private.is_admin()') is null then
    raise exception 'public.is_admin() est absente; migration interrompue';
  end if;
end;
$$;

-- Remplace uniquement le corps de la fonction déplacée, en conservant son OID
-- et donc toutes les dépendances RLS existantes.
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;

-- Le schéma private n'est pas exposé par l'API configurée : les rôles peuvent
-- exécuter la fonction depuis les politiques RLS, mais pas via /rest/v1/rpc.

-- Vérifie les garanties déjà auditées sans recréer ni renommer les politiques.
-- En cas de dérive du schéma distant, la transaction entière est interrompue.
do $$
declare
  table_name text;
  operation text;
begin
  foreach table_name in array array['challenges', 'handler_skills', 'site_settings'] loop
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = table_name
        and cmd in ('ALL', 'INSERT', 'UPDATE', 'DELETE')
        and (coalesce(qual, '') ilike '%is_admin%'
          or coalesce(with_check, '') ilike '%is_admin%')
    ) then
      raise exception 'Politique admin absente ou inattendue sur public.%', table_name;
    end if;
  end loop;

  foreach table_name in array array['challenges', 'handler_skills'] loop
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = table_name
        and cmd = 'SELECT'
        and (roles @> array['anon']::name[] or roles @> array['public']::name[])
        and coalesce(qual, '') ilike '%published%'
    ) then
      raise exception 'Politique de lecture publique des contenus publiés absente sur public.%', table_name;
    end if;
  end loop;

  foreach operation in array array['INSERT', 'UPDATE', 'DELETE'] loop
    if not exists (
      select 1 from pg_policies
      where schemaname = 'storage'
        and tablename = 'objects'
        and cmd in ('ALL', operation)
        and (coalesce(qual, '') ilike '%app-media%'
          or coalesce(with_check, '') ilike '%app-media%')
        and (coalesce(qual, '') ilike '%is_admin%'
          or coalesce(with_check, '') ilike '%is_admin%')
    ) then
      raise exception 'Politique admin % absente ou inattendue sur app-media', operation;
    end if;
  end loop;
end;
$$;

-- Renforce le bucket existant sans toucher aux objets déjà téléversés ni aux
-- politiques Storage existantes (lecture publique et écritures admin).
update storage.buckets
set public = true,
    file_size_limit = 5242880,
    allowed_mime_types = array[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif'
    ]::text[]
where id = 'app-media';

-- Échoue explicitement plutôt que de créer silencieusement un autre bucket si
-- l'état distant ne correspond plus à l'état audité.
do $$
begin
  if not exists (select 1 from storage.buckets where id = 'app-media') then
    raise exception 'Le bucket app-media est absent; migration interrompue';
  end if;
end;
$$;
