// Enhance the faces in portrait photos with AI, improving skin texture, lighting, and overall appearance.
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

const prompt = ai.definePrompt({
  name: 'enhanceFacePrompt',
  input: {schema: EnhanceFaceInputSchema},
  output: {schema: EnhanceFaceOutputSchema},
  prompt: `You are an AI-powered photo editor specializing in enhancing faces in images.

You will receive a photo as input and enhance the faces in the photo, improving skin texture, lighting, and overall appearance while preserving a natural look.

Make sure the output is still a valid data URI, of the same type as the input.

Input Photo: {{media url=photoDataUri}}

Enhanced Photo:`,
});

const enhanceFaceFlow = ai.defineFlow(
  {
    name: 'enhanceFaceFlow',
    inputSchema: EnhanceFaceInputSchema,
    outputSchema: EnhanceFaceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      enhancedPhotoDataUri: output!.enhancedPhotoDataUri,
    };
  }
);
