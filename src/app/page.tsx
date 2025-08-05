'use client';

import 'regenerator-runtime/runtime';
import { useState, useRef, useEffect } from 'react';
import { askDocumentAction, improveAction, summarizeAction, translateAction, summarizeDocumentAction } from './actions';
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
import { Sparkles, FileSearch, Bot, BookMarked, BrainCircuit, UploadCloud, FileQuestion, MessageSquareQuote, FileText, X, Image as ImageIcon, PlusCircle, CheckCircle, Printer, Download, FileSignature } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { GenerateSummaryFromQueryOutput } from '@/ai/flows/generate-summary-from-query';
import type { SuggestPolicyImprovementsOutput } from '@/ai/flows/suggest-policy-improvements';
import type { AskDocumentOutput, DocumentContext } from '@/ai/flows/ask-document';
import type { TranslateTextOutput } from '@/ai/flows/translate-text';
import type { SummarizeDocumentOutput } from '@/ai/flows/summarize-document';
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

export const maxDuration = 120;

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
  
  const [activeTab, setActiveTab] = useState<'query' | 'improve' | 'ask' | 'translate' | 'summarize'>('query');
  const [language, setLanguage] = useState('en');

  // State for document Q&A
  const [documentFiles, setDocumentFiles] = useState<DocumentContext[]>([]);
  const [currentDocumentQuery, setCurrentDocumentQuery] = useState('');
  const [documentQueries, setDocumentQueries] = useState<string[]>([]);
  const [askResult, setAskResult] = useState<AskDocumentOutput | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for translation
  const [textToTranslate, setTextToTranslate] = useState('');
  const [translationResult, setTranslationResult] = useState<TranslateTextOutput | null>(null);

  // State for document summarization
  const [summarizeFile, setSummarizeFile] = useState<DocumentContext | null>(null);
  const [summarizeResult, setSummarizeResult] = useState<SummarizeDocumentOutput | null>(null);
  const summarizeFileInputRef = useRef<HTMLInputElement>(null);

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
        setCurrentDocumentQuery(transcript);
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
  
  const handleAddDocumentQuery = () => {
    if (currentDocumentQuery.trim() && !documentQueries.includes(currentDocumentQuery.trim())) {
      setDocumentQueries([...documentQueries, currentDocumentQuery.trim()]);
      setCurrentDocumentQuery('');
    }
  };

  const handleRemoveDocumentQuery = (index: number) => {
    setDocumentQueries(documentQueries.filter((_, i) => i !== index));
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
    setAskResult(null); // Clear previous results

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
  
  const handleSummarizeFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setSummarizeResult(null);
    setSummarizeFile(null);

    const result = await processFile(file);
    
    if (result.file) {
      setSummarizeFile(result.file);
    } else if (result.error) {
       toast({
         variant: 'destructive',
         title: 'File Processing Error',
         description: result.error,
       });
    }
    
    setIsLoading(false);

    if(summarizeFileInputRef.current) {
      summarizeFileInputRef.current.value = '';
    }
  };

  const removeFile = (fileName: string) => {
    setDocumentFiles(files => files.filter(file => file.name !== fileName));
  }
  
  const removeSummarizeFile = () => {
    setSummarizeFile(null);
  }

  const handleAskDocument = async () => {
    if (documentQueries.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please add at least one question.' });
      return;
    }
    setIsLoading(true);
    setSummaryResult(null);
    setImprovementResult(null);
    setTranslationResult(null);
    setSummarizeResult(null);
    const result = await askDocumentAction(documentFiles, documentQueries, language);
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
      setAskResult(null);
    } else {
      setAskResult(result.data);
    }
    setIsLoading(false);
  };

  const handleSummarize = async () => {
    if (queries.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please add at least one question.' });
      return;
    }
    setIsLoading(true);
    setImprovementResult(null);
    setAskResult(null);
    setTranslationResult(null);
    setSummarizeResult(null);
    const result = await summarizeAction(policy, queries, language);
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
    setAskResult(null);
    setTranslationResult(null);
    setSummarizeResult(null);
    const result = await improveAction(policy, language);
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
    setAskResult(null);
    setSummarizeResult(null);
    const result = await translateAction(textToTranslate, language);
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
    setAskResult(null);
    setSummaryResult(null);
    setImprovementResult(null);
    setTranslationResult(null);
    const result = await summarizeDocumentAction(summarizeFile.content, language);
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
  
  const handleVoiceSearch = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ language });
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
    if (isLoading && !askResult && !summaryResult && !improvementResult && !translationResult && !summarizeResult) {
      return <ResultsSkeleton />;
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
                A concise summary of the document is below.
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

    if (activeTab === 'ask' && askResult) {
       return (
        <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
          {askResult.answers.map((item, index) => (
             <Card key={index}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileQuestion className="text-primary" />
                      {item.question}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {item.answer}
                  </div>
                  {item.sourceFile && (
                    <div className="pt-2">
                      <Badge variant="secondary">
                        <FileText className="mr-1.5 h-3 w-3" />
                        Source: {item.sourceFile}
                      </Badge>
                    </div>
                  )}
                </CardContent>
             </Card>
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
    }
    return <EmptyState icon={emptyStateIcon} />;
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'query' | 'improve' | 'ask' | 'translate' | 'summarize');
  };

  const renderCurrentTab = () => {
    const commonButtonClasses = "w-full transition-all transform hover:scale-105 hover:brightness-110 hover:saturate-125 active:scale-100";

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
              Upload up to 5 documents (text, pdf, images) to get AI-powered answers from their content.
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
              <>
                <div className="space-y-2">
                  <label htmlFor="doc-query" className="font-semibold">Your Questions</label>
                  <div className="flex gap-2">
                    <Input
                      id="doc-query"
                      placeholder="Type a question..."
                      value={currentDocumentQuery}
                      onChange={(e) => setCurrentDocumentQuery(e.target.value)}
                       onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddDocumentQuery();
                        }
                      }}
                    />
                    <Button variant="outline" onClick={handleAddDocumentQuery} aria-label="Add question">
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

                {documentQueries.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Added Questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {documentQueries.map((q, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1.5">
                          {q}
                           <button onClick={() => handleRemoveDocumentQuery(index)} className="rounded-full hover:bg-muted-foreground/20">
                            <X className="h-3 w-3"/>
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}


                <Button
                  onClick={handleAskDocument}
                  disabled={isLoading || documentQueries.length === 0}
                  className={cn(commonButtonClasses, "bg-primary hover:bg-primary/90 text-primary-foreground")}
                >
                  {isLoading && activeTab === 'ask' ? 'Thinking...' : <><FileQuestion className="mr-2"/>Ask Questions</>}
                </Button>
              </>
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
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-full">
          <header className="p-4 border-b flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-sm z-10">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden" />
              <h2 className="text-xl font-semibold capitalize">{activeTab === 'query' || activeTab === 'improve' ? `${activeTab} Policy` : activeTab === 'ask' ? 'Ask Document' : activeTab === 'summarize' ? 'Summarize Document' : 'Translate'}</h2>
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
