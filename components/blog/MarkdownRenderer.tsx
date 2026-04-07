"use client";

import { useEffect, useState } from 'react';
import { marked } from 'marked';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Renders Markdown content as HTML.
 * Used on the public-facing blog post page.
 */
export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    const parsed = marked.parse(content, { async: false }) as string;
    setHtml(parsed);
  }, [content]);

  return (
    <div
      className={`prose prose-violet dark:prose-invert max-w-none ${className}`}
      // Admin-authored content — sanitized at the editor level.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
