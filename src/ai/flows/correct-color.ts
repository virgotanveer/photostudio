'use server';
/**
 * @fileOverview An AI agent that can correct the color of an image.
 *
 * - correctColor - A function that handles the color correction process.
 * - CorrectColorInput - The input type for the correctColor function.
 * - CorrectColorOutput - The return type for the correctColor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CorrectColorInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type CorrectColorInput = z.infer<typeof CorrectColorInputSchema>;

const CorrectColorOutputSchema = z.object({
  correctedPhotoDataUri: z
    .string()
    .describe(
      'The color-corrected photo, as a data URI that must include a MIME type and use Base64 encoding.'
    ),
});
export type CorrectColorOutput = z.infer<typeof CorrectColorOutputSchema>;

export async function correctColor(input: CorrectColorInput): Promise<CorrectColorOutput> {
  return correctColorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'correctColorPrompt',
  input: {schema: CorrectColorInputSchema},
  output: {schema: CorrectColorOutputSchema},
  prompt: `You are an AI-powered photo editor specializing in color correction.

You will receive a photo as input and correct its colors to be more vibrant and balanced, while preserving a natural look.

Make sure the output is still a valid data URI, of the same type as the input.

Input Photo: {{media url=photoDataUri}}

Corrected Photo:`,
});

const correctColorFlow = ai.defineFlow(
  {
    name: 'correctColorFlow',
    inputSchema: CorrectColorInputSchema,
    outputSchema: CorrectColorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      correctedPhotoDataUri: output!.correctedPhotoDataUri,
    };
  }
);
