'use server';

/**
 * @fileOverview Generates a summarized answer to a user query based on a provided policy document.
 *
 * - generateSummaryFromQuery - A function that handles the generation of a summarized answer.
 * - GenerateSummaryFromQueryInput - The input type for the generateSummaryFromQuery function.
 * - GenerateSummaryFromQueryOutput - The return type for the generateSummaryFromQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSummaryFromQueryInputSchema = z.object({
  policyDocument: z.string().describe('The content of the policy document.'),
  userQuery: z.string().describe('The user query related to the policy document.'),
  clauseClassifications: z.string().describe('Clause classifications extracted from the document.'),
});
export type GenerateSummaryFromQueryInput = z.infer<typeof GenerateSummaryFromQueryInputSchema>;

const GenerateSummaryFromQueryOutputSchema = z.object({
  summary: z.string().describe('A summarized answer to the user query.'),
  relevantClauses: z.array(z.string()).describe('The relevant clauses from the policy document.'),
  confidenceScore: z.number().describe('Confidence score of the generated summary.'),
});
export type GenerateSummaryFromQueryOutput = z.infer<typeof GenerateSummaryFromQueryOutputSchema>;

export async function generateSummaryFromQuery(input: GenerateSummaryFromQueryInput): Promise<GenerateSummaryFromQueryOutput> {
  return generateSummaryFromQueryFlow(input);
}

const generateSummaryPrompt = ai.definePrompt({
  name: 'generateSummaryPrompt',
  input: {schema: GenerateSummaryFromQueryInputSchema},
  output: {schema: GenerateSummaryFromQueryOutputSchema},
  prompt: `You are an AI assistant specialized in summarizing policy documents based on user queries.

  Given a policy document, a user query, and clause classifications, generate a concise and accurate summary that answers the query.
  Highlight the most relevant clauses and sections from the document to support your summary.

  Policy Document: {{{policyDocument}}}
  User Query: {{{userQuery}}}
  Clause Classifications: {{{clauseClassifications}}}

  Format your response as a JSON object with the following keys:
  - summary: A summarized answer to the user query.
  - relevantClauses: An array of relevant clauses from the policy document.
  - confidenceScore: A confidence score (0-1) indicating the accuracy of the generated summary.
  `,
});

const generateSummaryFromQueryFlow = ai.defineFlow(
  {
    name: 'generateSummaryFromQueryFlow',
    inputSchema: GenerateSummaryFromQueryInputSchema,
    outputSchema: GenerateSummaryFromQueryOutputSchema,
  },
  async input => {
    const {output} = await generateSummaryPrompt(input);
    return output!;
  }
);
