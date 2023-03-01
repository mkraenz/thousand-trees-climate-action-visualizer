import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { readFileSync } from "fs";
import { getAmplifyServiceRole } from "./src/amplify.service-role";
import { createIdentityProvider } from "./src/identity-provider";
import { createNextjsAccessToDynamodb } from "./src/nextjs-access-to-dynanodb";

const config = new pulumi.Config();
const amplifyToGithubAccessToken = config.requireSecret(
  "amplifyToGithubAccessToken"
);
const awsConfig = new pulumi.Config("aws");
const region = awsConfig.require("region");
const project = pulumi.getProject();
const stack = pulumi.getStack();
const baseUrlLocal = config.require("baseUrlLocal");
const baseUrlRemote = config.require("baseUrlRemote");
const githubRepositoryUrl = config.require("githubRepositoryUrl");
const userpoolClientCallbackUrlRemote = `${baseUrlRemote}/api/auth/callback/cognito`;
const adminEmail = config.require("adminEmail");
const adminUserSub = config.require("adminUserSub");
const awsIdentity = await aws.getCallerIdentity();
const nextauthSecret = config.requireSecret("nextAuthSecret");
const nextAuthUrl = config.require("nextAuthUrl");
const cognitoOauthClientId = config.requireSecret("cognitoOauthClientId");
const cognitoOauthClientSecret = config.requireSecret(
  "cognitoOauthClientSecret"
);
const domainName = config.require("domainName");
const subdomain = config.require("subdomain");

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

const {
  nextjsToDynamodbAccessKey,
  nextjsToDynamodbUser,
  nextjsToDynamodbUserPolicy,
} = createNextjsAccessToDynamodb({
  awsAccountId: awsIdentity.accountId,
  db,
  project,
  stack,
  region,
});

const { userpool, userpoolDomain, userpoolClient, userpoolUser } =
  createIdentityProvider({
    adminEmail,
    adminUserSub,
    baseUrlLocal,
    baseUrlRemote,
    project,
    stack,
    awsAccountId: awsIdentity.accountId,
    userpoolClientCallbackUrlRemote,
  });

const amplifyServiceRole = new aws.iam.Role(`${project}-amplify-svc-role`, {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: "amplify.amazonaws.com",
  }),
  inlinePolicies: [
    {
      // we need to provide a name or pulumi will succeed without creating the policy WAT?!
      name: `${project}-amplify-create-logs`,
      policy: JSON.stringify(
        getAmplifyServiceRole(awsIdentity.accountId, region)
      ),
    },
  ],
});

const amplifyApp = new aws.amplify.App(project, {
  buildSpec: readFileSync("./amplify.buildSpec.yaml", "utf-8"),
  accessToken: amplifyToGithubAccessToken,
  platform: "WEB_COMPUTE",
  environmentVariables: {
    // TODO put secrets into AWS Systems Manager Parameter Store
    NEXTAUTH_SECRET: nextauthSecret,
    NEXTAUTH_URL: nextAuthUrl,
    COGNITO_OAUTH_CLIENT_ID: cognitoOauthClientId,
    COGNITO_OAUTH_CLIENT_SECRET: cognitoOauthClientSecret,
    COGNITO_OAUTH_ISSUER_URL: pulumi.interpolate`https://cognito-idp.${region}.amazonaws.com/${userpool.id}`,
    MY_AWS_REGION: region,
    MY_AWS_DYNAMODB_TABLE: db.name,
    MY_AWS_ACCESS_KEY_ID: nextjsToDynamodbAccessKey.id,
    MY_AWS_ACCESS_KEY_SECRET: nextjsToDynamodbAccessKey.secret,
    AMPLIFY_MONOREPO_APP_ROOT: "apps/frontend",
  },
  repository: githubRepositoryUrl,
  autoBranchCreationConfig: {
    enableAutoBuild: true,
  },
  autoBranchCreationPatterns: ["main"],
  enableAutoBranchCreation: true,
  iamServiceRoleArn: amplifyServiceRole.arn,
});

const nextAppMainBranch = new aws.amplify.Branch("main", {
  appId: amplifyApp.id,
  branchName: "main",
  framework: "Next.js - SSR",
  stage: "PRODUCTION",
  enableAutoBuild: true,
});

new aws.amplify.DomainAssociation("domain", {
  appId: amplifyApp.id,
  domainName,
  subDomains: [
    {
      branchName: nextAppMainBranch.branchName,
      prefix: subdomain,
    },
  ],
  waitForVerification: true,
});

export const amplifyAppId = amplifyApp.id;
export const amplifyAppArn = amplifyApp.arn;
export const amplifyAppDefaultDomain = amplifyApp.defaultDomain;
export const amplifyNextAppMainBranchName = nextAppMainBranch.branchName;

export const tableName = db.name;
export const cognitoAuthIssuerUrl = pulumi.interpolate`https://cognito-idp.${region}.amazonaws.com/${userpool.id}`;
export const hostedUi = pulumi.interpolate`https://${userpoolDomain.domain}.auth.${region}.amazoncognito.com/login?client_id=${userpoolClient.id}&response_type=code&scope=email+openid+profile&redirect_uri=${userpoolClientCallbackUrlRemote}`;
export const nextjsToDynamoDbAccessKeyId = nextjsToDynamodbAccessKey.id;
// export const nextjsToDynamoDbAccessKeySecret = nextjsToDynamodbAccessKey.secret;
