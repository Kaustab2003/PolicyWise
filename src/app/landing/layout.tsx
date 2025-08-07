import type {Metadata} from 'next';

export const metadata: Metadata = {
  title: 'Welcome to PolicyWise',
  description: 'Intelligent Policy Analysis for Everyone',
};

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-body antialiased">
        {children}
      </body>
    </html>
  );
}
