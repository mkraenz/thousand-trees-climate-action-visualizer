import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';

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


export const myconfig = {
    aws:{
        region,
        accountId: awsIdentity.accountId,
    },
    github:{
        amplifyAccessToken: ''
    }
    nextjs: {
        nextAuthSecret: config.requireSecret("nextAuthSecret")
    }
}