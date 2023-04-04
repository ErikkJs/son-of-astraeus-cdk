import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import {NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs';
import {TwitterCredentials} from '../src/connections/twitter';

interface SonOfAstraeusCdkStackProps extends cdk.StackProps {
  env: {
    account?: string;
    region?: string;
  };
  secret: TwitterCredentials;
}
export class SonOfAstraeusCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: SonOfAstraeusCdkStackProps) {
    super(scope, id, props);

    // Create a Secrets Manager secret for storing Twitter API keys and access tokens
    const twitterSecret = new secretsmanager.Secret(this, 'TwitterSecret', {
      secretName: 'twitter-api-keys',
      description: 'Twitter API keys and access tokens, for son... of astreus',
      generateSecretString: {
        secretStringTemplate: JSON.stringify(props?.secret),
        excludePunctuation: true,
        includeSpace: false,
      },
    });

    // Create an AWS Lambda function for the Twitter bot
    const twitterBotFunction = new NodejsFunction(this, 'TwitterBotFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      entry: 'src/handlers/twitterBot.ts',
      timeout: cdk.Duration.seconds(500),
      environment: {
        TWITTER_SECRET_ARN: twitterSecret.secretArn,
      },
    });

    // Grant the Lambda function permission to access the Twitter API keys secret
    twitterSecret.grantRead(twitterBotFunction);

    // Set up the Amazon EventBridge rule to trigger the Lambda function
    const eventRule = new events.Rule(this, 'TwitterBotEventRule', {
      schedule: events.Schedule.cron({minute: '0', hour: '6'}), // 6:00 AM UTC
    });

    // Add the Lambda function as a target for the EventBridge rule
    eventRule.addTarget(new targets.LambdaFunction(twitterBotFunction));
  }
}
