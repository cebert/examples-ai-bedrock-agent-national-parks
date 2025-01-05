# AWS Bedrock Agent National Parks Service Example

This repository demonstrates how we can use AWS Bedrock to create AI Agents that can fetch information on users' behalf. The Agent in this example repo can answer questions about U.S National Parks using a Lambda as its action handler.

This project leverages Amazon Bedrock, Bedrock Action Groups, and AWS Lambda.

AWS Bedrock support model support varies across regions. This project was tested deploying to the *us-east-1* region, which currently has the most robust Bedrock Foundation Model (FM) support. See [Model support by AWS Region in Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/models-regions.html).

## Overview

This project showcases:
- AWS Bedrock Agent integration with an external API, such as the U.S. National Parks Service API
- Using AWS CDK infrastructure as code (IaC) to deploy a Bedrock agent
- TypeScript Lambda function development

## Prerequisites

- Node.js (v22+)
- AWS Account with Bedrock access
  - *Note:* AWS accounts don't have access to FMs by default. You must request access to the model(s) you wish to use and experiment with. The process is easy. In personal accounts, I recommend requesting access to all available FMs at once.
- AWS CLI configured with SSO
- National Parks Service API key ([Get one here](https://www.nps.gov/subjects/developer/get-started.htm))

## Setup

1. Clone the repository:
```bash
git clone https://github.com/cebert/examples-ai-bedrock-agent-national-parks.git
cd examples-ai-bedrock-agent-national-parks
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file or rename the file `.env.example` to `.env` and replace the placeholder environmental variable values with values specific to your account. The `.env` file is excluded from git to prevent unintended secret disclosure. 
```plaintext
NPS_API_KEY=your_api_key_here
AWS_ACCOUNT=your_aws_account_number
AWS_REGION=your_aws_region
```

4. Bootstrap CDK (first time only):
```bash
cdk bootstrap --profile your-aws-profile
```

5. Deploy the stack:
```bash
npm run build
cdk deploy --profile your-aws-profile
```

## Project Structure

```
├── bin/                    # CDK app entry point
│   ├── ai-bedrock-agent-national-parks.ts
├── lib/                    # CDK IaC
│   ├── stacks/             # CDK stacks
|       └── national-parks-api-stack.ts
│   └── constructs/         # Reusable constructs (not currently used)
├── src/
│   ├── clients/            # API clients
│   │   └── nps/           # National Parks Service API client
│   └── functions/         # Lambda functions
│       └── parks/         # Parks info Lambda
└── test/                  # Tests
```

## Features

The Bedrock Agent can:
- Search for parks by state
- Get detailed information about specific parks
- Search parks by keywords
- Provide visitor information like operating hours and entrance fees

## Development

1. **Build the project**:
```bash
npm run build
```

2. **Run linting**:
```bash
npm run lint
```

3. **Deploy changes**:
```bash
cdk deploy --profile your-aws-profile
```

## Testing the Agent

You can test the Agent through:
1. AWS Console Bedrock Playground
2. Direct Lambda invocation
3. AWS SDK integration

Example test query:
"What national parks are in Michigan?"

## Architecture

![Architecture Diagram](architecture.png) - TODO

1. User queries the Bedrock Agent
2. The Agent determines the appropriate action
3. Lambda function is invoked
4. Lambda calls NPS API
5. Response is formatted and returned to the user

## National Parks Service API

This project uses the [National Parks Service API](https://www.nps.gov/subjects/developer/api-documentation.htm). Key endpoints used:
- `/parks` - Get the list of parks
- `/parks/{parkCode}` - Get specific park details

Please review the [NPS API Terms of Service](https://www.nps.gov/subjects/developer/terms-of-service.htm).

## Links
- [Building Effective AI Agents](https://www.anthropic.com/research/building-effective-agents)
	- This Anthropic blog post provides a great introduction to AI Agents and patterns for building agentic software.
- [Bedrock Documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html)
  - Link official AWS Bedrock documentation  
- [NPS API Documentation](https://www.nps.gov/subjects/developer/api-documentation.htm)
  - API Documentation for the free U.S. National Parks Service API.  
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/latest/guide/home.html)

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing
Feel free to fork this repository or use any of the code. I don't plan to actively maintain this example as an Open Source project.
