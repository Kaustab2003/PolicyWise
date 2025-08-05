'use client';

import 'regenerator-runtime/runtime';
import { useState, useRef, useEffect } from 'react';
import { askDocumentAction, improveAction, summarizeAction, translateAction, summarizeDocumentAction, complianceCheckAction, riskDetectionAction, generateSpeechAction } from './actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, FileSearch, Bot, BookMarked, BrainCircuit, UploadCloud, FileQuestion, MessageSquareQuote, FileText, X, Image as ImageIcon, PlusCircle, CheckCircle, Printer, Download, FileSignature, ShieldCheck, AlertTriangle, ShieldX, FileUp, Replace, Check, ChevronsUpDown, User, UserCircle, Volume2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { GenerateSummaryFromQueryOutput } from '@/ai/flows/generate-summary-from-query';
import type { SuggestPolicyImprovementsOutput } from '@/ai/flows/suggest-policy-improvements';
import type { AskDocumentOutput } from '@/ai/flows/ask-document';
import type { TranslateTextOutput } from '@/ai/flows/translate-text';
import type { SummarizeDocumentOutput } from '@/ai/flows/summarize-document';
import type { ComplianceCheckOutput } from '@/ai/flows/compliance-checker';
import type { RiskDetectionOutput } from '@/ai/flows/risk-detection';
import type { GenerateSpeechOutput } from '@/ai/flows/generate-speech';
import { LanguageSelector } from '@/components/language-selector';
import { VoiceInput } from '@/components/voice-input';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from '@/components/ui/sidebar';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ThemeSwitcher } from '@/components/theme-switcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { z } from 'zod';


export const maxDuration = 120;

// Zod Schemas for input validation, moved from AI flows
const SuggestPolicyImprovementsInputSchema = z.object({
  policyDocument: z.string().describe("The draft policy document to be reviewed."),
});
export type SuggestPolicyImprovementsInput = z.infer<typeof SuggestPolicyImprovementsInputSchema>;

const GenerateSummaryFromQueryInputSchema = z.object({
  policyDocument: z.string().describe('The content of the policy document.'),
  userQueries: z.array(z.string()).describe('The user queries related to the policy document.'),
  clauseClassifications: z.string().describe('Clause classifications extracted from the document.'),
});
export type GenerateSummaryFromQueryInput = z.infer<typeof GenerateSummaryFromQueryInputSchema>;

const DocumentContextSchema = z.object({
  name: z.string().describe('The name of the document file.'),
  content: z.string().describe("A data URI representing the document content (e.g., 'data:image/jpeg;base64,...' or 'data:application/pdf;base64,...')."),
});
const ConversationTurnSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'model']),
  content: z.string(),
  sourceFile: z.string().optional(),
});
const AskDocumentInputSchema = z.object({
  documents: z.array(DocumentContextSchema).describe('An array of documents to search for an answer.'),
  history: z.array(ConversationTurnSchema.omit({id: true})).describe('The conversation history.'),
  userQuery: z.string().describe('The latest user question.'),
});
export type AskDocumentInput = z.infer<typeof AskDocumentInputSchema>;

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  targetLanguage: z.string().describe('The target language code (e.g., "es", "fr", "hi").'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const SummarizeDocumentInputSchema = z.object({
  documentContent: z.string().describe("A data URI representing the document content."),
  targetLanguage: z.string().describe('The target language for the summary (e.g., "es", "fr", "hi").'),
});
export type SummarizeDocumentInput = z.infer<typeof SummarizeDocumentInputSchema>;

const ComplianceCheckInputSchema = z.object({
  policyDocument: z.string().describe("The policy document to be checked."),
  complianceStandard: z.string().describe('The compliance standard to check against.'),
});
export type ComplianceCheckInput = z.infer<typeof ComplianceCheckInputSchema>;

const RiskDetectionInputSchema = z.object({
  policyDocument: z.string().describe("The policy document to be analyzed for risks."),
});
export type RiskDetectionInput = z.infer<typeof RiskDetectionInputSchema>;

const GenerateSpeechInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
});
export type GenerateSpeechInput = z.infer<typeof GenerateSpeechInputSchema>;

const defaultPolicy = `## TechGadget Pro - 1-Year Limited Warranty

### 1. COVERAGE
This Limited Warranty covers your TechGadget Pro (the "Product") against defects in materials and workmanship when used normally in accordance with TechGadget's published guidelines for a period of ONE (1) YEAR from the date of original retail purchase by the end-user purchaser ("Warranty Period"). TechGadget’s published guidelines include but are not to limited to information contained in technical specifications, user manuals and service communications.

### 2. EXCLUSIONS
This Warranty does not apply to:
a) consumable parts, such as batteries or protective coatings that are designed to diminish over time, unless failure has occurred due to a defect in materials or workmanship;
b) cosmetic damage, including but not to limited to scratches, dents and broken plastic on ports unless failure has occurred due to a defect in materials or workmanship;
c) damage caused by use with a third party component or product that does not meet the Product’s specifications;
d) accidental damage, abuse, misuse, liquid contact, fire, earthquake or other external cause;
e) to a Product that has been modified to alter functionality or capability without the written permission of TechGadget.

### 3. SERVICE
If a defect arises and a valid claim is received by TechGadget within the Warranty Period, TechGadget will, at its option and to the extent permitted by law, either (1) repair the Product at no charge, using new or refurbished replacement parts or (2) exchange the Product with a new or refurbished Product.
`;

