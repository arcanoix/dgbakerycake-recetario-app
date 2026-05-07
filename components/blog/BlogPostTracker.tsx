"use client";

import { useAutoTrackBlogPost } from "@/hooks/useBlogAnalytics";

interface BlogPostTrackerProps {
  postId: string;
  postSlug: string;
}

export const BlogPostTracker = ({ postId, postSlug }: BlogPostTrackerProps) => {
  // Automatically track view and reading behavior
  useAutoTrackBlogPost(postId, postSlug);

  // This component doesn't render anything
  return null;
};
