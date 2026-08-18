"use client";

import dynamic from "next/dynamic";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const BlogPostForm = dynamic(
  () => import("@/components/blog/BlogPostForm").then((mod) => mod.BlogPostForm),
  { ssr: false }
);

export default function NuevoPostPage() {
  return (
    <ProtectedRoute>
      <BlogPostForm />
    </ProtectedRoute>
  );
}
