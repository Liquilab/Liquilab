import { Mail, ExternalLink } from "lucide-react";
import { WaveBackground } from "../components/WaveBackground";
import { Logo } from "../components/Logo";

export function AppLandingPage() {
  return (
    <div className="min-h-screen bg-[#0B1530] relative overflow-hidden flex flex-col">
      {/* Hero Wave Background */}
      <WaveBackground />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="px-6 md:px-12 py-6 md:py-8 flex items-center justify-between">
          {/* Logo */}
          <Logo size="md" showText={true} />

          {/* Top Right Domain */}
          <div className="hidden md:block">
            <span className="font-['Manrope',sans-serif] text-white/40 text-sm">
              app.liquilab.io
            </span>
          </div>
        </header>

        {/* Main Content - Centered */}
        <main className="flex-1 flex items-center justify-center px-6 md:px-12 pb-20">
          <div className="max-w-3xl w-full text-center">
            {/* Main Headline */}
            <h1 className="font-['Manrope',sans-serif] text-4xl md:text-5xl lg:text-6xl font-bold text-white/95 leading-tight mb-6">
              Liquidity intelligence is coming to Flare.
            </h1>

            {/* Subheadline */}
            <div className="space-y-4 mb-12">
              <p className="font-['Manrope',sans-serif] text-lg md:text-xl text-white/70 leading-relaxed">
                LiquiLab is building non-custodial analytics and monitoring for LPs on Flare V3.
              </p>
              <p className="font-['Manrope',sans-serif] text-lg md:text-xl text-white/70 leading-relaxed">
                App access is invite-only while we prepare our first public release.
              </p>
            </div>

            {/* Contact Section */}
            <div className="space-y-6">
              {/* Prompt */}
              <div className="space-y-2">
                <p className="font-['Manrope',sans-serif] text-base md:text-lg text-white/80">
                  Want to know more or join early?
                </p>
                <p className="font-['Manrope',sans-serif] text-base md:text-lg text-white/60">
                  Send us a note at:
                </p>
              </div>

              {/* Email CTA Pill */}
              <a
                href="mailto:hello@liquilab.io"
                className="inline-flex items-center gap-3 bg-[#3B82F6] hover:bg-[#3B82F6]/90 
                         px-8 py-4 rounded-full transition-all duration-300 
                         hover:scale-105 hover:shadow-lg hover:shadow-[#3B82F6]/20
                         group"
              >
                <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <span className="font-['Manrope',sans-serif] text-lg md:text-xl font-medium text-white">
                  hello@liquilab.io
                </span>
                <ExternalLink className="h-4 w-4 text-white/60 group-hover:text-white/90 transition-colors" />
              </a>

              {/* Reassurance Text */}
              <p className="font-['Manrope',sans-serif] text-sm text-white/50 max-w-md mx-auto">
                We'll get back to you with updates about the app and early access.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 md:px-12 py-6 md:py-8 text-center">
          <div className="space-y-2">
            <p className="font-['Manrope',sans-serif] text-sm text-white/40">
              LiquiLab · Flare V3 LP analytics
            </p>
            <p className="font-['Manrope',sans-serif] text-xs text-white/30">
              All rights reserved · 2025
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}