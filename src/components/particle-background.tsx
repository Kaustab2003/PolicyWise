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
  
  // We only want the fancy background on dark mode, and only after client-side mount.
  if (theme !== 'dark' || !hasMounted) {
    return null;
  }

  return (
    <div className={cn('ai-background', className)}>
      <div className="glowing-orb" />
    </div>
  );
};

export default ParticleBackground;
