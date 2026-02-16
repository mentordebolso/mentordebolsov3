import { createClient } from '@supabase/supabase-js';
import { mustGetEnv } from './env';

export function supabaseAdmin() {
  // Server-only client.
  const url = mustGetEnv('SUPABASE_URL');
  const key = mustGetEnv('SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}
