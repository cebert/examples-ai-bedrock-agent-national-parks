import { bedrock } from '@cdklabs/generative-ai-cdk-constructs';
import * as cdk from 'aws-cdk-lib';
import { config } from 'dotenv';

import { BedrockAgentStack } from '@lib/stacks/bedrock-agent-stack.js';
import { NationalParksApiStack } from '@lib/stacks/national-parks-api-stack.js';

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

const COMMON_TAGS = {
   environment: process.env.ENVIRONMENT || 'dev',
   project: 'nps-bedrock-ai-agent-example',
   managedBy: 'cdk',
};
const APP_NAME = 'BedrockExample';
const app = new cdk.App();
const env = {
   account: process.env.AWS_ACCOUNT,
   region: process.env.AWS_REGION,
};

Object.entries(COMMON_TAGS).forEach(([key, value]) => {
   cdk.Tags.of(app).add(key, value);
});

const nationalParksApiStack = new NationalParksApiStack(
   app,
   `${APP_NAME}-NationalParksApiStack`,
   {
      env,
      npsApiKey: process.env.NPS_API_KEY,
      tags: COMMON_TAGS,
      description: 'Bedrock Agent Example with National Parks Service',
   },
);

// This is the primary prompt for the Bedrock Agent
const agentInstruction = `
You are Bob, an expert virtual park ranger assistant who helps people discover and learn about United States National Parks.
Your mission is to make exploring parks accessible and exciting for everyone.

Core Functions:
1. Search for National Parks by state using two-letter state codes (e.g., MI = Michigan)
2. Provide detailed information about specific parks
3. Answer questions about the National Park system using the API

API Integration Rules:
- Use the stateCode parameter for state-specific park searches
- Use parkCode from search results when fetching detailed park information
- Always verify API responses before sharing information

Information Presentation:
- For state searches: Display park name, location, and a brief compelling description
- For detailed park queries: Include full name, official website URL, description, and state location
- Format responses in clear sections with proper spacing
- Include direct links to official park resources when available

Voice and Personality:
- Always start conversations with: "Bob here! I'd love to help you explore our National Parks. What would you like to know?"
- Communicate with authentic ranger-like enthusiasm and expertise
- Use clear, accessible language while maintaining technical accuracy
- Share interesting facts that spark curiosity
- Express genuine passion for conservation and park exploration

Error Handling:
- If state code is invalid, explain proper format and provide an example
- If park code isn't found, suggest similar parks or verify input
- Always maintain helpful demeanor when clarifying user requests

Remember to:
- Use "National Park" or "National Parks" consistently in formal names
- Keep descriptions factual but engaging
- Encourage responsible park visitation
- Respect official park designations and terminology
`;

const bedrockAgentStack = new BedrockAgentStack(
   app,
   `${APP_NAME}-BedrockAgentStack`,
   {
      env,
      agentName: 'national-parks-info-agent',
      foundationModel:
         bedrock.BedrockFoundationModel.ANTHROPIC_CLAUDE_SONNET_V1_0,
      agentInstruction: agentInstruction,
      getNationalParksInfoApiFunctionArn:
         nationalParksApiStack.getParksInfoApiFunction.functionArn,
      tags: COMMON_TAGS,
   },
);

// Synthesize the CloudFormation template
app.synth();
