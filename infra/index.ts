import * as cdk from "@aws-cdk/core";
import { z } from "zod";
import { Stack } from "./stack";

const configSchema = z.object({
  CDK_DEFAULT_REGION: z.string(),
  CDK_DEFAULT_ACCOUNT: z.string(),
  CDK_REGION: z.string().optional(),
  CDK_ACCOUNT: z.string().optional(),
});

const config = configSchema.parse(process.env);

const app = new cdk.App();
new Stack(app, "iot-poc-stack", {
  stackName: "iot-poc-stack",
  env: {
    region: config.CDK_REGION ?? config.CDK_DEFAULT_REGION,
    account: config.CDK_ACCOUNT ?? config.CDK_DEFAULT_ACCOUNT,
  },
});
