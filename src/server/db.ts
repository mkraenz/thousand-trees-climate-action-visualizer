import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import type { Entity, OneSchema } from "dynamodb-onetable";
import { Table } from "dynamodb-onetable";
import Dynamo from "dynamodb-onetable/Dynamo";
import { env } from "../env/server.mjs";

const client = new Dynamo({
  client: new DynamoDBClient({
    region: env.MY_AWS_REGION,
    // TODO
    // credentials: {
    //   accessKeyId: env.MY_AWS_ACCESS_KEY_ID,
    //   secretAccessKey: env.MY_AWS_SECRET_ACCESS_KEY,
    // }
  }),
});

const MySchema = {
  format: "onetable:1.1.0",
  version: "0.0.1",
  indexes: {
    primary: { hash: "pk", sort: "sk" },
  },
  models: {
    User: {
      /** partition key (hash key) */
      pk: { type: String, value: "user#${id}" },
      /** sort key (range key) */
      sk: { type: String, value: "shard#${shardId}" },
      /** equal to the Cognito `sub` */
      id: { type: String, required: true },
      /** we use this to shard large trees arrays into multiple items. Time-based-sorting. */
      shardId: {
        type: Number,
        required: true,
      },
      trees: {
        type: Array,
        items: {
          type: Object,
          schema: {
            x: { type: Number, required: true },
            y: { type: Number, required: true },
          },
        },
        default: [] as { x: number; y: number }[],
      },
    },
  },
  params: {
    isoDates: true,
    timestamps: true,
  },
} satisfies OneSchema;

const table = new Table({
  client,
  name: env.MY_AWS_DYNAMODB_TABLE,
  schema: MySchema,
  partial: true,
});

export const UserDb = table.getModel("User");
export type UserEntity = Entity<typeof MySchema.models.User>;
