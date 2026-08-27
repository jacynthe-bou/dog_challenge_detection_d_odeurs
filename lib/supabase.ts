import { createClient } from "@supabase/supabase-js";

// Les valeurs publiques servent de repli pour les previews Vercel.
// La publishable key Supabase est conçue pour être exposée côté client;
// la sécurité des données reste assurée par les politiques RLS.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://eyihplxpjogwxcyskrmo.supabase.co";
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_ogU-0NAh5UfMKcS7h0dWZA_Qn-FeIjE";

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
