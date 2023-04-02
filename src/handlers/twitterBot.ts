import {Context} from 'aws-lambda';
import {getTwitterCredentials} from '../connections/secretsManager';
import {TwitterClient} from '../connections/twitter';
import {getAstronomyPictureOfTheDay} from './nasaInterface';
import {OpenAIClient} from '../connections/openApi';

export const handler = async (event: any, context: Context): Promise<void> => {
  try {
    const twitterSecretArn = process.env.TWITTER_SECRET_ARN;
    if (!twitterSecretArn) throw new Error('TWITTER_SECRET_ARN environment variable is not set');

    const credentials = await getTwitterCredentials(twitterSecretArn);
    const twitterClient = new TwitterClient(credentials);
    const chatGptClient = new OpenAIClient(credentials);

    const {Apod, image} = await getAstronomyPictureOfTheDay(credentials);

    console.info('Astronomy picture of the day:', Apod);

    const chatGptResponse = await chatGptClient.sendQueryToChatGPT(
      `pretend you are one of many gods of the universe. you are the god of astronomy and the galaxies. you are the son of astreus. you are writing a 140 character summary of ${Apod.title}. this is for a twitter account. for more context, here is the astronomy picture of the day: ${Apod.url}. \n`
    );

    console.info('ChatGPT response:', chatGptResponse);

    const uploadedMediaId = await twitterClient.uploadMedia(image, 'image/jpeg');

    console.info('Uploaded media:', uploadedMediaId);

    console.info('Creating tweet with media...');
    await twitterClient.createTweetWithMedia(
      `${Apod.title} \n ${chatGptResponse}`,
      uploadedMediaId
    );
  } catch (error) {
    console.error('Error occurred while running, see error below:');
    console.error(error);
  }
};
