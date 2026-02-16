
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://olqbvraizyneplodvncb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scWJ2cmFpenluZXBsb2R2bmNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTk1NzksImV4cCI6MjA4Mzg5NTU3OX0.RqzF8o4taXg3QFqbpNIY3vtMe30uIhc_o9kRuqKZkYY';

const supabase = createClient(supabaseUrl, supabaseKey);
const logFile = 'debug_log_v2.txt';

function log(msg: string, ...args: any[]) {
    const text = msg + ' ' + args.map(a => JSON.stringify(a)).join(' ') + '\n';
    console.log(msg, ...args);
    fs.appendFileSync(logFile, text);
}

fs.writeFileSync(logFile, 'Starting Advanced DB Debug...\n');

async function testConnection() {
    log('Testing connection...');

    // 1. Fetch product
    const { data: products } = await supabase.from('products').select('*').limit(1);
    if (!products || products.length === 0) {
        log('No products found.');
        return;
    }
    const testProduct = products[0];
    log('Testing on Product ID:', testProduct.id);

    // 2. Test Material (String) - Already verified but good to keep
    const updates: any = {
        material: 'Debug Material ' + Date.now(),
        technologies: ['DebugTech1', 'DebugTech2'], // Array
        weight: '500g', // String
        free_shipping: true, // Boolean
        is_promotion: true, // Boolean
        description: 'Debug Description ' + Date.now()
    };

    log('Attempting to update multiple fields:', updates);

    const { error: updateError } = await supabase
        .from('products')
        .update(updates)
        .eq('id', testProduct.id);

    if (updateError) {
        log('Update FAILED:', updateError);
    } else {
        log('Update SUCCESS. Verifying values...');

        // Fetch back
        const { data: updated, error: fetchError } = await supabase
            .from('products')
            .select('*')
            .eq('id', testProduct.id)
            .single();

        if (fetchError) {
            log('Error reading back:', fetchError);
            return;
        }

        log('Read back values:');
        log('material:', updated.material);
        log('technologies:', updated.technologies, 'Is Array?', Array.isArray(updated.technologies));
        log('weight:', updated.weight);
        log('free_shipping:', updated.free_shipping);
        log('is_promotion:', updated.is_promotion);
        log('description:', updated.description);

        // Validation
        const techMatch = Array.isArray(updated.technologies) && updated.technologies.includes('DebugTech1');
        const boolMatch = updated.free_shipping === true;

        if (techMatch && boolMatch) {
            log('CRITICAL: All types accepted and persisted correctly.');

            // Revert!
            log('Reverting changes...');
            await supabase.from('products').update({
                material: testProduct.material,
                technologies: testProduct.technologies,
                weight: testProduct.weight,
                free_shipping: testProduct.free_shipping,
                is_promotion: testProduct.is_promotion,
                description: testProduct.description
            }).eq('id', testProduct.id);
            log('Reverted.');
        } else {
            log('CRITICAL: Write appeared successful but data mismatch!');
        }
    }
}

testConnection().catch(err => log('CRASH:', err));
