-- Create blog_analytics table for detailed tracking
CREATE TABLE IF NOT EXISTS public.blog_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'read', 'share', 'like')),
  visitor_id TEXT, -- Anonymous visitor identifier (hash of IP + User Agent)
  session_id TEXT, -- Session identifier
  referrer TEXT, -- Where the visitor came from
  user_agent TEXT, -- Browser/device info
  country TEXT, -- Geolocation (optional)
  city TEXT, -- Geolocation (optional)
  read_time INTEGER, -- Time spent reading in seconds
  scroll_depth INTEGER, -- Percentage of article scrolled (0-100)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blog_analytics_post_id ON public.blog_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_event_type ON public.blog_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_created_at ON public.blog_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_visitor_id ON public.blog_analytics(visitor_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_session_id ON public.blog_analytics(session_id);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_blog_analytics_post_event_date 
  ON public.blog_analytics(post_id, event_type, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.blog_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert analytics (for tracking)
CREATE POLICY "Anyone can insert analytics"
  ON public.blog_analytics
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only authenticated users can read analytics
CREATE POLICY "Authenticated users can read analytics"
  ON public.blog_analytics
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Grant permissions
GRANT INSERT ON public.blog_analytics TO anon, authenticated;
GRANT SELECT ON public.blog_analytics TO authenticated;

-- Create materialized view for quick stats
CREATE MATERIALIZED VIEW IF NOT EXISTS public.blog_stats AS
SELECT 
  bp.id,
  bp.title,
  bp.slug,
  bp.status,
  bp.published_at,
  COUNT(DISTINCT ba.visitor_id) FILTER (WHERE ba.event_type = 'view') as unique_views,
  COUNT(*) FILTER (WHERE ba.event_type = 'view') as total_views,
  AVG(ba.read_time) FILTER (WHERE ba.event_type = 'read' AND ba.read_time > 0) as avg_read_time,
  AVG(ba.scroll_depth) FILTER (WHERE ba.scroll_depth > 0) as avg_scroll_depth,
  COUNT(*) FILTER (WHERE ba.event_type = 'like') as total_likes,
  COUNT(*) FILTER (WHERE ba.event_type = 'share') as total_shares,
  MAX(ba.created_at) as last_viewed_at
FROM public.blog_posts bp
LEFT JOIN public.blog_analytics ba ON bp.id = ba.post_id
GROUP BY bp.id, bp.title, bp.slug, bp.status, bp.published_at;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_stats_id ON public.blog_stats(id);

-- Function to refresh blog stats
CREATE OR REPLACE FUNCTION refresh_blog_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.blog_stats;
END;
$$ LANGUAGE plpgsql;

-- Function to increment view count on blog_posts
CREATE OR REPLACE FUNCTION increment_post_views()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.event_type = 'view' THEN
    UPDATE public.blog_posts
    SET views = views + 1
    WHERE id = NEW.post_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-increment views
CREATE TRIGGER trigger_increment_post_views
  AFTER INSERT ON public.blog_analytics
  FOR EACH ROW
  EXECUTE FUNCTION increment_post_views();

-- Grant execute permission on refresh function
GRANT EXECUTE ON FUNCTION refresh_blog_stats() TO authenticated;
