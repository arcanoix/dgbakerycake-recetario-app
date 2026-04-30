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
 * Uses a single combined pass to avoid incomplete-sanitization edge cases:
 * - Dangerous block elements (e.g. <script>…</script>) are removed entirely.
 * - All remaining HTML tags are stripped while keeping their text content.
 * - Any residual `<` and `>` characters are replaced with their HTML entities
 *   so no partial tags can slip through.
 */
export function stripHtml(input: string): string {
  // Single-pass: dangerous blocks first (higher-specificity alternative),
  // then remaining HTML tags.
  const withoutTags = input.replace(
    new RegExp(
      DANGEROUS_TAG_PATTERN.source + '|<[^>]*>',
      'gi'
    ),
    ''
  );
  // Encode any residual angle-bracket characters so they cannot form new tags.
  return withoutTags
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
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
