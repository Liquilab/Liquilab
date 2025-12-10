import Image from 'next/image';
import type { ReactNode } from 'react';

interface WaveBackgroundProps {
  children?: ReactNode;
}

export function WaveBackground({ children }: WaveBackgroundProps) {
  return (
    <>
      <div className="fixed inset-0 bg-[#050A1A] z-0" />
      
      {/* Water image background */}
      <div className="pointer-events-none fixed inset-0 z-[1]">
        <Image
          src="/media/wave-hero.png"
          alt="Wave background"
          fill
          priority
          className="object-cover opacity-90"
          sizes="100vw"
        />
      </div>
      
      {/* Subtle gradient overlay */}
      <div 
        className="fixed inset-0 z-[2] pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(17, 18, 22, 0.3) 0%, transparent 40%)',
        }}
      />

      {/* Content on top (if any provided directly, though usually this component is used as a background layer) */}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </>
  );
}
