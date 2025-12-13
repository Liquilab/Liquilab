import { useState } from 'react';
import Head from 'next/head';
import Navigation from '@/components/Navigation';
import { WaveBackground } from '@/components/WaveBackground';
import Footer from '@/components/Footer';
import { ChevronDown, MessageCircle, Mail } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'rangeband' | 'billing';
}

const faqData: FAQItem[] = [
  {
    question: "What is Liquilab?",
    answer: "Liquilab is a portfolio intelligence platform for concentrated liquidity positions on Flare Network. It provides real-time tracking, RangeBand™ health monitoring, and comprehensive analytics for your positions on Ēnosys and SparkDEX.",
    category: 'general',
  },
  {
    question: "How do I connect my wallet?",
    answer: "Click the 'Connect Wallet' button in the navigation bar. We support MetaMask and WalletConnect. Make sure you're connected to Flare Network. Once connected, the app will automatically discover all your V3 LP positions.",
    category: 'general',
  },
  {
    question: "What is RangeBand™?",
    answer: "RangeBand™ is our visual health indicator for concentrated liquidity positions. It shows your position's price range, current market price, and status (In Range, Near Band, or Out of Range) at a glance, helping you decide when to rebalance.",
    category: 'rangeband',
  },
  {
    question: "What do the RangeBand™ colors mean?",
    answer: "Green (In Range) means your position is earning fees. Yellow (Near Band) means the price is approaching your range edge—consider rebalancing soon. Red (Out of Range) means you're not earning fees until you rebalance.",
    category: 'rangeband',
  },
  {
    question: "Can Liquilab modify my positions?",
    answer: "No. Liquilab is a monitoring dashboard only. All liquidity management actions (claim fees, increase/decrease liquidity, rebalance) happen directly on Ēnosys or SparkDEX. We provide quick links to the DEX for convenience.",
    category: 'general',
  },
  {
    question: "What are RFLR incentives?",
    answer: "RFLR (Reward FLR) are incentive rewards distributed by Flare Network to liquidity providers. These are separate from trading fees and accrue over time. They can be claimed via the Flare Portal at the end of each distribution period.",
    category: 'general',
  },
  {
    question: "What's included in Premium vs Pro?",
    answer: "Premium includes portfolio tracking for up to 5 pools with RangeBand™ monitoring and basic analytics. Pro adds advanced features like fee projections, peer benchmarking, and priority support. Both include a 14-day free trial.",
    category: 'billing',
  },
  {
    question: "How do I upgrade my plan?",
    answer: "Visit the Pricing page and select your preferred plan. You can start with a 14-day free trial—no credit card required. After the trial, you'll be prompted to subscribe to continue using premium features.",
    category: 'billing',
  },
  {
    question: "Is my data secure?",
    answer: "Yes. Liquilab is read-only—we never ask for private keys or have access to your funds. All data is fetched directly from the blockchain. Your positions remain completely under your control in your own wallet.",
    category: 'general',
  },
  {
    question: "Which DEXes are supported?",
    answer: "Currently we support Ēnosys V3 and SparkDEX V3 on Flare Network. We're actively working on adding more protocols and chains based on user demand.",
    category: 'general',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen relative text-white bg-[#0B1530]">
      <Head>
        <title>FAQ · Liquilab</title>
        <meta name="description" content="Frequently asked questions about Liquilab, RangeBand™, and managing your liquidity positions." />
      </Head>
      
      <WaveBackground className="min-h-screen">
        <Navigation />
        
        <div className="relative z-10 max-w-[900px] mx-auto px-4 lg:px-8 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-brand text-white mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-white/60 font-ui max-w-2xl mx-auto">
              Everything you need to know about Liquilab and managing your liquidity positions.
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-3">
            {faqData.map((item, index) => (
              <div 
                key={index}
                className="bg-[#0F1A36]/95 border border-white/10 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <span className="font-brand text-base sm:text-lg text-white/95 pr-4">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`size-5 text-white/50 transition-transform flex-shrink-0 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                {openIndex === index && (
                  <div className="px-6 pb-5 font-ui text-white/70 text-sm sm:text-base leading-relaxed border-t border-white/5 pt-4">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-16 bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-brand text-white mb-3">Still have questions?</h2>
            <p className="font-ui text-white/60 mb-6 max-w-lg mx-auto">
              Can't find what you're looking for? Reach out and we'll help you out.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@liquilab.io"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white font-brand px-6 py-3 text-sm font-medium transition"
              >
                <Mail className="size-4" />
                Email Support
              </a>
              <a
                href="https://discord.gg/flarenetwork"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 text-white/90 hover:border-white hover:text-white hover:bg-white/5 font-brand px-6 py-3 text-sm font-medium transition"
              >
                <MessageCircle className="size-4" />
                Join Discord
              </a>
            </div>
          </div>
        </div>

        <Footer />
      </WaveBackground>
    </div>
  );
}
