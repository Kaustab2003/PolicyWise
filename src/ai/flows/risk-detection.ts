'use server';

/**
 * @fileOverview Detects potential risks in a policy document.
 *
 * - riskDetection - A function that handles the risk detection process.
 * - RiskDetectionInput - The input type for the riskDetection function.
 * - RiskDetectionOutput - The return type for the riskDetection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RiskDetectionInputSchema = z.object({
  policyDocument: z
    .string()
    .describe('The policy document to be analyzed for risks.'),
});
export type RiskDetectionInput = z.infer<typeof RiskDetectionInputSchema>;

const RiskItemSchema = z.object({
    riskLevel: z.enum(['Low', 'Medium', 'High', 'Critical']).describe('The severity level of the identified risk.'),
    riskArea: z.string().describe('The area of the policy where the risk is identified (e.g., "Data Security", "Liability").'),
    description: z.string().describe('A detailed description of the potential risk.'),
    suggestion: z.string().describe('A suggestion to mitigate the identified risk.'),
});

const RiskDetectionOutputSchema = z.object({
  overallRiskAssessment: z.string().describe("A high-level summary of the document's overall risk profile."),
  riskReport: z.array(RiskItemSchema).describe('A detailed report of identified risks.'),
});
export type RiskDetectionOutput = z.infer<typeof RiskDetectionOutputSchema>;

export async function riskDetection(input: RiskDetectionInput): Promise<RiskDetectionOutput> {
  return riskDetectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'riskDetectionPrompt',
  input: {schema: RiskDetectionInputSchema},
  output: {schema: RiskDetectionOutputSchema},
  prompt: `You are an expert risk analyst. Your task is to review the provided policy document and identify potential legal, financial, and operational risks.

The report must contain:
1.  An 'overallRiskAssessment' summary of the document's risk profile.
2.  A 'riskReport' array, where each item is a distinct identified risk. For each risk, provide:
    - 'riskLevel': The severity of the risk (Low, Medium, High, Critical).
    - 'riskArea': The area of the policy the risk pertains to.
    - 'description': A detailed explanation of the risk.
    - 'suggestion': A concrete suggestion for mitigating the risk.

Policy Document:
{{{policyDocument}}}`,
});

const riskDetectionFlow = ai.defineFlow(
  {
    name: 'riskDetectionFlow',
    inputSchema: RiskDetectionInputSchema,
    outputSchema: RiskDetectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
