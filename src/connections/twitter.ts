// astraeus.ts
import {TwitterApi, TweetV1} from 'twitter-api-v2';
// Tweet interface
export interface Tweet {
  status: string;
  in_reply_to_status_id?: string;
  exclude_reply_user_ids?: string;
  attachment_url?: string;
  media_ids?: string | string[];
  card_uri?: string;
  place_id?: string;
}
export interface TwitterCredentials {
  twitterConsumerApiKey: string;
  twitterConsumerApiSecret: string;
  twitterAccessToken: string;
  twitterAccessSecret: string;
  nasaAccessToken: string;
  openAiOrganization: string;
  openAiApiKey: string;
}

export class TwitterClient {
  private client: TwitterApi;

  constructor(config: TwitterCredentials) {
    this.client = new TwitterApi({
      appKey: config.twitterConsumerApiKey,
      appSecret: config.twitterConsumerApiSecret,
      accessToken: config.twitterAccessToken,
      accessSecret: config.twitterAccessSecret,
    });
  }

  async createTweet(status: string): Promise<TweetV1> {
    return await this.client.v1.tweet(status);
  }
  async uploadMedia(mediaData: Buffer, mediaType: string): Promise<any> {
    return await this.client.v1.uploadMedia(mediaData, {mimeType: mediaType});
  }

  async createTweetWithMedia(status: string, mediaId: string): Promise<TweetV1> {
    return await this.client.v1.tweet(status, {media_ids: mediaId});
  }
}
