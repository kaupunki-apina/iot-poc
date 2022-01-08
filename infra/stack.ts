import * as lambda from "@aws-cdk/aws-lambda";
import * as rds from "@aws-cdk/aws-rds";
import * as ec2 from "@aws-cdk/aws-ec2";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import * as cdk from "@aws-cdk/core";
import * as secretsmanager from "@aws-cdk/aws-secretsmanager";
import * as path from "path";
import { postgresUrl } from "./templates";
import { IConfig as IotEventHandlerConfig } from "../lambda/iot-event-handler/config";

export class Stack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "VPC");

    const databaseName = "postgres";
    const dbUser = new secretsmanager.Secret(this, "database-credentials", {
      generateSecretString: {
        excludePunctuation: true,
        excludeCharacters: "(\" %+~`#$&()|[]{}:;<>?!'/)*",
        secretStringTemplate: JSON.stringify({ username: "postgres" }),
        generateStringKey: "password",
      },
    });

    const databaseCredentials = rds.Credentials.fromSecret(dbUser);
    const database = new rds.DatabaseInstance(this, "iot-event-db", {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_12_3,
      }),
      credentials: databaseCredentials,
      databaseName,
      vpc,
    });

    database.dbInstanceEndpointPort;

    const eventHandlerEnvironment: IotEventHandlerConfig = {
      DATABASE_URL: postgresUrl({
        user: dbUser.secretValueFromJson("username")?.toString(),
        pass: dbUser.secretValueFromJson("password")?.toString(),
        host: database.instanceEndpoint.hostname,
        port: database.dbInstanceEndpointPort,
        db: databaseName,
      }),
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
      vpc,
    });
  }
}
