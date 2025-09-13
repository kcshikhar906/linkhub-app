'use server';
/**
 * @fileOverview An AI flow to generate an icon for a given URL.
 *
 * - generateIcon - A function that creates an icon based on web content.
 * - GenerateIconInput - The input type for the generateIcon function.
 * - GenerateIconOutput - The return type for the generateIcon function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateIconInputSchema = z.object({
  url: z.string().url().describe('The URL to generate an icon from.'),
});
export type GenerateIconInput = z.infer<typeof GenerateIconInputSchema>;

const GenerateIconOutputSchema = z.object({
  iconDataUri: z
    .string()
    .describe(
      'A data URI of a generated icon. It should be a simple, clean, modern, abstract icon on a plain background, representing the service.'
    ),
});
export type GenerateIconOutput = z.infer<typeof GenerateIconOutputSchema>;

export async function generateIcon(
  input: GenerateIconInput
): Promise<GenerateIconOutput> {
  return generateIconFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateIconPrompt',
  input: {schema: GenerateIconInputSchema},
  output: {schema: GenerateIconOutputSchema},
  prompt: `You are an expert at generating minimalist, abstract icons for web services.

  Analyze the content of the following URL and generate a single, simple, modern, and abstract icon that represents the service. The icon should be on a plain, single-color background.

  URL: {{{url}}}
  `,
});

const generateIconFlow = ai.defineFlow(
  {
    name: 'generateIconFlow',
    inputSchema: GenerateIconInputSchema,
    outputSchema: GenerateIconOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
