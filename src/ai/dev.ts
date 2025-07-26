
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-background.ts';
import '@/ai/flows/enhance-face.ts';
import '@/ai/flows/upscale-image.ts';
import '@/ai/flows/correct-color.ts';
import '@/ai/flows/remove-background.ts';
import '@/ai/flows/crop-image.ts';
import '@/ai/flows/remove-blemishes.ts';
