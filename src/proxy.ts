import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/prijava" || pathname === "/admin/login" || pathname === "/admin/ponastavitev") return NextResponse.next();
  const token = request.cookies.get("elmoto_session")?.value;
  const secret = process.env.AUTH_SECRET;
  if (!token || !secret) return NextResponse.redirect(new URL("/admin/prijava", request.url));
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    if (payload.role !== "ADMIN") throw new Error("role");
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL("/admin/prijava", request.url));
    response.cookies.delete("elmoto_session");
    return response;
  }
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
