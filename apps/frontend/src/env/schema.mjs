// @ts-check
import { z } from "zod";

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
export const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.preprocess(
    // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
    // Since NextAuth.js automatically uses the VERCEL_URL if present.
    (str) => process.env.VERCEL_URL ?? str,
    // VERCEL_URL doesn't include `https` so it cant be validated as a URL
    process.env.VERCEL ? z.string() : z.string().url()
  ),
  COGNITO_OAUTH_ISSUER_URL: z.string().url(),
  COGNITO_OAUTH_CLIENT_SECRET: z.string(),
  COGNITO_OAUTH_CLIENT_ID: z.string(),
  MY_AWS_DYNAMODB_TABLE: z.string(),
  MY_AWS_REGION: z.string().default("us-east-1"),
  MY_AWS_ACCESS_KEY_ID: z.string(),
  MY_AWS_ACCESS_KEY_SECRET: z.string(),
});

/**
 * You can't destruct `process.env` as a regular object in the Next.js
 * middleware, so you have to do it manually here.
 * @type {{ [k in keyof z.infer<typeof serverSchema>]: z.infer<typeof serverSchema>[k] | undefined }}
 */
export const serverEnv = {
  NODE_ENV: process.env.NODE_ENV,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  COGNITO_OAUTH_ISSUER_URL: process.env.COGNITO_OAUTH_ISSUER_URL,
  COGNITO_OAUTH_CLIENT_SECRET: process.env.COGNITO_OAUTH_CLIENT_SECRET,
  COGNITO_OAUTH_CLIENT_ID: process.env.COGNITO_OAUTH_CLIENT_ID,
  MY_AWS_DYNAMODB_TABLE: process.env.MY_AWS_DYNAMODB_TABLE,
  MY_AWS_REGION: process.env.MY_AWS_REGION,
  MY_AWS_ACCESS_KEY_ID: process.env.MY_AWS_ACCESS_KEY_ID,
  MY_AWS_ACCESS_KEY_SECRET: process.env.MY_AWS_ACCESS_KEY_SECRET,
};

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
export const clientSchema = z.object({
  // NEXT_PUBLIC_CLIENTVAR: z.string(),
});

/**
 * You can't destruct `process.env` as a regular object, so you have to do
 * it manually here. This is because Next.js evaluates this at build time,
 * and only used environment variables are included in the build.
 * @type {{ [k in keyof z.infer<typeof clientSchema>]: z.infer<typeof clientSchema>[k] | undefined }}
 */
export const clientEnv = {
  // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
};
