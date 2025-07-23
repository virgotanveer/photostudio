'use server';
/**
 * @fileOverview An AI agent that can remove the background from an image.
 *
 * - removeBackground - A function that handles the background removal process.
 * - RemoveBackgroundInput - The input type for the removeBackground function.
 * - RemoveBackgroundOutput - The return type for the removeBackground function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RemoveBackgroundInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RemoveBackgroundInput = z.infer<typeof RemoveBackgroundInputSchema>;

const RemoveBackgroundOutputSchema = z.object({
  photoWithBackgroundRemovedDataUri: z
    .string()
    .describe(
      'The photo with the background removed, as a data URI that must include a MIME type and use Base64 encoding. The background should be transparent.'
    ),
});
export type RemoveBackgroundOutput = z.infer<
  typeof RemoveBackgroundOutputSchema
>;

export async function removeBackground(
  input: RemoveBackgroundInput
): Promise<RemoveBackgroundOutput> {
  return removeBackgroundFlow(input);
}

const removeBackgroundFlow = ai.defineFlow(
  {
    name: 'removeBackgroundFlow',
    inputSchema: RemoveBackgroundInputSchema,
    outputSchema: RemoveBackgroundOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {
          text: `You are an AI-powered photo editor specializing in background removal.

You will receive a photo as input and your task is to remove the background, leaving only the main subject. The output image must have a transparent background.

Make sure the output is still a valid data URI, of the same type as the input (preferably PNG to support transparency).`,
        },
        { media: { url: input.photoDataUri } },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('No image was returned from the background removal service.');
    }

    return {
      photoWithBackgroundRemovedDataUri: media.url,
    };
  }
);
