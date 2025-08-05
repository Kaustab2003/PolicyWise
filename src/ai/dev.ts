import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-policy-improvements.ts';
import '@/ai/flows/generate-summary-from-query.ts';
import '@/ai/flows/ask-document.ts';
import '@/ai/flows/translate-text.ts';
import '@/ai/flows/summarize-document.ts';
import '@/ai/flows/compliance-checker.ts';
import '@/ai/flows/risk-detection.ts';
