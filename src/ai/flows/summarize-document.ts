'use server';
/**
 * @fileOverview Summarizes the content of a provided document.
 *
 * - summarizeDocument - A function that handles summarizing a document.
 * - SummarizeDocumentInput - The input type for the summarizeDocument function.
 * - SummarizeDocumentOutput - The return type for the summarizeDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDocumentInputSchema = z.object({
  documentContent: z
    .string()
    .describe(
      "The text content or a base64-encoded data URI of an image to be summarized."
    ),
  targetLanguage: z
    .string()
    .describe('The target language for the summary (e.g., "es", "fr", "hi").'),
});
export type SummarizeDocumentInput = z.infer<
  typeof SummarizeDocumentInputSchema
>;

const SummarizeDocumentOutputSchema = z.object({
  summary: z.string().describe('The generated summary of the document.'),
});
export type SummarizeDocumentOutput = z.infer<
  typeof SummarizeDocumentOutputSchema
>;

export async function summarizeDocument(
  input: SummarizeDocumentInput
): Promise<SummarizeDocumentOutput> {
  return summarizeDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeDocumentPrompt',
  input: {schema: SummarizeDocumentInputSchema},
  output: {schema: SummarizeDocumentOutputSchema},
  prompt: `You are an expert at summarizing documents. Analyze the following document content and provide a concise summary.

The summary should capture the key points and main ideas of the document.

Generate the summary in the language with the ISO 639-1 code: "{{targetLanguage}}".

Document Content:
{{#if (documentContent.startsWith "data:image")}}
{{media url=documentContent}}
{{else}}
{{{documentContent}}}
{{/if}}`,
});

const summarizeDocumentFlow = ai.defineFlow(
  {
    name: 'summarizeDocumentFlow',
    inputSchema: SummarizeDocumentInputSchema,
    outputSchema: SummarizeDocumentOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
