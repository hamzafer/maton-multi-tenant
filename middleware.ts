import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    "/admin/:path*",
    "/activity/:path*",
    "/store/:path*",
    "/api/maton/:path*",
  ],
};

export function middleware(req: NextRequest) {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASSWORD;

  // If no credentials configured, skip auth
  if (!user || !pass) return NextResponse.next();

  const authHeader = req.headers.get("authorization");

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const [u, p] = decoded.split(":");
      if (u === user && p === pass) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Maton Demo"' },
  });
}
