import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

export const main = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  return {
    statusCode: 200,
    body: `Hello world`,
  };
};
