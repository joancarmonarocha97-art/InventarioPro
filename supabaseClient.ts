/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Leemos las variables de entorno (Vercel las inyectará automáticamente)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltan las variables de entorno de Supabase. Asegúrate de configurarlas en el archivo .env.local y en Vercel.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');