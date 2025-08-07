
'use client';
import { SidebarProvider } from '@/components/ui/sidebar';
import ParticleBackground from '@/components/particle-background';
import { cn } from '@/lib/utils';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <div className="relative w-full h-full">
        <ParticleBackground className="absolute inset-0 -z-10" />
        <div className={cn("z-0")}>
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
