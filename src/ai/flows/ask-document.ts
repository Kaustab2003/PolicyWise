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
  content: z.string().describe("A data URI representing the document content (e.g., 'data:image/jpeg;base64,...' or 'data:application/pdf;base64,...')."),
});
export type DocumentContext = z.infer<typeof DocumentContextSchema>;

const AskDocumentInputSchema = z.object({
  documents: z.array(DocumentContextSchema).describe('An array of documents to search for an answer.'),
  userQueries: z.array(z.string()).describe('The user questions related to the document.'),
});
export type AskDocumentInput = z.infer<typeof AskDocumentInputSchema>;

const AnswerSchema = z.object({
    question: z.string().describe('The original user question.'),
    answer: z.string().describe('A comprehensive answer to the user query based on the document.'),
    sourceFile: z.string().optional().describe('The name of the file that contains the most relevant information for the answer.'),
});

const AskDocumentOutputSchema = z.object({
  answers: z.array(AnswerSchema).describe('An array of answers, one for each user query.'),
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
  prompt: `You are an AI assistant designed to answer questions based on the content of provided documents and images.

Your task is to carefully analyze the documents/images and the user's questions. For each question, provide a clear, comprehensive, and accurate answer derived solely from the information within the provided materials.

For each answer, you MUST identify which document or image was the primary source for your answer and set the 'sourceFile' field to the name of that file. If the answer is synthesized from multiple sources, pick the most relevant one.

If no document contains the information needed to answer a question, state that clearly in the answer for that question and do not set a 'sourceFile'. Do not use any external knowledge.

Respond with an array of answer objects, one for each user question.

{{#each documents}}
Document Name: {{{name}}}
Content:
{{media url=content}}
---
{{/each}}

User Questions:
{{#each userQueries}}
- {{{this}}}
{{/each}}`,
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
