
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Validate if the URL is actually a valid URL string
const isValidUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

export const isSupabaseConfigured = isValidUrl(supabaseUrl) && !!supabaseKey;

// Create a dummy client if config is missing OR invalid to prevent immediate crash.
// The app will check isSupabaseConfigured and show the error screen.
export const supabase = isSupabaseConfigured
    ? createClient(supabaseUrl!, supabaseKey!)
    : createClient('https://placeholder.supabase.co', 'placeholder');
