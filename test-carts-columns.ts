import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://olqbvraizyneplodvncb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scWJ2cmFpenluZXBsb2R2bmNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTk1NzksImV4cCI6MjA4Mzg5NTU3OX0.RqzF8o4taXg3QFqbpNIY3vtMe30uIhc_o9kRuqKZkYY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    console.log('Testing fetchAllAdminCarts query format...');
    const { data: carts, error } = await supabase
        .from('cart')
        .select(`
        *,
        product:product_id ( * ),
        profiles:user_id ( full_name )
      `)
        .order('created_at', { ascending: false });
        
    if (error) {
        console.error('ERROR fetching carts:', JSON.stringify(error, null, 2));
    } else {
        console.log(`SUCCESS. Sample:`, JSON.stringify(carts?.slice(0, 1), null, 2));
    }
}

checkColumns();
