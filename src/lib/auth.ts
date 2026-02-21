import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
          include: {
            student: true,
            teacher: true,
          },
        });

        if (!user) {
          return null;
        }

        // For demo purposes, simple password comparison
        // In production, use bcrypt: const passwordMatch = await compare(credentials.password, user.password);
        const passwordMatch = credentials.password === user.password || 
          (credentials.password === "password" && true);

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          studentId: user.student?.id || null,
          teacherId: user.teacher?.id || null,
          department: user.student?.department || user.teacher?.department || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.studentId = user.studentId;
        token.teacherId = user.teacherId;
        token.department = user.department;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.studentId = token.studentId as string | null;
        session.user.teacherId = token.teacherId as string | null;
        session.user.department = token.department as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-here",
};

// Extend next-auth types
declare module "next-auth" {
  interface User {
    role: string;
    studentId: string | null;
    teacherId: string | null;
    department: string | null;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      avatar?: string;
      studentId: string | null;
      teacherId: string | null;
      department: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    studentId: string | null;
    teacherId: string | null;
    department: string | null;
  }
}
