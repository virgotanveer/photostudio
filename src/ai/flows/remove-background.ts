'use server';
/**
 * @fileOverview An AI agent that removes the background from an image using the remove.bg API.
 *
 * - removeBackground - A function that handles the background removal process.
 * - RemoveBackgroundInput - The input type for the removeBackground function.
 * - RemoveBackgroundOutput - The return type for the removeBackground function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import axios from 'axios';
import FormData from 'form-data';

// Define input and output schemas
const RemoveBackgroundInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    )
    .refine(
      (value) => /^data:image\/(png|jpeg|jpg);base64,[A-Za-z0-9+/=]+$/.test(value),
      {
        message: 'Invalid data URI format. Must be a valid image (PNG/JPEG) with base64 encoding.',
      }
    ),
});
export type RemoveBackgroundInput = z.infer<typeof RemoveBackgroundInputSchema>;

const RemoveBackgroundOutputSchema = z.object({
  photoWithBackgroundRemovedDataUri: z
    .string()
    .describe(
      'The photo with the background removed, as a data URI that must include a MIME type and use Base64 encoding. The background is transparent, and the subject is preserved.'
    ),
});
export type RemoveBackgroundOutput = z.infer<typeof RemoveBackgroundOutputSchema>;

/**
 * Removes the background from an image using the remove.bg API.
 * @param input - Object containing the photo as a data URI.
 * @returns A promise resolving to the processed image as a data URI.
 * @throws Error if the API key is missing, the input is invalid, or the API request fails.
 */
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
    // Validate environment variable
    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      throw new Error('REMOVE_BG_API_KEY is not set in environment variables.');
    }

    // Extract base64 string from data URI
    const { photoDataUri } = input;
    const base64Match = photoDataUri.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
    if (!base64Match) {
      throw new Error('Invalid data URI format. Must include valid MIME type and base64 data.');
    }
    const base64Image = base64Match[2]; // Extract base64 data without prefix

    try {
      const formData = new FormData();
      formData.append('image_file_b64', base64Image);
      formData.append('size', 'auto');

      console.log('Sending request to remove.bg API...');
      const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
        headers: {
          ...formData.getHeaders(),
          'X-Api-Key': apiKey,
        },
        responseType: 'arraybuffer',
        timeout: 30000, // 30-second timeout
      });

      console.log('Received response from remove.bg API');
      const resultBase64 = Buffer.from(response.data, 'binary').toString('base64');
      return {
        photoWithBackgroundRemovedDataUri: `data:image/png;base64,${resultBase64}`,
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.errors?.[0]?.title ||
        error.message ||
        'Failed to remove background';
      console.error('Background removal error:', errorMessage);
      throw new Error(`Background removal failed: ${errorMessage}`);
    }
  }
);
