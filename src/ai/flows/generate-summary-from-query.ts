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
  userQueries: z.array(z.string()).describe('The user queries related to the policy document.'),
  clauseClassifications: z.string().describe('Clause classifications extracted from the document.'),
});
export type GenerateSummaryFromQueryInput = z.infer<typeof GenerateSummaryFromQueryInputSchema>;

const AnswerSchema = z.object({
    question: z.string().describe('The original user question.'),
    summary: z.string().describe('A summarized answer to the user query.'),
    relevantClauses: z.array(z.string()).describe('The relevant clauses from the policy document.'),
    confidenceScore: z.number().describe('Confidence score of the generated summary.'),
});

const GenerateSummaryFromQueryOutputSchema = z.object({
  answers: z.array(AnswerSchema).describe('An array of answers, one for each user query.'),
});
export type GenerateSummaryFromQueryOutput = z.infer<typeof GenerateSummaryFromQueryOutputSchema>;

export async function generateSummaryFromQuery(input: GenerateSummaryFromQueryInput): Promise<GenerateSummaryFromQueryOutput> {
  return generateSummaryFromQueryFlow(input);
}

const generateSummaryPrompt = ai.definePrompt({
  name: 'generateSummaryPrompt',
  input: {schema: GenerateSummaryFromQueryInputSchema},
  output: {schema: GenerateSummaryFromQueryOutputSchema},
  prompt: `You are an AI assistant specialized in analyzing policy documents based on user queries.

  Given a policy document with pre-classified clauses and a list of user queries, you must provide a separate, detailed answer for each query.
  For each query, use the clause classifications to inform your reasoning. Generate a concise and accurate summary that directly answers the question. Also, identify the most relevant clauses or sections from the document that support your summary. Finally, provide a confidence score (from 0 to 1) for each summary.

  Policy Document:
  {{{policyDocument}}}

  Clause Classifications:
  {{{clauseClassifications}}}

  User Queries:
  {{#each userQueries}}
  - {{{this}}}
  {{/each}}

  Format your response as a JSON object containing an 'answers' array. Each object in the array should correspond to a user query and have the following structure:
  - question: The original user question.
  - summary: A summarized answer to the user query.
  - relevantClauses: An array of the most relevant clauses from the policy document that support the summary.
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
