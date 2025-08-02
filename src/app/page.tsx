'use client';

import 'regenerator-runtime/runtime';
import { useState, useRef, useEffect } from 'react';
import { askDocumentAction, improveAction, summarizeAction, parsePdfAction, translateAction } from './actions';
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
import { Sparkles, FileSearch, Bot, BookMarked, BrainCircuit, UploadCloud, FileQuestion, MessageSquareQuote } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { GenerateSummaryFromQueryOutput } from '@/ai/flows/generate-summary-from-query';
import type { SuggestPolicyImprovementsOutput } from '@/ai/flows/suggest-policy-improvements';
import type { AskDocumentOutput } from '@/ai/flows/ask-document';
import type { TranslateTextOutput } from '@/ai/flows/translate-text';
import { LanguageSelector } from '@/components/language-selector';
import { VoiceInput } from '@/components/voice-input';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from '@/components/ui/sidebar';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

const defaultPolicy = `## TechGadget Pro - 1-Year Limited Warranty

### 1. COVERAGE
This Limited Warranty covers your TechGadget Pro (the "Product") against defects in materials and workmanship when used normally in accordance with TechGadget's published guidelines for a period of ONE (1) YEAR from the date of original retail purchase by the end-user purchaser ("Warranty Period"). TechGadget’s published guidelines include but are not limited to information contained in technical specifications, user manuals and service communications.

### 2. EXCLUSIONS
This Warranty does not apply to:
a) consumable parts, such as batteries or protective coatings that are designed to diminish over time, unless failure has occurred due to a defect in materials or workmanship;
b) cosmetic damage, including but not limited to scratches, dents and broken plastic on ports unless failure has occurred due to a defect in materials or workmanship;
c) damage caused by use with a third party component or product that does not meet the Product’s specifications;
d) accidental damage, abuse, misuse, liquid contact, fire, earthquake or other external cause;
e) to a Product that has been modified to alter functionality or capability without the written permission of TechGadget.

### 3. SERVICE
If a defect arises and a valid claim is received by TechGadget within the Warranty Period, TechGadget will, at its option and to the extent permitted by law, either (1) repair the Product at no charge, using new or refurbished replacement parts or (2) exchange the Product with a new or refurbished Product.
`;

