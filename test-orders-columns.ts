import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://olqbvraizyneplodvncb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scWJ2cmFpenluZXBsb2R2bmNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTk1NzksImV4cCI6MjA4Mzg5NTU3OX0.RqzF8o4taXg3QFqbpNIY3vtMe30uIhc_o9kRuqKZkYY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    const { data, error } = await supabase.from('orders').select('*').limit(1);
    if (error) {
        console.error('Error fetching orders:', error);
    } else if (data && data.length > 0) {
        console.log('Columns in orders:', Object.keys(data[0]));
        console.log('Sample order:', JSON.stringify(data[0], null, 2));
    } else {
        console.log('Orders table is empty, cannot infer columns from a select *.');
    }
}

checkColumns();
