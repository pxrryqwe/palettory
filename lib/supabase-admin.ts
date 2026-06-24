import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdminConfigured = Boolean(url && serviceKey);

export const supabaseAdmin: SupabaseClient | null = supabaseAdminConfigured
  ? createClient(url!, serviceKey!, { auth: { persistSession: false } })
  : null;
