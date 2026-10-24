import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2 MB

const IMAGE_TYPES: Record<string, { extension: string; signature: number[] }> = {
  "image/jpeg": { extension: "jpg", signature: [0xff, 0xd8, 0xff] },
  "image/png": { extension: "png", signature: [0x89, 0x50, 0x4e, 0x47] },
  "image/webp": { extension: "webp", signature: [0x52, 0x49, 0x46, 0x46] },
};

function readBlobBuffer(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === "function") {
    return blob.arrayBuffer();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

function hasValidImageSignature(file: File, signature: number[]) {
  return readBlobBuffer(file.slice(0, signature.length)).then((buffer) => {
    const bytes = new Uint8Array(buffer);
    return signature.every((byte, index) => bytes[index] === byte);
  });
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Selecciona una imagen válida" }, { status: 400 });
    }

    const imageType = IMAGE_TYPES[file.type];
    if (!imageType) {
      return NextResponse.json(
        { error: "Solo se permiten imágenes PNG, JPG o WebP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_LOGO_SIZE) {
      return NextResponse.json(
        { error: "El logo no puede superar 2 MB" },
        { status: 400 }
      );
    }

    if (!(await hasValidImageSignature(file, imageType.signature))) {
      return NextResponse.json(
        { error: "El archivo no contiene una imagen válida" },
        { status: 400 }
      );
    }

    const arrayBuffer = await readBlobBuffer(file);
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ url: dataUrl, dataUrl });
    }

    try {
      const blob = await put(`logos/${user.id}/logo.${imageType.extension}`, file, {
        access: "public",
        addRandomSuffix: true,
        contentType: file.type,
        cacheControlMaxAge: 60 * 60 * 24 * 365,
      });

      return NextResponse.json({ url: blob.url, dataUrl });
    } catch {
      // If Vercel Blob fails or token is invalid in dev, fall back to DataURL seamlessly
      return NextResponse.json({ url: dataUrl, dataUrl });
    }
  } catch (error) {
    console.error("Error al subir logo:", error);
    return NextResponse.json(
      { error: "No se pudo subir el logo" },
      { status: 500 }
    );
  }
}
