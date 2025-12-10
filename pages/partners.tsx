import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { WaveBackground } from '@/components/WaveBackground';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function PartnersPage() {
  return (
    <div className="min-h-screen relative text-white bg-[#0B1530]">
      <Head>
        <title>Partner with Liquilab</title>
        <meta
          name="description"
          content="Embed RangeBand™ in your DEX or portfolio tool. Flexible licensing: flat chain fee, per-viewer, or revenue share."
        />
      </Head>

      <WaveBackground>
        <Navigation />

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 lg:px-8 py-16">
          {/* Hero Section */}
          <section className="mb-24 text-center">
            <h1 className="font-brand text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-[64px] mb-6">
              Partner with Liquilab
            </h1>
            <p className="mx-auto max-w-2xl font-ui text-white/70 text-lg sm:text-[20px] leading-[1.6]">
              Embed RangeBand™ in your DEX, aggregator, or portfolio tool to help LPs instantly understand their position health. 
              We offer flexible licensing tailored to your platform's scale and business model.
            </p>
          </section>

          {/* Trusted Ecosystem Partners */}
          <section className="mb-24">
            <p className="text-center text-white/40 text-sm font-ui uppercase tracking-wider mb-8">
              Trusted Ecosystem Partners
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center opacity-80 hover:opacity-100 transition-opacity">
              {/* Partner 1: Flare */}
              <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all duration-300">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <span className="font-brand font-bold text-white">F</span>
                </div>
                <span className="font-brand text-xl text-white">Flare</span>
              </div>

              {/* Partner 2: SparkDEX */}
              <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all duration-300">
                <div className="w-10 h-10 bg-[#FFD700]/20 rounded-full flex items-center justify-center">
                  <span className="font-brand font-bold text-[#FFD700]">S</span>
                </div>
                <span className="font-brand text-xl text-white">SparkDEX</span>
              </div>

              {/* Partner 3: Enosys */}
              <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all duration-300">
                <div className="w-10 h-10 bg-[#7B61FF]/20 rounded-full flex items-center justify-center">
                  <span className="font-brand font-bold text-[#7B61FF]">E</span>
                </div>
                <span className="font-brand text-xl text-white">Enosys</span>
              </div>

              {/* Partner 4: BlazeSwap */}
              <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all duration-300">
                <div className="w-10 h-10 bg-[#FF6B6B]/20 rounded-full flex items-center justify-center">
                  <span className="font-brand font-bold text-[#FF6B6B]">B</span>
                </div>
                <span className="font-brand text-xl text-white">BlazeSwap</span>
              </div>
            </div>
          </section>

          {/* Main Content Card - Licensing */}
          <section className="mb-24">
            <div className="bg-[#0F1A36]/80 backdrop-blur-md border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl">
              <h2 className="mb-12 font-brand text-3xl font-semibold text-white text-center">
                RangeBand™ Licensing Options
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {/* Option 1 */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-[#3B82F6]/30 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center mb-4 text-[#3B82F6] font-brand font-bold text-xl">
                    1
                  </div>
                  <h3 className="font-brand text-xl text-white mb-2">Flat Chain License</h3>
                  <p className="font-ui text-white/60 text-sm leading-relaxed">
                    Predictable monthly fee + impression tier. Best for high-volume platforms with stable traffic looking for consistent costs.
                  </p>
                </div>

                {/* Option 2 */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-[#3B82F6]/30 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center mb-4 text-[#3B82F6] font-brand font-bold text-xl">
                    2
                  </div>
                  <h3 className="font-brand text-xl text-white mb-2">Per Active Viewer</h3>
                  <p className="font-ui text-white/60 text-sm leading-relaxed">
                    Pay per unique LP who sees RangeBand™. Scales naturally with your user base—you only pay for value delivered.
                  </p>
                </div>

                {/* Option 3 */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-[#3B82F6]/30 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center mb-4 text-[#3B82F6] font-brand font-bold text-xl">
                    3
                  </div>
                  <h3 className="font-brand text-xl text-white mb-2">Revenue Share</h3>
                  <p className="font-ui text-white/60 text-sm leading-relaxed">
                    Percentage of first-year net subscription from tracked referrals. Ideal for platforms focused on driving LP engagement.
                  </p>
                </div>
              </div>

              {/* Key Terms */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-white/10">
                <div>
                  <h4 className="flex items-center gap-2 font-brand text-white font-medium mb-2">
                    <CheckCircle2 className="size-4 text-[#10B981]" />
                    Pilot Program
                  </h4>
                  <p className="font-ui text-sm text-white/50 pl-6">
                    90-day pilot with KPI review. Platform fee waived during pilot phase.
                  </p>
                </div>
                <div>
                  <h4 className="flex items-center gap-2 font-brand text-white font-medium mb-2">
                    <CheckCircle2 className="size-4 text-[#10B981]" />
                    Service Level
                  </h4>
                  <p className="font-ui text-sm text-white/50 pl-6">
                    99.5% uptime target • Cached p95 &lt; 1.2s • Graceful fallbacks.
                  </p>
                </div>
                <div>
                  <h4 className="flex items-center gap-2 font-brand text-white font-medium mb-2">
                    <CheckCircle2 className="size-4 text-[#10B981]" />
                    Intellectual Property
                  </h4>
                  <p className="font-ui text-sm text-white/50 pl-6">
                    RangeBand™ patent pending. Attribution required.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <p className="mb-8 font-ui text-lg text-white/70">
              Ready to integrate RangeBand™ into your platform?
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button 
                as="a" 
                href="/contact" 
                className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white px-8 py-6 h-auto text-base font-semibold"
              >
                Contact Us
              </Button>
              <Button 
                as="a" 
                href="mailto:support@liquilab.io" 
                variant="ghost" 
                className="border-white/10 bg-white/5 hover:bg-white/10 text-white px-8 py-6 h-auto text-base"
              >
                support@liquilab.io
              </Button>
            </div>
          </section>
        </div>
        
        <Footer />
      </WaveBackground>
    </div>
  );
}
