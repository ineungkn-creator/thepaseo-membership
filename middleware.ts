import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const runtime = "nodejs";

export async function middleware(req: any) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico" ||
    pathname === "/admin-login"
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req });

  if (!token) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin-login", req.nextUrl.origin));
    }
    return NextResponse.redirect(new URL("/auth/login", req.nextUrl.origin));
  }

  if (token.role === "USER") {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", req.nextUrl.origin));
    }

    const incomplete =
      !token.dateOfBirth ||
      !token.gender ||
      !token.phone ||
      !token.branchId ||
      !token.occupation;

    if (incomplete && pathname !== "/complete-profile") {
      return NextResponse.redirect(
        new URL("/complete-profile", req.nextUrl.origin)
      );
    }
  }

  // ✅ ต้อง next
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/((?!_next|static|api|favicon.ico).*)",
  ],
};
