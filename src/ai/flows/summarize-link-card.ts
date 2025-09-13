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
import { generateIcon } from './generate-icon-flow';
import { CATEGORY_TAGS } from '@/lib/category-tags';

const SummarizeLinkCardInputSchema = z.object({
  url: z.string().url().describe('The URL of the official website content.'),
  categorySlug: z.string().describe('The slug of the category this URL belongs to.'),
});
export type SummarizeLinkCardInput = z.infer<typeof SummarizeLinkCardInputSchema>;

const SummarizeLinkCardOutputSchema = z.object({
  title: z.string().describe('A concise, user-friendly title for the service.'),
  description: z.string().describe('A plain-English description of the service.'),
  steps: z.array(z.string()).describe('A step-by-step guide on how to use the service.'),
  iconDataUri: z.string().optional().describe('A data URI for a generated icon representing the service.'),
  suggestedTags: z.array(z.string()).optional().describe('A list of suggested tags for the service based on its content and the available tags for the category.'),
});
export type SummarizeLinkCardOutput = z.infer<typeof SummarizeLinkCardOutputSchema>;

export async function summarizeLinkCard(input: SummarizeLinkCardInput): Promise<SummarizeLinkCardOutput> {
  return summarizeLinkCardFlow(input);
}

const summarizeLinkCardPrompt = ai.definePrompt({
  name: 'summarizeLinkCardPrompt',
  input: {schema: z.object({
    url: z.string().url(),
    categorySlug: z.string(),
    availableTags: z.array(z.string()),
  })},
  output: {schema: SummarizeLinkCardOutputSchema},
  prompt: `You are an expert at summarizing official website content into plain English and suggesting relevant tags.

  Given the following URL and a list of available tags for its category, please provide a concise title, a description of the service offered, a step-by-step guide, and suggest a few relevant tags from the provided list.

  URL: {{{url}}}
  Available Tags for category '{{{categorySlug}}}': {{{json availableTags}}}

  Title: 
  A short, clear title for this service (e.g., "Apply for a Tax File Number").

  Description:
  A plain-English description of what the service is and why someone would need it.

  Steps:
  A list of 3-5 bullet points breaking down the process into simple, actionable steps.
  
  Suggested Tags:
  From the list of available tags, choose up to 3 that are most relevant to the content of the URL.
  `,
});

const summarizeLinkCardFlow = ai.defineFlow(
  {
    name: 'summarizeLinkCardFlow',
    inputSchema: SummarizeLinkCardInputSchema,
    outputSchema: SummarizeLinkCardOutputSchema,
  },
  async input => {
    // Get the available tags for the given category slug
    const availableTags = CATEGORY_TAGS[input.categorySlug] || [];

    const [summary, icon] = await Promise.all([
        summarizeLinkCardPrompt({...input, availableTags}),
        generateIcon(input),
    ]);
    
    return {
      ...summary.output!,
      iconDataUri: icon.iconDataUri,
    };
  }
);
