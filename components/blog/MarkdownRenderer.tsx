"use client";

import { useEffect, useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Renders Markdown content as sanitized HTML.
 * Used on the public-facing blog post page.
 */
export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    const raw = marked.parse(content, { async: false }) as string;
    const sanitized = DOMPurify.sanitize(raw);
    setHtml(sanitized);
  }, [content]);

  return (
    <div
      className={`prose prose-violet dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
