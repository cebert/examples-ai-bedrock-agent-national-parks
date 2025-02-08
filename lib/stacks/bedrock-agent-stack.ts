import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import parksApiSchema from "../schema/parks-api-schema.json";
import { bedrock } from "@cdklabs/generative-ai-cdk-constructs";
import { Construct } from "constructs";

import {
   AgentActionGroup,
   ApiSchema,
} from '@cdklabs/generative-ai-cdk-constructs/lib/cdk-lib/bedrock';

/**
 * Properties for configuring the BedrockAgentStack.
 * @interface BedrockAgentStackProps
 * @extends cdk.StackProps
 * @property {string} agentName - The unique name for the Bedrock agent.
 * @property {bedrock.BedrockFoundationModel} foundationModel - The foundation model to be used by the Bedrock agent.
 * @property {string} getNationalParksInfoApiFunctionArn - ARN of the Lambda function handling National Parks info requests.
 * @property {string} agentInstruction - Basic prompt instructions for the agent
 * @property {{ [key: string]: string }} [tags] - Optional tags to associate with the stack's resources.
 */
interface BedrockAgentStackProps extends cdk.StackProps {
   agentName: string;
   foundationModel: bedrock.BedrockFoundationModel;
   getNationalParksInfoApiFunctionArn: string;
   agentInstruction: string;
   tags?: { [key: string]: string };
}

/**
 * Creates a stack for a Bedrock Agent which determines the correct Action Group to utilize
 * when processing requests from clients.
 */
export class BedrockAgentStack extends cdk.Stack {
   /**
    * The Bedrock agent created by this stack.
    */
   public readonly bedrockAgent: bedrock.Agent;

   /**
    * The action group responsible for handling park information requests.
    */
   public readonly parkInfoActionGroup: AgentActionGroup;

   /**
    * Constructs a new instance of the BedrockAgentStack.
    *
    * This stack provisions a Bedrock agent, action groups, and related resources for
    * processing client requests using Amazon Bedrock.
    *
    * @param scope - The parent Construct, typically an app or another stack.
    * @param id - The unique identifier for this stack within the scope.
    * @param props - The configuration properties for this stack.
    */
   constructor(scope: Construct, id: string, props: BedrockAgentStackProps) {
      super(scope, id, props);

      const agentExecutionRole = new iam.Role(this, 'AgentExecutionRole', {
         assumedBy: new iam.ServicePrincipal('bedrock.amazonaws.com'),
         description: 'Execution role for the National Parks Bedrock AI Agent',
         roleName: `${cdk.Stack.of(this).stackName}-agent-execution-role`,
      });

      agentExecutionRole.addToPolicy(
         new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['bedrock:InvokeModel', 'bedrock:InvokeAgent'],
            // We could make this permission more restrictive so only certain models could be invoked
            // since this is non-production, making this * makes it easier to experiment with
            resources: ['*'],
         }),
      );

      agentExecutionRole.addToPolicy(
         new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
               'logs:CreateLogGroup',
               'logs:CreateLogStream',
               'logs:PutLogEvents',
            ],
            resources: ['arn:aws:logs:*:*:*'],
         }),
      );

      const getNationalParksInfoApiFunction =
         lambda.Function.fromFunctionAttributes(
            this,
            'GetNationalParksInfoApiFunctionArn',
            {
               functionArn: props.getNationalParksInfoApiFunctionArn,
               sameEnvironment: true,
            },
         );

      getNationalParksInfoApiFunction.grantInvoke(agentExecutionRole);

      this.bedrockAgent = new bedrock.Agent(this, 'Agent', {
         name: props.agentName,
         description: 'The Bedrock Agent for US National Parks information',
         foundationModel: props.foundationModel,
         instruction: props.agentInstruction,

         idleSessionTTL: cdk.Duration.minutes(30),
         enableUserInput: true,
         shouldPrepareAgent: true,
         existingRole: agentExecutionRole,
      });

      // create the action group for interacting with the National Parks info lambda
      this.parkInfoActionGroup = new AgentActionGroup(
         this,
         'ParkInfoActionGroup',
         {
            actionGroupName: 'national-parks-info-action-group',
            description:
               'Action group for retrieving National Parks information',
            actionGroupExecutor: {
               lambda: getNationalParksInfoApiFunction,
            },
            actionGroupState: 'ENABLED',
            // refer to https://docs.aws.amazon.com/bedrock/latest/userguide/agents-api-schema.html
            // to se requirements on Action Group schemas paths, method, description, operationId,
            // and responses are minimally required
            apiSchema: ApiSchema.fromInline(JSON.stringify(parksApiSchema)),
         },
      );

      this.bedrockAgent.addActionGroups([this.parkInfoActionGroup]);

      if (props.tags) {
         Object.entries(props.tags).forEach(([key, value]) => {
            cdk.Tags.of(this.bedrockAgent).add(key, value);
            cdk.Tags.of(this.parkInfoActionGroup).add(key, value);
         });
      }

      new cdk.CfnOutput(this, 'AgentId', { value: this.bedrockAgent.agentId });
      new cdk.CfnOutput(this, 'AgentExecutionRoleId', {
         value: agentExecutionRole.roleId,
      });
   }
}
