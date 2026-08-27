import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://invalid.supabase.co";
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "invalid-publishable-key";

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
