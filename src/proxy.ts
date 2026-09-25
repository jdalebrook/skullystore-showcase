export { auth as proxy } from "@/lib/auth";

export const config = {
  matcher: ["/cuenta/:path*", "/checkout/:path*", "/admin/:path*"],
};
