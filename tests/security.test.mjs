import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const migrationPath = "supabase/migrations/20260827215447_harden_existing_security.sql";

test("le client ne contient aucun secret ni fallback Supabase", async () => {
  const source = await read("lib/supabase.ts");
  assert.doesNotMatch(source, /sb_secret_|service_role|https:\/\/[a-z]+\.supabase\.co|sb_publishable_[A-Za-z0-9_-]{10,}/);
  assert.match(source, /NEXT_PUBLIC_SUPABASE_URL/);
  assert.match(source, /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
});

test("un client ne peut pas changer profiles.role", async () => {
  const sql = await read(migrationPath);
  assert.match(sql, /before update of role on public\.profiles/i);
  assert.match(sql, /old\.role is distinct from new\.role/i);
  assert.match(sql, /auth\.uid\(\).*is not null/is);
  assert.match(sql, /errcode = '42501'/i);
});

test("is_admin reste utilisable par les RLS sans RPC dans public", async () => {
  const sql = await read(migrationPath);
  assert.match(sql, /alter function public\.is_admin\(\) set schema private/i);
  assert.match(sql, /security definer/i);
  assert.match(sql, /grant execute on function private\.is_admin\(\) to anon, authenticated/i);
  assert.doesNotMatch(sql, /grant execute on function public\.is_admin/i);
});

test("app-media conserve la lecture publique et limite les nouveaux uploads", async () => {
  const sql = await read(migrationPath);
  assert.match(sql, /update storage\.buckets[\s\S]*where id = 'app-media'/i);
  assert.match(sql, /public = true/i);
  assert.match(sql, /file_size_limit = 5242880/i);
  for (const mime of ["image/jpeg", "image/png", "image/webp", "image/gif"]) assert.match(sql, new RegExp(`'${mime}'`));
});

test("un utilisateur normal ne peut pas uploader mais un admin le peut", async () => {
  const sql = await read(migrationPath);
  assert.match(sql, /foreach operation in array array\['INSERT', 'UPDATE', 'DELETE'\]/i);
  assert.match(sql, /schemaname = 'storage'[\s\S]*tablename = 'objects'/i);
  assert.match(sql, /ilike '%app-media%'/i);
  assert.match(sql, /ilike '%is_admin%'/i);
});

test("la migration conserve les politiques admin et les données métier", async () => {
  const sql = await read(migrationPath);
  assert.doesNotMatch(sql, /(?:create|drop|truncate)\s+table/i);
  assert.doesNotMatch(sql, /drop\s+policy|create\s+policy/i);
  assert.doesNotMatch(sql, /(?:update|delete\s+from)\s+public\.(?:challenges|handler_skills|site_settings|dogs|challenge_progress)/i);
});

test("les règles de visibilité des contenus restent intactes", async () => {
  const sql = await read(migrationPath);
  assert.match(sql, /roles @> array\['anon'\]/i);
  assert.match(sql, /coalesce\(qual, ''\) ilike '%published%'/i);
  assert.doesNotMatch(sql, /drop\s+policy|create\s+policy/i);
});

test("l’interface admin ne propose pas l’inscription cliente", async () => {
  const source = await read("app/admin/page.tsx");
  assert.doesNotMatch(source, /auth\.signUp|Créer mon compte administrateur/);
  assert.match(source, /signInWithPassword/);
});

test("une réponse Supabase vide remplace le fallback local", async () => {
  const source = await read("app/DynamicPage.tsx");
  assert.match(source, /!challengeError && challengeRows\)/);
  assert.doesNotMatch(source, /challengeRows\?\.length/);
});
