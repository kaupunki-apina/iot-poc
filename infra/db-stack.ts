import * as rds from "@aws-cdk/aws-rds";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as cdk from "@aws-cdk/core";
import * as secretsmanager from "@aws-cdk/aws-secretsmanager";
import { postgresUrl } from "./templates";

interface Props extends cdk.StackProps {
  vpc: ec2.Vpc;
}

export class DbStack extends cdk.Stack {
  databaseUrl: string;
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;

  constructor(scope: cdk.App, id: string, props: Props) {
    super(scope, id, props);

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
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    });

    database.connections.allowFromAnyIpv4(ec2.Port.tcp(5432));

    this.user = dbUser.secretValueFromJson("username")?.toString();
    this.password = dbUser.secretValueFromJson("password")?.toString();
    this.host = database.instanceEndpoint.hostname;
    this.port = database.dbInstanceEndpointPort;
    this.database = databaseName;
    this.databaseUrl = postgresUrl({
      user: dbUser.secretValueFromJson("username")?.toString(),
      pass: dbUser.secretValueFromJson("password")?.toString(),
      host: database.instanceEndpoint.hostname,
      port: database.dbInstanceEndpointPort,
      db: databaseName,
    });
  }
}
