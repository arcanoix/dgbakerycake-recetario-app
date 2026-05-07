import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const period = searchParams.get('period') || '30'; // days

    const supabase = await createSupabaseServerClient();

    // Check if user is authenticated (only admins should see stats)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (postId) {
      // Get stats for specific post
      const { data: stats, error } = await supabase
        .from('blog_stats')
        .select('*')
        .eq('id', postId)
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch stats' },
          { status: 500 }
        );
      }

      // Get views over time
      const periodDays = parseInt(period);
      const { data: viewsOverTime, error: viewsError } = await supabase
        .from('blog_analytics')
        .select('created_at')
        .eq('post_id', postId)
        .eq('event_type', 'view')
        .gte('created_at', new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (viewsError) {
        console.error('Error fetching views over time:', viewsError);
      }

      // Group views by date
      const viewsByDate: Record<string, number> = {};
      viewsOverTime?.forEach((view) => {
        const date = new Date(view.created_at).toISOString().split('T')[0];
        viewsByDate[date] = (viewsByDate[date] || 0) + 1;
      });

      return NextResponse.json({
        ...stats,
        viewsByDate,
      });
    } else {
      // Get stats for all posts
      const { data: stats, error } = await supabase
        .from('blog_stats')
        .select('*')
        .order('total_views', { ascending: false });

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch stats' },
          { status: 500 }
        );
      }

      return NextResponse.json({ posts: stats });
    }
  } catch (error) {
    console.error('Error in analytics stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
