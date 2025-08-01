'use server';

import {
  generateSummaryFromQuery,
  type GenerateSummaryFromQueryOutput,
} from '@/ai/flows/generate-summary-from-query';
import {
  suggestPolicyImprovements,
  type SuggestPolicyImprovementsOutput,
} from '@/ai/flows/suggest-policy-improvements';
import {
  askDocument,
  type AskDocumentOutput,
} from '@/ai/flows/ask-document';

export async function askDocumentAction(
  documentContent: string,
  userQuery: string
): Promise<{ data: AskDocumentOutput | null; error: string | null }> {
  if (!documentContent || !userQuery) {
    return {
      data: null,
      error: 'Document content and user query are required.',
    };
  }

  try {
    const result = await askDocument({
      documentContent,
      userQuery,
    });
    return { data: result, error: null };
  } catch (e) {
    console.error('askDocumentAction failed:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      data: null,
      error: `Failed to get answer from document: ${errorMessage}`,
    };
  }
}

export async function summarizeAction(
  policyDocument: string,
  userQuery: string
): Promise<{ data: GenerateSummaryFromQueryOutput | null; error: string | null }> {
  if (!policyDocument || !userQuery) {
    return {
      data: null,
      error: 'Policy document and user query are required.',
    };
  }

  try {
    const result = await generateSummaryFromQuery({
      policyDocument,
      userQuery,
      // The user request implies clause classification is an automated backend step.
      // We provide a static, sensible default here for the flow.
      clauseClassifications: 'Coverage, Exclusion, Limit, Definition, Service',
    });
    return { data: result, error: null };
  } catch (e) {
    console.error('summarizeAction failed:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      data: null,
      error: `Failed to generate summary: ${errorMessage}`,
    };
  }
}

export async function improveAction(
  policyDocument: string
): Promise<{
  data: SuggestPolicyImprovementsOutput | null;
  error: string | null;
}> {
  if (!policyDocument) {
    return { data: null, error: 'Policy document is required.' };
  }

  try {
    const result = await suggestPolicyImprovements({
      policyDocument,
    });
    return { data: result, error: null };
  } catch (e) {
    console.error('improveAction failed:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      data: null,
      error: `Failed to suggest improvements: ${errorMessage}`,
    };
  }
}

    