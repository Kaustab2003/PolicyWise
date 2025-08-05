'use server';
/**
 * @fileOverview Summarizes the content of a provided document and extracts key points.
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
      "A data URI representing the document content (e.g., 'data:image/jpeg;base64,...' or 'data:application/pdf;base64,...')."
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
  keyPoints: z.array(z.string()).describe('A list of the most important key points from the document.'),
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
  input: {schema: z.any()},
  output: {schema: SummarizeDocumentOutputSchema},
  prompt: `You are an expert at summarizing documents. Analyze the following document content and provide a concise summary and a list of key points.

The summary should capture the key points and main ideas of the document.
The key points should be a list of the most important individual takeaways.

Generate the summary and key points in the language with the ISO 639-1 code: "{{targetLanguage}}".

Document Content:
{{media url=documentContent}}
`,
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
