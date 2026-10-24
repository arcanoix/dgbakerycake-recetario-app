import jsPDF from "jspdf";

export const LOGO_STORAGE_KEY = "dgcost_config_logo_url";

export function guardarLogoLocal(logoUrl?: string): void {
  if (typeof window === "undefined") return;
  try {
    if (logoUrl && logoUrl.trim()) {
      window.localStorage.setItem(LOGO_STORAGE_KEY, logoUrl.trim());
    } else {
      window.localStorage.removeItem(LOGO_STORAGE_KEY);
    }
  } catch {
    // Ignore storage quota or SSR errors
  }
}

export function obtenerLogoLocal(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const val = window.localStorage.getItem(LOGO_STORAGE_KEY);
    return val && val.trim() ? val.trim() : undefined;
  } catch {
    return undefined;
  }
}

export interface PdfLogoOptions {
  x?: number;
  y?: number;
  maxWidth?: number;
  maxHeight?: number;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(buffer).toString("base64");
  }
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function resolveImageFormat(mimeOrDataUrl: string): "PNG" | "JPEG" | "WEBP" {
  const lower = mimeOrDataUrl.toLowerCase();
  if (lower.includes("jpeg") || lower.includes("jpg")) {
    return "JPEG";
  }
  if (lower.includes("webp")) {
    return "WEBP";
  }
  return "PNG";
}

/**
 * In browser environments, normalizes any image (including WebP or remote URLs)
 * into a standard PNG DataURL via an offscreen canvas so jsPDF can always embed it
 * without WebP decoder failures or connect-src CSP restrictions.
 */
function normalizeLogoViaCanvas(
  src: string
): Promise<{ dataUrl: string; format: "PNG"; width: number; height: number } | null> {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    typeof Image === "undefined" ||
    (typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent || ""))
  ) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    const timeoutId = setTimeout(() => {
      resolve(null);
    }, 5000);

    img.onload = () => {
      clearTimeout(timeoutId);
      try {
        const naturalW = img.naturalWidth || img.width || 200;
        const naturalH = img.naturalHeight || img.height || 100;
        const maxDim = 600;
        const scale = Math.min(1, maxDim / Math.max(naturalW, naturalH));
        const targetW = Math.max(1, Math.round(naturalW * scale));
        const targetH = Math.max(1, Math.round(naturalH * scale));

        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0, targetW, targetH);
        const pngDataUrl = canvas.toDataURL("image/png");
        resolve({
          dataUrl: pngDataUrl,
          format: "PNG",
          width: targetW,
          height: targetH,
        });
      } catch {
        resolve(null);
      }
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      resolve(null);
    };

    img.src = src;
  });
}

async function resolveLogoDataUrl(
  logoUrl: string
): Promise<{ dataUrl: string; format: "PNG" | "JPEG" | "WEBP"; width?: number; height?: number } | null> {
  const trimmed = logoUrl.trim();
  if (!trimmed) return null;

  // Try canvas normalization first in real browser (handles WebP, PNG, JPG, and remote URLs via img-src)
  const canvasNormalized = await normalizeLogoViaCanvas(trimmed);
  if (canvasNormalized) {
    return canvasNormalized;
  }

  if (trimmed.startsWith("data:image/")) {
    return {
      dataUrl: trimmed,
      format: resolveImageFormat(trimmed.slice(0, 40)),
    };
  }

  const response = await fetch(trimmed);
  if (!response.ok) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "image/png";
  const buffer = await response.arrayBuffer();
  if (!buffer || buffer.byteLength === 0) {
    return null;
  }

  const base64 = arrayBufferToBase64(buffer);
  const format = resolveImageFormat(contentType);
  const mime =
    format === "JPEG"
      ? "image/jpeg"
      : format === "WEBP"
        ? "image/webp"
        : "image/png";

  const dataUrl = `data:${mime};base64,${base64}`;
  const canvasFromFetched = await normalizeLogoViaCanvas(dataUrl);
  if (canvasFromFetched) {
    return canvasFromFetched;
  }

  return {
    dataUrl,
    format,
  };
}

/**
 * Loads and stamps the user's configured logo into the PDF header.
 * Returns true if the logo was drawn, or false if no logo is configured or loading failed.
 */
export async function agregarLogoPDF(
  doc: jsPDF,
  logoUrl?: string,
  options: PdfLogoOptions = {}
): Promise<boolean> {
  const effectiveLogoUrl = (logoUrl && logoUrl.trim()) || obtenerLogoLocal();
  if (!effectiveLogoUrl) {
    return false;
  }

  const { x = 166, y = 10, maxWidth = 30, maxHeight = 16 } = options;

  try {
    const resolved = await resolveLogoDataUrl(effectiveLogoUrl);
    if (!resolved) {
      return false;
    }

    let renderWidth = maxWidth;
    let renderHeight = maxHeight;

    if (resolved.width && resolved.height && resolved.width > 0 && resolved.height > 0) {
      const ratio = Math.min(maxWidth / resolved.width, maxHeight / resolved.height);
      renderWidth = resolved.width * ratio;
      renderHeight = resolved.height * ratio;
    } else {
      try {
        if (typeof doc.getImageProperties === "function") {
          const props = doc.getImageProperties(resolved.dataUrl);
          if (props?.width > 0 && props?.height > 0) {
            const ratio = Math.min(
              maxWidth / props.width,
              maxHeight / props.height
            );
            renderWidth = props.width * ratio;
            renderHeight = props.height * ratio;
          }
        }
      } catch {
        // Fallback to bounding box dimensions if image properties cannot be inspected
      }
    }

    const drawX = x + (maxWidth - renderWidth);
    const drawY = y + (maxHeight - renderHeight) / 2;

    doc.addImage(
      resolved.dataUrl,
      resolved.format,
      drawX,
      drawY,
      renderWidth,
      renderHeight
    );
    return true;
  } catch {
    return false;
  }
}
