import jsPDF from "jspdf";

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

async function resolveLogoDataUrl(
  logoUrl: string
): Promise<{ dataUrl: string; format: "PNG" | "JPEG" | "WEBP" } | null> {
  const trimmed = logoUrl.trim();
  if (!trimmed) return null;

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

  return {
    dataUrl: `data:${mime};base64,${base64}`,
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
  if (!logoUrl || !logoUrl.trim()) {
    return false;
  }

  const { x = 166, y = 10, maxWidth = 30, maxHeight = 16 } = options;

  try {
    const resolved = await resolveLogoDataUrl(logoUrl);
    if (!resolved) {
      return false;
    }

    let renderWidth = maxWidth;
    let renderHeight = maxHeight;

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
