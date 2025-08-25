import { createClient } from '@supabase/supabase-js';
import config from '../config/environment';

if (!config.supabase.url) {
  throw new Error('SUPABASE_URL es requerido');
}

if (!config.supabase.anonKey) {
  throw new Error('SUPABASE_ANON_KEY es requerido');
}

// Cliente normal para operaciones regulares
export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

// Cliente admin para operaciones administrativas
export const supabaseAdmin = config.supabase.serviceKey 
  ? createClient(
      config.supabase.url,
      config.supabase.serviceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null;

export default supabase; 