"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BlogPostForm } from "@/components/blog/BlogPostForm";

export default function NuevoPostPage() {
  return (
    <ProtectedRoute>
      <BlogPostForm />
    </ProtectedRoute>
  );
}
