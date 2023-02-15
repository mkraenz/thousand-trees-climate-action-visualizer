import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const awsConfig = new pulumi.Config("aws");
const region = awsConfig.require("region");
const project = pulumi.getProject();
const stack = pulumi.getStack();
const baseUrlLocal = config.require("baseUrlLocal");
const baseUrlRemote = config.require("baseUrlRemote");
const userpoolClientCallbackUrlRemote = `${baseUrlRemote}/api/auth/callback/cognito`;
const adminEmail = config.require("adminEmail");
const adminUserSub = config.require("adminUserSub");
const awsIdentity = await aws.getCallerIdentity();

const db = new aws.dynamodb.Table(
  "db",
  {
    attributes: [
      {
        name: "pk",
        type: "S",
      },
      {
        name: "sk",
        type: "S",
      },
    ],
    hashKey: "pk",
    name: `${project}-${stack}-db`,
    pointInTimeRecovery: {
      enabled: false,
    },
    rangeKey: "sk",
    readCapacity: 1,
    ttl: {
      attributeName: "",
    },
    writeCapacity: 1,
  },
  {
    protect: true,
  }
);

const nextjsToDynamodbUser = new aws.iam.User(
  "nextjs-to-dynamodb-user",
  { name: `${project}-${stack}-nextjs-to-dynamodb-user` },
  {
    protect: true,
  }
);

const nextjsToDynamodbUserPolicy = new aws.iam.UserPolicy(
  "nextjs-to-dynamodb-user-policy",
  {
    name: `${project}-${stack}-nextjs-to-dynamodb-policy`,
    policy: db.name.apply((name) =>
      JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Action: [
              "dynamodb:Query",
              "dynamodb:Scan",
              "dynamodb:GetItem",
              "dynamodb:PutItem",
              "dynamodb:UpdateItem",
              "dynamodb:DeleteItem",
            ],
            Effect: "Allow",
            Resource: [
              `arn:aws:dynamodb:${region}:${awsIdentity.accountId}:table/${name}`,
            ],
          },
        ],
      })
    ),
    user: nextjsToDynamodbUser.name,
  },
  {
    protect: true,
  }
);

const nextjsToDynamodbAccessKey = new aws.iam.AccessKey(
  "nextjs-to-dynamodb-access-key",
  { user: nextjsToDynamodbUser.name },
  {
    protect: true,
  }
);

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
    domain: `${project}-${stack}-${awsIdentity.accountId}`,
    userPoolId: userpool.id,
  },
  {
    protect: true,
  }
);

export const tableName = db.name;
export const cognitoAuthIssuerUrl = pulumi.interpolate`https://cognito-idp.${region}.amazonaws.com/${userpool.id}`;
export const hostedUi = pulumi.interpolate`https://${userpoolDomain.domain}.auth.${region}.amazoncognito.com/login?client_id=${userpoolClient.id}&response_type=code&scope=email+openid+profile&redirect_uri=${userpoolClientCallbackUrlRemote}`;
export const nextjsToDynamoDbAccessKeyId = nextjsToDynamodbAccessKey.id;
// export const nextjsToDynamoDbAccessKeySecret = nextjsToDynamodbAccessKey.secret;
