import { BookMarked } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="p-2 bg-primary/20 rounded-lg">
        <BookMarked className="h-6 w-6 text-primary" />
      </div>
      <h1 className="text-2xl font-bold font-headline text-foreground tracking-tight">
        PolicyWise
      </h1>
    </div>
  );
}
