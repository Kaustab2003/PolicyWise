'use server';

import {
  generateSummaryFromQuery,
} from '@/ai/flows/generate-summary-from-query';
import {
  suggestPolicyImprovements,
  type SuggestPolicyImprovementsOutput,
} from '@/ai/flows/suggest-policy-improvements';
import {
  askDocument,
} from '@/ai/flows/ask-document';
import { summarizeDocument, type SummarizeDocumentOutput } from '@/ai/flows/summarize-document';
import { translateText, type TranslateTextOutput } from '@/ai/flows/translate-text';
import { complianceCheck, type ComplianceCheckOutput } from '@/ai/flows/compliance-checker';
import { riskDetection, type RiskDetectionOutput } from '@/ai/flows/risk-detection';
import { generateSpeech, type GenerateSpeechOutput } from '@/ai/flows/generate-speech';
import type { GenerateSummaryFromQueryInput, SuggestPolicyImprovementsInput, SummarizeDocumentInput, TranslateTextInput, ComplianceCheckInput, RiskDetectionInput, GenerateSpeechInput, AskDocumentInput } from './page';
import { GenerateSummaryFromQueryOutput } from '@/ai/flows/generate-summary-from-query';
import { AskDocumentOutput } from '@/ai/flows/ask-document';


async function translate(text: string, targetLanguage: string): Promise<string> {
  if (targetLanguage === 'en' || !text) {
    // Avoids attempting to translate empty or english strings
    return text;
  }
  // No try/catch here, as it will be handled by the calling action
  const result = await translateText({ text, targetLanguage });
  return result.translatedText;
}

export async function generateSpeechAction(
  generateSpeechInput: GenerateSpeechInput,
): Promise<{ data: GenerateSpeechOutput | null; error: string | null }> {
  if (!generateSpeechInput.text) {
    return { data: null, error: 'Text for speech generation is required.' };
  }
  try {
    const result = await generateSpeech(generateSpeechInput);
    return { data: result, error: null };
  } catch (e) {
    console.error('generateSpeechAction failed:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      data: null,
      error: `Failed to generate speech: ${errorMessage}`,
    };
  }
}

export async function complianceCheckAction(
  complianceCheckInput: ComplianceCheckInput,
  language: string,
): Promise<{ data: ComplianceCheckOutput | null; error: string | null }> {
  if (!complianceCheckInput.policyDocument || !complianceCheckInput.complianceStandard) {
    return { data: null, error: 'Policy document and compliance standard are required.' };
  }

  try {
    const result = await complianceCheck(complianceCheckInput);
    
    const translatedOverallCompliance = await translate(result.overallCompliance, language);
    const translatedComplianceReport = await Promise.all(
      result.complianceReport.map(async (item) => ({
        ...item,
        clause: await translate(item.clause, language),
        reason: await translate(item.reason, language),
      }))
    );

    return { data: { ...result, overallCompliance: translatedOverallCompliance, complianceReport: translatedComplianceReport }, error: null };
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
  riskDetectionInput: RiskDetectionInput,
  language: string,
): Promise<{ data: RiskDetectionOutput | null; error: string | null }> {
  if (!riskDetectionInput.policyDocument) {
    return { data: null, error: 'Policy document is required.' };
  }

  try {
    const result = await riskDetection(riskDetectionInput);
    
    const translatedOverallRiskAssessment = await translate(result.overallRiskAssessment, language);
    const translatedRiskReport = await Promise.all(
      result.riskReport.map(async (item) => ({
        ...item,
        riskArea: await translate(item.riskArea, language),
        description: await translate(item.description, language),
        suggestion: await translate(item.suggestion, language),
      }))
    );

    return { data: { ...result, overallRiskAssessment: translatedOverallRiskAssessment, riskReport: translatedRiskReport }, error: null };
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
  summarizeDocumentInput: SummarizeDocumentInput,
): Promise<{ data: SummarizeDocumentOutput | null; error: string | null }> {
  if (!summarizeDocumentInput.documentContent) {
    return { data: null, error: 'Document content is required.' };
  }

  try {
    const result = await summarizeDocument(summarizeDocumentInput);
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
  translateTextInput: TranslateTextInput,
): Promise<{ data: TranslateTextOutput | null; error: string | null }> {
  if (!translateTextInput.text) {
    return { data: null, error: 'Text to translate is required.' };
  }

  try {
    const translatedText = await translate(translateTextInput.text, translateTextInput.targetLanguage);
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
  askDocumentInput: AskDocumentInput,
  language: string,
): Promise<{ data: AskDocumentOutput | null; error: string | null }> {
  if ((!askDocumentInput.documents || askDocumentInput.documents.length === 0) || !askDocumentInput.userQueries || askDocumentInput.userQueries.length === 0) {
    return {
      data: null,
      error: 'At least one document and at least one user query are required.',
    };
  }

  try {
    const translatedHistory = await Promise.all(
      askDocumentInput.history.map(async (turn) => ({
        ...turn,
        content: await translate(turn.content, 'en'),
      }))
    );
    const translatedQueries = await Promise.all(askDocumentInput.userQueries.map(q => translate(q, 'en')));

    const result = await askDocument({
      ...askDocumentInput,
      history: translatedHistory,
      userQueries: translatedQueries,
    });
    
    const translatedAnswers = await Promise.all(
        result.answers.map(async (item) => ({
            ...item,
            question: await translate(item.question, language),
            directAnswer: await translate(item.directAnswer, language),
            summary: await translate(item.summary, language),
            keyPoints: await Promise.all(
              item.keyPoints.map((point) => translate(point, language))
            ),
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
  generateSummaryFromQueryInput: GenerateSummaryFromQueryInput,
  language: string,
): Promise<{ data: GenerateSummaryFromQueryOutput | null; error: string | null }> {
  if (!generateSummaryFromQueryInput.policyDocument || !generateSummaryFromQueryInput.userQueries || generateSummaryFromQueryInput.userQueries.length === 0) {
    return {
      data: null,
      error: 'Policy document and at least one user query are required.',
    };
  }

  try {
    const translatedQueries = await Promise.all(generateSummaryFromQueryInput.userQueries.map(q => translate(q, 'en')));
    const result = await generateSummaryFromQuery({
      ...generateSummaryFromQueryInput,
      userQueries: translatedQueries,
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
  suggestPolicyImprovementsInput: SuggestPolicyImprovementsInput,
  language: string,
): Promise<{
  data: SuggestPolicyImprovementsOutput | null;
  error: string | null;
}> {
  if (!suggestPolicyImprovementsInput.policyDocument) {
    return { data: null, error: 'Policy document is required.' };
  }

  try {
    const result = await suggestPolicyImprovements(suggestPolicyImprovementsInput);
    
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
