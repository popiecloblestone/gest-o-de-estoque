import { supabase } from './supabase';
import { Order } from '../types';

/**
 * Fetch all orders with customer information
 */
export async function fetchOrders(): Promise<{ data: Order[] | null; error: any }> {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
        *,
        profiles:user_id (
          full_name,
          email,
          phone
        ),
        items:order_items (
          *
        )
      `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            return { data: null, error };
        }

        // Map profiles data to customer field
        const ordersWithCustomer = orders?.map((order: any) => ({
            ...order,
            customer: order.profiles ? {
                name: order.profiles.full_name || 'Nome não disponível',
                email: order.profiles.email || '',
                phone: order.profiles.phone || ''
            } : undefined,
            profiles: undefined // Remove profiles from final object
        })) || [];

        return { data: ordersWithCustomer, error: null };
    } catch (err) {
        console.error('Unexpected error in fetchOrders:', err);
        return { data: null, error: err };
    }
}

/**
 * Update tracking code for an order
 */
export async function updateTrackingCode(
    orderId: number,
    trackingCode: string
): Promise<{ success: boolean; error: any }> {
    try {
        const { error } = await supabase
            .from('orders')
            .update({ tracking_code: trackingCode })
            .eq('id', orderId);

        if (error) {
            console.error('Error updating tracking code:', error);
            return { success: false, error };
        }

        return { success: true, error: null };
    } catch (err) {
        console.error('Unexpected error in updateTrackingCode:', err);
        return { success: false, error: err };
    }
}
