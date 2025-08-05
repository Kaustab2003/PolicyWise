'use server';
/**
 * @fileOverview Answers questions based on a provided document.
 *
 * - askDocument - A function that handles answering questions about a document.
 * - AskDocumentInput - The input type for the askDocument function.
 * - AskDocumentOutput - The return type for the askDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DocumentContextSchema = z.object({
  name: z.string().describe('The name of the document file.'),
  content: z.string().describe("A data URI representing the document content (e.g., 'data:image/jpeg;base64,...' or 'data:application/pdf;base64,...')."),
});
export type DocumentContext = z.infer<typeof DocumentContextSchema>;

const ConversationTurnSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const AskDocumentInputSchema = z.object({
  documents: z.array(DocumentContextSchema).describe('An array of documents to search for an answer.'),
  history: z.array(ConversationTurnSchema).describe('The conversation history between the user and the model.'),
  userQueries: z.array(z.string()).describe('The latest user questions related to the document.'),
});
export type AskDocumentInput = z.infer<typeof AskDocumentInputSchema>;

const AnswerSchema = z.object({
    question: z.string().describe('The original user question.'),
    directAnswer: z.string().describe('A direct, concise answer to the question.'),
    summary: z.string().describe('A detailed summary of the findings related to the question.'),
    keyPoints: z.array(z.string()).describe('A bulleted list of the most important supporting facts or clauses.'),
    confidenceScore: z.number().min(0).max(100).describe('A score from 0-100 indicating confidence in the answer.'),
    sourceFile: z.string().optional().describe('The name of the file that contains the most relevant information for the answer.'),
});


const AskDocumentOutputSchema = z.object({
  answers: z.array(AnswerSchema).describe('An array of answers, one for each user query.'),
});
export type AskDocumentOutput = z.infer<typeof AskDocumentOutputSchema>;

export async function askDocument(
  input: AskDocumentInput
): Promise<AskDocumentOutput> {
  return askDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askDocumentPrompt',
  input: {schema: AskDocumentInputSchema},
  output: {schema: AskDocumentOutputSchema},
  prompt: `You are a highly-skilled AI analyst. Your task is to provide detailed and accurate answers to user questions based SOLELY on the content of the documents provided. Do not use any external knowledge.

For each user query, you MUST generate a complete and structured response with the following fields: 'question', 'directAnswer', 'summary', 'keyPoints', 'confidenceScore', and 'sourceFile'.

Follow these steps for each user query:
1.  **Analyze the User's Query**: First, understand the core intent of the user's question. What specific information are they looking for?
2.  **Scan Documents for Keywords**: Identify keywords and phrases in the query. Scan all provided documents for these keywords and related concepts.
3.  **Extract Relevant Facts**: From the documents, extract every piece of information that is relevant to the user's query. This includes direct statements, clauses, and data points.
4.  **Synthesize the Answer and Generate Output**:
    - **directAnswer**: Provide a concise, one-sentence answer to the user's question.
    - **summary**: Write a detailed summary that elaborates on the direct answer, providing context and explaining the nuances found in the document.
    - **keyPoints**: Create a bulleted list of the most important facts, evidence, or clauses from the document that directly support your answer.
    - **confidenceScore**: Based on how explicitly the information is stated in the document, provide a confidence score from 0 to 100. A score of 100 means the document directly and unambiguously answers the question. A lower score indicates the answer is inferred or based on less direct evidence.
    - **sourceFile**: You MUST identify which document was the primary source and set the 'sourceFile' field to the name of that file. If the answer is synthesized from multiple sources, pick the most relevant one.
5.  **Handle Missing Information**: If the documents DO NOT contain the information needed to answer a question, you MUST explicitly state this in the 'directAnswer', 'summary', and 'keyPoints' fields. Set the 'confidenceScore' to 0 and do not set a 'sourceFile'.

**Context for the Conversation**

{{#if documents}}
**Available Documents:**
{{#each documents}}
---
Document Name: {{{name}}}
Content:
{{media url=content}}
---
{{/each}}
{{/if}}

**Conversation History:**
{{#each history}}
{{#if this.role.user}}User: {{content}}{{/if}}
{{#if this.role.model}}AI: {{content}}{{/if}}
{{/each}}

**User's New Question(s):**
Based on the documents and the conversation history, please provide a detailed and structured answer for the following question(s):
{{#each userQueries}}
- {{{this}}}
{{/each}}
`,
});

const askDocumentFlow = ai.defineFlow(
  {
    name: 'askDocumentFlow',
    inputSchema: AskDocumentInputSchema,
    outputSchema: AskDocumentOutputSchema,
  },
  async (input) => {
     // Create a history that Handlebars can easily parse
    const parsableHistory = input.history.map(turn => ({
      ...turn,
      role: {
        [turn.role]: true,
      }
    }));
    
    const {output} = await prompt({...input, history: parsableHistory});
    return output!;
  }
);
