import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";
import { loginSchema } from "@/lib/validations/auth.schema";
import { logger } from "@/lib/logger";
import type { Role } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          logger.warn("Login validation failed", { issues: parsed.error.issues });
          return null;
        }
        const { email, password } = parsed.data;
        const user = await db.user.findUnique({ where: { email } });
        if (!user || !user.password) {
          return null;
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return null;
        }
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: Role }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
});