
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseKey;

// Create a dummy client if config is missing to prevent immediate crash,
// but the app should check isSupabaseConfigured and show an error screen.
export const supabase = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseKey)
    : createClient('https://placeholder.supabase.co', 'placeholder');
