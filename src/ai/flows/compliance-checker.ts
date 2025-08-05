'use server';

/**
 * @fileOverview Checks a policy document for compliance with specified standards.
 *
 * - complianceCheck - A function that handles the compliance checking process.
 * - ComplianceCheckInput - The input type for the complianceCheck function.
 * - ComplianceCheckOutput - The return type for the complianceCheck function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ComplianceCheckInputSchema = z.object({
  policyDocument: z
    .string()
    .describe(
      "The policy document to be checked, as a string or a data URI (e.g., 'data:image/jpeg;base64,...')."
    ),
  complianceStandard: z
    .string()
    .describe('The compliance standard to check against (e.g., "GDPR", "HIPAA").'),
});
export type ComplianceCheckInput = z.infer<typeof ComplianceCheckInputSchema>;

const ComplianceItemSchema = z.object({
    isCompliant: z.boolean().describe('Whether the clause is compliant or not.'),
    clause: z.string().describe('The specific clause from the document being checked.'),
    reason: z.string().describe('The reasoning for the compliance status.'),
});

const ComplianceCheckOutputSchema = z.object({
  overallCompliance: z.string().describe("A high-level summary of the document's overall compliance status."),
  complianceScore: z.number().min(0).max(100).describe('A compliance score from 0 to 100, where 100 is fully compliant.'),
  complianceReport: z.array(ComplianceItemSchema).describe('A detailed report of compliance checks for each relevant clause.'),
});
export type ComplianceCheckOutput = z.infer<typeof ComplianceCheckOutputSchema>;

export async function complianceCheck(input: ComplianceCheckInput): Promise<ComplianceCheckOutput> {
  return complianceCheckFlow(input);
}

const prompt = ai.definePrompt({
  name: 'complianceCheckPrompt',
  input: {schema: ComplianceCheckInputSchema},
  output: {schema: ComplianceCheckOutputSchema},
  prompt: `You are an expert compliance officer. Your task is to review the provided policy document and check its compliance against the specified standard.

The report must contain:
1.  An 'overallCompliance' summary of the document's adherence to the standard.
2.  A 'complianceScore' from 0 to 100, representing your confidence in the document's overall compliance.
3.  A 'complianceReport' array, detailing the compliance status of each relevant clause. For each item, provide:
    - 'isCompliant': A boolean indicating if the clause is compliant.
    - 'clause': The exact text of the clause being analyzed.
    - 'reason': A detailed explanation for the compliance status.

Compliance Standard: {{{complianceStandard}}}

Policy Document:
{{media url=policyDocument}}`,
});

const complianceCheckFlow = ai.defineFlow(
  {
    name: 'complianceCheckFlow',
    inputSchema: ComplianceCheckInputSchema,
    outputSchema: ComplianceCheckOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
