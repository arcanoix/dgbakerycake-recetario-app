/**
 * Server/client-safe XSS sanitization utilities for plain-text user inputs.
 * Strips HTML tags from string values before they are stored or rendered.
 *
 * For rich-text / markdown rendering (blog posts), use DOMPurify in client
 * components as already done in MarkdownRenderer.tsx.
 */

/** Tags whose entire block (opening tag + content + closing tag) should be removed. */
const DANGEROUS_TAG_PATTERN =
  /<(script|style|iframe|object|embed|link|meta|noscript)[^>]*>[\s\S]*?<\/\1>/gi;

/**
 * Strips HTML/script tags and dangerous block content from a plain-text string.
 * Works in both server (Node.js) and browser environments.
 *
 * 1. Removes dangerous blocks entirely (e.g. <script>…</script>).
 * 2. Strips remaining HTML tags while keeping their text content.
 * 3. Trims surrounding whitespace.
 */
export function stripHtml(input: string): string {
  return input
    .replace(DANGEROUS_TAG_PATTERN, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

/**
 * Applies stripHtml to every string property of a plain object.
 * Non-string values are left untouched.
 */
export function sanitizeStringFields<T extends Record<string, unknown>>(data: T): T {
  const result = { ...data } as Record<string, unknown>;
  for (const key of Object.keys(result)) {
    const value = result[key];
    if (typeof value === 'string') {
      result[key] = stripHtml(value);
    }
  }
  return result as T;
}
