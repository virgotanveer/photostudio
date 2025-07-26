'use server';
/**
 * @fileOverview An AI agent that can remove blemishes and wrinkles from faces in an image.
 *
 * - removeBlemishes - A function that handles the blemish removal process.
 * - RemoveBlemishesInput - The input type for the removeBlemishes function.
 * - RemoveBlemishesOutput - The return type for the removeBlemishes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RemoveBlemishesInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo containing one or more faces, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RemoveBlemishesInput = z.infer<typeof RemoveBlemishesInputSchema>;

const RemoveBlemishesOutputSchema = z.object({
  retouchedPhotoDataUri: z
    .string()
    .describe(
      'The retouched photo with blemishes and wrinkles removed, as a data URI that must include a MIME type and use Base64 encoding.'
    ),
});
export type RemoveBlemishesOutput = z.infer<typeof RemoveBlemishesOutputSchema>;

export async function removeBlemishes(input: RemoveBlemishesInput): Promise<RemoveBlemishesOutput> {
  return removeBlemishesFlow(input);
}


const removeBlemishesFlow = ai.defineFlow(
  {
    name: 'removeBlemishesFlow',
    inputSchema: RemoveBlemishesInputSchema,
    outputSchema: RemoveBlemishesOutputSchema,
  },
  async (input) => {
     const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {
          text: 'You are an expert photo retoucher. You will receive a photo and your task is to remove blemishes, wrinkles, and other minor imperfections from the face(s) in the image. The result should look natural and preserve the original character of the person. Do not change the dimensions of the photo.',
        },
        {
          media: {
            url: input.photoDataUri,
          },
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Blemish removal failed to return an image.');
    }

    return {
      retouchedPhotoDataUri: media.url,
    };
  }
);
