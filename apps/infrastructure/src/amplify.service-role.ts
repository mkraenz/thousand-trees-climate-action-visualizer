export const getAmplifyServiceRole = (accountId: string, region: string) => {
  return {
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "PushLogs",
        Effect: "Allow",
        Action: ["logs:CreateLogStream", "logs:PutLogEvents"],
        Resource: `arn:aws:logs:${region}:${accountId}:log-group:/aws/amplify/*:log-stream:*`,
      },
      {
        Sid: "CreateLogGroup",
        Effect: "Allow",
        Action: "logs:CreateLogGroup",
        Resource: `arn:aws:logs:${region}:${accountId}:log-group:/aws/amplify/*`,
      },
      {
        Sid: "DescribeLogGroups",
        Effect: "Allow",
        Action: "logs:DescribeLogGroups",
        Resource: `arn:aws:logs:${region}:${accountId}:log-group:*`,
      },
    ],
  };
};
