import { AxiosError } from 'axios';
import { Configuration, OpenAIApi } from 'openai';

const ACCESS_KEY = import.meta.env.VITE_OPENAI_API_KEY as string

export const getImages = async (query: string) => {
  const configuration = new Configuration({
      apiKey: ACCESS_KEY,
  });
  try {
      const openai = new OpenAIApi(configuration);
      const response = await openai.createImage({
          prompt: query,
          n: 8,
          size: "1024x1024",
      });
      // console.log('result', response.data);
      return response.data.data;
  } catch (error) {
      throw new Error((error as AxiosError).message)
  }
}