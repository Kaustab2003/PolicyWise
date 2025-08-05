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
  type DocumentContext,
} from '@/ai/flows/ask-document';
import { translateText, type TranslateTextOutput } from '@/ai/flows/translate-text';
import { parsePdf } from '@/lib/pdf-parser';

async function translate(text: string, targetLanguage: string): Promise<string> {
  if (targetLanguage === 'en' || !text) {
    // Avoids attempting to translate empty or english strings
    return text;
  }
  const result = await translateText({ text, targetLanguage });
  return result.translatedText;
}

export async function translateAction(
  textToTranslate: string,
  targetLanguage: string,
): Promise<{ data: TranslateTextOutput | null; error: string | null }> {
  if (!textToTranslate) {
    return { data: null, error: 'Text to translate is required.' };
  }

  try {
    const translatedText = await translate(textToTranslate, targetLanguage);
    return { data: { translatedText }, error: null };
  } catch (e) {
    console.error('translateAction failed:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      data: null,
      error: `Failed to translate text: ${errorMessage}`,
    };
  }
}

export async function parsePdfAction(formData: FormData): Promise<{
  data: { documentContent: string } | null;
  error: string | null;
}> {
  const file = formData.get('file') as File;
  if (!file) {
    return { data: null, error: 'No file uploaded.' };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const documentContent = await parsePdf(arrayBuffer);
    return { data: { documentContent }, error: null };
  } catch (e) {
    console.error('parsePdfAction failed:', e);
    const errorMessage =
      e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      data: null,
      error: `Failed to parse PDF: ${errorMessage}`,
    };
  }
}

export async function askDocumentAction(
  documents: DocumentContext[],
  userQueries: string[],
  language: string,
): Promise<{ data: AskDocumentOutput | null; error: string | null }> {
  if (!documents || documents.length === 0 || !userQueries || userQueries.length === 0) {
    return {
      data: null,
      error: 'Documents and at least one user query are required.',
    };
  }

  try {
    const translatedQueries = await Promise.all(userQueries.map(query => translate(query, 'en')));
    const result = await askDocument({
      documents,
      userQueries: translatedQueries,
    });
    
    const translatedAnswers = await Promise.all(
        result.answers.map(async (item) => ({
            ...item,
            question: await translate(item.question, language),
            answer: await translate(item.answer, language),
            sourceFile: item.sourceFile ? await translate(item.sourceFile, language) : undefined,
        }))
    );

    return { data: { answers: translatedAnswers }, error: null };
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
  userQueries: string[],
  language: string,
): Promise<{ data: GenerateSummaryFromQueryOutput | null; error: string | null }> {
  if (!policyDocument || !userQueries || userQueries.length === 0) {
    return {
      data: null,
      error: 'Policy document and at least one user query are required.',
    };
  }

  try {
    const translatedQueries = await Promise.all(userQueries.map(q => translate(q, 'en')));
    const result = await generateSummaryFromQuery({
      policyDocument,
      userQueries: translatedQueries,
      clauseClassifications: 'Coverage, Exclusion, Limit, Definition, Service',
    });

    const translatedAnswers = await Promise.all(
        result.answers.map(async (item) => ({
            ...item,
            question: await translate(item.question, language),
            summary: await translate(item.summary, language),
            relevantClauses: await Promise.all(
                item.relevantClauses.map((clause) => translate(clause, language))
            ),
        }))
    );

    return { data: { answers: translatedAnswers }, error: null };
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
  policyDocument: string,
  language: string,
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
    
    const translatedImprovements = await translate(result.suggestedImprovements, language);

    return { data: { suggestedImprovements: translatedImprovements }, error: null };
  } catch (e) {
    console.error('improveAction failed:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      data: null,
      error: `Failed to suggest improvements: ${errorMessage}`,
    };
  }
}
