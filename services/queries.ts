import { supabase } from './supabase'

// ─── Orders ──────────────────────────────────────────────────────────────────

/**
 * Fetches all orders with their items (admin only — protected by RLS).
 * Note: customer identity comes from address_snapshot, not a join,
 * because orders in this project store the snapshot at purchase time.
 */
export async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      status,
      total_amount,
      payment_method,
      shipping_method,
      shipping_cost,
      created_at,
      address_snapshot,
      order_items (
        id,
        name,
        quantity,
        price_at_purchase,
        selected_size,
        selected_color
      )
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// ─── Analytics — Site Visits ──────────────────────────────────────────────────

/**
 * Returns raw site_visits rows for the last 30 days.
 * Useful for building unique-visitor and page-view charts.
 */
export async function getSiteVisitsStats() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('site_visits')
    .select('created_at, session_id')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// ─── Analytics — Top Products ─────────────────────────────────────────────────

/**
 * Returns raw product_views rows.
 * Aggregate client-side or use the analyticsService.getMostViewedProducts()
 * RPC for pre-aggregated results.
 */
export async function getTopProducts() {
  const { data, error } = await supabase
    .from('product_views')
    .select('product_id, created_at')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// ─── Analytics — Revenue by Status ───────────────────────────────────────────

/**
 * Returns a Record mapping each order status → total revenue (R$).
 * Example: { "paid": 1530.00, "pending": 250.00, "shipped": 800.00 }
 */
export async function getRevenueByStatus(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('orders')
    .select('status, total_amount')
  if (error) throw error

  return (data ?? []).reduce<Record<string, number>>((acc, order) => {
    acc[order.status] = (acc[order.status] ?? 0) + (order.total_amount ?? 0)
    return acc
  }, {})
}
