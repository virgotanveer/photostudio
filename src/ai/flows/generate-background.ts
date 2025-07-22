// src/ai/flows/generate-background.ts
'use server';
/**
 * @fileOverview A flow that generates a background image based on a text prompt.
 *
 * - generateBackground - A function that generates a background image and returns it as a data URI.
 * - GenerateBackgroundInput - The input type for the generateBackground function.
 * - GenerateBackgroundOutput - The return type for the generateBackground function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBackgroundInputSchema = z.object({
  prompt: z.string().describe('A text prompt describing the desired background image.'),
});

export type GenerateBackgroundInput = z.infer<typeof GenerateBackgroundInputSchema>;

const GenerateBackgroundOutputSchema = z.object({
  backgroundImage: z.string().describe('The generated background image as a data URI.'),
});

export type GenerateBackgroundOutput = z.infer<typeof GenerateBackgroundOutputSchema>;

export async function generateBackground(input: GenerateBackgroundInput): Promise<GenerateBackgroundOutput> {
  return generateBackgroundFlow(input);
}

const generateBackgroundPrompt = ai.definePrompt({
  name: 'generateBackgroundPrompt',
  input: {schema: GenerateBackgroundInputSchema},
  output: {schema: GenerateBackgroundOutputSchema},
  prompt: `Generate a background image based on the following prompt: {{{prompt}}}. Return the image as a data URI.`,
});

const generateBackgroundFlow = ai.defineFlow(
  {
    name: 'generateBackgroundFlow',
    inputSchema: GenerateBackgroundInputSchema,
    outputSchema: GenerateBackgroundOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: input.prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('No image was generated.');
    }

    return {backgroundImage: media.url};
  }
);
