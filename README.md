# AWS Bedrock Agent National Parks Service Example

This repository demonstrates the use of Amazon Bedrock to create AI agents that can form tasks on behalf of users. The Agent in this example repo can answer questions about U.S National Parks. This project deploys a working AI Agent that can answer questions about national
parks and calls an actual, publicly exposed API by the U.S National Parks.

This project leverages Amazon Bedrock, Bedrock Action Groups, Amazon CDK, and AWS Lambda and integrates with the U.S. National Parks Service API to serve as a realistic demonstration. This AI agent executes a straightforward task: calling a single API using Amazon Bedrock Actions. It doesn't use advanced agentic AI patterns such as routing, chaining, or parallelization patterns.

AWS Bedrock support model support varies across regions. This project was tested deploying to the `us-east-1` region, which currently has the most robust Bedrock Foundation Model (FM) support. See [Model support by AWS Region in Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/models-regions.html).

## Overview

This project showcases:

- An AWS Bedrock Agent integration with an external API, such as the U.S. National Parks Service API
- Using AWS CDK infrastructure as code (IaC) to deploy a Bedrock agent using the (currently) experimental [AWS Generative AI Constructs Library](https://github.com/awslabs/generative-ai-cdk-constructs)
- TypeScript Lambda function development

## Features

The Bedrock Agent can:

- Search for parks by state
- Get detailed information about specific parks
- Provide visitor information like operating hours and entrance fees

### National Parks Service API

This project uses the [National Parks Service API](https://www.nps.gov/subjects/developer/api-documentation.htm). Key endpoints used:

- `/parks` - Get the list of parks
- `/parks/{parkCode}` - Get specific park details

Please review the [NPS API Terms of Service](https://www.nps.gov/subjects/developer/terms-of-service.htm). You must request a free NPS API key to use this project in your AWS account.

## Project Structure

```plaintext
├── bin/ # CDK entry point
│ ├── national-parks-bedrock-agent-example
├── lib/ # CDK IaC
| ├── schema # Contains an Open API 3.0.1 spec we share with the Action Group
│ ├── stacks/ # CDK stacks
│  ├── bedrock-agent-stack.ts # Deploys a Bedrock Agent, Action Group, and sets up IAM
│  ├── national-parks-api-stack.ts # Deploys Lambda that interacts with NPS API
├── src/
│ ├── clients/ # API clients
│ │ └── nps/ # National Parks Service API client directory
│ └── functions/ # Lambda functions
│ │ └── parks/ # Parks info Lambda
└── test/ # Tests (currently not used)
```

## Using the Bedrock Agent

You can test the Agent through:

- AWS Console Bedrock Playground
- Direct Lambda invocation
- AWS SDK integration

Example test query:

- "What national parks are in Michigan?"

## Architecture

![Architecture Diagram](architecture.png) - TODO

1. User queries the Bedrock Agent
1. The Agent determines the appropriate action group for the request
1. Lambda function is invoked using the API Spec provided to the Action Group
1. Lambda calls the National Parks Service API
1. Response is formatted and returned to the user

## Deployment

This project leverages the experimental [generative-ai-cdk-constructs](https://github.com/awslabs/generative-ai-cdk-constructs) library to
easily configure and deploy AWS Bedrock and Action Groups. Several constructs in this library help make provisioning and deploying generative AI projects. Since this is an experimental library and this space is evolving, rapidly expect this library to change
frequently.

## Setup Steps

### Prerequisites

- Node.js (v22+)
- National Parks Service API key
   - ([Get one here](https://www.nps.gov/subjects/developer/get-started.htm))
- AWS Account with Bedrock access
   - _Note:_ AWS accounts don't have access to FMs by default. You must request access to the model(s) you wish to use and experiment with. The process is easy. In personal accounts, I recommend requesting access to all available FMs at once. As of January 2025, the `us-east-1` supports the most FMs. It's recommended that you run out of that region.
   - This project is currently using ANTHROPIC_CLAUDE_SONNET_V1_0

### Initial Setup

The following steps only need to be performed once for initial setup.

1. Clone the repository:

   ```bash
   git clone https://github.com/cebert/examples-ai-bedrock-agent-national-parks.git
   cd examples-ai-bedrock-agent-national-parks
   ```

1. Install dependencies:

   ```bash
   npm install
   ```

1. Create a `.env` file or rename the file `.env.example` to `.env` and replace the placeholder environmental variable values with values specific to your AWS account. The `.env` file is excluded from git to prevent unintended secret disclosure:

   ```plaintext
   NPS_API_KEY=your_api_key_here
   AWS_ACCOUNT=your_aws_account_number
   AWS_REGION=us-east-1
   ```

1. Using the AWS CLI, configure and authenticate with AWS using your SSO credentials:

   ```bash
   aws configure sso
   ```

1. Follow the prompts to set up your SSO profile (e.g., `bedrock-agent`).

1. The first time you deploy this stack, you'll need to run the following bootstrap command to prepare your AWS environment for CDK use:

   ```bash
   cdk bootstrap aws://<AWS_ACCOUNT_ID>/us-east-1 --profile <SSO_PROFILE_NAME>
   ```

Replace `<AWS_ACCOUNT_ID>` with your AWS account ID and `<SSO_PROFILE_NAME>` with your SSO profile name (e.g., `bedrock-agent`).

### Building and Deploying

1. Build the Project:

   ```bash
   npm run build
   ```

1. Generate the CloudFormation template for your stack:

   ```bash
   npm run synth
   ```

1. Deploy the CDK application to AWS:

   ```bash
      npm run deploy -- --profile <SSO_PROFILE_NAME> --all
   ```

## Links

- [Getting started with Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/getting-started.html)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/latest/guide/home.html)
- [AWS Generative AI Constructs Library](https://github.com/awslabs/generative-ai-cdk-constructs)
- [Bedrock Documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html)
   - Links to official AWS Bedrock documentation
- [Building Effective AI Agents](https://www.anthropic.com/research/building-effective-agents)
   - This Anthropic blog post provides a great introduction to AI Agents and patterns for building agentic software.
- [Defining Bedrock Agent Action Groups](https://docs.aws.amazon.com/bedrock/latest/userguide/agents-action-create.html)
   - Explains how to define an action group, which instructs the agent which actions it can perform on behalf of a user
- [NPS API Documentation](https://www.nps.gov/subjects/developer/api-documentation.htm)
   - API Documentation for the free U.S. National Parks Service API.
- [Anthropic Model comparison table](https://docs.anthropic.com/en/docs/about-claude/models)
- [Telecom Bedrock Agent Example in using CloudFormation](https://github.com/aws-samples/bedrock-agent-and-telecom-apis/blob/main/openAPI-spec/ParcelStatus-API.json)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Feel free to fork this repository or use any of the code. I don't plan to actively maintain this example as an Open Source project.
