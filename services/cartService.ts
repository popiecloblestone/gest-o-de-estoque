import { supabase } from './supabase';
import { AdminCartItem } from '../types';

/**
 * Fetch all cart items across all users (Admin only)
 */
export async function fetchAllCarts(): Promise<{ data: AdminCartItem[] | null; error: any }> {
    try {
        const { data: carts, error } = await supabase
            .from('cart')
            .select(`
                *,
                profiles:user_id (
                  full_name,
                  email,
                  phone
                ),
                product:product_id (
                  *
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching carts:', error);
            return { data: null, error };
        }

        // Map profiles and products data
        const formattedCarts = carts?.map((cart: any) => ({
            ...cart,
            customer: cart.profiles ? {
                name: cart.profiles.full_name || 'Nome não disponível',
                email: cart.profiles.email || '',
                phone: cart.profiles.phone || ''
            } : undefined,
            product: cart.product,
            profiles: undefined
        })) || [];

        return { data: formattedCarts, error: null };
    } catch (err) {
        console.error('Unexpected error in fetchAllCarts:', err);
        return { data: null, error: err };
    }
}
