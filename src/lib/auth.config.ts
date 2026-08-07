import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      const isOrganizerRoute = pathname.startsWith("/organizer");
      const isAttendeeRoute = pathname.startsWith("/dashboard");

      if (isOrganizerRoute) {
        if (!isLoggedIn) return false;
        return auth.user.role === "ORGANIZER" || auth.user.role === "ADMIN";
      }

      if (isAttendeeRoute) {
        if (!isLoggedIn) return false;
        return true;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;