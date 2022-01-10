# iot-poc

## Get started 

### Prerequisites
- [nodeJs & npm installed](https://docs.npmjs.com/cli/v8/configuring-npm/install)
- AWS account
- [AWS CLI installed](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

### Running locally
// TODO
### Deploy to AWS
```bash
npm run cdk:bootstrap # Bootstrap required only before first deploy
npm run cdk:deploy
```

### Destroy resources
```bash
npm run cdk:destroy # Destroys all AWS resources created by this project
```

## Architecture
![architecture](assets/architecture.svg)