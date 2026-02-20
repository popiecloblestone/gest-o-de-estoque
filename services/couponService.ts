import { supabase } from './supabase';
import { Coupon, CouponValidation } from '../types';

/**
 * Fetch all coupons
 */
export async function fetchCoupons(): Promise<{ data: Coupon[] | null; error: any }> {
    try {
        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching coupons:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (err) {
        console.error('Unexpected error in fetchCoupons:', err);
        return { data: null, error: err };
    }
}

/**
 * Create a new coupon
 */
export async function createCoupon(couponData: Omit<Coupon, 'id' | 'created_at' | 'used_count'>): Promise<{ success: boolean; error: any; data?: Coupon }> {
    try {
        const { data, error } = await supabase
            .from('coupons')
            .insert([{ ...couponData, used_count: 0 }])
            .select()
            .single();

        if (error) {
            console.error('Error creating coupon:', error);
            return { success: false, error };
        }

        return { success: true, error: null, data };
    } catch (err) {
        console.error('Unexpected error in createCoupon:', err);
        return { success: false, error: err };
    }
}

/**
 * Update an existing coupon
 */
export async function updateCoupon(id: string, couponData: Partial<Coupon>): Promise<{ success: boolean; error: any }> {
    try {
        const { error } = await supabase
            .from('coupons')
            .update(couponData)
            .eq('id', id);

        if (error) {
            console.error('Error updating coupon:', error);
            return { success: false, error };
        }

        return { success: true, error: null };
    } catch (err) {
        console.error('Unexpected error in updateCoupon:', err);
        return { success: false, error: err };
    }
}

/**
 * Delete a coupon
 */
export async function deleteCoupon(id: string): Promise<{ success: boolean; error: any }> {
    try {
        const { error } = await supabase
            .from('coupons')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting coupon:', error);
            return { success: false, error };
        }

        return { success: true, error: null };
    } catch (err) {
        console.error('Unexpected error in deleteCoupon:', err);
        return { success: false, error: err };
    }
}

/**
 * Validate a coupon code
 */
export async function validateCoupon(code: string): Promise<CouponValidation> {
    try {
        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', code.toUpperCase())
            .single();

        if (error || !data) {
            return { valid: false, message: 'Cupom não encontrado' };
        }

        const coupon = data as Coupon;

        // Check if coupon is active
        if (!coupon.is_active) {
            return { valid: false, message: 'Este cupom está inativo' };
        }

        // Check if coupon is expired
        const expiryDate = new Date(coupon.expiration_date);
        const now = new Date();
        if (expiryDate < now) {
            return { valid: false, message: 'Este cupom expirou' };
        }

        // Check if coupon has uses remaining
        if (coupon.used_count >= coupon.usage_limit_user) {
            return { valid: false, message: 'Este cupom atingiu o limite de usos' };
        }

        return { valid: true, coupon };
    } catch (err) {
        console.error('Unexpected error in validateCoupon:', err);
        return { valid: false, message: 'Erro ao validar cupom' };
    }
}

/**
 * Apply a coupon discount to a cart total
 */
export function applyCouponDiscount(coupon: Coupon, cartTotal: number): number {
    if (coupon.discount_type === 'percentage') {
        return cartTotal * (coupon.discount_value / 100);
    } else {
        // Fixed discount
        return Math.min(coupon.discount_value, cartTotal);
    }
}

/**
 * Increment coupon usage count
 */
export async function incrementCouponUsage(couponId: string): Promise<{ success: boolean; error: any }> {
    try {
        const { data: coupon, error: fetchError } = await supabase
            .from('coupons')
            .select('used_count')
            .eq('id', couponId)
            .single();

        if (fetchError || !coupon) {
            return { success: false, error: fetchError };
        }

        const { error } = await supabase
            .from('coupons')
            .update({ used_count: coupon.used_count + 1 })
            .eq('id', couponId);

        if (error) {
            console.error('Error incrementing coupon usage:', error);
            return { success: false, error };
        }

        return { success: true, error: null };
    } catch (err) {
        console.error('Unexpected error in incrementCouponUsage:', err);
        return { success: false, error: err };
    }
}
