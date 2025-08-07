'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

interface Particle {
  id: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
}

const particleCount = 50; // Number of particles

const ParticleBackground = ({ className }: { className?: string }) => {
  const { theme } = useTheme();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles: Particle[] = [];
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          duration: Math.random() * 5 + 5, // 5 to 10 seconds
          delay: Math.random() * 5, // 0 to 5 seconds
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  if (theme !== 'dark') {
    return null;
  }

  return (
    <div className={cn("absolute inset-0 overflow-hidden -z-10", className)}>
      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-primary rounded-full opacity-40 animate-particle-float"
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
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {/* Outer Glow */}
        <div className="absolute -inset-24 opacity-30 animate-orb-rotate">
          <div 
            className="w-full h-full rounded-full animate-glow-pulse"
            style={{
              background: 'radial-gradient(circle, hsl(var(--orb-glow) / 0.3) 0%, transparent 70%)',
              filter: 'blur(3px)',
            }}
          />
        </div>

        {/* Core Orb */}
        <div 
          className="relative w-32 h-32 rounded-full animate-orb-pulse"
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