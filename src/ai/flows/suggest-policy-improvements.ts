'use server';

/**
 * @fileOverview Suggests improvements to a draft policy document related to clarity, completeness, and fairness.
 *
 * - suggestPolicyImprovements - A function that handles the policy improvement suggestion process.
 * - SuggestPolicyImprovementsInput - The input type for the suggestPolicyImprovements function.
 * - SuggestPolicyImprovementsOutput - The return type for the suggestPolicyImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPolicyImprovementsInputSchema = z.object({
  policyDocument: z
    .string()
    .describe('The draft policy document to be reviewed, as a string or a data URI.'),
});
export type SuggestPolicyImprovementsInput = z.infer<typeof SuggestPolicyImprovementsInputSchema>;

const ImprovementSuggestionSchema = z.object({
    title: z.string().describe('A concise title for the suggested improvement area (e.g., "Clarity and Conciseness", "Fairness Review").'),
    details: z.string().describe('A detailed, elaborated explanation of the suggestion, including the reasoning behind it and how to implement the change.'),
});

const SuggestPolicyImprovementsOutputSchema = z.object({
  summary: z.string().describe("A high-level summary of the policy's overall quality, its strengths, and its primary areas for improvement."),
  improvements: z.array(ImprovementSuggestionSchema).describe('A list of detailed improvement suggestions in a report format.'),
});
export type SuggestPolicyImprovementsOutput = z.infer<typeof SuggestPolicyImprovementsOutputSchema>;

export async function suggestPolicyImprovements(
  input: SuggestPolicyImprovementsInput
): Promise<SuggestPolicyImprovementsOutput> {
  return suggestPolicyImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPolicyImprovementsPrompt',
  input: {schema: SuggestPolicyImprovementsInputSchema},
  output: {schema: SuggestPolicyImprovementsOutputSchema},
  prompt: `You are an expert policy analyst. Your task is to review the provided policy document and generate a detailed improvement report.

The report should be structured to be as helpful and clear as possible. It must contain:
1.  A 'summary' that gives a high-level overview of the document's quality, highlighting its strengths and key weaknesses.
2.  An 'improvements' array, where each item is a distinct suggestion. For each suggestion, provide:
    - A clear 'title' for the improvement category (e.g., "Enhance Clarity in Coverage Section", "Improve Fairness of Exclusion Clauses").
    - A 'details' section that elaborately explains the issue, why it's a problem, and provides a comprehensive recommendation for how to fix it.

Review the policy for clarity, completeness, fairness, and enforceability, based on common industry standards and best practices.

Policy Document:
{{media url=policyDocument}}`,
});

const suggestPolicyImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestPolicyImprovementsFlow',
    inputSchema: SuggestPolicyImprovementsInputSchema,
    outputSchema: SuggestPolicyImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
