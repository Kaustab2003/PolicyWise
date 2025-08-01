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
    .describe('The draft policy document to be reviewed.'),
});
export type SuggestPolicyImprovementsInput = z.infer<typeof SuggestPolicyImprovementsInputSchema>;

const SuggestPolicyImprovementsOutputSchema = z.object({
  suggestedImprovements: z
    .string()
    .describe('The suggested improvements to the policy document.'),
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
  prompt: `You are an expert policy analyst. You will review the provided policy document and suggest improvements related to clarity, completeness, and fairness based on common industry standards and best practices.

Policy Document:
{{{policyDocument}}}`,
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
