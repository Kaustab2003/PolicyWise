
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
        className={cn("absolute inset-0 overflow-hidden -z-10", className)} 
    >
      <div 
        className="absolute inset-0 transition-opacity duration-1000 ease-in-out animate-[pulse-glow_20s_ease-in-out_infinite]"
        style={{ background: 'var(--gradient-violet)' }}
      />
      <div 
        className="absolute inset-0 transition-opacity duration-1000 ease-in-out animate-[pulse-glow_20s_ease-in-out_infinite_10s]"
        style={{ background: 'var(--gradient-blue)' }}
      />
    </div>
  );
};

export default ParticleBackground;
