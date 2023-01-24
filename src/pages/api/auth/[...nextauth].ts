import NextAuth, { type NextAuthOptions } from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";
import { env } from "../../../env/server.mjs";

export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, token }) {
      // Note: we're using ts module augmentation to add the id field to user. see src/types/next-auth.d.ts
      if (session.user) session.user.id = token.sub;
      return session;
    },
  },
  providers: [
    CognitoProvider({
      clientId: env.COGNITO_OAUTH_CLIENT_ID,
      clientSecret: env.COGNITO_OAUTH_CLIENT_SECRET,
      issuer: env.COGNITO_OAUTH_ISSUER_URL,
    }),
  ],
};

export default NextAuth(authOptions);
