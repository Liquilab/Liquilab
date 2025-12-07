import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { RangeBandIcon } from '../components/RangeBandIcon';
import { 
  Package, 
  Layers, 
  Palette, 
  FileText, 
  Database,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  Code,
  Gauge,
  TrendingUp,
  Building2,
  Zap,
  Users,
  BarChart3,
  Settings,
  Shield,
  Bell
} from 'lucide-react';

export default function DSScreensSummary() {
  return (
    <div className="min-h-screen bg-[#0B1530]">
      <Navigation walletConnected={false} planType="Premium" />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* How to Access This Page */}
        <div className="bg-[#3B82F6]/10 border-2 border-[#3B82F6]/30 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#3B82F6]/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Info className="w-6 h-6 text-[#3B82F6]" />
            </div>
            <div>
              <h3 className="text-white/95 mb-2">
                💡 Hoe deze pagina te vinden
              </h3>
              <div className="space-y-2 text-white/70 text-sm">
                <p>
                  <strong className="text-white/95">Methode 1 — Direct via URL:</strong> Plak deze URL in je adresbalk:
                </p>
                <div className="bg-[#0B1530]/60 rounded-lg p-3 font-mono text-[#1BE8D2] border border-white/10">
                  https://www.figma.com/make/75w1dSinK03GLkglA4HVHa/#/ds-summary
                </div>
                <p>
                  <strong className="text-white/95">Methode 2 — Via Component Overview:</strong> Ga naar{' '}
                  <a href="/#/overview" className="text-[#3B82F6] hover:underline">/#/overview</a> en klik op de "Design System & Screens Summary" card bovenaan.
                </p>
                <p className="text-white/[0.58] italic">
                  ℹ️ De <code className="bg-[#0B1530]/60 px-2 py-0.5 rounded text-white/70">#</code> in de URL is onderdeel van de HashRouter navigatie (client-side routing).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 bg-[#3B82F6]/20 text-[#3B82F6] px-4 py-2 rounded-full mb-6">
            <FileText className="w-4 h-4" />
            <span className="text-sm">Developer Handoff Documentation</span>
          </div>
          
          <h1 className="text-white/95 mb-4">
            00 — Design System & Screens Summary
          </h1>
          
          <p className="text-white/70 text-lg max-w-4xl">
            Complete reference for implementing Liquilab in Next.js. This document is the single source of truth 
            for all UI/UX specifications, component architecture, and screen implementations.
          </p>
        </div>

        {/* 1. PROJECT OVERVIEW */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#3B82F6]/20 rounded-xl flex items-center justify-center">
              <Info className="w-6 h-6 text-[#3B82F6]" />
            </div>
            <h2 className="text-white/95">1. Project Overview</h2>
          </div>
          
          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8">
            <h3 className="text-white/95 mb-4">What is Liquilab?</h3>
            <p className="text-white/70 mb-6 leading-relaxed">
              Liquilab is a premium DeFi liquidity analytics platform for liquidity providers on Flare Network 
              (Ēnosys & SparkDEX). It provides visual range monitoring through the proprietary RangeBand™ technology, 
              helping LPs maximize fee capture and minimize out-of-range time.
            </p>
            
            <h3 className="text-white/95 mb-4">This Figma Make Project</h3>
            <p className="text-white/70 mb-6 leading-relaxed">
              This file serves as the <strong className="text-white/95">Single Source of Truth (SSoT)</strong> for all 
              UI/UX design decisions. All screens, components, and interactions documented here will be implemented in a 
              Next.js application (Pages Router) hosted on Railway with Supabase backend.
            </p>
            
            <h3 className="text-white/95 mb-4">Key Design Principles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#1BE8D2] mt-2 flex-shrink-0" />
                <div>
                  <strong className="text-white/95">Dark Fintech Aesthetic</strong>
                  <p className="text-white/[0.58] text-sm mt-1">
                    Navy canvas (#0B1530) with Electric Blue (#3B82F6) and Signal Aqua (#1BE8D2) accents
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#1BE8D2] mt-2 flex-shrink-0" />
                <div>
                  <strong className="text-white/95">Clarity Over Noise</strong>
                  <p className="text-white/[0.58] text-sm mt-1">
                    Minimal UI, focused metrics, no overwhelming dashboards
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#1BE8D2] mt-2 flex-shrink-0" />
                <div>
                  <strong className="text-white/95">RangeBand™ as Hero</strong>
                  <p className="text-white/[0.58] text-sm mt-1">
                    Visual range monitoring is the core differentiator and primary UX element
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#1BE8D2] mt-2 flex-shrink-0" />
                <div>
                  <strong className="text-white/95">Professional but Accessible</strong>
                  <p className="text-white/[0.58] text-sm mt-1">
                    Trustworthy, friendly, approachable for broad audience
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. ROUTES & SCREENS MAP */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#3B82F6]/20 rounded-xl flex items-center justify-center">
              <Layers className="w-6 h-6 text-[#3B82F6]" />
            </div>
            <h2 className="text-white/95">2. Routes & Screens Map</h2>
          </div>
          
          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 text-white/95 font-medium">Route Path</th>
                    <th className="text-left p-4 text-white/95 font-medium">Figma Frame Name</th>
                    <th className="text-left p-4 text-white/95 font-medium">Description</th>
                    <th className="text-left p-4 text-white/95 font-medium">Plan Access</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Core Pages */}
                  <tr className="border-b border-white/5">
                    <td className="p-4 text-white/70 font-mono text-sm">/</td>
                    <td className="p-4 text-white/70">HomePage.tsx</td>
                    <td className="p-4 text-white/70">Landing page with hero, value props, feature highlights, social proof</td>
                    <td className="p-4"><span className="text-white/[0.58] text-sm">Public</span></td>
                  </tr>
                  
                  <tr className="border-b border-white/5">
                    <td className="p-4 text-white/70 font-mono text-sm">/pools</td>
                    <td className="p-4 text-white/70">PoolsOverview.tsx</td>
                    <td className="p-4 text-white/70">Pools list & grid with KPI cards, filters, search, sort, list/grid toggle</td>
                    <td className="p-4"><span className="bg-[#10B981]/20 text-[#10B981] px-2 py-1 rounded text-sm">Premium+</span></td>
                  </tr>
                  
                  <tr className="border-b border-white/5">
                    <td className="p-4 text-white/70 font-mono text-sm">/pool/:id</td>
                    <td className="p-4 text-white/70">PoolDetailPage.tsx</td>
                    <td className="p-4 text-white/70">Standard pool analytics: price chart, earnings, RangeBand status, My Positions table</td>
                    <td className="p-4"><span className="bg-[#10B981]/20 text-[#10B981] px-2 py-1 rounded text-sm">Premium+</span></td>
                  </tr>
                  
                  <tr className="border-b border-white/5">
                    <td className="p-4 text-white/70 font-mono text-sm">/pool/:id/pro</td>
                    <td className="p-4 text-white/70">PoolDetailProPage.tsx</td>
                    <td className="p-4 text-white/70">Pro pool analytics: 6 KPI strip, global time-range, Risk & Range Insights, wallet-filtered activity</td>
                    <td className="p-4"><span className="bg-[#3B82F6]/20 text-[#3B82F6] px-2 py-1 rounded text-sm">Pro</span></td>
                  </tr>
                  
                  <tr className="border-b border-white/5">
                    <td className="p-4 text-white/70 font-mono text-sm">/pool/:pair/universe</td>
                    <td className="p-4 text-white/70">PoolUniversePage.tsx</td>
                    <td className="p-4 text-white/70">Pool Universe View: deep token-pair analytics across all LPs, DEXes, fee tiers</td>
                    <td className="p-4"><span className="bg-[#3B82F6]/20 text-[#3B82F6] px-2 py-1 rounded text-sm">Pro</span></td>
                  </tr>
                  
                  <tr className="border-b border-white/5">
                    <td className="p-4 text-white/70 font-mono text-sm">/portfolio</td>
                    <td className="p-4 text-white/70">WalletOverview.tsx</td>
                    <td className="p-4 text-white/70">Wallet dashboard: portfolio stats, active positions table, transaction history</td>
                    <td className="p-4"><span className="bg-[#10B981]/20 text-[#10B981] px-2 py-1 rounded text-sm">Premium+</span></td>
                  </tr>
                  
                  <tr className="border-b border-white/5">
                    <td className="p-4 text-white/70 font-mono text-sm">/portfolio/pro</td>
                    <td className="p-4 text-white/70">WalletOverviewPro.tsx</td>
                    <td className="p-4 text-white/70">Pro wallet dashboard: Activity Calendar, advanced portfolio metrics, Pro KPI cards</td>
                    <td className="p-4"><span className="bg-[#3B82F6]/20 text-[#3B82F6] px-2 py-1 rounded text-sm">Pro</span></td>
                  </tr>
                  
                  {/* Marketing & Info */}
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <td colSpan={4} className="p-3 text-white/[0.58] text-sm font-medium">Marketing & Education</td>
                  </tr>
                  
                  <tr className="border-b border-white/5">
                    <td className="p-4 text-white/70 font-mono text-sm">/rangeband</td>
                    <td className="p-4 text-white/70">RangeBandExplainer.tsx</td>
                    <td className="p-4 text-white/70">RangeBand™ marketing page: hero demo, strategy cards, how it works, before/after story</td>
                    <td className="p-4"><span className="text-white/[0.58] text-sm">Public</span></td>
                  </tr>
                  
                  <tr className="border-b border-white/5">
                    <td className="p-4 text-white/70 font-mono text-sm">/pricing</td>
                    <td className="p-4 text-white/70">PricingPage.tsx</td>
                    <td className="p-4 text-white/70">Pricing cards, key differences strip, compare plans table, RangeBand Alerts add-on</td>
                    <td className="p-4"><span className="text-white/[0.58] text-sm">Public</span></td>
                  </tr>
                  
                  <tr className="border-b border-white/5">
                    <td className="p-4 text-white/70 font-mono text-sm">/faq</td>
                    <td className="p-4 text-white/70">FAQPage.tsx</td>
                    <td className="p-4 text-white/70">FAQ accordion, contact section</td>
                    <td className="p-4"><span className="text-white/[0.58] text-sm">Public</span></td>
                  </tr>
                  
                  <tr className="border-b border-white/5 opacity-50">
                    <td className="p-4 text-white/70 font-mono text-sm">/status</td>
                    <td className="p-4 text-white/70">StatusPage.tsx</td>
                    <td className="p-4 text-white/70">System status, services health, incident history <span className="text-[#F59E0B] text-xs">(Planned — not yet implemented)</span></td>
                    <td className="p-4"><span className="text-white/[0.58] text-sm">Public</span></td>
                  </tr>
                  
                  <tr className="border-b border-white/5">
                    <td className="p-4 text-white/70 font-mono text-sm">/legal/:page</td>
                    <td className="p-4 text-white/70">LegalPage.tsx</td>
                    <td className="p-4 text-white/70">Dynamic legal pages: terms, privacy, cookies, disclaimer</td>
                    <td className="p-4"><span className="text-white/[0.58] text-sm">Public</span></td>
                  </tr>
                  
                  {/* Account & Tools */}
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <td colSpan={4} className="p-3 text-white/[0.58] text-sm font-medium">Account & Developer Tools</td>
                  </tr>
                  
                  <tr className="border-b border-white/5">
                    <td className="p-4 text-white/70 font-mono text-sm">/account</td>
                    <td className="p-4 text-white/70">AccountPage.tsx</td>
                    <td className="p-4 text-white/70">Subscription control center: plan management, pool usage, add-ons, profile, notifications</td>
                    <td className="p-4"><span className="bg-[#10B981]/20 text-[#10B981] px-2 py-1 rounded text-sm">Premium+</span></td>
                  </tr>
                  
                  <tr className="border-b border-white/5">
                    <td className="p-4 text-white/70 font-mono text-sm">/overview</td>
                    <td className="p-4 text-white/70">ComponentOverviewPage.tsx</td>
                    <td className="p-4 text-white/70">Central navigation hub: pages map, components overview, design system resources</td>
                    <td className="p-4"><span className="bg-[#F59E0B]/20 text-[#F59E0B] px-2 py-1 rounded text-sm">Dev Tool</span></td>
                  </tr>
                  
                  <tr className="border-b border-white/5">
                    <td className="p-4 text-white/70 font-mono text-sm">/icons</td>
                    <td className="p-4 text-white/70">IconShowcase.tsx</td>
                    <td className="p-4 text-white/70">Searchable icon grid with copy-to-clipboard, usage examples</td>
                    <td className="p-4"><span className="bg-[#F59E0B]/20 text-[#F59E0B] px-2 py-1 rounded text-sm">Dev Tool</span></td>
                  </tr>
                  
                  <tr className="border-b border-white/5">
                    <td className="p-4 text-white/70 font-mono text-sm">/screenshot-generator</td>
                    <td className="p-4 text-white/70">ScreenshotGeneratorPage.tsx</td>
                    <td className="p-4 text-white/70">Automated screenshot generation for Uizard export workflow</td>
                    <td className="p-4"><span className="bg-[#F59E0B]/20 text-[#F59E0B] px-2 py-1 rounded text-sm">Dev Tool</span></td>
                  </tr>
                  
                  <tr className="border-b border-white/5">
                    <td className="p-4 text-white/70 font-mono text-sm">/rangeband-ds</td>
                    <td className="p-4 text-white/70">RangeBandDS.tsx</td>
                    <td className="p-4 text-white/70">RangeBand™ design system showcase: all variants, states, specifications</td>
                    <td className="p-4"><span className="bg-[#F59E0B]/20 text-[#F59E0B] px-2 py-1 rounded text-sm">Dev Tool</span></td>
                  </tr>
                  
                  {/* Admin (Internal Only) */}
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <td colSpan={4} className="p-3 text-white/[0.58] text-sm font-medium">Admin Dashboard (Internal Only — NOT in public navigation)</td>
                  </tr>
                  
                  <tr className="border-b border-white/5">
                    <td className="p-4 text-white/70 font-mono text-sm">/admin</td>
                    <td className="p-4 text-white/70">AdminDashboard.tsx</td>
                    <td className="p-4 text-white/70">Admin landing: system overview, key metrics, health status, recent activity, quick actions</td>
                    <td className="p-4"><span className="bg-[#EF4444]/20 text-[#EF4444] px-2 py-1 rounded text-sm">Admin</span></td>
                  </tr>
                  
                  <tr>
                    <td className="p-4 text-white/70 font-mono text-sm">/admin/status</td>
                    <td className="p-4 text-white/70">AdminStatusPage.tsx</td>
                    <td className="p-4 text-white/70">Detailed system status: service health monitoring, uptime %, incident timeline</td>
                    <td className="p-4"><span className="bg-[#EF4444]/20 text-[#EF4444] px-2 py-1 rounded text-sm">Admin</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 3. DESIGN TOKENS & TYPOGRAPHY */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#3B82F6]/20 rounded-xl flex items-center justify-center">
              <Palette className="w-6 h-6 text-[#3B82F6]" />
            </div>
            <h2 className="text-white/95">3. Design Tokens & Typography</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Colors */}
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8">
              <h3 className="text-white/95 mb-6">Color System</h3>
              
              <div className="space-y-6">
                {/* Brand Colors */}
                <div>
                  <h4 className="text-white/70 text-sm mb-3 uppercase tracking-wide">Brand Colors</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[#3B82F6] border border-white/20" />
                      <div>
                        <div className="text-white/95 font-mono text-sm">#3B82F6</div>
                        <div className="text-white/[0.58] text-xs">Primary (Electric Blue)</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[#1BE8D2] border border-white/20" />
                      <div>
                        <div className="text-white/95 font-mono text-sm">#1BE8D2</div>
                        <div className="text-white/[0.58] text-xs">Accent (Signal Aqua)</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[#0B1530] border border-white/20" />
                      <div>
                        <div className="text-white/95 font-mono text-sm">#0B1530</div>
                        <div className="text-white/[0.58] text-xs">Background (Navy Canvas)</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Surface Colors */}
                <div>
                  <h4 className="text-white/70 text-sm mb-3 uppercase tracking-wide">Surfaces</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[#0F1A36]/95 border border-white/20" />
                      <div>
                        <div className="text-white/95 font-mono text-sm">rgba(15, 20, 36, 0.95)</div>
                        <div className="text-white/[0.58] text-xs">Card Surface</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Semantic Colors */}
                <div>
                  <h4 className="text-white/70 text-sm mb-3 uppercase tracking-wide">Semantic (APR & RangeBand Only)</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[#10B981] border border-white/20" />
                      <div>
                        <div className="text-white/95 font-mono text-sm">#10B981</div>
                        <div className="text-white/[0.58] text-xs">Success (In Range, Positive APR)</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[#F59E0B] border border-white/20" />
                      <div>
                        <div className="text-white/95 font-mono text-sm">#F59E0B</div>
                        <div className="text-white/[0.58] text-xs">Warning (Near Band)</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[#EF4444] border border-white/20" />
                      <div>
                        <div className="text-white/95 font-mono text-sm">#EF4444</div>
                        <div className="text-white/[0.58] text-xs">Error (Out of Range, Negative APR)</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Text Opacity */}
                <div>
                  <h4 className="text-white/70 text-sm mb-3 uppercase tracking-wide">Text Opacity Levels</h4>
                  <div className="space-y-2">
                    <div className="text-white/95">Primary text (0.95)</div>
                    <div className="text-white/70">Secondary text (0.70)</div>
                    <div className="text-white/[0.58]">Tertiary text (0.58)</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Typography */}
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8">
              <h3 className="text-white/95 mb-6">Typography System</h3>
              
              <div className="space-y-6">
                {/* Headings */}
                <div>
                  <h4 className="text-white/70 text-sm mb-3 uppercase tracking-wide">Headings (Manrope)</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="text-white/95" style={{ fontFamily: 'Manrope', fontSize: '32px', fontWeight: 700 }}>
                        Heading XL
                      </div>
                      <div className="text-white/[0.58] text-xs mt-1">32px / 700</div>
                    </div>
                    
                    <div>
                      <div className="text-white/95" style={{ fontFamily: 'Manrope', fontSize: '24px', fontWeight: 600 }}>
                        Heading L
                      </div>
                      <div className="text-white/[0.58] text-xs mt-1">24px / 600</div>
                    </div>
                    
                    <div>
                      <div className="text-white/95" style={{ fontFamily: 'Manrope', fontSize: '18px', fontWeight: 600 }}>
                        Heading M
                      </div>
                      <div className="text-white/[0.58] text-xs mt-1">18px / 600</div>
                    </div>
                  </div>
                </div>
                
                {/* Body */}
                <div>
                  <h4 className="text-white/70 text-sm mb-3 uppercase tracking-wide">Body Text (Manrope)</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="text-white/95" style={{ fontSize: '16px', fontWeight: 400 }}>
                        Body L — Regular paragraph text
                      </div>
                      <div className="text-white/[0.58] text-xs mt-1">16px / 400</div>
                    </div>
                    
                    <div>
                      <div className="text-white/95" style={{ fontSize: '14px', fontWeight: 400 }}>
                        Body M — Default body text
                      </div>
                      <div className="text-white/[0.58] text-xs mt-1">14px / 400</div>
                    </div>
                    
                    <div>
                      <div className="text-white/95" style={{ fontSize: '12px', fontWeight: 400 }}>
                        Body S — Small text, captions
                      </div>
                      <div className="text-white/[0.58] text-xs mt-1">12px / 400</div>
                    </div>
                  </div>
                </div>
                
                {/* Numeric */}
                <div>
                  <h4 className="text-white/70 text-sm mb-3 uppercase tracking-wide">Numeric (Tabular)</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="text-white/95 numeric" style={{ fontSize: '16px' }}>
                        $1,234,567.89
                      </div>
                      <div className="text-white/[0.58] text-xs mt-1">Use .numeric class for all numbers</div>
                    </div>
                  </div>
                </div>
                
                {/* Important Note */}
                <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-[#3B82F6] flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-white/70">
                      <strong className="text-white/95">Do NOT use Tailwind font-size/weight classes</strong> unless explicitly requested. 
                      All typography defaults are defined in /styles/globals.css
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. CORE DESIGN SYSTEM COMPONENTS */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#3B82F6]/20 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-[#3B82F6]" />
            </div>
            <h2 className="text-white/95">4. Core Design System Components</h2>
          </div>
          
          <div className="space-y-6">
            {/* RangeBand Component - HERO */}
            <div className="bg-[#0F1A36]/95 border-2 border-[#3B82F6]/30 rounded-xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-[#3B82F6]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <RangeBandIcon size={32} />
                </div>
                <div>
                  <h3 className="text-white/95 mb-2">Rangeband.tsx ⭐ CORE USP</h3>
                  <p className="text-white/70">
                    The proprietary visual range monitoring component — Liquilab's primary differentiator
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#0B1530]/60 rounded-lg p-4 border border-white/5">
                  <div className="text-[#3B82F6] text-sm font-medium mb-2">Variant: List</div>
                  <p className="text-white/[0.58] text-sm mb-3">
                    Compact horizontal layout for table rows and My Positions. Occupies ~60% of row width, centered.
                  </p>
                  <div className="text-white/[0.58] text-xs space-y-1">
                    <div>• Dot: 14px</div>
                    <div>• Max width: 600px</div>
                    <div>• Band width: 30/65/100%</div>
                  </div>
                </div>
                
                <div className="bg-[#0B1530]/60 rounded-lg p-4 border border-white/5">
                  <div className="text-[#3B82F6] text-sm font-medium mb-2">Variant: Card</div>
                  <p className="text-white/[0.58] text-sm mb-3">
                    Vertical with breathing room for pool cards, mobile views, grid layouts.
                  </p>
                  <div className="text-white/[0.58] text-xs space-y-1">
                    <div>• Dot: 21px</div>
                    <div>• Min width: 160px</div>
                    <div>• "CURRENT PRICE" label</div>
                  </div>
                </div>
                
                <div className="bg-[#0B1530]/60 rounded-lg p-4 border border-white/5">
                  <div className="text-[#3B82F6] text-sm font-medium mb-2">Variant: Hero</div>
                  <p className="text-white/[0.58] text-sm mb-3">
                    Large, prominent for marketing pages, hero sections, demos.
                  </p>
                  <div className="text-white/[0.58] text-xs space-y-1">
                    <div>• Dot: 28px</div>
                    <div>• Thicker band: 3px</div>
                    <div>• Full section width</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="text-white/95 text-sm font-medium">Props:</div>
                <div className="bg-[#0B1530]/60 rounded-lg p-4 border border-white/5 font-mono text-xs text-white/70 space-y-1">
                  <div>minPrice: number</div>
                  <div>maxPrice: number</div>
                  <div>currentPrice: number</div>
                  <div>status?: 'in-range' | 'near-band' | 'out-of-range' (auto-calculated if omitted)</div>
                  <div>strategyLabel: string (e.g., "Balanced (25.0%)")</div>
                  <div>pairLabel: string (e.g., "WFLR/FXRP")</div>
                  <div>variant: 'list' | 'card' | 'hero'</div>
                  <div>className?: string</div>
                </div>
              </div>
              
              <div className="mt-6 bg-[#1BE8D2]/10 border border-[#1BE8D2]/30 rounded-lg p-4">
                <div className="text-sm text-white/70">
                  <strong className="text-white/95">Status Colors:</strong> In Range (#10B981 green + glow + heartbeat), 
                  Near Band (#F59E0B amber + glow + slow heartbeat), Out of Range (#EF4444 red, no animation)
                </div>
              </div>
            </div>
            
            {/* Navigation & Footer */}
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
              <h3 className="text-white/95 mb-4">Navigation.tsx & Footer.tsx</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-[#3B82F6] text-sm font-medium mb-2">Navigation</div>
                  <p className="text-white/[0.58] text-sm mb-3">
                    Main nav bar with logo, menu items, wallet status, plan badge
                  </p>
                  <div className="text-white/[0.58] text-xs space-y-1">
                    <div>• Props: walletConnected, planType</div>
                    <div>• Navy bg with Electric Blue accents</div>
                    <div>• Responsive mobile menu</div>
                  </div>
                </div>
                
                <div>
                  <div className="text-[#3B82F6] text-sm font-medium mb-2">Footer</div>
                  <p className="text-white/[0.58] text-sm mb-3">
                    Multi-column footer with links, legal, social
                  </p>
                  <div className="text-white/[0.58] text-xs space-y-1">
                    <div>• Sections: Product, Resources, Legal, Company</div>
                    <div>• Copyright notice</div>
                    <div>• Consistent styling with nav</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* PoolCard & PoolTable */}
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
              <h3 className="text-white/95 mb-4">PoolCard.tsx & PoolTable.tsx</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-[#3B82F6] text-sm font-medium mb-2">PoolCard (Grid View)</div>
                  <p className="text-white/[0.58] text-sm mb-3">
                    Vertical card for pool grid layout
                  </p>
                  <div className="text-white/[0.58] text-xs space-y-1">
                    <div>• Token pair header with icons</div>
                    <div>• 2×2 metrics grid (TVL, Fees, Incentives, APR)</div>
                    <div>• RangeBand / Card variant at bottom</div>
                    <div>• Time period indicators: "24H" (selected: white, others: white/40)</div>
                    <div>• Border: border-white/10, hover: border-[#3B82F6]/50</div>
                  </div>
                </div>
                
                <div>
                  <div className="text-[#3B82F6] text-sm font-medium mb-2">PoolTable (List View)</div>
                  <p className="text-white/[0.58] text-sm mb-3">
                    Table rows for pool list view
                  </p>
                  <div className="text-white/[0.58] text-xs space-y-1">
                    <div>• Components: PoolTableHeader, PoolTableRow</div>
                    <div>• Sortable columns</div>
                    <div>• KPI row + RangeBand row in one container (seamless)</div>
                    <div>• Border: border-white/5, no rounded corners</div>
                    <div>• Shared hover state for both rows</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 bg-[#0B1530]/60 rounded-lg p-4 border border-white/5 font-mono text-xs text-white/70">
                <div className="text-white/95 mb-2">Key Data Fields:</div>
                <div className="space-y-1">
                  <div>tvlUsd, unclaimedFeesUsd, incentivesUsd, apr24hPct</div>
                  <div>token1, token2, poolId, fee, dex</div>
                  <div>currentPrice, minPrice, maxPrice, strategyPercent</div>
                  <div>bandColor (status), positionRatio</div>
                </div>
              </div>
            </div>
            
            {/* TokenIcon & TokenPairIcon */}
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
              <h3 className="text-white/95 mb-4">TokenIcon.tsx</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-[#3B82F6] text-sm font-medium mb-2">TokenIcon</div>
                  <p className="text-white/[0.58] text-sm mb-3">
                    Single token icon with fallback
                  </p>
                  <div className="text-white/[0.58] text-xs space-y-1">
                    <div>• Props: symbol, size (small/medium/large)</div>
                    <div>• Circular with gradient backgrounds</div>
                    <div>• Fallback to first letter if no icon</div>
                  </div>
                </div>
                
                <div>
                  <div className="text-[#3B82F6] text-sm font-medium mb-2">TokenPairIcon</div>
                  <p className="text-white/[0.58] text-sm mb-3">
                    Overlapping pair of token icons
                  </p>
                  <div className="text-white/[0.58] text-xs space-y-1">
                    <div>• Used in pool headers, cards, tables</div>
                    <div>• Second icon overlaps first with negative margin</div>
                    <div>• White border for separation</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* WaveBackground */}
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
              <h3 className="text-white/95 mb-4">WaveBackground.tsx</h3>
              <p className="text-white/70 mb-4">
                Animated water wave hero background with gradient (Electric Blue → Signal Aqua)
              </p>
              <div className="text-white/[0.58] text-sm space-y-2">
                <div>• Used on: HomePage, key landing sections, marketing pages</div>
                <div>• Occupies bottom 40-50% of fold</div>
                <div>• Subtle wave animation</div>
                <div>• Gradient from Electric Blue to Signal Aqua</div>
              </div>
            </div>
            
            {/* Form Components & UI Primitives */}
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
              <h3 className="text-white/95 mb-4">ShadCN UI Components (/components/ui/)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  'Button', 'Badge', 'Input', 'Select',
                  'Tabs', 'Alert', 'AlertDialog', 'Accordion',
                  'Checkbox', 'Switch', 'Tooltip', 'Progress',
                  'Separator', 'Dialog', 'Dropdown', 'Table'
                ].map(comp => (
                  <div key={comp} className="bg-[#0B1530]/60 rounded-lg p-3 border border-white/5">
                    <div className="text-white/70 text-sm">{comp}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-white/[0.58] text-sm">
                All ShadCN components are customized with Liquilab design tokens (colors, spacing, typography)
              </div>
            </div>
          </div>
        </section>

        {/* 5. PLAN-SPECIFIC FEATURES */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#3B82F6]/20 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#3B82F6]" />
            </div>
            <h2 className="text-white/95">5. Plan-Specific Features (Premium vs Pro)</h2>
          </div>
          
          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 text-white/95 font-medium">Feature / UI Block</th>
                    <th className="text-left p-4 text-white/95 font-medium">Premium</th>
                    <th className="text-left p-4 text-white/95 font-medium">Pro</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="p-4 text-white/70">Pool Detail View</td>
                    <td className="p-4 text-white/70">Standard view: chart, 4 KPI cards, RangeBand status, My Positions</td>
                    <td className="p-4 text-white/70">Pro view: 6 KPI strip, global time-range, Risk & Range Insights card</td>
                  </tr>
                  
                  <tr className="border-b border-white/5">
                    <td className="p-4 text-white/70">Pool Universe View</td>
                    <td className="p-4"><span className="text-white/[0.58] text-sm">❌ Not available</span></td>
                    <td className="p-4"><span className="text-[#10B981]">✓</span> Full access to pool-wide analytics</td>
                  </tr>
                  
                  <tr className="border-b border-white/5">
                    <td className="p-4 text-white/70">Pro Analytics Tiles</td>
                    <td className="p-4"><span className="text-white/[0.58] text-sm">❌ Not available</span></td>
                    <td className="p-4"><span className="text-[#10B981]">✓</span> Realized APR, PnL, Range Efficiency, Time in range %</td>
                  </tr>
                  
                  <tr className="border-b border-white/5">
                    <td className="p-4 text-white/70">Risk & Range Insights Card</td>
                    <td className="p-4"><span className="text-white/[0.58] text-sm">❌ Not available</span></td>
                    <td className="p-4"><span className="text-[#10B981]">✓</span> Risk profile, sensitivity badges, contextual insights</td>
                  </tr>
                  
                  <tr className="border-b border-white/5">
                    <td className="p-4 text-white/70">RangeBand™ Alerts</td>
                    <td className="p-4 text-white/70">Available as add-on (+$2.49/month per 5 pools)</td>
                    <td className="p-4"><span className="text-[#10B981]">✓</span> Included in subscription</td>
                  </tr>
                  
                  <tr className="border-b border-white/5">
                    <td className="p-4 text-white/70">Data Export</td>
                    <td className="p-4"><span className="text-white/[0.58] text-sm">❌ UI only</span></td>
                    <td className="p-4"><span className="text-[#10B981]">✓</span> Export-ready data (CSV/JSON)</td>
                  </tr>
                  
                  <tr>
                    <td className="p-4 text-white/70">Global Time-Range Toggle</td>
                    <td className="p-4"><span className="text-white/[0.58] text-sm">❌ Fixed 24h view</span></td>
                    <td className="p-4"><span className="text-[#10B981]">✓</span> 24h / 7D / 30D / 90D switching (drives all analytics)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 6. SCREEN-BY-SCREEN COMPONENT USAGE */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#3B82F6]/20 rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 text-[#3B82F6]" />
            </div>
            <h2 className="text-white/95">6. Screen-by-Screen Component Usage</h2>
          </div>
          
          <div className="space-y-4">
            {/* HomePage */}
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
              <h3 className="text-white/95 mb-3">HomePage.tsx (/)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-[#3B82F6] text-sm font-medium mb-2">Components Used</div>
                  <div className="text-white/[0.58] text-sm space-y-1">
                    <div>• Navigation</div>
                    <div>• WaveBackground</div>
                    <div>• Badge (plan indicators)</div>
                    <div>• Button (CTAs)</div>
                    <div>• Icons (Gauge, Users, BarChart3)</div>
                    <div>• Footer</div>
                  </div>
                </div>
                <div>
                  <div className="text-[#3B82F6] text-sm font-medium mb-2">Key Data</div>
                  <div className="text-white/[0.58] text-sm space-y-1">
                    <div>• Hero headline + subtitle</div>
                    <div>• Value propositions (3 columns)</div>
                    <div>• Feature highlights</div>
                    <div>• Social proof stats</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* PoolsOverview */}
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
              <h3 className="text-white/95 mb-3">PoolsOverview.tsx (/pools)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-[#3B82F6] text-sm font-medium mb-2">Components Used</div>
                  <div className="text-white/[0.58] text-sm space-y-1">
                    <div>• Navigation</div>
                    <div>• KPI Cards (4 metrics)</div>
                    <div>• Input (search)</div>
                    <div>• Select (sort dropdown)</div>
                    <div>• Badge (filter chips)</div>
                    <div>• Tabs (List/Grid toggle)</div>
                    <div>• PoolTable / PoolCard</div>
                    <div>• Rangeband / List & Card variants</div>
                    <div>• Footer</div>
                  </div>
                </div>
                <div>
                  <div className="text-[#3B82F6] text-sm font-medium mb-2">Key Data</div>
                  <div className="text-white/[0.58] text-sm space-y-1">
                    <div>• Total TVL, Active Pools, 24H Volume, Avg APR</div>
                    <div>• Pool arrays with: tvlUsd, unclaimedFeesUsd, incentivesUsd, apr24hPct</div>
                    <div>• RangeBand: currentPrice, minPrice, maxPrice, strategyPercent</div>
                    <div>• Filter state: search, dex, strategy, sort</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* PoolDetailPage */}
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
              <h3 className="text-white/95 mb-3">PoolDetailPage.tsx (/pool/:id) — Premium</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-[#3B82F6] text-sm font-medium mb-2">Components Used</div>
                  <div className="text-white/[0.58] text-sm space-y-1">
                    <div>• Navigation</div>
                    <div>• TokenPairIcon</div>
                    <div>• Button ("PRO Analytics")</div>
                    <div>• Recharts (LineChart for price)</div>
                    <div>• KPI Cards (4 earnings metrics)</div>
                    <div>• Rangeband / Hero variant</div>
                    <div>• Table (My Positions with Manage buttons)</div>
                    <div>• Badge (status, DEX)</div>
                    <div>• Footer</div>
                  </div>
                </div>
                <div>
                  <div className="text-[#3B82F6] text-sm font-medium mb-2">Key Data</div>
                  <div className="text-white/[0.58] text-sm space-y-1">
                    <div>• Pool header: token pair, TVL, 24H volume</div>
                    <div>• Price history array for chart</div>
                    <div>• Earnings: totalFees, unclaimedFees, incentives, realizedPnL</div>
                    <div>• RangeBand: status, strategyLabel, pairLabel</div>
                    <div>• Positions: positionId, provider, range, liquidity, mintDate</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* PoolDetailProPage */}
            <div className="bg-[#0F1A36]/95 border border-[#3B82F6]/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-white/95">PoolDetailProPage.tsx (/pool/:id/pro) — Pro</h3>
                <span className="bg-[#3B82F6]/20 text-[#3B82F6] px-2 py-1 rounded text-xs">PRO</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-[#3B82F6] text-sm font-medium mb-2">Components Used</div>
                  <div className="text-white/[0.58] text-sm space-y-1">
                    <div>• Navigation</div>
                    <div>• Badge ("PRO", "Standard View" button)</div>
                    <div>• Tabs (24h/7D/30D/90D time-range toggle)</div>
                    <div>• Recharts (LineChart with range overlay)</div>
                    <div>• KPI Cards (6 PRO metrics)</div>
                    <div>• Rangeband / Hero variant</div>
                    <div>• Risk & Range Insights Card (PRO-only)</div>
                    <div>• Table (My Positions)</div>
                    <div>• Alert (data states: loading, stale)</div>
                    <div>• Footer</div>
                  </div>
                </div>
                <div>
                  <div className="text-[#3B82F6] text-sm font-medium mb-2">Key Data</div>
                  <div className="text-white/[0.58] text-sm space-y-1">
                    <div>• All Premium data PLUS:</div>
                    <div>• realizedAPR, realizedPnL, rangeEfficiency%</div>
                    <div>• Period metrics: avgPrice, volatility, timeInRange%, timeOutOfRange%</div>
                    <div>• Risk profile: Aggressive/Balanced/Conservative</div>
                    <div>• Sensitivity: downsideRisk%, upsideExposure%</div>
                    <div>• Contextual insights array</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* PoolUniversePage */}
            <div className="bg-[#0F1A36]/95 border border-[#3B82F6]/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-white/95">PoolUniversePage.tsx (/pool/:pair/universe) — Pro</h3>
                <span className="bg-[#3B82F6]/20 text-[#3B82F6] px-2 py-1 rounded text-xs">PRO</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-[#3B82F6] text-sm font-medium mb-2">Components Used</div>
                  <div className="text-white/[0.58] text-sm space-y-1">
                    <div>• Navigation</div>
                    <div>• TokenPairIcon</div>
                    <div>• Badge ("Pro · Pool Universe Analytics")</div>
                    <div>• Tabs (24h/7D/30D/90D)</div>
                    <div>• KPI Cards (6 universe metrics)</div>
                    <div>• Recharts (BarChart, PieChart, LineChart)</div>
                    <div>• Table (DEX breakdown, Fee-tier breakdown)</div>
                    <div>• Alert (interpretive hints)</div>
                    <div>• Footer</div>
                  </div>
                </div>
                <div>
                  <div className="text-[#3B82F6] text-sm font-medium mb-2">Key Data</div>
                  <div className="text-white/[0.58] text-sm space-y-1">
                    <div>• Pool-wide: totalTVL, volume, fees, poolAPR, activePositions, activeWallets</div>
                    <div>• DEX breakdown: tvl, volume, fees, apr per DEX</div>
                    <div>• Fee-tier breakdown: data per tier (0.05%, 0.3%, 1%)</div>
                    <div>• LP population: wallet size distribution, top wallet shares</div>
                    <div>• RangeBand landscape: strategy distribution, status distribution</div>
                    <div>• Cash-flow: claim latency, unclaimed fees %</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* WalletOverview */}
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
              <h3 className="text-white/95 mb-3">WalletOverview.tsx (/portfolio)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-[#3B82F6] text-sm font-medium mb-2">Components Used</div>
                  <div className="text-white/[0.58] text-sm space-y-1">
                    <div>• Navigation</div>
                    <div>• Badge (wallet address, verified)</div>
                    <div>• Button (copy-to-clipboard)</div>
                    <div>• KPI Cards (4 portfolio metrics)</div>
                    <div>• PoolTable (active positions)</div>
                    <div>• Table (transaction history)</div>
                    <div>• Footer</div>
                  </div>
                </div>
                <div>
                  <div className="text-[#3B82F6] text-sm font-medium mb-2">Key Data</div>
                  <div className="text-white/[0.58] text-sm space-y-1">
                    <div>• Wallet address</div>
                    <div>• Portfolio: totalValueLocked, totalEarned, activePositions, avgAPR</div>
                    <div>• Positions array: same as pool list data</div>
                    <div>• Transactions: type, pool, amount, timestamp, txHash</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* RangeBandExplainer */}
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
              <h3 className="text-white/95 mb-3">RangeBandExplainer.tsx (/rangeband)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-[#3B82F6] text-sm font-medium mb-2">Components Used</div>
                  <div className="text-white/[0.58] text-sm space-y-1">
                    <div>• Navigation</div>
                    <div>• WaveBackground</div>
                    <div>• Rangeband / Hero variant (demo)</div>
                    <div>• Rangeband / Card variant (strategy cards)</div>
                    <div>• Badge (status indicators, "Recommended")</div>
                    <div>• Button (CTAs, "Try RangeBand", "Start trial")</div>
                    <div>• Icons (numbered steps)</div>
                    <div>• Sticky CTA bar (scroll-triggered)</div>
                    <div>• Footer</div>
                  </div>
                </div>
                <div>
                  <div className="text-[#3B82F6] text-sm font-medium mb-2">Key Data</div>
                  <div className="text-white/[0.58] text-sm space-y-1">
                    <div>• Hero RangeBand example (Balanced strategy)</div>
                    <div>• Strategy cards: Aggressive, Balanced, Conservative</div>
                    <div>• Tradeoff bullets per strategy</div>
                    <div>• How it works: 4 steps</div>
                    <div>• Before/After comparison: time out of range %, missed fees, earned fees</div>
                    <div>• Social proof: "Join 500+ LPs..."</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* PricingPage */}
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
              <h3 className="text-white/95 mb-3">PricingPage.tsx (/pricing)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-[#3B82F6] text-sm font-medium mb-2">Components Used</div>
                  <div className="text-white/[0.58] text-sm space-y-1">
                    <div>• Navigation</div>
                    <div>• WaveBackground</div>
                    <div>• Badge ("Most Popular", "14-day trial")</div>
                    <div>• Button (CTAs, "Start trial", "Contact sales")</div>
                    <div>• Icons (Gauge, TrendingUp, Building2, Zap)</div>
                    <div>• Table (Compare Plans)</div>
                    <div>• Tooltip (feature explanations)</div>
                    <div>• Card (RangeBand Alerts add-on)</div>
                    <div>• Footer</div>
                  </div>
                </div>
                <div>
                  <div className="text-[#3B82F6] text-sm font-medium mb-2">Key Data</div>
                  <div className="text-white/[0.58] text-sm space-y-1">
                    <div>• Pricing: Premium ($14.95), Pro ($24.95), Enterprise (custom)</div>
                    <div>• Add-on bundles: +$9.95 (Premium), +$14.95 (Pro) per 5 pools</div>
                    <div>• RangeBand Alerts: +$2.49/month (Premium only)</div>
                    <div>• Compare table: 7 sections, 20+ features</div>
                    <div>• Key differences: 3-column bullet summary</div>
                    <div>• Currency messaging: "Charged in EUR, shown in USD"</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* AccountPage */}
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
              <h3 className="text-white/95 mb-3">AccountPage.tsx (/account)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-[#3B82F6] text-sm font-medium mb-2">Components Used</div>
                  <div className="text-white/[0.58] text-sm space-y-1">
                    <div>• Navigation</div>
                    <div>• Badge (plan status, "Active", "Included")</div>
                    <div>• Button (upgrade, add bundles, save)</div>
                    <div>• Progress (pool usage bar)</div>
                    <div>• Input (email, profile fields)</div>
                    <div>• Select (timezone)</div>
                    <div>• Switch (notification toggles)</div>
                    <div>• AlertDialog (delete account confirmation)</div>
                    <div>• Icons (TrendingUp, Package, Zap, AlertTriangle)</div>
                    <div>• Footer</div>
                  </div>
                </div>
                <div>
                  <div className="text-[#3B82F6] text-sm font-medium mb-2">Key Data</div>
                  <div className="text-white/[0.58] text-sm space-y-1">
                    <div>• Current plan: name, subtitle, badge, next billing, features</div>
                    <div>• Pool usage: used/total pools, percentage, color-coded progress</div>
                    <div>• Add-on: RangeBand Alerts status (active/inactive)</div>
                    <div>• Profile: wallet, email, timezone</div>
                    <div>• Notifications: email, alerts, weekly reports (toggles)</div>
                    <div>• Developer tools: links to /icons, /overview, /rangeband-ds</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. NOTES & CAVEATS FOR DEVELOPERS */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#3B82F6]/20 rounded-xl flex items-center justify-center">
              <Code className="w-6 h-6 text-[#3B82F6]" />
            </div>
            <h2 className="text-white/95">7. Notes & Caveats for Developers</h2>
          </div>
          
          <div className="space-y-4">
            {/* Implementation Notes */}
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
              <h3 className="text-white/95 mb-4">Implementation Notes</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#1BE8D2] mt-2 flex-shrink-0" />
                  <div>
                    <strong className="text-white/95">Routing:</strong>
                    <p className="text-white/70 text-sm mt-1">
                      This Figma Make project uses HashRouter for client-side routing. When migrating to Next.js, 
                      convert to Next.js Pages Router with dynamic routes ([id], [pair], [page]).
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#1BE8D2] mt-2 flex-shrink-0" />
                  <div>
                    <strong className="text-white/95">Design Tokens:</strong>
                    <p className="text-white/70 text-sm mt-1">
                      All design tokens are defined in /styles/globals.css using Tailwind v4 syntax. 
                      Do NOT create a tailwind.config.js file. Typography defaults are set globally — 
                      avoid Tailwind font-size/weight classes unless explicitly requested.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#1BE8D2] mt-2 flex-shrink-0" />
                  <div>
                    <strong className="text-white/95">Figma Assets:</strong>
                    <p className="text-white/70 text-sm mt-1">
                      Replace all <code className="bg-[#0B1530] px-2 py-1 rounded text-xs text-white/95">figma:asset/...</code> imports 
                      with local images in /public/assets/ when migrating to Next.js. RangeBandIcon.tsx uses a Figma asset 
                      that must be replaced with the correct local PNG.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#1BE8D2] mt-2 flex-shrink-0" />
                  <div>
                    <strong className="text-white/95">Mock Data:</strong>
                    <p className="text-white/70 text-sm mt-1">
                      All pool, wallet, and transaction data is currently mocked. Replace with Supabase queries 
                      and real-time subscriptions for TVL, price feeds, and position data.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#1BE8D2] mt-2 flex-shrink-0" />
                  <div>
                    <strong className="text-white/95">Numeric Class:</strong>
                    <p className="text-white/70 text-sm mt-1">
                      Always use the <code className="bg-[#0B1530] px-2 py-1 rounded text-xs text-white/95">.numeric</code> class 
                      for ALL numbers, prices, percentages, and metrics to ensure tabular-nums alignment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Pro-Only Gating */}
            <div className="bg-[#0F1A36]/95 border border-[#3B82F6]/30 rounded-xl p-6">
              <h3 className="text-white/95 mb-4">Pro-Only Features (Entitlement Gating Required)</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-[#3B82F6]" />
                  <span className="text-white/70">Pool Universe View (/pool/:pair/universe)</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-[#3B82F6]" />
                  <span className="text-white/70">Pool Detail Pro view (/pool/:id/pro)</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-[#3B82F6]" />
                  <span className="text-white/70">Pro Analytics tiles (Realized APR, PnL, Range Efficiency)</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-[#3B82F6]" />
                  <span className="text-white/70">Risk & Range Insights card</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-[#3B82F6]" />
                  <span className="text-white/70">Global time-range toggle (24h/7D/30D/90D)</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-[#3B82F6]" />
                  <span className="text-white/70">Data export (CSV/JSON)</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-[#1BE8D2]" />
                  <span className="text-white/70">RangeBand™ Alerts (Pro: included, Premium: +$2.49 add-on)</span>
                </div>
              </div>
            </div>
            
            {/* Open TODOs */}
            <div className="bg-[#0F1A36]/95 border border-[#F59E0B]/30 rounded-xl p-6">
              <h3 className="text-white/95 mb-4">Open TODOs & Future Enhancements</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                  <div className="text-white/70 text-sm">
                    <strong className="text-white/95">Wallet Connection:</strong> WalletConnect integration pending
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                  <div className="text-white/70 text-sm">
                    <strong className="text-white/95">Live Price Feeds:</strong> Replace mock data with real-time Flare DEX APIs
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                  <div className="text-white/70 text-sm">
                    <strong className="text-white/95">Email Notifications:</strong> RangeBand Alerts email workflow (SendGrid/Resend)
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                  <div className="text-white/70 text-sm">
                    <strong className="text-white/95">Tooltips:</strong> Some tooltip copy text is placeholder, needs finalization
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                  <div className="text-white/70 text-sm">
                    <strong className="text-white/95">Performance:</strong> Implement code splitting, virtualized lists, image lazy loading
                  </div>
                </div>
              </div>
            </div>
            
            {/* Promotie Cards Pattern */}
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
              <h3 className="text-white/95 mb-4">🎁 Promotie Cards — Upsell Pattern</h3>
              <p className="text-white/70 text-sm mb-4">
                Dedicated design pattern for Pro/Premium feature teasers, upgrade prompts, and promotional content.
              </p>
              
              {/* Visual Example */}
              <div className="bg-gradient-to-br from-[#3B82F6]/20 to-[#1BE8D2]/20 border border-[#3B82F6]/30 rounded-xl p-8 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#3B82F6]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-[#3B82F6]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-white/95">Unlock Pro Analytics</h4>
                      <span className="bg-[#1BE8D2]/20 text-[#1BE8D2] border border-[#1BE8D2]/30 px-2 py-1 rounded text-xs">Pro</span>
                    </div>
                    <p className="text-white/70 text-sm">
                      This is how Promotie Cards look with the signature gradient background.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#1BE8D2] mt-2 flex-shrink-0" />
                  <div className="text-white/70 text-sm">
                    <strong className="text-white/95">Gradient Background:</strong> <code className="bg-[#0B1530]/60 px-2 py-0.5 rounded text-white/70">bg-gradient-to-br from-[#3B82F6]/20 to-[#1BE8D2]/20</code>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#1BE8D2] mt-2 flex-shrink-0" />
                  <div className="text-white/70 text-sm">
                    <strong className="text-white/95">Border:</strong> <code className="bg-[#0B1530]/60 px-2 py-0.5 rounded text-white/70">border border-[#3B82F6]/30</code> (Electric Blue with transparency)
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#1BE8D2] mt-2 flex-shrink-0" />
                  <div className="text-white/70 text-sm">
                    <strong className="text-white/95">Padding:</strong> <code className="bg-[#0B1530]/60 px-2 py-0.5 rounded text-white/70">p-8</code> (larger than normal cards for "premium" feel)
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#1BE8D2] mt-2 flex-shrink-0" />
                  <div className="text-white/70 text-sm">
                    <strong className="text-white/95">Layout:</strong> Icon container (Electric Blue bg) + content (H3 + badge + description + CTA button)
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#1BE8D2] mt-2 flex-shrink-0" />
                  <div className="text-white/70 text-sm">
                    <strong className="text-white/95">Badge:</strong> Signal Aqua variant <code className="bg-[#0B1530]/60 px-2 py-0.5 rounded text-white/70">bg-[#1BE8D2]/20 text-[#1BE8D2] border-[#1BE8D2]/30</code>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#1BE8D2] mt-2 flex-shrink-0" />
                  <div className="text-white/70 text-sm">
                    <strong className="text-white/95">Icon Choices:</strong> Lock (gated features), Zap (performance upgrades), TrendingUp (analytics), Sparkles (premium)
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#1BE8D2] mt-2 flex-shrink-0" />
                  <div className="text-white/70 text-sm">
                    <strong className="text-white/95">Examples:</strong> WalletOverview.tsx ("Unlock Pro Analytics"), AccountPage.tsx ("Upgrade to Pro"), PoolDetailPage.tsx ("PRO Analytics" button)
                  </div>
                </div>
              </div>
            </div>
            
            {/* Brand Guidelines */}
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
              <h3 className="text-white/95 mb-4">Brand Guidelines</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                  <div className="text-white/70 text-sm">
                    Always write "Liquilab" (not "LiquiLab")
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                  <div className="text-white/70 text-sm">
                    Always write "RangeBand™" with trademark symbol
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                  <div className="text-white/70 text-sm">
                    Use Signal Aqua (#1BE8D2) ONLY for bullets, checkmarks, badges — NOT for links
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                  <div className="text-white/70 text-sm">
                    <strong className="text-white/95">Icon Containers:</strong> ALWAYS use Electric Blue background <code className="bg-[#0B1530]/60 px-2 py-0.5 rounded text-white/70">bg-[#3B82F6]/20</code> — icon color itself can vary (green/red/aqua) for semantic meaning
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                  <div className="text-white/70 text-sm">
                    Use semantic colors (green/amber/red) ONLY for APR, RangeBand status, and PnL
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                  <div className="text-white/70 text-sm">
                    All other UI elements use Electric Blue (#3B82F6) for interactive states
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <div className="bg-gradient-to-r from-[#3B82F6]/20 to-[#1BE8D2]/20 border border-[#3B82F6]/30 rounded-xl p-8 text-center">
          <h3 className="text-white/95 mb-4">Ready to Implement?</h3>
          <p className="text-white/70 mb-6 max-w-2xl mx-auto">
            This summary provides everything needed to migrate Liquilab from Figma Make to Next.js. 
            Refer to the Guidelines.md for detailed component specifications and the codebase for implementation details.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a href="/#/overview" className="inline-flex items-center gap-2 bg-[#3B82F6] text-white px-6 py-3 rounded-lg hover:bg-[#3B82F6]/90 transition-colors">
              <Layers className="w-4 h-4" />
              View Component Overview
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#0B1530] border border-white/10 text-white/70 px-6 py-3 rounded-lg hover:border-white/20 hover:text-white/95 transition-colors">
              <ExternalLink className="w-4 h-4" />
              View on GitHub
            </a>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
