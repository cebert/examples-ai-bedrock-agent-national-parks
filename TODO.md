# Project TODO List

- Improve formatting of AI responses with better prompt instructions
- Add rate limiting to prevent excessive API usage.
- Enhance prompt customization options to allow more flexibility in configurations (the current setup is basic).
- Add guardrails to prevent abuse and ensure secure usage of the system.
- Consider adding a dashboard to monitor Amazon Bedrock model usage (see [AWS Bedrock CW Dashboard](https://github.com/awslabs/generative-ai-cdk-constructs/blob/main/src/patterns/gen-ai/aws-bedrock-cw-dashboard/README.md)).
- Develop a front-end application accessible outside the AWS Console for better user experience.
- Consider creating a generic CDK construct for deploying AI agents to streamline deployments.
- Add unit tests to improve code quality and reliability (skipped initially since this isn't a production app).
- Consider making a reusable Bedrock Agent construct in the future
