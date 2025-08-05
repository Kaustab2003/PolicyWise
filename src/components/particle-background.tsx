'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

interface Particle {
  id: number;
  style: React.CSSProperties;
}

const ParticleBackground = ({
  className,
  quantity = 25,
}: {
  className?: string;
  quantity?: number;
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const { theme } = useTheme();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted) {
      const newParticles: Particle[] = [];
      for (let i = 0; i < quantity; i++) {
        newParticles.push({
          id: i,
          style: {
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${Math.random() * 5 + 5}s`,
          },
        });
      }
      setParticles(newParticles);
    }
  }, [quantity, hasMounted]);
  
  // We only want the fancy background on dark mode, and only after client-side mount.
  if (theme !== 'dark' || !hasMounted) {
    return null;
  }

  return (
    <div className={cn('particle-background', className)}>
      {particles.map((p) => (
        <div key={p.id} className="particle" style={p.style} />
      ))}
      <div className="orb">
        <div className="orb-core" />
        <div className="orb-glow" />
      </div>
    </div>
  );
};

export default ParticleBackground;
