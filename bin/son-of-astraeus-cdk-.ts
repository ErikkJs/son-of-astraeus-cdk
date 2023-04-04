import * as cdk from 'aws-cdk-lib';
import {SonOfAstraeusCdkStack} from '../lib/son-of-astraeus-cdk--stack';
import {CdkPipelineStack} from '../lib/pipeline-stack';
import {BuildSpec} from 'aws-cdk-lib/aws-codebuild';
require('dotenv').config();

async function main() {
  // Define the CDK app
  const app = new cdk.App();

  // Define the pipeline stack with the required Git properties
  new CdkPipelineStack(app, 'SonOfAstraeusCdkPipeline', {
    pipeline: {
      projectName: 'SonOfAstraeusCdkPipeline',
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: ['npm install -g aws-cdk'],
          },
          build: {
            commands: ['npm install', 'npm run build', 'cdk synth'],
          },
        },
        artifacts: {
          'base-directory': 'cdk.out',
          files: ['SonOfAstraeusCdkStack.template.json'],
        },
      }),
      stackName: 'SonOfAstraeusCdkStack',
      stackParameters: {
        // Define stack parameters
      },
    },
    GitProperties: {
      owner: process.env.GITHUB_OWNER || '',
      repo: process.env.GITHUB_REPO || '',
      oauthToken: process.env.GITHUB_TOKEN || '',
      branch: process.env.GITHUB_BRANCH || 'main',
    },
  });

  // Define the application stack with the required environment variables
  const props = {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION || 'us-west-2',
    },
    secret: {
      twitterConsumerApiKey: process.env.TWITTER_CONSUMER_API_KEY || '',
      twitterConsumerApiSecret: process.env.TWITTER_CONSUMER_API_SECRET || '',
      twitterAccessToken: process.env.TWITTER_ACCESS_TOKEN || '',
      twitterAccessSecret: process.env.TWITTER_ACCESS_SECRET || '',
      nasaAccessToken: process.env.NASA_ACCESS_TOKEN || '',
      openAiOrganization: process.env.OPEN_AI_ORGANIZATION || '',
      openAiApiKey: process.env.OPEN_AI_API_KEY || '',
    },
  };
  new SonOfAstraeusCdkStack(app, 'SonOfAstraeusCdkStack', props);

  // Synthesize the CDK app
  app.synth();
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
