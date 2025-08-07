import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'PolicyWise',
  description: 'Intelligent Policy Analysis',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=PT+Sans:wght@400;700&family=Source+Code+Pro:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider>
              {children}
            </SidebarProvider>
            <Toaster />
          </ThemeProvider>
      </body>
    </html>
  );
}
