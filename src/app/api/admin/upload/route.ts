import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { deleteProductImage, uploadProductImage } from "@/lib/storage";

export async function POST(request: Request) {
  await requireAdmin();

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se ha recibido ninguna imagen." }, { status: 400 });
  }

  try {
    const url = await uploadProductImage(file);
    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo subir la imagen.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  await requireAdmin();

  const body = await request.json();
  const url = body?.url;

  if (typeof url !== "string") {
    return NextResponse.json({ error: "URL inválida." }, { status: 400 });
  }

  await deleteProductImage(url);
  return NextResponse.json({ ok: true });
}
