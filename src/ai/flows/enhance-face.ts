'use server';
/**
 * @fileOverview An AI agent that can enhance the faces in an image.
 *
 * - enhanceFace - A function that handles the face enhancement process.
 * - EnhanceFaceInput - The input type for the enhanceFace function.
 * - EnhanceFaceOutput - The return type for the enhanceFace function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceFaceInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo containing one or more faces, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type EnhanceFaceInput = z.infer<typeof EnhanceFaceInputSchema>;

const EnhanceFaceOutputSchema = z.object({
  enhancedPhotoDataUri: z
    .string()
    .describe(
      'The enhanced photo with improved face appearance, as a data URI that must include a MIME type and use Base64 encoding.'
    ),
});
export type EnhanceFaceOutput = z.infer<typeof EnhanceFaceOutputSchema>;

export async function enhanceFace(input: EnhanceFaceInput): Promise<EnhanceFaceOutput> {
  return enhanceFaceFlow(input);
}


const enhanceFaceFlow = ai.defineFlow(
  {
    name: 'enhanceFaceFlow',
    inputSchema: EnhanceFaceInputSchema,
    outputSchema: EnhanceFaceOutputSchema,
  },
  async (input) => {
     const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {
          text: 'You are an AI-powered photo editor specializing in enhancing faces in images. You will receive a photo as input and enhance the faces in the photo, improving skin texture, lighting, and overall appearance while preserving a natural look. Return the enhanced photo. Do not change the dimensions of the photo.',
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
      throw new Error('Face enhancement failed to return an image.');
    }

    return {
      enhancedPhotoDataUri: media.url,
    };
  }
);
