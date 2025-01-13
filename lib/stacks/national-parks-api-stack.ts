import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import { Duration, Tags } from 'aws-cdk-lib';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Properties for configuring the NationalParksApiStack.
 * @interface NationalParksApiStackProps
 * @extends cdk.StackProps
 * @property {string} npsApiKey - API key for accessing the US National Parks API. You will need to request one of these for yourself.
 * @property {{ [key: string]: string }} [tags] - Optional tags to apply to resources created by this stack.
 */
interface NationalParksApiStackProps extends cdk.StackProps {
   npsApiKey: string;
   tags?: { [key: string]: string };
}

/**
 * Creates a stack that provisions Lambda resources for interacting with the US National Parks API.
 *
 * This stack defines a Lambda function that integrates with the National Parks API, allowing
 * the Bedrock Agent to search for parks in a given state or return detailed information for a given park
 */
export class NationalParksApiStack extends cdk.Stack {
   /**
    * Lambda function for getting national parks information.
    */
   public readonly getParksInfoApiFunction: nodeLambda.NodejsFunction;

   /**
    * Constructs a new instance of the NationalParksApiStack.
    *
    * @param scope - The parent construct, usually an app or another stack.
    * @param id - The unique identifier for this stack within the scope.
    * @param props - The configuration properties for this stack.
    */
   constructor(
      scope: Construct,
      id: string,
      props: NationalParksApiStackProps,
   ) {
      super(scope, id, props);

      if (!props.npsApiKey) {
         throw new Error('The NPS API Key (npsApiKey) is required.');
      }

      /**
       * Defines the Lambda function that facilitates requests to the US National Parks API.
       */
      this.getParksInfoApiFunction = new nodeLambda.NodejsFunction(
         this,
         'GetNationalParksInfoFunction',
         {
            architecture: lambda.Architecture.ARM_64,
            runtime: lambda.Runtime.NODEJS_22_X,
            memorySize: 2048,
            timeout: Duration.seconds(60),
            // Since this isn't a production app, we don't need to store logs long term
            logRetention: RetentionDays.THREE_DAYS,
            functionName: `${cdk.Stack.of(this).stackName}-get-national-park-info`,
            description:
               'Lambda function that facilitates requesting park information from the US National Parks API',
            entry: join(
               __dirname,
               '../../src/functions/parks/parks-info-handler.ts',
            ),
            handler: 'handler',
            environment: {
               // NOTE: this API key isn't super sensitive, but we could consider storing this in secrets manager
               NPS_API_KEY: props.npsApiKey,
               POWERTOOLS_LOGGER_LOG_EVENT: 'true',
               POWERTOOLS_LOGGER_LOG_LEVEL: 'TRACE',
               POWERTOOLS_LOGGER_SAMPLE_RATE: '1',
               POWERTOOLS_SERVICE_NAME: 'national-parks-service',
            },
            bundling: {
               sourceMap: true,
               format: nodeLambda.OutputFormat.ESM,
               environment: { NODE_ENV: 'production' },
               externalModules: ['aws-sdk'],
            },
            currentVersionOptions: {
               removalPolicy: cdk.RemovalPolicy.DESTROY,
               retryAttempts: 1,
            },
         },
      );

      if (props.tags) {
         for (const [key, value] of Object.entries(props.tags)) {
            Tags.of(this.getParksInfoApiFunction).add(key, value);
         }
      }
   }
}
