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

const DocumentContextSchema = z.object({
  name: z.string().describe('The name of the document file.'),
  content: z.string().describe('The full text content of the document.'),
});
export type DocumentContext = z.infer<typeof DocumentContextSchema>;

const AskDocumentInputSchema = z.object({
  documents: z.array(DocumentContextSchema).describe('An array of documents to search for an answer.'),
  userQuery: z.string().describe('The user question related to the document.'),
});
export type AskDocumentInput = z.infer<typeof AskDocumentInputSchema>;

const AskDocumentOutputSchema = z.object({
  answer: z
    .string()
    .describe('A comprehensive answer to the user query based on the document.'),
  sourceFile: z
    .string()
    .optional()
    .describe('The name of the file that contains the most relevant information for the answer.'),
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
  prompt: `You are an AI assistant designed to answer questions based on the content of provided documents.

Your task is to carefully analyze the documents and the user's question. Provide a clear, concise, and accurate answer derived solely from the information within the documents.

After providing the answer, you MUST identify which document was the primary source for your answer and set the 'sourceFile' field to the name of that document. If the answer is synthesized from multiple documents, pick the most relevant one.

If the question is predictive or asks for an inference, base your prediction only on the evidence available in the text. Clearly state that your answer is an inference based on the provided content.

If no document contains the information needed to answer the question, state that clearly and do not set a 'sourceFile'. Do not use any external knowledge.

{{#each documents}}
Document Name: {{{name}}}
Content:
{{{content}}}
---
{{/each}}

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
