import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

const SESSION_KEY = 'site_session_id';

class AnalyticsService {
  /**
   * Generates or retrieves a unique session ID for the current visitor.
   * This allows us to track unique visits securely without requiring login.
   */
  public getSessionId(): string {
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = uuidv4();
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  }

  /**
   * Records a site visit when the session starts.
   */
  async recordVisit(pagePath: string = window.location.pathname) {
    try {
      const sessionId = this.getSessionId();

      // We only insert once per session. 
      // If the user refreshes, we might already have a record for this session, 
      // but let's just insert and keep it simple for now, or use an upsert if we 
      // added a unique constraint on session_id (which we didn't).
      // For a more robust approach, we check if we already tracked this session in memory:
      if (sessionStorage.getItem(`${SESSION_KEY}_tracked`)) {
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const userEmail = session?.user?.email || null;

      await supabase.from('site_visits').insert([{
        session_id: sessionId,
        page_path: pagePath,
        user_email: userEmail,
        duration_seconds: 0
      }]);

      sessionStorage.setItem(`${SESSION_KEY}_tracked`, 'true');
    } catch (error) {
      console.error('Error recording site visit:', error);
    }
  }

  /**
   * Updates the duration of the current session.
   * Called periodically or before the window unloads.
   */
  async updateSessionDuration(durationSeconds: number) {
    try {
      const sessionId = this.getSessionId();
      
      // Update by session_id. 
      // Note: If multiple rows exist for the same session (e.g. they opened multiple tabs without the _tracked check working perfectly),
      // this updates all of them, which is acceptable for a simple tracking system.
      await supabase
        .from('site_visits')
        .update({ duration_seconds: durationSeconds })
        .eq('session_id', sessionId);
        
    } catch (error) {
       // Silently fail, it's just analytics
       console.error('Error updating session duration:', error);
    }
  }

  /**
   * Records when a user views a specific product.
   */
  async recordProductView(productId: number | string) {
    try {
      const sessionId = this.getSessionId();
      await supabase.from('product_views').insert([{
        product_id: typeof productId === 'string' ? parseInt(productId, 10) : productId,
        session_id: sessionId
      }]);
    } catch (error) {
      console.error('Error recording product view:', error);
    }
  }

  // --- ADMIN FUNCTIONS ---

  async getAverageDuration(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('get_average_duration');
      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Error fetching average duration:', error);
      return 0;
    }
  }

  async getVisitsByDay(): Promise<{ day: string; visitor_type: string; count: number }[]> {
    try {
      const { data, error } = await supabase.rpc('get_visits_by_day');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching visits by day:', error);
      return [];
    }
  }

  async getMostViewedProducts(limitCount: number = 10): Promise<{ product_id: number; view_count: number }[]> {
    try {
      const { data, error } = await supabase.rpc('get_most_viewed_products', { limit_count: limitCount });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching most viewed products:', error);
      return [];
    }
  }
}

export const analyticsService = new AnalyticsService();
