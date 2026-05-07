import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      post_id,
      event_type,
      visitor_id,
      session_id,
      referrer,
      user_agent,
      read_time,
      scroll_depth,
    } = body;

    // Validate required fields
    if (!post_id || !event_type || !visitor_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate event_type
    const validEventTypes = ['view', 'read', 'share', 'like'];
    if (!validEventTypes.includes(event_type)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Insert analytics event
    const { error } = await supabase.from('blog_analytics').insert({
      post_id,
      event_type,
      visitor_id,
      session_id,
      referrer: referrer || null,
      user_agent: user_agent || null,
      read_time: read_time || null,
      scroll_depth: scroll_depth || null,
    });

    if (error) {
      console.error('Error inserting analytics:', error);
      return NextResponse.json(
        { error: 'Failed to track event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in analytics track:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
