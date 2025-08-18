import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lsdqktvfdzzwtohzaaak.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZHFrdHZmZHp6d3RvaHphYWFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjY5OTQsImV4cCI6MjA3MTEwMjk5NH0.xyna28Sm9repjnbY_cXz2XlRfAEn2qnDUXzwZKwVi4s';

// Validación de variables de entorno
if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL no configurado');
  throw new Error('NEXT_PUBLIC_SUPABASE_URL es requerido');
}

if (!supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY no configurado');
  console.error('🔧 Verifica que esta variable esté configurada en Vercel');
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY es requerido');
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