export default function Home() {
  const [policy, setPolicy] = useState(defaultPolicy);
  
  // State for multiple questions
  const [currentQuery, setCurrentQuery] = useState('');
  const [queries, setQueries] = useState<string[]>(['Is accidental drop damage covered?']);
  
  const [activeTab, setActiveTab] = useState<'query' | 'improve' | 'ask' | 'translate' | 'summarize' | 'compliance' | 'risk'>('query');
  const [language, setLanguage] = useState('en');

  type DocumentContext = {
    name: string;
    content: string;
  };

  type ConversationTurn = z.infer<typeof ConversationTurnSchema>;

  // State for document Q&A
  const [documentFiles, setDocumentFiles] = useState<DocumentContext[]>([]);
  const [documentQuery, setDocumentQuery] = useState('');
  const [askHistory, setAskHistory] = useState<ConversationTurn[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for translation
  const [textToTranslate, setTextToTranslate] = useState('');
  const [translationResult, setTranslationResult] = useState<TranslateTextOutput | null>(null);

  // State for document summarization
  const [summarizeFile, setSummarizeFile] = useState<DocumentContext | null>(null);
  const [summarizeResult, setSummarizeResult] = useState<SummarizeDocumentOutput | null>(null);
  const summarizeFileInputRef = useRef<HTMLInputElement>(null);

  // State for compliance checker
  const [complianceStandard, setComplianceStandard] = useState('GDPR');
  const [complianceResult, setComplianceResult] = useState<ComplianceCheckOutput | null>(null);
  const [complianceFile, setComplianceFile] = useState<DocumentContext | null>(null);
  const complianceFileInputRef = useRef<HTMLInputElement>(null);
  
  // State for risk detection
  const [riskResult, setRiskResult] = useState<RiskDetectionOutput | null>(null);
  const [riskFile, setRiskFile] = useState<DocumentContext | null>(null);
  const riskFileInputRef = useRef<HTMLInputElement>(null);

  // State for Text-to-Speech
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [currentlyLoading, setCurrentlyLoading] = useState<string | null>(null);

  const [summaryResult, setSummaryResult] =
    useState<GenerateSummaryFromQueryOutput | null>(null);
  const [improvementResult, setImprovementResult] =
    useState<SuggestPolicyImprovementsOutput | null>(null);
  const improvementResultRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
    const audio = new Audio();
    setAudioPlayer(audio);

    const handleEnded = () => setCurrentlyPlaying(null);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      if (activeTab === 'query') {
        setCurrentQuery(transcript);
      } else if (activeTab === 'ask') {
        setDocumentQuery(transcript);
      }
    }
  }, [transcript, activeTab]);

  const handleAddQuery = () => {
    if (currentQuery.trim() && !queries.includes(currentQuery.trim())) {
      setQueries([...queries, currentQuery.trim()]);
      setCurrentQuery('');
    }
  };

  const handleRemoveQuery = (index: number) => {
    setQueries(queries.filter((_, i) => i !== index));
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const processFile = async (
    file: File
  ): Promise<{ file?: DocumentContext; error?: string }> => {
    const allowedFileExtensions = ['.txt', '.md', '.pdf', '.jpg', '.jpeg', '.png'];
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;
  
    if (!allowedFileExtensions.includes(fileExtension)) {
      return {
        error: `Skipping '${file.name}'. Please upload text, PDF, JPG, or PNG files.`,
      };
    }
  
    try {
      const dataUri = await readFileAsDataURL(file);
      return { file: { name: file.name, content: dataUri } };
    } catch (error) {
      console.error('Error processing file:', error);
      const errorMessage =
        error instanceof Error
          ? `Could not process ${file.name}: ${error.message}`
          : `Could not read or parse ${file.name}.`;
      return { error: errorMessage };
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (documentFiles.length + files.length > 5) {
      toast({
        variant: 'destructive',
        title: 'Upload Limit Exceeded',
        description: 'You can upload a maximum of 5 files.',
      });
      return;
    }

    setIsLoading(true);
    setAskHistory([]);

    const newFiles: DocumentContext[] = [];

    for (const file of Array.from(files)) {
      const result = await processFile(file);
      if (result.file) {
        newFiles.push(result.file);
      } else if (result.error) {
        toast({
          variant: 'destructive',
          title: 'File Processing Error',
          description: result.error,
        });
      }
    }

    setDocumentFiles(prevFiles => [...prevFiles, ...newFiles]);
    setIsLoading(false);

    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };
  
  const createSingleFileHandler = (
    setFile: (file: DocumentContext | null) => void,
    setResult: (result: any) => void,
    inputRef: React.RefObject<HTMLInputElement>
  ) => async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setResult(null);
    setFile(null);

    const result = await processFile(file);
    
    if (result.file) {
      setFile(result.file);
    } else if (result.error) {
       toast({
         variant: 'destructive',
         title: 'File Processing Error',
         description: result.error,
       });
    }
    
    setIsLoading(false);

    if(inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleSummarizeFileChange = createSingleFileHandler(setSummarizeFile, setSummarizeResult, summarizeFileInputRef);
  const handleComplianceFileChange = createSingleFileHandler(setComplianceFile, setComplianceResult, complianceFileInputRef);
  const handleRiskFileChange = createSingleFileHandler(setRiskFile, setRiskResult, riskFileInputRef);


  const removeFile = (fileName: string) => {
    setDocumentFiles(files => files.filter(file => file.name !== fileName));
  }
  
  const removeSummarizeFile = () => setSummarizeFile(null);
  const removeComplianceFile = () => setComplianceFile(null);
  const removeRiskFile = () => setRiskFile(null);

  const handleAskDocument = async () => {
    if (documentQuery.trim() === '') {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter a question.' });
      return;
    }
    setIsLoading(true);
    setSummaryResult(null);
    setImprovementResult(null);
    setTranslationResult(null);
    setSummarizeResult(null);
    setComplianceResult(null);
    setRiskResult(null);
    
    const userTurn: ConversationTurn = { id: crypto.randomUUID(), role: 'user', content: documentQuery };
    const newHistory = [...askHistory, userTurn];
    setAskHistory(newHistory);
    setDocumentQuery('');
    
    const input: AskDocumentInput = {
      documents: documentFiles.map(f => ({ name: f.name, content: f.content })),
      history: askHistory.map(({id, ...rest}) => rest), // Omit id for the API call
      userQuery: documentQuery,
    };
    
    const result = await askDocumentAction(input, language);
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      // Remove the user's query from history if there was an error
      setAskHistory(prev => prev.slice(0, -1));
    } else if (result.data) {
      const modelTurn: ConversationTurn = { id: crypto.randomUUID(), role: 'model', content: result.data.answer, sourceFile: result.data.sourceFile };
      setAskHistory(prev => [...prev, modelTurn]);
    }
    setIsLoading(false);
  };

  const handleSummarize = async () => {
    setIsLoading(true);
    setImprovementResult(null);
    setAskHistory([]);
    setTranslationResult(null);
    setSummarizeResult(null);
    setComplianceResult(null);
    setRiskResult(null);

    const input: GenerateSummaryFromQueryInput = {
      policyDocument: policy,
      userQueries: queries,
      clauseClassifications: 'Coverage, Exclusion, Limit, Definition, Service'
    };

    const result = await summarizeAction(input, language);
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      setSummaryResult(null);
    } else {
      setSummaryResult(result.data);
    }
    setIsLoading(false);
  };

  const handleImprove = async () => {
    setIsLoading(true);
    setSummaryResult(null);
    setAskHistory([]);
    setTranslationResult(null);
    setSummarizeResult(null);
    setComplianceResult(null);
    setRiskResult(null);
    const result = await improveAction({ policyDocument: policy }, language);
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      setImprovementResult(null);
    } else {
      setImprovementResult(result.data);
    }
    setIsLoading(false);
  };
  
  const handleTranslate = async () => {
    setIsLoading(true);
    setSummaryResult(null);
    setImprovementResult(null);
    setAskHistory([]);
    setSummarizeResult(null);
    setComplianceResult(null);
    setRiskResult(null);
    const result = await translateAction({ text: textToTranslate, targetLanguage: language });
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      setTranslationResult(null);
    } else {
      setTranslationResult(result.data);
    }
    setIsLoading(false);
  };

  const handleSummarizeDocument = async () => {
    if (!summarizeFile) return;
    setIsLoading(true);
    setAskHistory([]);
    setSummaryResult(null);
    setImprovementResult(null);
    setTranslationResult(null);
    setComplianceResult(null);
    setRiskResult(null);
    
    const input: SummarizeDocumentInput = {
      documentContent: summarizeFile.content,
      targetLanguage: language
    };

    const result = await summarizeDocumentAction(input);
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      setSummarizeResult(null);
    } else {
      setSummarizeResult(result.data);
    }
    setIsLoading(false);
  };

  const handleComplianceCheck = async () => {
    const document = complianceFile?.content || policy;
    if (!document) return;

    setIsLoading(true);
    setSummaryResult(null);
    setImprovementResult(null);
    setAskHistory([]);
    setTranslationResult(null);
    setSummarizeResult(null);
    setRiskResult(null);

    const input: ComplianceCheckInput = {
      policyDocument: document,
      complianceStandard: complianceStandard,
    };

    const result = await complianceCheckAction(input, language);
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      setComplianceResult(null);
    } else {
      setComplianceResult(result.data);
    }
    setIsLoading(false);
  };

  const handleRiskDetection = async () => {
    const document = riskFile?.content || policy;
    if (!document) return;

    setIsLoading(true);
    setSummaryResult(null);
    setImprovementResult(null);
    setAskHistory([]);
    setTranslationResult(null);
    setSummarizeResult(null);
    setComplianceResult(null);

    const input: RiskDetectionInput = {
      policyDocument: document
    };

    const result = await riskDetectionAction(input, language);
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      setRiskResult(null);
    } else {
      setRiskResult(result.data);
    }
    setIsLoading(false);
  };
  
  const handleVoiceSearch = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ language });
    }
  };

  const handlePlayAudio = async (turnId: string, text: string) => {
    if (!audioPlayer) return;

    if (currentlyPlaying === turnId) {
      audioPlayer.pause();
      setCurrentlyPlaying(null);
      return;
    }

    setCurrentlyLoading(turnId);
    setCurrentlyPlaying(null);

    try {
      const result = await generateSpeechAction({ text });
      if (result.error || !result.data) {
        throw new Error(result.error || 'Failed to generate audio.');
      }
      audioPlayer.src = result.data.audioDataUri;
      audioPlayer.play();
      setCurrentlyPlaying(turnId);
    } catch (e) {
      const error = e instanceof Error ? e.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Audio Error',
        description: error,
      });
    } finally {
      setCurrentlyLoading(null);
    }
  };

  const handlePrint = () => {
    if (!improvementResultRef.current) return;
    const printContent = improvementResultRef.current.innerHTML;

    const printWindow = window.open('', '', 'height=800,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Policy Improvement Report</title>');
      // A simple stylesheet for printing.
      printWindow.document.write(`
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; }
          .prose { max-width: 100%; }
          .prose h1, .prose h2, .prose h3 { margin-bottom: 0.5em; }
          .prose p { margin-top: 0; }
          .prose ul, .prose ol { padding-left: 2em; }
          .prose pre { white-space: pre-wrap; background-color: #f3f4f6; padding: 1em; border-radius: 0.5em; }
          .card { border: 1px solid #e5e7eb; border-radius: 0.75rem; margin-bottom: 1.5rem; }
          .card-header { padding: 1.5rem; border-bottom: 1px solid #e5e7eb; }
          .card-title { font-size: 1.25rem; font-weight: 600; }
          .card-content { padding: 1.5rem; }
        </style>
      `);
      printWindow.document.write('</head><body>');
      printWindow.document.write(printContent);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      // Use a timeout to ensure content is loaded before printing
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const handleDownload = (format: 'txt' | 'pdf' | 'jpg') => {
    if (!improvementResultRef.current || !improvementResult) return;
  
    const contentElement = improvementResultRef.current;
    const filename = 'policy-improvement-report';
  
    if (format === 'txt') {
      // Create a plain text version of the report
      const { summary, improvements } = improvementResult;
      let textContent = `POLICY IMPROVEMENT REPORT\n\n`;
      textContent += `ANALYSIS SUMMARY:\n${summary}\n\n`;
      textContent += `----------------------------------------\n\n`;
      textContent += `IMPROVEMENT SUGGESTIONS:\n\n`;
      improvements.forEach(item => {
        textContent += `TITLE: ${item.title}\n`;
        textContent += `DETAILS:\n${item.details}\n\n`;
      });
  
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === 'jpg' || format === 'pdf') {
       html2canvas(contentElement, {
         onclone: (document) => {
           // Un-invert prose styles for light background canvas
           const proseElement = document.querySelector('.dark\\:prose-invert');
           if (proseElement) {
             proseElement.classList.remove('dark:prose-invert');
           }
         },
         backgroundColor: window.getComputedStyle(document.body).getPropertyValue('background-color'),
         scale: 2,
       }).then(canvas => {
         const imgData = canvas.toDataURL('image/jpeg', 1.0);
         
         if (format === 'jpg') {
           const a = document.createElement('a');
           a.href = imgData;
           a.download = `${filename}.jpg`;
           document.body.appendChild(a);
           a.click();
           document.body.removeChild(a);
         } else { // pdf
           const pdf = new jsPDF({
             orientation: 'p',
             unit: 'px',
             format: [canvas.width, canvas.height]
           });
           pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
           pdf.save(`${filename}.pdf`);
         }
       });
    }
  };


  const renderResults = () => {
    if (isLoading && askHistory.length === 0 && !summaryResult && !improvementResult && !translationResult && !summarizeResult && !complianceResult && !riskResult) {
      return <ResultsSkeleton />;
    }

    if (activeTab === 'risk' && riskResult) {
      const getRiskColor = (level: string) => {
        switch (level) {
          case 'Critical': return 'border-red-500 bg-red-500/10';
          case 'High': return 'border-orange-500 bg-orange-500/10';
          case 'Medium': return 'border-yellow-500 bg-yellow-500/10';
          case 'Low': return 'border-green-500 bg-green-500/10';
          default: return 'border-gray-500 bg-gray-500/10';
        }
      };
      return (
        <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="text-primary" />
                Overall Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {riskResult.overallRiskAssessment}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="text-primary" />
                Risk Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {riskResult.riskReport.map((item, index) => (
                  <AccordionItem value={`item-${index}`} key={index} className={cn("border-l-4 pl-4", getRiskColor(item.riskLevel))}>
                    <AccordionTrigger className="text-left font-semibold hover:no-underline">
                      <div className="flex items-center gap-2">
                        <span>{item.riskArea}</span>
                        <Badge variant="destructive">{item.riskLevel}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="prose prose-sm dark:prose-invert max-w-none pt-2">
                      <p><strong>Description:</strong> {item.description}</p>
                      <p><strong>Suggestion:</strong> {item.suggestion}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    if (activeTab === 'compliance' && complianceResult) {
      return (
        <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="text-primary" />
                Overall Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold text-muted-foreground">
                  <span>Compliance Score</span>
                  <span>{Math.round(complianceResult.complianceScore)}%</span>
                </div>
                <Progress value={complianceResult.complianceScore} />
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap mt-4">
                {complianceResult.overallCompliance}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="text-primary" />
                Compliance Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceResult.complianceReport.map((item, index) => (
                  <div key={index} className="p-4 rounded-md border bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      {item.isCompliant ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <ShieldX className="h-5 w-5 text-red-500" />
                      )}
                      <h4 className="font-semibold">{item.isCompliant ? 'Compliant' : 'Not Compliant'}</h4>
                    </div>
                    <pre className="bg-background p-2 rounded-md overflow-x-auto text-xs font-code mb-2">
                      <code>{item.clause}</code>
                    </pre>
                    <p className="text-sm text-muted-foreground">{item.reason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (activeTab === 'summarize' && summarizeResult) {
      return (
        <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="text-primary" />
                Document Summary
              </CardTitle>
              <CardDescription>
                A detailed summary of the document is below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {summarizeResult.summary}
              </div>
            </CardContent>
          </Card>
          {summarizeResult.keyPoints && summarizeResult.keyPoints.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="text-primary" />
                  Key Points
                </CardTitle>
                <CardDescription>
                  The most important points identified from the document.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {summarizeResult.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                      <span className="text-sm">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    if (activeTab === 'translate' && translationResult) {
      return (
        <Card className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="text-primary" />
              Translated Text
            </CardTitle>
            <CardDescription>
              The translated text is below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
              {translationResult.translatedText}
            </div>
          </CardContent>
        </Card>
      )
    }

    if (activeTab === 'ask' && askHistory.length > 0) {
       return (
        <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
          {askHistory.map((turn, index) => (
            <div key={turn.id} className="flex gap-3">
              <div className="p-1.5 bg-muted rounded-full h-fit">
                {turn.role === 'user' ? <User className="h-5 w-5 text-muted-foreground" /> : <Bot className="h-5 w-5 text-primary" />}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center">
                   <h4 className="font-semibold capitalize">{turn.role}</h4>
                    {turn.role === 'model' && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                           <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => handlePlayAudio(turn.id, turn.content)}
                            disabled={currentlyLoading !== null}
                          >
                            {currentlyLoading === turn.id ? (
                               <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                               <Volume2 className={cn("h-4 w-4", currentlyPlaying === turn.id && "text-primary")} />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Read aloud</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                  {turn.content}
                </div>
                {turn.sourceFile && (
                  <div className="pt-2">
                    <Badge variant="secondary">
                      <FileText className="mr-1.5 h-3 w-3" />
                      Source: {turn.sourceFile}
                    </Badge>
                  </div>
                )}
                 {isLoading && index === askHistory.length - 1 && turn.role === 'user' && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm pt-2">
                    <Bot className="h-5 w-5 animate-pulse" />
                    <span>Thinking...</span>
                  </div>
                 )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'query' && summaryResult) {
      return (
        <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
          {summaryResult.answers.map((item, index) => (
             <div key={index} className="space-y-6">
              <Card>
                <CardHeader>
                   <CardTitle className="flex items-center gap-2 text-lg">
                      <FileQuestion className="text-primary" />
                      {item.question}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{item.summary}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Confidence Score</span>
                      <span>{Math.round(item.confidenceScore * 100)}%</span>
                    </div>
                    <Progress value={item.confidenceScore * 100} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookMarked className="text-primary" />
                    Relevant Clauses
                  </CardTitle>
                  <CardDescription>
                    These clauses were identified as most relevant to this question.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {item.relevantClauses.map((clause, clauseIndex) => (
                      <pre
                        key={clauseIndex}
                        className="bg-muted p-4 rounded-md overflow-x-auto"
                      >
                        <code className="font-code text-sm">{clause}</code>
                      </pre>
                    ))}
                  </div>
                </CardContent>
              </Card>
             </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'improve' && improvementResult) {
      return (
        <div ref={improvementResultRef} className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
            {/* Report Summary Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileSignature className="text-primary"/>
                        Analysis Report
                    </CardTitle>
                    <CardDescription>
                        A high-level summary of the policy's quality.
                    </CardDescription>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                    <p>{improvementResult.summary}</p>
                </CardContent>
            </Card>

            {/* Improvement Suggestions Card */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="text-accent"/>
                                Improvement Suggestions
                            </CardTitle>
                            <CardDescription>
                                Detailed suggestions to improve your policy.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" onClick={handlePrint}>
                                        <Printer/>
                                        <span className="sr-only">Print</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Print Report</TooltipContent>
                            </Tooltip>
                            <DropdownMenu>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="icon">
                                                <Download/>
                                                <span className="sr-only">Download Report</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>Download Report</TooltipContent>
                                </Tooltip>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onSelect={() => handleDownload('txt')}>Save as TXT</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleDownload('jpg')}>Save as JPG</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleDownload('pdf')}>Save as PDF</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                        {improvementResult.improvements.map((item, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger className="text-left font-semibold hover:no-underline">
                                    {item.title}
                                </AccordionTrigger>
                                <AccordionContent className="prose prose-sm dark:prose-invert max-w-none pt-2">
                                    <p>{item.details}</p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
      );
    }

    let emptyStateIcon = <FileSearch className="h-12 w-12 text-primary" />;
    if (activeTab === 'ask') {
      emptyStateIcon = <FileQuestion className="h-12 w-12 text-primary" />;
    } else if (activeTab === 'translate') {
      emptyStateIcon = <MessageSquareQuote className="h-12 w-12 text-primary" />;
    } else if (activeTab === 'improve') {
      emptyStateIcon = <Sparkles className="h-12 w-12 text-primary" />;
    } else if (activeTab === 'summarize') {
      emptyStateIcon = <FileText className="h-12 w-12 text-primary" />;
    } else if (activeTab === 'compliance') {
      emptyStateIcon = <ShieldCheck className="h-12 w-12 text-primary" />;
    } else if (activeTab === 'risk') {
      emptyStateIcon = <AlertTriangle className="h-12 w-12 text-primary" />;
    }

    return <EmptyState icon={emptyStateIcon} />;
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'query' | 'improve' | 'ask' | 'translate' | 'summarize' | 'compliance' | 'risk');
  };

  const complianceStandards = [
    { value: 'GDPR', label: 'GDPR (General Data Protection Regulation)' },
    { value: 'HIPAA', label: 'HIPAA (Health Insurance Portability and Accountability Act)' },
    { value: 'CCPA', label: 'CCPA (California Consumer Privacy Act)' },
    { value: 'PCI DSS', label: 'PCI DSS (Payment Card Industry Data Security Standard)' },
    { value: 'SOX', label: 'SOX (Sarbanes-Oxley Act)' },
    { value: 'ISO 27001', label: 'ISO/IEC 27001' },
  ];

  const ComplianceStandardCombobox = () => {
    const [open, setOpen] = useState(false);
  
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="truncate">
              {complianceStandards.find((s) => s.value.toLowerCase() === complianceStandard.toLowerCase())?.label || complianceStandard || "Select a standard..."}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput 
              placeholder="Search or type custom standard..."
              value={complianceStandard}
              onValueChange={setComplianceStandard}
            />
            <CommandList>
              <CommandEmpty>No standard found.</CommandEmpty>
              <CommandGroup>
                {complianceStandards.map((standard) => (
                  <CommandItem
                    key={standard.value}
                    value={standard.value}
                    onSelect={(currentValue) => {
                      setComplianceStandard(currentValue.toUpperCase());
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        complianceStandard.toLowerCase() === standard.value.toLowerCase() ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {standard.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  const renderCurrentTab = () => {
    const commonButtonClasses = "w-full transition-all transform hover:scale-105 hover:brightness-110 hover:saturate-125 active:scale-100";

    const FileUploadDisplay = ({ file, onRemove, onTriggerClick, isLoading }: { file: DocumentContext | null, onRemove: () => void, onTriggerClick: () => void, isLoading: boolean }) => (
      <div className="space-y-2">
        <label className="font-semibold">Policy Document</label>
        {file ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-muted rounded-md text-sm">
              <div className="flex items-center gap-2 truncate">
                {file.content.startsWith('data:image') ? <ImageIcon className="h-4 w-4 shrink-0" /> : <FileText className="h-4 w-4 shrink-0" />}
                <span className="truncate">{file.name}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onRemove}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" className="w-full" onClick={onTriggerClick}>
              <Replace className="mr-2" />
              Replace File
            </Button>
          </div>
        ) : (
          <Button variant="outline" className="w-full" onClick={onTriggerClick} disabled={isLoading}>
            <FileUp className="mr-2" />
            {isLoading ? 'Processing...' : 'Upload a file (.txt, .pdf, .jpg, .png)'}
          </Button>
        )}
      </div>
    );

    if (activeTab === 'risk') {
      return (
        <Card className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
          <CardHeader>
            <CardTitle>Risk Detection</CardTitle>
            <CardDescription>
              Analyze a policy to identify potential legal, financial, and operational risks.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <Input
                id="risk-file-upload"
                type="file"
                ref={riskFileInputRef}
                onChange={handleRiskFileChange}
                className="hidden"
                accept=".txt,.md,.pdf,.jpg,.jpeg,.png"
              />
            {riskFile ? (
               <FileUploadDisplay file={riskFile} onRemove={removeRiskFile} onTriggerClick={() => riskFileInputRef.current?.click()} isLoading={isLoading} />
            ) : (
              <div className="space-y-2">
                <label htmlFor="policy-doc-risk" className="font-semibold">Policy Document</label>
                <Textarea
                  id="policy-doc-risk"
                  placeholder="Paste your policy document here, or upload a file."
                  className="min-h-[300px] font-code text-xs"
                  value={policy}
                  onChange={(e) => setPolicy(e.target.value)}
                />
                 <Button variant="outline" className="w-full" onClick={() => riskFileInputRef.current?.click()} disabled={isLoading}>
                  <FileUp className="mr-2" />
                  {isLoading ? 'Processing...' : 'Or Upload a File'}
                </Button>
              </div>
            )}
            <Button
              onClick={handleRiskDetection}
              disabled={isLoading || (!policy && !riskFile)}
              className={cn(commonButtonClasses, "bg-primary hover:bg-primary/90 text-primary-foreground")}
            >
              {isLoading && activeTab === 'risk' ? 'Detecting...' : <><AlertTriangle className="mr-2"/>Detect Risks</>}
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    if (activeTab === 'compliance') {
      return (
        <Card className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
          <CardHeader>
            <CardTitle>Compliance Checker</CardTitle>
            <CardDescription>
              Check a policy's adherence to a specific compliance standard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="compliance-file-upload"
              type="file"
              ref={complianceFileInputRef}
              onChange={handleComplianceFileChange}
              className="hidden"
              accept=".txt,.md,.pdf,.jpg,.jpeg,.png"
            />
            {complianceFile ? (
               <FileUploadDisplay file={complianceFile} onRemove={removeComplianceFile} onTriggerClick={() => complianceFileInputRef.current?.click()} isLoading={isLoading} />
            ) : (
              <div className="space-y-2">
                <label htmlFor="policy-doc-compliance" className="font-semibold">Policy Document</label>
                <Textarea
                  id="policy-doc-compliance"
                  placeholder="Paste policy text or upload a file."
                  className="min-h-[250px] font-code text-xs"
                  value={policy}
                  onChange={(e) => setPolicy(e.target.value)}
                />
                <Button variant="outline" className="w-full" onClick={() => complianceFileInputRef.current?.click()} disabled={isLoading}>
                  <FileUp className="mr-2" />
                  {isLoading ? 'Processing...' : 'Or Upload a File'}
                </Button>
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="compliance-standard" className="font-semibold">Compliance Standard</label>
               <ComplianceStandardCombobox />
            </div>
            <Button
              onClick={handleComplianceCheck}
              disabled={isLoading || (!policy && !complianceFile) || !complianceStandard}
              className={cn(commonButtonClasses, "bg-accent hover:bg-accent/90 text-accent-foreground")}
            >
              {isLoading && activeTab === 'compliance' ? 'Checking...' : <><ShieldCheck className="mr-2" />Check Compliance</>}
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (activeTab === 'query') {
      return (
        <Card className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
          <CardHeader>
            <CardTitle>Analyze a Policy</CardTitle>
            <CardDescription>
              Enter a policy and ask one or more questions to get AI-powered summaries.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="policy-doc-query" className="font-semibold">Policy Document</label>
              <Textarea
                id="policy-doc-query"
                placeholder="Paste your policy document here..."
                className="min-h-[250px] font-code text-xs"
                value={policy}
                onChange={(e) => setPolicy(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="user-query" className="font-semibold">Your Questions</label>
              <div className="flex gap-2">
                <Input
                  id="user-query"
                  placeholder="Type a question..."
                  value={currentQuery}
                  onChange={(e) => setCurrentQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddQuery();
                    }
                  }}
                />
                <Button variant="outline" onClick={handleAddQuery} aria-label="Add question">
                  Add
                </Button>
                {isClient && browserSupportsSpeechRecognition && (
                  <VoiceInput
                    onToggle={handleVoiceSearch}
                    isListening={listening}
                  />
                )}
              </div>
            </div>
            
            {queries.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Added Questions:</p>
                <div className="flex flex-wrap gap-2">
                  {queries.map((q, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1.5">
                      {q}
                      <button onClick={() => handleRemoveQuery(index)} className="rounded-full hover:bg-muted-foreground/20">
                        <X className="h-3 w-3"/>
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handleSummarize}
              disabled={isLoading || !policy || queries.length === 0}
              className={cn(commonButtonClasses, "bg-primary hover:bg-primary/90 text-primary-foreground")}
            >
              {isLoading && activeTab === 'query' ? 'Analyzing...' : <><FileSearch className="mr-2"/>Analyze Queries</>}
            </Button>
          </CardContent>
        </Card>
      )
    }

    if (activeTab === 'improve') {
      return (
        <Card className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
          <CardHeader>
            <CardTitle>Improve a Policy Draft</CardTitle>
            <CardDescription>
              Get AI-powered suggestions to improve the clarity, fairness, and completeness of your policy.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="policy-doc-improve" className="font-semibold">Policy Document</label>
              <Textarea
                id="policy-doc-improve"
                placeholder="Paste your policy draft here..."
                className="min-h-[350px] font-code text-xs"
                value={policy}
                onChange={(e) => setPolicy(e.target.value)}
              />
            </div>
            <Button
              onClick={handleImprove}
              disabled={isLoading || !policy}
              className={cn(commonButtonClasses, "bg-accent hover:bg-accent/90 text-accent-foreground")}
            >
              {isLoading && activeTab === 'improve' ? 'Improving...' : <><Sparkles className="mr-2" />Suggest Improvements</>}
            </Button>
          </CardContent>
        </Card>
      )
    }

    if (activeTab === 'ask') {
      return (
        <Card className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
          <CardHeader>
            <CardTitle>Ask Document(s)</CardTitle>
            <CardDescription>
              Upload up to 5 documents to have a conversation about their content.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="doc-upload" className="font-semibold">Upload Documents</label>
              <Input
                id="doc-upload"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".txt,.md,.pdf,.jpg,.jpeg,.png"
                multiple
                disabled={documentFiles.length >= 5}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
                disabled={isLoading || documentFiles.length >= 5}
              >
                <UploadCloud className="mr-2" />
                {isLoading ? 'Processing...' : (documentFiles.length >= 5 ? 'Maximum files reached' : 'Select files (up to 5)')}
              </Button>
            </div>
            {documentFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Uploaded Files:</p>
                <div className="space-y-2">
                  {documentFiles.map((file) => (
                    <div key={file.name} className="flex items-center justify-between p-2 bg-muted rounded-md text-sm">
                      <div className="flex items-center gap-2 truncate">
                        {file.content.startsWith('data:image') ? <ImageIcon className="h-4 w-4 shrink-0" /> : <FileText className="h-4 w-4 shrink-0" />}
                        <span className="truncate">{file.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => removeFile(file.name)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
              {documentFiles.length > 0 && (
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label htmlFor="doc-query" className="font-semibold">Your Question</label>
                  <div className="flex gap-2">
                    <Input
                      id="doc-query"
                      placeholder="Ask a follow-up question..."
                      value={documentQuery}
                      onChange={(e) => setDocumentQuery(e.target.value)}
                       onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAskDocument();
                        }
                      }}
                    />
                    {isClient && browserSupportsSpeechRecognition && (
                      <VoiceInput
                          onToggle={handleVoiceSearch}
                          isListening={listening}
                      />
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleAskDocument}
                  disabled={isLoading || documentQuery.trim() === ''}
                  className={cn(commonButtonClasses, "bg-primary hover:bg-primary/90 text-primary-foreground")}
                >
                  {isLoading ? 'Thinking...' : <><FileQuestion className="mr-2"/>Ask Question</>}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )
    }

    if (activeTab === 'summarize') {
      return (
        <Card className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
          <CardHeader>
            <CardTitle>Summarize a Document</CardTitle>
            <CardDescription>
              Upload a document (.txt, .md, .pdf, .jpg, .png) to get a concise summary in your selected language.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="summarize-upload" className="font-semibold">Upload Document</label>
              <Input
                id="summarize-upload"
                type="file"
                ref={summarizeFileInputRef}
                onChange={handleSummarizeFileChange}
                className="hidden"
                accept=".txt,.md,.pdf,.jpg,.jpeg,.png"
              />
              {!summarizeFile && (
                <Button
                  variant="outline"
                  onClick={() => summarizeFileInputRef.current?.click()}
                  className="w-full"
                  disabled={isLoading}
                >
                  <UploadCloud className="mr-2" />
                  {isLoading ? 'Processing...' : 'Select a file'}
                </Button>
              )}
            </div>

            {summarizeFile && (
               <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Uploaded File:</p>
                <div className="flex items-center justify-between p-2 bg-muted rounded-md text-sm">
                  <div className="flex items-center gap-2 truncate">
                    {summarizeFile.content.startsWith('data:image') ? <ImageIcon className="h-4 w-4 shrink-0" /> : <FileText className="h-4 w-4 shrink-0" />}
                    <span className="truncate">{summarizeFile.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={removeSummarizeFile}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            <Button
              onClick={handleSummarizeDocument}
              disabled={isLoading || !summarizeFile}
              className={cn(commonButtonClasses, "bg-accent hover:bg-accent/90 text-accent-foreground")}
            >
              {isLoading && activeTab === 'summarize' ? 'Summarizing...' : <><BrainCircuit className="mr-2"/>Generate Summary</>}
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    if (activeTab === 'translate') {
       return (
        <Card className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
          <CardHeader>
            <CardTitle>Translate Text</CardTitle>
            <CardDescription>
              Enter text and select a language to translate it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="text-to-translate" className="font-semibold">Your Text</label>
              <Textarea
                id="text-to-translate"
                placeholder="Enter text to translate..."
                className="min-h-[250px]"
                value={textToTranslate}
                onChange={(e) => setTextToTranslate(e.target.value)}
              />
            </div>
            <Button
              onClick={handleTranslate}
              disabled={isLoading || !textToTranslate}
              className={cn(commonButtonClasses, "bg-primary hover:bg-primary/90 text-primary-foreground")}
            >
              {isLoading && activeTab === 'translate' ? 'Translating...' : <><MessageSquareQuote className="mr-2" />Translate Text</>}
            </Button>
          </CardContent>
        </Card>
       )
    }

    return null;
  }

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'query': return 'Query Policy';
      case 'improve': return 'Improve Policy';
      case 'ask': return 'Ask Document';
      case 'summarize': return 'Summarize Document';
      case 'translate': return 'Translate';
      case 'compliance': return 'Compliance Checker';
      case 'risk': return 'Risk Detection';
      default: return 'PolicyWise';
    }
  };

  return (
    <TooltipProvider>
      <Sidebar collapsible="icon" variant="sidebar">
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={activeTab === 'query'} onClick={() => handleTabChange('query')} tooltip="Query Policy">
                <FileSearch />
                <span>Query Policy</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={activeTab === 'improve'} onClick={() => handleTabChange('improve')} tooltip="Improve Policy">
                <Sparkles />
                <span>Improve Policy</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={activeTab === 'ask'} onClick={() => handleTabChange('ask')} tooltip="Ask Document">
                <FileQuestion />
                <span>Ask Document</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton isActive={activeTab === 'summarize'} onClick={() => handleTabChange('summarize')} tooltip="Summarize Document">
                <FileText />
                <span>Summarize Document</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={activeTab === 'translate'} onClick={() => handleTabChange('translate')} tooltip="Translate">
                <MessageSquareQuote />
                <span>Translate</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={activeTab === 'compliance'} onClick={() => handleTabChange('compliance')} tooltip="Compliance Checker">
                <ShieldCheck />
                <span>Compliance Checker</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={activeTab === 'risk'} onClick={() => handleTabChange('risk')} tooltip="Risk Detection">
                <AlertTriangle />
                <span>Risk Detection</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-full">
          <header className="p-4 border-b flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-sm z-10">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden" />
              <h2 className="text-xl font-semibold capitalize">{getHeaderTitle()}</h2>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector value={language} onValueChange={setLanguage} />
              <ThemeSwitcher />
              <Button variant="ghost" asChild>
                <Link href="/about">About</Link>
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-4">
                {renderCurrentTab()}
              </div>
              <aside className="h-full">
                <Card className="sticky top-28 h-[calc(100vh-8rem)]">
                  <CardHeader>
                    <CardTitle>Results</CardTitle>
                    <CardDescription>
                      Your analysis will appear here.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="overflow-y-auto h-[calc(100vh-14rem)]">
                    {renderResults()}
                  </CardContent>
                </Card>
              </aside>
            </div>
          </main>
        </div>
      </SidebarInset>
    </TooltipProvider>
  );
}

const EmptyState = ({ icon }: { icon: React.ReactNode }) => (
  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 animate-in fade-in-50 duration-500">
    <div className="p-4 rounded-full bg-muted mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-foreground">Ready for Analysis</h3>
    <p className="mt-1">
      Your results will be displayed here once you submit an item for analysis.
    </p>
  </div>
);

const ResultsSkeleton = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-3/4 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="pt-4 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-5 w-full" />
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-3/4 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  </div>
);
