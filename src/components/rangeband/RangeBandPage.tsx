'use client';

import React from 'react';
import { Navigation } from '@/components/Navigation';
import { WaveBackground } from '@/components/WaveBackground';
import { InteractiveRangeBandExplainer } from '@/components/InteractiveRangeBandExplainer';
import { GlobalCtaButton } from '@/components/GlobalCtaButton';

export default function RangeBandPage() {
  return (
    <div className="min-h-screen relative text-white bg-[#0B1530]">
      <WaveBackground />
      <Navigation />
      
      <div className="relative z-10 max-w-[900px] mx-auto px-4 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="font-brand text-white mb-6 text-4xl sm:text-5xl leading-[1.1]">
            RangeBand™
          </h1>
          
          <p className="font-ui text-white/60 max-w-2xl mx-auto text-lg leading-relaxed">
            See your pool's health at a glance. Price boundaries, live market price, and status — all in one elegant line.
          </p>
        </div>

        {/* Interactive Explainer with Legend */}
        <div className="mb-16">
          <div className="bg-[#0F1A36]/80 border border-white/10 rounded-2xl p-6 sm:p-10">
            <h2 className="text-center text-white/90 font-brand text-xl sm:text-2xl mb-2">
              Interactive Explainer
            </h2>
            <p className="text-center text-white/50 text-sm font-ui mb-8 max-w-lg mx-auto">
              Hover over the legend items below to learn what each part of RangeBand™ represents.
            </p>

            <InteractiveRangeBandExplainer />
          </div>
        </div>

        {/* Simple CTA */}
        <div className="text-center">
          <GlobalCtaButton className="h-12 px-8" />
        </div>
      </div>
    </div>
  );
}
