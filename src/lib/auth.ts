import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Google,
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const rawEmail = credentials?.email;
        const password = credentials?.password;
        if (typeof rawEmail !== "string" || typeof password !== "string") {
          return null;
        }
        const email = rawEmail.trim().toLowerCase();

        // Limita por email en el punto real de verificación: cubre tanto el
        // formulario de login como cualquier POST directo al callback de
        // NextAuth (no solo las llamadas que pasan por nuestra Server Action).
        const { allowed } = rateLimit(`login:${email}`, 8, 15 * 60 * 1000);
        if (!allowed) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        // Sin passwordHash: cuenta creada solo con Google, no puede entrar
        // por email/contraseña hasta que fije una (recuperar contraseña).
        if (!user || !user.passwordHash) return null;

        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatches) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return true;
      }
      if (!user.email) {
        return false;
      }

      // Sin adapter de BD (sesiones JWT), Auth.js no crea filas en User por
      // su cuenta -- lo hacemos aquí a mano en el primer login con Google.
      const email = user.email.trim().toLowerCase();
      const dbUser = await prisma.user.upsert({
        where: { email },
        update: {},
        create: { email, name: user.name ?? null, role: "CUSTOMER" },
      });

      user.id = dbUser.id;
      user.role = dbUser.role;
      return true;
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const pathname = request.nextUrl.pathname;
      const isProtectedRoute =
        pathname.startsWith("/cuenta") ||
        pathname.startsWith("/checkout") ||
        pathname.startsWith("/admin");
      if (isProtectedRoute && !isLoggedIn) return false;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "CUSTOMER" | "ADMIN";
      }
      return session;
    },
  },
});
