'use server';
/**
 * @fileOverview Answers questions based on a provided document.
 *
 * - askDocument - A function that handles answering questions about a document.
 * - AskDocumentInput - The input type for the askDocument function.
 * - AskDocumentOutput - The return type for the askDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskDocumentInputSchema = z.object({
  documentContent: z.string().describe('The content of the document.'),
  userQuery: z.string().describe('The user question related to the document.'),
});
export type AskDocumentInput = z.infer<typeof AskDocumentInputSchema>;

const AskDocumentOutputSchema = z.object({
  answer: z
    .string()
    .describe('A comprehensive answer to the user query based on the document.'),
});
export type AskDocumentOutput = z.infer<typeof AskDocumentOutputSchema>;

export async function askDocument(
  input: AskDocumentInput
): Promise<AskDocumentOutput> {
  return askDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askDocumentPrompt',
  input: {schema: AskDocumentInputSchema},
  output: {schema: AskDocumentOutputSchema},
  prompt: `You are an AI assistant designed to answer questions based on the content of a provided document. Your task is to carefully analyze the document and the user's question, and then provide a clear, concise, and accurate answer derived solely from the information within the document.

If the question is predictive or asks for an inference, base your prediction only on the evidence available in the text. Clearly state that your answer is an inference based on the provided content.

If the document does not contain the information needed to answer the question, state that clearly. Do not use any external knowledge.

Document Content:
{{{documentContent}}}

User Question:
{{{userQuery}}}`,
});

const askDocumentFlow = ai.defineFlow(
  {
    name: 'askDocumentFlow',
    inputSchema: AskDocumentInputSchema,
    outputSchema: AskDocumentOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);

    