import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { Link } from "react-router-dom";
import { Footer } from "../components/Footer";
import { WaveBackground } from "../components/WaveBackground";

export function FAQPage() {
  const faqs = [
    {
      question: "What is Liquilab?",
      answer: "Liquilab is a non-custodial analytics platform for DeFi liquidity pools on Flare Network. We help you monitor, analyze, and optimize your liquidity positions across Ēnosys and SparkDEX without ever touching your funds.",
    },
    {
      question: "How does RangeBand™ work?",
      answer: "RangeBand™ is our intelligent range monitoring system for concentrated liquidity positions. It visually shows where the current price sits within your range, with color-coded status indicators (green for in-range, orange for near edge, red for out-of-range) and optional alerts when positions move.",
    },
    {
      question: "Is Liquilab custodial?",
      answer: "No, Liquilab is completely non-custodial. We never have access to your funds. You connect your wallet using read-only access, and we fetch on-chain data to provide analytics. Your keys remain entirely under your control.",
    },
    {
      question: "Which DEXs are supported?",
      answer: "Liquilab currently supports Ēnosys and SparkDEX on Flare Network. We're working on adding support for additional DEXs and networks. If you'd like to request support for a specific DEX, please contact our team.",
    },
    {
      question: "What's the difference between plans?",
      answer: "The Visitor plan is free and allows monitoring up to 5 pools with basic analytics. Premium ($29/mo) supports 25 pools with advanced analytics and RangeBand™ monitoring. Pro ($99/mo) is designed for professional traders with up to 100 pools, API access, and white-label reports.",
    },
    {
      question: "Can I try before upgrading?",
      answer: "Yes! You can start with our free Visitor plan to explore the platform. Premium and Pro plans come with a 14-day trial, and you can cancel anytime during the trial without being charged.",
    },
    {
      question: "How do RangeBand™ Alerts work?",
      answer: "RangeBand™ Alerts is an optional add-on ($9/mo) that sends you instant notifications via email or webhook when your positions approach or move out of range. This helps you take action before missing out on fees or experiencing impermanent loss.",
    },
    {
      question: "What data do you collect?",
      answer: "We collect wallet addresses you choose to monitor (read-only), email addresses for notifications, and on-chain transaction data that's already public on the blockchain. We never collect private keys or have access to move your funds. See our Privacy Policy for details.",
    },
    {
      question: "How accurate is the data?",
      answer: "We index data directly from Flare Network and update our analytics every few minutes. Price data is sourced from on-chain DEX prices. While we strive for accuracy, DeFi moves fast—always verify important decisions on-chain.",
    },
    {
      question: "Can I export my data?",
      answer: "Yes, Premium and Pro plans include data export functionality. You can export your pool performance, fee history, and transaction records as CSV or JSON for your own analysis or tax reporting.",
    },
    {
      question: "Do you offer API access?",
      answer: "API access is available on the Pro plan. You can programmatically fetch pool data, positions, and analytics to integrate Liquilab into your own tools or workflows. API documentation is available in your account dashboard.",
    },
    {
      question: "How do I cancel my subscription?",
      answer: "You can cancel anytime from your Account settings. Your plan will remain active until the end of your current billing period, and you won't be charged again. Your data will be retained for 30 days in case you change your mind.",
    },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Wave Background */}
      <WaveBackground />
      
      <div className="relative z-10 max-w-[900px] mx-auto px-8 py-8">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="text-white mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-300">
            Everything you need to know about Liquilab
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="bg-[#0F1A36] border border-white/10 rounded-lg overflow-hidden mb-8">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem 
                key={i} 
                value={`item-${i}`}
                className="border-b border-white/5 last:border-0"
              >
                <AccordionTrigger className="px-8 py-6 text-left hover:bg-white/5 data-[state=open]:bg-white/5">
                  <span className="text-lg font-heading font-semibold text-white">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-6 text-slate-300">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact Section */}
        <div className="bg-[#0F1A36] border border-white/10 rounded-lg p-8 text-center mb-16">
          <h2 className="text-white mb-3">
            Have more questions?
          </h2>
          <p className="text-slate-300 mb-6">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a 
              href="mailto:support@liquilab.io"
              className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white transition-colors"
            >
              Contact Support
            </a>
            <Link 
              to="/status"
              className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-white/20 hover:bg-white/5 text-white transition-colors"
            >
              Check System Status
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}