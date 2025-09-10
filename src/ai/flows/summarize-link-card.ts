'use server';

/**
 * @fileOverview A link summarization AI agent.
 *
 * - summarizeLinkCard - A function that summarizes a link card.
 * - SummarizeLinkCardInput - The input type for the summarizeLinkCard function.
 * - SummarizeLinkCardOutput - The return type for the summarizeLinkCard function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeLinkCardInputSchema = z.object({
  url: z.string().url().describe('The URL of the official website content.'),
});
export type SummarizeLinkCardInput = z.infer<typeof SummarizeLinkCardInputSchema>;

const SummarizeLinkCardOutputSchema = z.object({
  title: z.string().describe('A concise, user-friendly title for the service.'),
  description: z.string().describe('A plain-English description of the service.'),
  steps: z.array(z.string()).describe('A step-by-step guide on how to use the service.'),
});
export type SummarizeLinkCardOutput = z.infer<typeof SummarizeLinkCardOutputSchema>;

export async function summarizeLinkCard(input: SummarizeLinkCardInput): Promise<SummarizeLinkCardOutput> {
  return summarizeLinkCardFlow(input);
}

const summarizeLinkCardPrompt = ai.definePrompt({
  name: 'summarizeLinkCardPrompt',
  input: {schema: SummarizeLinkCardInputSchema},
  output: {schema: SummarizeLinkCardOutputSchema},
  prompt: `You are an expert at summarizing official website content into plain English.

  Given the following URL, please provide a concise title, a description of the service offered, and a step-by-step guide.

  URL: {{{url}}}

  Title: 
  A short, clear title for this service (e.g., "Apply for a Tax File Number").

  Description:
  A plain-English description of what the service is and why someone would need it.

  Steps:
  A list of 3-5 bullet points breaking down the process into simple, actionable steps.
  `,
});

const summarizeLinkCardFlow = ai.defineFlow(
  {
    name: 'summarizeLinkCardFlow',
    inputSchema: SummarizeLinkCardInputSchema,
    outputSchema: SummarizeLinkCardOutputSchema,
  },
  async input => {
    const {output} = await summarizeLinkCardPrompt(input);
    return output!;
  }
);
