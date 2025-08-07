'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FileSearch,
  Sparkles,
  FileQuestion,
  MessageSquareQuote,
  Mic,
  Languages,
  PanelLeft,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Download,
  Volume2,
  Gift,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 border-b flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <Logo />
        <nav>
          <Button variant="ghost" asChild>
            <Link href="/">Back to App</Link>
          </Button>
        </nav>
      </header>
      <main className="container mx-auto p-4 md:p-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-center text-primary">
            Welcome to PolicyWise
          </h1>
          <p className="text-lg text-muted-foreground mb-12 text-center">
            Your intelligent assistant for analyzing, improving, and understanding
            policy documents.
          </p>

          <Card className="mb-8 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Gift className="text-primary"/>
                What&apos;s New
              </CardTitle>
               <CardDescription>
                We&apos;ve added some powerful new features to make your workflow even smoother.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                    <Download className="h-6 w-6 text-primary" />
                    <div>
                    <h4 className="font-semibold">Download & Print Reports</h4>
                    <p className="text-sm text-muted-foreground">
                        You can now download the detailed reports from the &quot;Improve Policy&quot; tool in various formats (TXT, JPG, PDF) or print them directly.
                    </p>
                    </div>
                </div>
                 <div className="flex items-center gap-4">
                    <Volume2 className="h-6 w-6 text-primary" />
                    <div>
                    <h4 className="font-semibold">Text-to-Speech</h4>
                    <p className="text-sm text-muted-foreground">
                        Have the AI-generated summaries from the &quot;Ask Document&quot; tool read aloud to you. Just click the speaker icon next to a summary.
                    </p>
                    </div>
                </div>
            </CardContent>
          </Card>


          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">
                How to Use PolicyWise
              </CardTitle>
              <CardDescription>
                Using the app is simple. Select a tool from the sidebar and follow the steps to get the
                insights you need.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FileSearch className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    Query Policy
                  </h3>
                  <p className="text-muted-foreground">
                    Use this tool to ask specific questions about a policy.
                  </p>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>
                      Select &quot;Query Policy&quot; from the sidebar.
                    </li>
                    <li>
                      Paste the full policy text into the &quot;Policy Document&quot; area.
                    </li>
                    <li>Type your question(s) into the input field and click &quot;Add&quot;.</li>
                    <li>Click &quot;Analyze Queries&quot;.</li>
                  </ol>
                  <p className="mt-2 text-sm text-foreground/80">
                    The AI will return a direct summary, a confidence score, and
                    the most relevant clauses from the document for each question.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Sparkles className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    Improve Policy
                  </h3>
                  <p className="text-muted-foreground">
                    Get AI-driven feedback to make your policy clearer and more
                    effective.
                  </p>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                     <li>
                      Select &quot;Improve Policy&quot; from the sidebar.
                    </li>
                    <li>
                      Paste your draft policy into the &quot;Policy Document&quot; area or upload a file.
                    </li>
                    <li>Click &quot;Suggest Improvements&quot;.</li>
                  </ol>
                  <p className="mt-2 text-sm text-foreground/80">
                    The AI will provide suggestions to enhance clarity,
                    completeness, and fairness. You can then download or print the report.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FileQuestion className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    Ask Document
                  </h3>
                  <p className="text-muted-foreground">
                    Upload any document to ask questions about its
                    content.
                  </p>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>
                      Select &quot;Ask Document&quot; from the sidebar.
                    </li>
                    <li>
                      Click the &quot;Select files&quot; button to upload one or more documents.
                    </li>
                    <li>
                      Once uploaded, type your question(s) in the input field.
                    </li>
                    <li>Click &quot;Ask Questions&quot;.</li>
                  </ol>
                  <p className="mt-2 text-sm text-foreground/80">
                    The AI will provide direct answers based solely on the
                    information in your documents and remembers the conversation history.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <FileText className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    Summarize Document
                  </h3>
                  <p className="text-muted-foreground">
                    Get a quick summary of any uploaded document.
                  </p>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>
                      Select &quot;Summarize Document&quot; from the sidebar.
                    </li>
                    <li>
                      Click the &quot;Select a file&quot; button to upload a document.
                    </li>
                    <li>Click &quot;Generate Summary&quot;.</li>
                  </ol>
                  <p className="mt-2 text-sm text-foreground/80">
                    The AI will return a concise summary and key points from the document's content.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-6">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <MessageSquareQuote className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    Translate
                  </h3>
                  <p className="text-muted-foreground">
                    Translate any piece of text into a different language.
                  </p>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>
                      Select &quot;Translate&quot; from the sidebar.
                    </li>
                    <li>
                      Paste the text you want to translate into the &quot;Your Text&quot; area.
                    </li>
                    <li>
                      Select your desired target language from the dropdown at the top right of the page.
                    </li>
                    <li>Click &quot;Translate Text&quot;.</li>
                  </ol>
                  <p className="mt-2 text-sm text-foreground/80">
                    The AI will return the translated text in the results panel.
                  </p>
                </div>
              </div>

               <div className="flex items-start gap-6">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <ShieldCheck className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    Compliance Checker
                  </h3>
                  <p className="text-muted-foreground">
                    Check if your policy adheres to specific compliance standards.
                  </p>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                     <li>
                      Select &quot;Compliance Checker&quot; from the sidebar.
                    </li>
                    <li>
                      Paste your policy into the text area or upload a file.
                    </li>
                    <li>
                      Enter or select a compliance standard (e.g., &quot;GDPR&quot;, &quot;HIPAA&quot;).
                    </li>
                    <li>Click &quot;Check Compliance&quot;.</li>
                  </ol>
                  <p className="mt-2 text-sm text-foreground/80">
                    The AI will provide a detailed report on the policy&apos;s adherence to the specified standard.
                  </p>
                </div>
              </div>

               <div className="flex items-start gap-6">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <AlertTriangle className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    Risk Detection
                  </h3>
                  <p className="text-muted-foreground">
                    Identify potential legal, financial, or operational risks in your policy.
                  </p>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                     <li>
                      Select &quot;Risk Detection&quot; from the sidebar.
                    </li>
                    <li>
                       Paste your policy into the text area or upload a file.
                    </li>
                    <li>Click &quot;Detect Risks&quot;.</li>
                  </ol>
                  <p className="mt-2 text-sm text-foreground/80">
                    The AI will generate a report detailing potential risks and suggestions for mitigation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Advanced Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="flex items-center gap-4">
                <PanelLeft className="h-6 w-6 text-primary" />
                <div>
                  <h4 className="font-semibold">Collapsible Sidebar</h4>
                  <p className="text-sm text-muted-foreground">
                    Click the <PanelLeft className="inline h-4 w-4" /> icon or press <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Ctrl+B</kbd> to collapse or expand the sidebar for a more focused view.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Languages className="h-6 w-6 text-primary" />
                <div>
                  <h4 className="font-semibold">Multi-Language Support</h4>
                  <p className="text-sm text-muted-foreground">
                    Select your preferred language from the dropdown at the top right.
                    All your questions and the AI&apos;s answers will be automatically
                    translated, allowing you to work in the language you&apos;re most
                    comfortable with.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Mic className="h-6 w-6 text-primary" />
                <div>
                  <h4 className="font-semibold">Voice Input</h4>
                  <p className="text-sm text-muted-foreground">
                    Click the microphone icon next to any question field to ask
                    your question using your voice. The app will transcribe your
                    speech into text. This also works with your selected
                    language!
                  </p>
                </div>
              </div>
               <div className="flex items-center gap-4">
                <Volume2 className="h-6 w-6 text-primary" />
                <div>
                  <h4 className="font-semibold">Audio Answers</h4>
                  <p className="text-sm text-muted-foreground">
                    In the &quot;Ask Document&quot; tab, click the speaker icon on a result card to have the summary read aloud to you.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
