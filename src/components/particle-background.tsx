'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
}

const ParticleBackground = ({ className }: { className?: string }) => {
  const { theme } = useTheme();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    
    // Generate 15 floating particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < 15; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 6,
        duration: 4 + Math.random() * 4,
      });
    }
    setParticles(newParticles);
  }, []);
  
  // We only want the fancy background on dark mode, and only after client-side mount.
  if (theme !== 'dark' || !hasMounted) {
    return null;
  }

  return (
    <div className={cn('particle-background', className)}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

export default ParticleBackground;
