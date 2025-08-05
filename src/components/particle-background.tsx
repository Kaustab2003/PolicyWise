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
    
    // Generate floating particles
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
  
  if (theme !== 'dark' || !hasMounted) {
    return null;
  }

  return (
    <div className={cn("particle-background", className)} style={{ background: 'var(--gradient-ai)' }}>
      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle w-1 h-1 bg-primary rounded-full opacity-40 animate-particle-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            boxShadow: '0 0 10px hsl(var(--primary))',
          }}
        />
      ))}

      {/* Main Orb */}
      <div className="orb-container">
        {/* Outer Glow */}
        <div className="absolute -inset-24 opacity-30 animate-orb-rotate">
          <div 
            className="w-full h-full rounded-full animate-glow-pulse orb-outer-glow"
            style={{
              background: 'radial-gradient(circle, hsl(var(--orb-glow) / 0.3) 0%, transparent 70%)',
              filter: 'blur(3px)',
            }}
          />
        </div>

        {/* Core Orb */}
        <div 
          className="relative w-32 h-32 rounded-full animate-orb-pulse orb-core"
          style={{
            background: 'var(--gradient-orb)',
            boxShadow: 'var(--shadow-glow)',
          }}
        />
      </div>
    </div>
  );
};

export default ParticleBackground;
