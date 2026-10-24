// Lambda entry point: wires handleContact to DynamoDB, SES, SSM and Cloudflare Turnstile.
// Configuration comes from environment variables set by Terraform (infra/terraform/modules/contact-api).
import {
  ConditionalCheckFailedException,
  DeleteItemCommand,
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { handleContact } from "./contact.mjs";

const env = process.env;
const table = env.TABLE_NAME;
const dynamo = new DynamoDBClient({});
const ses = new SESv2Client({});
const ssm = new SSMClient({});

const config = {
  allowedOrigins: (env.ALLOWED_ORIGINS ?? "").split(",").filter(Boolean),
  from: env.FROM_ADDRESS,
  to: env.TO_ADDRESS,
  ipLimitPerHour: Number(env.IP_LIMIT_PER_HOUR ?? 5),
  dailyLimit: Number(env.DAILY_LIMIT ?? 50),
  duplicateWindowHours: Number(env.DUPLICATE_WINDOW_HOURS ?? 24),
};

// Read once per container; the secret never appears in code, state or logs.
let secret;
const turnstileSecret = async () => {
  secret ??= (
    await ssm.send(
      new GetParameterCommand({ Name: env.TURNSTILE_SECRET_PARAMETER, WithDecryption: true }),
    )
  ).Parameter.Value;
  return secret;
};

const deps = {
  config,
  now: () => Date.now(),
  fetch,
  turnstileSecret,
  async counter(key, ttl) {
    const result = await dynamo.send(
      new UpdateItemCommand({
        TableName: table,
        Key: { pk: { S: key } },
        UpdateExpression: "ADD hits :one SET expires_at = if_not_exists(expires_at, :ttl)",
        ExpressionAttributeValues: { ":one": { N: "1" }, ":ttl": { N: String(ttl) } },
        ReturnValues: "UPDATED_NEW",
      }),
    );
    return Number(result.Attributes.hits.N);
  },
  async claim(key, ttl) {
    try {
      await dynamo.send(
        new PutItemCommand({
          TableName: table,
          Item: { pk: { S: key }, expires_at: { N: String(ttl) } },
          ConditionExpression: "attribute_not_exists(pk)",
        }),
      );
      return true;
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) return false;
      throw error;
    }
  },
  async release(key) {
    await dynamo.send(new DeleteItemCommand({ TableName: table, Key: { pk: { S: key } } }));
  },
  async send(email) {
    await ses.send(
      new SendEmailCommand({
        FromEmailAddress: email.from,
        Destination: { ToAddresses: [email.to] },
        ReplyToAddresses: [email.replyTo],
        Content: {
          Simple: {
            Subject: { Data: email.subject, Charset: "UTF-8" },
            Body: { Text: { Data: email.text, Charset: "UTF-8" } },
          },
        },
      }),
    );
  },
  // Structured logs without personal data (no names, emails, messages or raw IPs).
  log: (event, data) => console.log(JSON.stringify({ event, ...data })),
};

export const handler = (event) => handleContact(event, deps);
