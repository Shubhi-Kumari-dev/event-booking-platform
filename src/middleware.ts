import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/events",
];

const ORGANIZER_ROUTES = ["/organizer"];
const ATTENDEE_ROUTES = ["/dashboard"];

function isPathMatch(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;
  const role = req.auth?.user?.role;

  const isApiAuthRoute = pathname.startsWith("/api/auth");
  const isPublicApiRoute = pathname.startsWith("/api/events") && req.method === "GET";
  const isPublicRoute = isPathMatch(pathname, PUBLIC_ROUTES);
  const isOrganizerRoute = isPathMatch(pathname, ORGANIZER_ROUTES);
  const isAttendeeRoute = isPathMatch(pathname, ATTENDEE_ROUTES);

  if (isApiAuthRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  if (isOrganizerRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== "ORGANIZER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard?error=forbidden", req.url));
    }
    return NextResponse.next();
  }

  if (isAttendeeRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (isPublicRoute) {
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"],
};