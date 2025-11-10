import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Validación de variables de entorno
if (!supabaseUrl) {
  console.error('❌ SUPABASE_URL no configur hshshsado');
  throw new Error('SUPABASE_URL es requerido');
}

if (!supabaseAnonKey) {
  console.error('❌ SUPABASE_ANON_KEY test no configurado');
  console.error('🔧 Verifica que esta variable esté configurada en Vercel test test');
  throw new Error('SUPABASE_ANON_KEY es requerido');
}

// Log para debugging (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
}

// Log para debugging en producción (solo para diagnosticar)
if (process.env.NODE_ENV === 'production') {
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Activar persistencia de sesión
    autoRefreshToken: true, // Auto-refresh del token
    detectSessionInUrl: true, // Detectar sesión en URL para auth callbacks
  },
}); 