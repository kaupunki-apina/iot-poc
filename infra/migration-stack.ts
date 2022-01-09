import * as path from "path";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as cdk from "@aws-cdk/core";
import * as ecs from "@aws-cdk/aws-ecs";
import * as logs from "@aws-cdk/aws-logs";
import * as tasks from "@aws-cdk/aws-stepfunctions-tasks";
import * as sfn from "@aws-cdk/aws-stepfunctions";
import { DockerImageAsset } from "@aws-cdk/aws-ecr-assets";

interface Props extends cdk.StackProps {
  vpc: ec2.Vpc;
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
}

export class MigrationStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: Props) {
    super(scope, id, props);

    const cluster = new ecs.Cluster(this, "Ec2Cluster", { vpc: props.vpc });
    cluster.addCapacity("DefaultAutoScalingGroup", {
      instanceType: new ec2.InstanceType("t3.micro"),
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      machineImage: ecs.EcsOptimizedImage.amazonLinux(),
    });

    const migrationTaskDefinition = new ecs.FargateTaskDefinition(
      this,
      `iot-poc-migration-definition`,
      {
        memoryLimitMiB: 512,
        cpu: 256,
      }
    );

    const migrationImage = new DockerImageAsset(this, "migration-image", {
      directory: path.join(__dirname, "../migrations"),
    });

    const migrationContainer = migrationTaskDefinition.addContainer(
      "MigrationContainer",
      {
        image: ecs.ContainerImage.fromDockerImageAsset(migrationImage),
        environment: {
          FLYWAY_URL: `jdbc:postgresql://${props.host}:${props.port}/${props.database}?sslmode=require`,
          FLYWAY_USER: props.user,
          FLYWAY_PASSWORD: props.password,
        },
        memoryLimitMiB: 512,
        logging: ecs.LogDrivers.awsLogs({
          streamPrefix: "Migration logs",
          logRetention: logs.RetentionDays.ONE_WEEK,
        }),
      }
    );
    migrationContainer.addPortMappings({
      containerPort: 8000,
    });

    const runTask = new tasks.EcsRunTask(this, "Run migrations", {
      integrationPattern: sfn.IntegrationPattern.RUN_JOB,
      cluster,
      taskDefinition: migrationTaskDefinition,
      launchTarget: new tasks.EcsFargateLaunchTarget(),
    });
  }
}
