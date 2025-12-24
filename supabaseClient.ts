import { createClient } from '@supabase/supabase-js';

// Intentamos obtener las claves de las variables de entorno de Vite
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

// Verificamos si la configuración es válida para su uso en la App
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Valores de respaldo para evitar que 'createClient' lance un error fatal durante el build de Vercel
const fallbackUrl = 'https://placeholder-project.supabase.co';
const fallbackKey = 'placeholder-key';

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : fallbackUrl,
  isSupabaseConfigured ? supabaseAnonKey : fallbackKey
);
