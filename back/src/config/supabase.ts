import { createClient } from '@supabase/supabase-js';
import config from './environment';

if (!config.supabase.url) {
  throw new Error('SUPABASE_URL es requerido');
}

if (!config.supabase.anonKey) {
  throw new Error('SUPABASE_ANON_KEY es requerido');
}

// Cliente normal para operaciones regulares
const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

// Cliente admin para operaciones administrativas (como invitaciones)
let supabaseAdmin: ReturnType<typeof createClient> | null = null;

if (config.supabase.serviceKey) {
  supabaseAdmin = createClient(
    config.supabase.url,
    config.supabase.serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

export default supabase;
export { supabaseAdmin }; 