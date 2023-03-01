import * as aws from "@pulumi/aws";

export const createNextjsAccessToDynamodb = ({
  region,
  project,
  stack,
  db,
  awsAccountId,
}: {
  region: string;
  project: string;
  stack: string;
  db: aws.dynamodb.Table;
  awsAccountId: string;
}) => {
  const nextjsToDynamodbUser = new aws.iam.User("nextjs-to-dynamodb-user-2");

  const nextjsToDynamodbUserPolicy = new aws.iam.UserPolicy(
    "nextjs-to-dynamodb-user-policy-2",
    {
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
                `arn:aws:dynamodb:${region}:${awsAccountId}:table/${name}`,
              ],
            },
          ],
        })
      ),
      user: nextjsToDynamodbUser.name,
    }
  );

  const nextjsToDynamodbAccessKey = new aws.iam.AccessKey(
    "nextjs-to-dynamodb-access-key-2",
    { user: nextjsToDynamodbUser.name, status: "Active" }
  );
  return {
    nextjsToDynamodbUser,
    nextjsToDynamodbUserPolicy,
    nextjsToDynamodbAccessKey,
  };
};
