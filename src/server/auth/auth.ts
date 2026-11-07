import "server-only";

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { DefaultSession } from "next-auth";

import User from "@/models/User";
import { connectDB } from "@/server/database/mongodb";
import {
  authorizeCredentials,
  type TrustedCredentialsUser,
} from "@/server/auth/credentials";
import { authorizeGoogleAccount } from "@/server/auth/google";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "HEAD_COACH" | "COACH" | "SCOUT" | "PLAYER";
      academyId: string;
      status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
      sessionVersion: number;
    } & DefaultSession["user"];
  }

  interface User {
    role?: "HEAD_COACH" | "COACH" | "SCOUT" | "PLAYER";
    academyId?: string;
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    sessionVersion?: number;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    userId?: string;
    role?: "HEAD_COACH" | "COACH" | "SCOUT" | "PLAYER";
    academyId?: string;
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    sessionVersion?: number;
    invalid?: boolean;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: false,
    }),
    Credentials({
      id: "credentials",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => authorizeCredentials(credentials),
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") {
        return true;
      }

      if (
        !profile ||
        typeof profile.sub !== "string" ||
        typeof profile.email !== "string" ||
        profile.email_verified !== true
      ) {
        return false;
      }

      return authorizeGoogleAccount({
        googleSub: profile.sub,
        googleEmail: profile.email,
      });
    },
    async jwt({ token, user, account, profile }) {
      const trustedUser = user as TrustedCredentialsUser | undefined;
      let userId =
        typeof token.userId === "string"
          ? token.userId
          : typeof trustedUser?.id === "string"
            ? trustedUser.id
            : typeof token.sub === "string"
              ? token.sub
              : undefined;

      if (account?.provider === "google") {
        await connectDB();
        const googleSub =
          typeof profile?.sub === "string" ? profile.sub : undefined;
        const googleEmail =
          typeof profile?.email === "string"
            ? profile.email.trim().toLowerCase()
            : undefined;
        const databaseUser = googleSub
          ? await User.findOne({ googleId: googleSub }).select("_id").lean()
          : googleEmail
            ? await User.findOne({ email: googleEmail }).select("_id").lean()
            : null;
        userId = databaseUser ? String(databaseUser._id) : undefined;
      }

      if (!userId) {
        return { ...token, invalid: true };
      }

      try {
        await connectDB();
        const databaseUser = await User.findById(userId).lean();
        if (
          !databaseUser ||
          databaseUser.status !== "ACTIVE" ||
          (databaseUser.role === "PLAYER" &&
            databaseUser.passwordSetupCompleted === false)
        ) {
          return { ...token, invalid: true };
        }

        token.userId = String(databaseUser._id);
        token.role = databaseUser.role;
        token.academyId = String(databaseUser.academyId);
        token.status = databaseUser.status;
        const databaseSessionVersion = databaseUser.authSessionVersion ?? 0;
        if (
          typeof token.sessionVersion === "number" &&
          token.sessionVersion !== databaseSessionVersion
        ) {
          return { ...token, invalid: true };
        }
        token.sessionVersion = databaseSessionVersion;
        token.name = databaseUser.name;
        token.email = databaseUser.email;
        token.invalid = false;
        return token;
      } catch {
        return { ...token, invalid: true };
      }
    },
    async session({ session, token }) {
      if (
        token.invalid ||
        !token.userId ||
        !token.role ||
        !token.academyId ||
        token.status !== "ACTIVE"
        || typeof token.sessionVersion !== "number"
      ) {
        return { expires: session.expires };
      }

      return {
        ...session,
        user: {
          ...session.user,
          id: token.userId,
          name: token.name,
          email: token.email,
          role: token.role,
          academyId: token.academyId,
          status: token.status,
          sessionVersion: token.sessionVersion,
        },
      };
    },
  },
});
