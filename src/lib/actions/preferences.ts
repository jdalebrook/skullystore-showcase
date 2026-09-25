"use server";

import { cookies } from "next/headers";

const GRID_COLUMNS_COOKIE = "grid-columns";

export async function setGridColumns(columns: number) {
  const cookieStore = await cookies();
  cookieStore.set(GRID_COLUMNS_COOKIE, String(columns), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
