// NextAuth v5, persona-bypass credentials provider.
//
// The demo doesn't have real signups. The persona-pick page POSTs to a
// route handler that calls signIn("credentials", { personaId }). The
// authorize() callback below looks up the matching User row and starts
// a real signed-in session, JWT cookie, server components can read
// auth() to get the active user.

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";

declare module "next-auth" {
  interface User {
    id: string;
    personaId: string;
    role: UserRole;
  }
  interface Session {
    user: {
      id: string;
      personaId: string;
      name: string;
      email: string;
      role: UserRole;
    };
  }
}

// JWT augmentation, Auth.js v5 hangs the JWT interface off
// `@auth/core/jwt`. We use a lightweight local interface and cast in
// the callbacks to stay portable across Auth.js minor versions.
type JwtClaims = {
  id?: string;
  personaId?: string;
  role?: UserRole;
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/lattice" },
  providers: [
    Credentials({
      name: "Persona",
      credentials: {
        personaId: { label: "Persona ID", type: "text" },
      },
      async authorize(credentials) {
        const personaId = credentials?.personaId;
        if (typeof personaId !== "string") return null;

        const user = await prisma.user.findUnique({
          where: { personaId },
        });
        if (!user) return null;

        return {
          id: user.id,
          personaId: user.personaId,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return { ...token, id: user.id, personaId: user.personaId, role: user.role };
      }
      return token;
    },
    async session({ session, token }) {
      const claims = token as JwtClaims;
      if (session.user && claims.id && claims.personaId && claims.role) {
        session.user.id = claims.id;
        session.user.personaId = claims.personaId;
        session.user.role = claims.role;
      }
      return session;
    },
  },
  trustHost: true,
});
