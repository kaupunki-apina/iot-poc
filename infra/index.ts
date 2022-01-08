import * as cdk from "@aws-cdk/core";
import { z } from "zod";
import { VpcStack } from "./vpc-stack";
import { DbStack } from "./db-stack";
import { LambdaStack } from "./lambda-stack";

const configSchema = z.object({
  CDK_DEFAULT_REGION: z.string(),
  CDK_DEFAULT_ACCOUNT: z.string(),
  CDK_REGION: z.string().optional(),
  CDK_ACCOUNT: z.string().optional(),
});

const config = configSchema.parse(process.env);

const app = new cdk.App();

const vpcStack = new VpcStack(app, "iot-poc-vpc-stack", {
  env: {
    region: config.CDK_REGION ?? config.CDK_DEFAULT_REGION,
    account: config.CDK_ACCOUNT ?? config.CDK_DEFAULT_ACCOUNT,
  },
});

const dbStack = new DbStack(app, "iot-poc-db-stack", {
  vpc: vpcStack.vpc,
  env: {
    region: config.CDK_REGION ?? config.CDK_DEFAULT_REGION,
    account: config.CDK_ACCOUNT ?? config.CDK_DEFAULT_ACCOUNT,
  },
});

const lambdaStack = new LambdaStack(app, "iot-poc-lambda-stack", {
  vpc: vpcStack.vpc,
  databaseUrl: dbStack.databaseUrl,
  env: {
    region: config.CDK_REGION ?? config.CDK_DEFAULT_REGION,
    account: config.CDK_ACCOUNT ?? config.CDK_DEFAULT_ACCOUNT,
  },
});
