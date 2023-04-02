import axios from 'axios';
import {TwitterCredentials} from '../connections/twitter';
require('dotenv').config();

type TweetContent = {
  Apod: AstronomyPictureOfTheDay;
  image: Buffer;
};

type AstronomyPictureOfTheDay = {
  copyright: string;
  date: string;
  explanation: string;
  hdurl: string;
  media_type: string;
  service_version: string;
  title: string;
  url: string;
};

export const getAstronomyPictureOfTheDay = async (config: TwitterCredentials) => {
  const params = {
    api_key: config.nasaAccessToken,
  };

  // execute the request to retrieve the astronomy picture of the day

  const response = (await axios.get('https://api.nasa.gov/planetary/apod', {params}))
    .data as AstronomyPictureOfTheDay;

  // download the image
  const image = await downloadImage(response.url);

  return {
    Apod: response,
    image,
  } as TweetContent;
};

const downloadImage = async (url: string): Promise<Buffer> => {
  const response = await axios.get(url, {responseType: 'arraybuffer'});
  return Buffer.from(response.data, 'binary');
};
