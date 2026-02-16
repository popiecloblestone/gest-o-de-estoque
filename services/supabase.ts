
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL or Key not found in environment variables. Please check your .env.local or Vercel settings.');
}

// Ensure URL has protocol
const validUrl = supabaseUrl.startsWith('http') ? supabaseUrl : `https://${supabaseUrl}`;

console.log(`Supabase URL: ${validUrl}`); // Debug: Check if URL is correct in production

export const supabase = createClient(validUrl, supabaseKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});
