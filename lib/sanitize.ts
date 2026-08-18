/**
 * Server/client-safe XSS sanitization utilities for plain-text user inputs.
 * Strips HTML tags from string values before they are stored or rendered.
 *
 * For rich-text / markdown rendering (blog posts), use DOMPurify in client
 * components as already done in MarkdownRenderer.tsx.
 */

/**
 * Tags whose entire block (opening tag + content + closing tag) should be
 * removed. This pattern is intentionally NOT stored as a module-level constant
 * with the /g flag because global regex instances are stateful (lastIndex) and
 * unsafe to reuse across calls. A fresh RegExp is created for each invocation.
 */
const DANGEROUS_TAG_SOURCE =
  '<(script|style|iframe|object|embed|link|meta|noscript)[^>]*>[\\s\\S]*?<\\/\\1>';

/** Combined pattern: dangerous blocks first, then any remaining HTML tag. */
const STRIP_HTML_SOURCE = `${DANGEROUS_TAG_SOURCE}|<[^>]*>`;

/**
 * Strips HTML/script tags and dangerous block content from a plain-text string.
 * Works in both server (Node.js) and browser environments.
 *
 * - Dangerous block elements (e.g. <script>…</script>) are removed entirely
 *   including their content.
 * - All remaining HTML tags are stripped while keeping their text content.
 * - Any residual `<` and `>` characters are replaced with their HTML entities
 *   so no partial tags can slip through.
 *
 * A new RegExp instance is created on every call to avoid statefulness issues
 * with the global (`g`) flag.
 */
export function stripHtml(input: string): string {
  const withoutTags = input.replace(new RegExp(STRIP_HTML_SOURCE, 'gi'), '');
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