export default function Home() {
  const [policy, setPolicy] = useState(defaultPolicy);
  const [query, setQuery] = useState('Is accidental drop damage covered?');
  const [activeTab, setActiveTab] = useState<'query' | 'improve' | 'ask' | 'translate'>('query');
  const [language, setLanguage] = useState('en');

  // State for document Q&A
  const [documentContent, setDocumentContent] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentQuery, setDocumentQuery] = useState('');
  const [askResult, setAskResult] = useState<AskDocumentOutput | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for translation
  const [textToTranslate, setTextToTranslate] = useState('');
  const [translationResult, setTranslationResult] = useState<TranslateTextOutput | null>(null);

  const [summaryResult, setSummaryResult] =
    useState<GenerateSummaryFromQueryOutput | null>(null);
  const [improvementResult, setImprovementResult] =
    useState<SuggestPolicyImprovementsOutput | null>(null);

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
        setQuery(transcript);
      } else if (activeTab === 'ask') {
        setDocumentQuery(transcript);
      }
    }
  }, [transcript, activeTab]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('text/') && file.type !== 'application/pdf') {
        toast({
          variant: 'destructive',
          title: 'Unsupported File Type',
          description: 'Please upload a plain text file (.txt, .md) or a PDF.',
        });
        return;
      }
      setDocumentName(file.name);
      setAskResult(null); // Clear previous results
      setIsLoading(true);

      const processFile = async () => {
        try {
          let textContent = '';
          if (file.type === 'application/pdf') {
            const formData = new FormData();
            formData.append('file', file);
            const result = await parsePdfAction(formData);
            if (result.error || !result.data) {
              throw new Error(result.error || 'Failed to parse PDF.');
            }
            textContent = result.data.documentContent;
          } else {
            textContent = await file.text();
          }
          setDocumentContent(textContent);
        } catch (error) {
           console.error("Error processing file:", error);
           toast({
             variant: 'destructive',
             title: 'File Processing Error',
             description: error instanceof Error ? error.message : 'Could not read or parse the uploaded file.',
           });
           setDocumentContent('');
           setDocumentName('');
        } finally {
          setIsLoading(false);
        }
      }
      processFile();
    }
  };

  const handleAskDocument = async () => {
    setIsLoading(true);
    setSummaryResult(null);
    setImprovementResult(null);
    const result = await askDocumentAction(documentContent, documentQuery, language);
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
    setIsLoading(true);
    setImprovementResult(null);
    setAskResult(null);
    const result = await summarizeAction(policy, query, language);
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
    setTranslationResult(null);
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
  
  const handleVoiceSearch = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ language });
    }
  };

  const renderResults = () => {
    if (isLoading && !askResult && !summaryResult && !improvementResult && !translationResult) {
      return <ResultsSkeleton />;
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
        <Card className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="text-primary" />
              AI Answer
            </CardTitle>
            <CardDescription>
              This answer is generated by AI based on your query and the uploaded document.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
              {askResult.answer}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (activeTab === 'query' && summaryResult) {
      return (
        <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="text-primary" />
                AI Summary
              </CardTitle>
              <CardDescription>
                This summary is generated by AI based on your query and the provided policy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{summaryResult.summary}</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Confidence Score</span>
                  <span>{Math.round(summaryResult.confidenceScore * 100)}%</span>
                </div>
                <Progress value={summaryResult.confidenceScore * 100} />
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
                These clauses were identified as most relevant to your query.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summaryResult.relevantClauses.map((clause, index) => (
                  <pre
                    key={index}
                    className="bg-muted p-4 rounded-md overflow-x-auto"
                  >
                    <code className="font-code text-sm">{clause}</code>
                  </pre>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (activeTab === 'improve' && improvementResult) {
      return (
        <Card className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="text-primary" />
              Suggested Improvements
            </CardTitle>
             <CardDescription>
              AI-powered suggestions to improve clarity, completeness, and fairness.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
              {improvementResult.suggestedImprovements}
            </div>
          </CardContent>
        </Card>
      );
    }

    let emptyStateIcon = <FileSearch className="h-12 w-12 text-primary" />;
    if (activeTab === 'ask') {
      emptyStateIcon = <FileQuestion className="h-12 w-12 text-primary" />;
    } else if (activeTab === 'translate') {
      emptyStateIcon = <MessageSquareQuote className="h-12 w-12 text-primary" />;
    } else if (activeTab === 'improve') {
      emptyStateIcon = <Sparkles className="h-12 w-12 text-primary" />;
    }
    return <EmptyState icon={emptyStateIcon} />;
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'query' | 'improve' | 'ask' | 'translate');
  };

  const renderCurrentTab = () => {
    const commonButtonClasses = "w-full transition-all transform hover:scale-105 hover:brightness-110 hover:saturate-125 active:scale-100";

    if (activeTab === 'query') {
      return (
        <Card className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
          <CardHeader>
            <CardTitle>Analyze a Policy</CardTitle>
            <CardDescription>
              Enter a policy document and ask a question to get an AI-powered summary.
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
              <label htmlFor="user-query" className="font-semibold">Your Question</label>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      id="user-query"
                      placeholder="e.g., Is water damage covered?"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Type or speak in your preferred language</p>
                  </TooltipContent>
                </Tooltip>
                {isClient && browserSupportsSpeechRecognition && (
                  <VoiceInput
                    onToggle={handleVoiceSearch}
                    isListening={listening}
                  />
                )}
              </div>
            </div>
            <Button
              onClick={handleSummarize}
              disabled={isLoading || !policy || !query}
              className={cn(commonButtonClasses, "bg-primary hover:bg-primary/90 text-primary-foreground")}
            >
              {isLoading && activeTab === 'query' ? 'Analyzing...' : <><FileSearch className="mr-2"/>Analyze Query</>}
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
            <CardTitle>Ask a Document</CardTitle>
            <CardDescription>
              Upload a document and ask a question to get an AI-powered answer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="doc-upload" className="font-semibold">Upload Document</label>
              <Input
                id="doc-upload"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="text/*,application/pdf"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
                disabled={isLoading}
              >
                <UploadCloud className="mr-2" />
                {isLoading && !documentContent ? 'Processing...' : (documentName ? `Selected: ${documentName}` : 'Select a file')}
              </Button>
            </div>
              {documentContent && (
              <>
                <div className="space-y-2">
                  <label htmlFor="doc-query" className="font-semibold">Your Question</label>
                  <div className="flex gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Input
                          id="doc-query"
                          placeholder="Ask anything about the document..."
                          value={documentQuery}
                          onChange={(e) => setDocumentQuery(e.target.value)}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Type or speak in your preferred language</p>
                      </TooltipContent>
                    </Tooltip>
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
                  disabled={isLoading || !documentQuery}
                  className={cn(commonButtonClasses, "bg-primary hover:bg-primary/90 text-primary-foreground")}
                >
                  {isLoading && activeTab === 'ask' ? 'Thinking...' : <><FileQuestion className="mr-2"/>Ask Question</>}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )
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
              <h2 className="text-xl font-semibold capitalize">{activeTab} Policy</h2>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector value={language} onValueChange={setLanguage} />
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
