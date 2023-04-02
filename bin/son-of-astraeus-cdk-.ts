#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {SonOfAstraeusCdkStack} from '../lib/son-of-astraeus-cdk--stack';
import {TwitterCredentials} from '../src/connections/twitter';
require('dotenv').config();

let props = {
  env: {
    account: '456103903859',
    region: 'us-west-2',
  },
  secret: {
    twitterConsumerApiKey: process.env.TWITTER_CONSUMER_API_KEY,
    twitterConsumerApiSecret: process.env.TWITTER_CONSUMER_API_SECRET,
    twitterAccessToken: process.env.TWITTER_ACCESS_TOKEN,
    twitterAccessSecret: process.env.TWITTER_ACCESS_SECRET,
    nasaAccessToken: process.env.NASA_ACCESS_TOKEN,
    openAiOrganization: process.env.OPEN_AI_ORGANIZATION,
    openAiApiKey: process.env.OPEN_AI_API_KEY,
  } as TwitterCredentials,
};

const app = new cdk.App();
new SonOfAstraeusCdkStack(app, 'SonOfAstraeusCdkStack', props);
