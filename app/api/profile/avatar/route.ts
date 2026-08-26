import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const IMAGE_TYPES: Record<string, { extension: string; signature: number[] }> = {
  "image/jpeg": { extension: "jpg", signature: [0xff, 0xd8, 0xff] },
  "image/png": { extension: "png", signature: [0x89, 0x50, 0x4e, 0x47] },
  "image/webp": { extension: "webp", signature: [0x52, 0x49, 0x46, 0x46] },
};

function hasValidImageSignature(file: File, signature: number[]) {
  return file.slice(0, signature.length).arrayBuffer().then((buffer) => {
    const bytes = new Uint8Array(buffer);
    return signature.every((byte, index) => bytes[index] === byte);
  });
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

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
      return NextResponse.json({ error: "Solo se permiten imágenes JPG, PNG o WebP" }, { status: 400 });
    }

    if (file.size > MAX_AVATAR_SIZE) {
      return NextResponse.json({ error: "La foto de perfil no puede superar 2 MB" }, { status: 400 });
    }

    if (!(await hasValidImageSignature(file, imageType.signature))) {
      return NextResponse.json({ error: "El archivo no contiene una imagen válida" }, { status: 400 });
    }

    const blob = await put(`avatars/${user.id}/perfil.${imageType.extension}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Error al subir avatar:", error);
    return NextResponse.json({ error: "No se pudo subir la foto de perfil" }, { status: 500 });
  }
}
