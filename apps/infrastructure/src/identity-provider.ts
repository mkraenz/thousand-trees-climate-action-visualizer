import * as aws from "@pulumi/aws";

export const createIdentityProvider = ({
  project,
  stack,
  baseUrlLocal,
  userpoolClientCallbackUrlRemote,
  baseUrlRemote,
  adminEmail,
  adminUserSub,
  awsAccountId,
}: {
  project: string;
  stack: string;
  baseUrlLocal: string;
  userpoolClientCallbackUrlRemote: string;
  baseUrlRemote: string;
  adminEmail: string;
  adminUserSub: string;
  awsAccountId: string;
}) => {
  const userpool = new aws.cognito.UserPool(
    "userpool",
    {
      autoVerifiedAttributes: ["email"],
      name: `${project}-${stack}-user-pool`,
      passwordPolicy: {
        minimumLength: 8,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true,
        requireUppercase: true,
        temporaryPasswordValidityDays: 7,
      },
      usernameAttributes: ["email"],
      verificationMessageTemplate: {
        emailMessage: "Your verification code is {####}",
        emailSubject: "Thousand Trees: Your verification code",
        defaultEmailOption: "CONFIRM_WITH_CODE",
      },
    },
    {
      protect: true,
    }
  );

  const userpoolClient = new aws.cognito.UserPoolClient(
    "userpool-client",
    {
      allowedOauthFlows: ["code"],
      allowedOauthFlowsUserPoolClient: true,
      allowedOauthScopes: ["openid", "profile", "email"],
      callbackUrls: [
        `${baseUrlLocal}/api/auth/callback/cognito`,
        userpoolClientCallbackUrlRemote,
      ],
      enableTokenRevocation: true,
      logoutUrls: [
        `${baseUrlRemote}/api/auth/logout`,
        `${baseUrlLocal}/api/auth/logout`,
      ],
      name: `${project}-${stack}-nextjs`,
      preventUserExistenceErrors: "ENABLED",
      supportedIdentityProviders: ["COGNITO"],
      userPoolId: userpool.id,
      // generateSecret: true,
    },
    {
      protect: true,
    }
  );

  const userpoolUser = new aws.cognito.User(
    "userpool-user",
    {
      attributes: {
        email: adminEmail,
        sub: adminUserSub, // due to having imported an existing user
      },
      userPoolId: userpool.id,
      username: adminEmail,
    },
    {
      protect: true,
    }
  );

  const userpoolDomain = new aws.cognito.UserPoolDomain(
    "userpool-domain",
    {
      domain: `${project}-${stack}-${awsAccountId}`,
      userPoolId: userpool.id,
    },
    {
      protect: true,
    }
  );
  return {
    userpool,
    userpoolClient,
    userpoolUser,
    userpoolDomain,
  };
};
