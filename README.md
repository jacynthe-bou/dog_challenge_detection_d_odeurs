# Sniff and Fun Challenge

## Configuration locale et Vercel

Copiez `.env.example` vers `.env.local`, puis renseignez l’URL et la clé
**publiable** du projet Supabase. Configurez les mêmes variables dans chacun des
environnements Vercel utilisés (Development, Preview et Production), puis
redéployez : les variables `NEXT_PUBLIC_*` sont intégrées au bundle au build.

Ne placez jamais une clé `service_role`, `sb_secret_` ou un autre secret dans
Git, dans le navigateur ou dans une variable `NEXT_PUBLIC_*`.

## Base Supabase

La migration `supabase/migrations/20260827215447_harden_existing_security.sql`
renforce progressivement la base existante sans recréer ses tables ni modifier
les données métier. Sur une base existante, comparez impérativement le schéma
distant avant application :

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db diff --linked
supabase migration up --linked --dry-run
```

N’appliquez pas la migration si le diff révèle une conversion ou une suppression
de données. Faites d’abord une sauvegarde et validez manuellement le plan.

## Bootstrap sécurisé du premier administrateur

L’application n’offre volontairement aucune inscription ni promotion de rôle
depuis le navigateur. Pour créer le premier administrateur :

1. désactivez les inscriptions publiques dans Supabase Auth si elles ne servent
   pas ailleurs;
2. créez l’utilisateur dans **Authentication > Users** du tableau de bord;
3. vérifiez que le trigger existant a créé son profil avec le rôle `user`;
4. dans le SQL Editor Supabase, connecté comme propriétaire, exécutez le bloc
   suivant en remplaçant l’adresse exacte :

```sql
do $$
declare
  target_id uuid;
begin
  select id into strict target_id
  from auth.users
  where lower(email) = lower('ADMIN_EMAIL_TO_REPLACE');

  if exists (select 1 from public.profiles where role = 'admin') then
    raise exception 'Un administrateur existe déjà; bootstrap refusé.';
  end if;

  update public.profiles set role = 'admin' where id = target_id;
end $$;
```

Le `into strict` refuse zéro ou plusieurs correspondances et la garde refuse de
remplacer un administrateur existant. Les sessions clientes ne peuvent pas
modifier `profiles.role`, y compris celles d’un administrateur.

## Vérifications

```bash
npm run typecheck
npm run lint
npm test
npm run build
```
