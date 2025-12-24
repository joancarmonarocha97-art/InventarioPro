import { createClient } from '@supabase/supabase-js';

// Intentamos obtener las claves de las variables de entorno
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

// Verificamos si la configuración es válida
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Valores placeholder para evitar que 'createClient' falle durante la construcción si las variables no están presentes
const fallbackUrl = 'https://placeholder-project.supabase.co';
const fallbackKey = 'placeholder-key';

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : fallbackUrl,
  isSupabaseConfigured ? supabaseAnonKey : fallbackKey
);
