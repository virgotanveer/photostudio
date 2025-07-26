
'use server';
/**
 * @fileOverview An AI agent that can crop an image to specific dimensions.
 *
 * - cropImage - A function that handles the image cropping process.
 * - CropImageInput - The input type for the cropImage function.
 * - CropImageOutput - The return type for the cropImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CropImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  targetWidth: z.number().describe('The target width of the cropped image in pixels.'),
  targetHeight: z.number().describe('The target height of the cropped image in pixels.'),
});
export type CropImageInput = z.infer<typeof CropImageInputSchema>;

const CropImageOutputSchema = z.object({
  croppedPhotoDataUri: z
    .string()
    .describe(
      'The cropped photo, as a data URI that must include a MIME type and use Base64 encoding.'
    ),
});
export type CropImageOutput = z.infer<typeof CropImageOutputSchema>;

export async function cropImage(input: CropImageInput): Promise<CropImageOutput> {
  return cropImageFlow(input);
}

// Although this doesn't use a generative model, we define it as a flow
// to keep the architecture consistent and allow for future AI enhancements,
// such as smart cropping (e.g., face detection).
const cropImageFlow = ai.defineFlow(
  {
    name: 'cropImageFlow',
    inputSchema: CropImageInputSchema,
    outputSchema: CropImageOutputSchema,
  },
  async ({ photoDataUri, targetWidth, targetHeight }) => {
    
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {
          text: `You are an AI-powered photo editor. You will receive an image. Your task is to perform a center crop on the image to the exact dimensions of ${targetWidth}px width and ${targetHeight}px height. Do not change the content of the image other than cropping it. The output image must have the exact dimensions specified. Return only the cropped image.`,
        },
        {
          media: {
            url: photoDataUri,
          },
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Cropping failed to return an image.');
    }

    return {
      croppedPhotoDataUri: media.url,
    };
  }
);
