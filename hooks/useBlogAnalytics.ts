import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface TrackViewOptions {
  postId: string;
  postSlug: string;
}

interface TrackReadOptions {
  postId: string;
  readTime: number; // in seconds
  scrollDepth: number; // 0-100
}

// Generate a stable visitor ID (stored in localStorage)
const getVisitorId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let visitorId = localStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('visitor_id', visitorId);
  }
  return visitorId;
};

// Generate a session ID (stored in sessionStorage)
const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

export const useBlogAnalytics = () => {
  const startTimeRef = useRef<number>(0);
  const maxScrollRef = useRef<number>(0);
  const hasTrackedViewRef = useRef<boolean>(false);

  // Track page view
  const trackView = useCallback(async ({ postId, postSlug }: TrackViewOptions) => {
    if (hasTrackedViewRef.current) return; // Only track once per page load
    
    try {
      const visitorId = getVisitorId();
      const sessionId = getSessionId();
      const referrer = document.referrer || 'direct';
      const userAgent = navigator.userAgent;

      await supabase.from('blog_analytics').insert({
        post_id: postId,
        event_type: 'view',
        visitor_id: visitorId,
        session_id: sessionId,
        referrer,
        user_agent: userAgent,
      });

      hasTrackedViewRef.current = true;
      startTimeRef.current = Date.now();
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  }, [supabase]);

  // Track reading completion
  const trackRead = useCallback(async ({ postId, readTime, scrollDepth }: TrackReadOptions) => {
    try {
      const visitorId = getVisitorId();
      const sessionId = getSessionId();

      await supabase.from('blog_analytics').insert({
        post_id: postId,
        event_type: 'read',
        visitor_id: visitorId,
        session_id: sessionId,
        read_time: readTime,
        scroll_depth: scrollDepth,
      });
    } catch (error) {
      console.error('Error tracking read:', error);
    }
  }, [supabase]);

  // Track scroll depth
  const trackScroll = useCallback(() => {
    if (typeof window === 'undefined') return;

    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const scrollPercentage = Math.round(
      ((scrollTop + windowHeight) / documentHeight) * 100
    );

    if (scrollPercentage > maxScrollRef.current) {
      maxScrollRef.current = Math.min(scrollPercentage, 100);
    }
  }, []);

  // Auto-track on unmount (when user leaves the page)
  const setupAutoTrack = useCallback((postId: string) => {
    const handleBeforeUnload = () => {
      const readTime = Math.round((Date.now() - startTimeRef.current) / 1000);
      const scrollDepth = maxScrollRef.current;

      // Only track if user spent at least 5 seconds and scrolled at least 25%
      if (readTime >= 5 && scrollDepth >= 25) {
        // Use sendBeacon for reliable tracking on page unload
        const visitorId = getVisitorId();
        const sessionId = getSessionId();
        
        const data = {
          post_id: postId,
          event_type: 'read',
          visitor_id: visitorId,
          session_id: sessionId,
          read_time: readTime,
          scroll_depth: scrollDepth,
        };

        // Try to send via fetch with keepalive
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          keepalive: true,
        }).catch(() => {
          // Fallback: use sendBeacon
          navigator.sendBeacon(
            '/api/analytics/track',
            JSON.stringify(data)
          );
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('scroll', trackScroll, { passive: true });

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('scroll', trackScroll);
    };
  }, [trackScroll]);

  return {
    trackView,
    trackRead,
    setupAutoTrack,
  };
};

// Hook for automatic tracking on blog post pages
export const useAutoTrackBlogPost = (postId: string | null, postSlug: string | null) => {
  const { trackView, setupAutoTrack } = useBlogAnalytics();
  const hasSetupRef = useRef(false);

  useEffect(() => {
    if (!postId || !postSlug || hasSetupRef.current) return;

    // Track view immediately
    trackView({ postId, postSlug });

    // Setup auto-tracking for read time and scroll depth
    const cleanup = setupAutoTrack(postId);
    hasSetupRef.current = true;

    return cleanup;
  }, [postId, postSlug, trackView, setupAutoTrack]);
};
