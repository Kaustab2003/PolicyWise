
'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

const ParticleBackground = ({ className }: { className?: string }) => {
  const { theme } = useTheme();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  if (theme !== 'dark' || !hasMounted) {
    return null;
  }

  return (
    <div 
        className={cn("absolute inset-0 overflow-hidden", className)} 
        style={{ background: 'var(--gradient-ai)' }}
    />
  );
};

export default ParticleBackground;
