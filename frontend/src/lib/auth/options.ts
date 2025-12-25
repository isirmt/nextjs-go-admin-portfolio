import Google from "next-auth/providers/google";
import { isAllowedEmail } from "./allowedEmails";
import NextAuth from "next-auth";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ profile }) {
      return isAllowedEmail(profile?.email);
    },
    async session({ session }) {
      if (session.user?.email && isAllowedEmail(session.user.email)) {
        session.user.role = "admin";
      } else if (session.user) {
        session.user.role = "guest";
      }
      return session;
    },
  },
  pages: {
    signIn: "/console/login",
  },
});
