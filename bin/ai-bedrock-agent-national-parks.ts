import * as cdk from "aws-cdk-lib";
import { config } from "dotenv";

import { NationalParksApiStack } from "@lib/stacks/national-parks-api-stack.js";

config();

if (!process.env.NPS_API_KEY) {
  throw new Error('NPS_API_KEY environment variable is required');
}

if (!process.env.AWS_ACCOUNT) {
  throw new Error('AWS_ACCOUNT environment variable is required');
}

if (!process.env.AWS_REGION) {
  throw new Error('AWS_REGION environment variable is required');
}

const app = new cdk.App();

new NationalParksApiStack(app, 'NationalParksApiStack', {
  env: {
    account: process.env.AWS_ACCOUNT,
    region: process.env.AWS_REGION
  },
  npsApiKey: process.env.NPS_API_KEY,

  tags: {
    Project: 'bedrock-examples-national-parks-service',
    Environment: process.env.ENVIRONMENT || 'dev',
    ManagedBy: 'cdk'
  },
  description: 'Bedrock Agent Example with National Parks Service'
});

app.synth();
