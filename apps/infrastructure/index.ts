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
// TODO move secrets from config to a separate (private) repository
const nextauthSecret = config.requireSecret("nextAuthSecret");
const nextAuthUrl = config.require("nextAuthUrl");
const domainName = config.require("domainName");
const subdomain = config.require("subdomain");

const tags = {
  managedBy: "pulumi",
  project,
};

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
    {
      name: `${project}-amplify-access-to-parameter-store`,
      policy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "",
            Effect: "Allow",
            Action: [
              "ssm:GetParametersByPath",
              "ssm:GetParameters",
              "ssm:GetParameter",
              "ssm:DescribeParameters",
            ],
            // TODO restrict to specific path, minimize the actions
            Resource: "*",
          },
        ],
      }),
    },
  ],
});

const amplifyApp = new aws.amplify.App(project, {
  buildSpec: readFileSync("./amplify.buildSpec.yaml", "utf-8"),
  accessToken: amplifyToGithubAccessToken,
  platform: "WEB_COMPUTE",
  environmentVariables: {
    // NOTE: secrets are inside AWS Systems Manager Parameter Store and accessed in the buildSpec as an environment variable named $secrets
    NEXTAUTH_URL: nextAuthUrl,
    COGNITO_OAUTH_CLIENT_ID: userpoolClient.id,
    COGNITO_OAUTH_ISSUER_URL: pulumi.interpolate`https://cognito-idp.${region}.amazonaws.com/${userpool.id}`,
    MY_AWS_REGION: region,
    MY_AWS_DYNAMODB_TABLE: db.name,
    MY_AWS_ACCESS_KEY_ID: nextjsToDynamodbAccessKey.id,
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

const getParameterName = (suffix: string) =>
  pulumi.interpolate`/amplify/${amplifyApp.id}/${nextAppMainBranch.branchName}/${suffix}`;

new aws.ssm.Parameter("nextauth-secret", {
  type: "SecureString",
  name: getParameterName("NEXTAUTH_SECRET"),
  value: nextauthSecret,
  tags,
});
new aws.ssm.Parameter("cognito-oauth-client-secret", {
  type: "SecureString",
  name: getParameterName("COGNITO_OAUTH_CLIENT_SECRET"),
  value: userpoolClient.clientSecret,
  tags,
});
new aws.ssm.Parameter("aws-access-key-secret", {
  type: "SecureString",
  name: getParameterName("MY_AWS_ACCESS_KEY_SECRET"),
  value: nextjsToDynamodbAccessKey.secret,
  tags,
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
