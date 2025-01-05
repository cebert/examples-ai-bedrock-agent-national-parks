import { dirname, join } from "path";
import { fileURLToPath } from "url";

import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodeLambda from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

// lib/stacks/national-parks-api-stack.ts


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface NationalParksApiStackProps extends cdk.StackProps {
  npsApiKey: string;
}

export class NationalParksApiStack extends cdk.Stack {
  public readonly parksFunction: nodeLambda.NodejsFunction;

  constructor(scope: Construct, id: string, props: NationalParksApiStackProps) {
    super(scope, id, props);

    this.parksFunction = new nodeLambda.NodejsFunction(this, 'ParksFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: join(__dirname, '../../src/functions/parks/get-parks-info.ts'),
      handler: 'handler',
      environment: {
        NPS_API_KEY: props.npsApiKey,
        POWERTOOLS_SERVICE_NAME: 'national-parks-service',
        POWERTOOLS_LOGGER_LOG_LEVEL: 'INFO',
      },
      bundling: {
        minify: true,
        sourceMap: true,
        format: nodeLambda.OutputFormat.ESM,
        target: 'node22',
        esbuildArgs: {
          '--format=esm': true
        }
      },
    });
  }
}
