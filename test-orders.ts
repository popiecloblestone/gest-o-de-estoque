import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://olqbvraizyneplodvncb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scWJ2cmFpenluZXBsb2R2bmNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTk1NzksImV4cCI6MjA4Mzg5NTU3OX0.RqzF8o4taXg3QFqbpNIY3vtMe30uIhc_o9kRuqKZkYY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetchOrders() {
    console.log('Testing fetchOrders...');
    
    // Step 1: try the exact query the frontend runs
    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            id,
            total_amount,
            status,
            profiles:user_id ( full_name ),
            items:order_items ( * )
        `)
        .order('created_at', { ascending: false });
        
    if (error) {
        console.error('ERROR fetching orders:', JSON.stringify(error, null, 2));
    } else {
        console.log(`SUCCESS fetching orders. Found ${orders?.length} orders.`);
        console.log('First order sample:', JSON.stringify(orders?.[0], null, 2));
    }
}

testFetchOrders().catch(err => console.error('CRASH:', err));
