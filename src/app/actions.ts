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
import { summarizeDocument, type SummarizeDocumentOutput } from '@/ai/flows/summarize-document';
import { translateText, type TranslateTextOutput } from '@/ai/flows/translate-text';
import { complianceCheck, type ComplianceCheckOutput } from '@/ai/flows/compliance-checker';
import { riskDetection, type RiskDetectionOutput } from '@/ai/flows/risk-detection';


async function translate(text: string, targetLanguage: string): Promise<string> {
  if (targetLanguage === 'en' || !text) {
    // Avoids attempting to translate empty or english strings
    return text;
  }
  // No try/catch here, as it will be handled by the calling action
  const result = await translateText({ text, targetLanguage });
  return result.translatedText;
}

export async function complianceCheckAction(
  policyDocument: string,
  complianceStandard: string,
  language: string,
): Promise<{ data: ComplianceCheckOutput | null; error: string | null }> {
  if (!policyDocument || !complianceStandard) {
    return { data: null, error: 'Policy document and compliance standard are required.' };
  }

  try {
    const result = await complianceCheck({
      policyDocument,
      complianceStandard,
    });
    
    const translatedOverallCompliance = await translate(result.overallCompliance, language);
    const translatedComplianceReport = await Promise.all(
      result.complianceReport.map(async (item) => ({
        ...item,
        clause: await translate(item.clause, language),
        reason: await translate(item.reason, language),
      }))
    );

    return { data: { overallCompliance: translatedOverallCompliance, complianceReport: translatedComplianceReport }, error: null };
  } catch (e) {
    console.error('complianceCheckAction failed:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      data: null,
      error: `Failed to check compliance: ${errorMessage}`,
    };
  }
}

export async function riskDetectionAction(
  policyDocument: string,
  language: string,
): Promise<{ data: RiskDetectionOutput | null; error: string | null }> {
  if (!policyDocument) {
    return { data: null, error: 'Policy document is required.' };
  }

  try {
    const result = await riskDetection({
      policyDocument,
    });
    
    const translatedOverallRiskAssessment = await translate(result.overallRiskAssessment, language);
    const translatedRiskReport = await Promise.all(
      result.riskReport.map(async (item) => ({
        ...item,
        riskArea: await translate(item.riskArea, language),
        description: await translate(item.description, language),
        suggestion: await translate(item.suggestion, language),
      }))
    );

    return { data: { overallRiskAssessment: translatedOverallRiskAssessment, riskReport: translatedRiskReport }, error: null };
  } catch (e) {
    console.error('riskDetectionAction failed:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      data: null,
      error: `Failed to detect risks: ${errorMessage}`,
    };
  }
}

export async function summarizeDocumentAction(
  documentContent: string,
  language: string,
): Promise<{ data: SummarizeDocumentOutput | null; error: string | null }> {
  if (!documentContent) {
    return { data: null, error: 'Document content is required.' };
  }

  try {
    const result = await summarizeDocument({
      documentContent,
      targetLanguage: language,
    });
    return { data: result, error: null };
  } catch (e) {
    console.error('summarizeDocumentAction failed:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      data: null,
      error: `Failed to summarize document: ${errorMessage}`,
    };
  }
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
    
    const translatedSummary = await translate(result.summary, language);
    const translatedImprovements = await Promise.all(
      result.improvements.map(async (item) => ({
        ...item,
        title: await translate(item.title, language),
        details: await translate(item.details, language),
      }))
    );

    return { data: { summary: translatedSummary, improvements: translatedImprovements }, error: null };
  } catch (e) {
    console.error('improveAction failed:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      data: null,
      error: `Failed to suggest improvements: ${errorMessage}`,
    };
  }
}
