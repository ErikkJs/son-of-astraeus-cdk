import {Configuration, OpenAIApi} from 'openai';
import {TwitterCredentials} from './twitter';

export class OpenAIClient {
  private client: OpenAIApi;
  constructor(config: TwitterCredentials) {
    const configuration = new Configuration({
      organization: config.openAiOrganization,
      apiKey: config.openAiApiKey,
    });
    this.client = new OpenAIApi(configuration);
  }
  public async sendQueryToChatGPT(query: string): Promise<string> {
    try {
      const response = await this.client.createCompletion({
        model: 'text-davinci-003',
        prompt: query,
        max_tokens: 120,
      });

      if (response.data) {
        console.log('choices: ', response.data.choices);
      }

      return response.data.choices[0].text as string;
    } catch (error) {
      console.error('Error sending query to ChatGPT:', error);
      throw new Error(`Error sending query to ChatGPT: ${error}`);
    }
  }
}
