import { useEffect, useRef } from 'react';
import { analyticsService } from '../services/analyticsService';

export function useAnalytics() {
  const isInitialized = useRef(false);
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    // Only initialize once per component mount (strict mode protection)
    if (!isInitialized.current) {
      isInitialized.current = true;
      startTime.current = Date.now();
      
      // Record the visit when the app starts
      analyticsService.recordVisit(window.location.pathname);
    }

    // Function to calculate and save duration
    const saveDuration = () => {
      const durationSeconds = Math.floor((Date.now() - startTime.current) / 1000);
      if (durationSeconds > 0) {
        // Use keepalive for reliable delivery during page unload
        // Since we are using Supabase JS client, it might not support keepalive natively
        // in fetchOptions easily without custom fetch. 
        // For our purpose, we will just call the service.
        analyticsService.updateSessionDuration(durationSeconds);
      }
    };

    // Listen to visibility change (when user switches tabs or minimizes)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveDuration();
      } else if (document.visibilityState === 'visible') {
        // Reset timer when they come back, or keep accumulating. 
        // For simplicity, we keep accumulating the total time since they first opened it.
        // It's not perfectly precise if they leave it open for days, but good enough for a basic metric.
      }
    };

    // Also try to catch window unload 
    const handleBeforeUnload = () => {
      saveDuration();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveDuration(); // Catch normal unmounts
    };
  }, []);

  return null;
}
