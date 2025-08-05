'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Particle {
  id: number;
  style: React.CSSProperties;
}

const ParticleBackground = ({
  className,
  quantity = 50,
}: {
  className?: string;
  quantity?: number;
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < quantity; i++) {
      newParticles.push({
        id: i,
        style: {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 6}s`,
          animationDuration: `${Math.random() * 4 + 4}s`, // 4s to 8s
        },
      });
    }
    setParticles(newParticles);
  }, [quantity]);

  return (
    <div className={cn('particle-background', className)}>
      {particles.map((p) => (
        <div key={p.id} className="particle" style={p.style} />
      ))}
    </div>
  );
};

export default ParticleBackground;
