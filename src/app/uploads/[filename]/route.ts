import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { OWNED_FILENAME, UPLOADS_DIR } from "@/lib/storage";

const MIME_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".avif": "image/avif",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  if (!OWNED_FILENAME.test(filename)) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const buffer = await readFile(path.join(UPLOADS_DIR, filename));
    const extension = path.extname(filename).toLowerCase();
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": MIME_TYPES[extension] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
