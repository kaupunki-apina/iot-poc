import * as lambda from "@aws-cdk/aws-lambda";
import * as ec2 from "@aws-cdk/aws-ec2";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import * as cdk from "@aws-cdk/core";
import * as path from "path";
import { IConfig as IotEventHandlerConfig } from "../lambda/iot-event-handler/config";

interface Props extends cdk.StackProps {
  vpc: ec2.Vpc;
  databaseUrl: string;
}

export class LambdaStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: Props) {
    super(scope, id, props);

    const eventHandlerEnvironment: IotEventHandlerConfig = {
      DATABASE_URL: props.databaseUrl,
    };

    const eventHandler = new NodejsFunction(this, "iot-event-handler", {
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "main",
      entry: path.join(__dirname, `/../lambda/iot-event-handler/index.ts`),
      bundling: {
        minify: true,
        externalModules: ["aws-sdk"],
      },
      environment: eventHandlerEnvironment,
      vpc: props.vpc,
    });
  }
}
