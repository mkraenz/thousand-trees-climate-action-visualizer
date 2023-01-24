import "next-auth";
import type { DefaultSession } from "next-auth";

// https://next-auth.js.org/getting-started/typescript#extend-default-interface-properties
declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */

  interface Session extends DefaultSession {
    user?: ({ id?: string } & DefaultSession["user"]) | null;
  }
}
