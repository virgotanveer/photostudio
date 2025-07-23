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
      'The photo with the background removed, as a data URI that must include a MIME type and use Base64 encoding. The background should be transparent and the subject should be preserved.'
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

const removeBackgroundPrompt = ai.definePrompt({
  name: 'removeBackgroundPrompt',
  input: { schema: RemoveBackgroundInputSchema },
  output: { schema: RemoveBackgroundOutputSchema },
  prompt: `You are an expert at removing the background from a photo.
  
You will receive a photo as input.
Your task is to remove the background from the image, preserving the person's head, hair, neck, and shoulders.
The resulting image should have a transparent background.
Make sure the output is still a valid data URI, of the same type as the input.

Input Photo: {{media url=photoDataUri}}`
});


const removeBackgroundFlow = ai.defineFlow(
  {
    name: 'removeBackgroundFlow',
    inputSchema: RemoveBackgroundInputSchema,
    outputSchema: RemoveBackgroundOutputSchema,
  },
  async (input) => {
    const { output } = await removeBackgroundPrompt(input);

    if (!output?.photoWithBackgroundRemovedDataUri) {
      throw new Error('No image was returned from the background removal service.');
    }

    return {
      photoWithBackgroundRemovedDataUri: output.photoWithBackgroundRemovedDataUri,
    };
  }
);
