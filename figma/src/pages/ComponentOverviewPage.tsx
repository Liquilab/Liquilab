import { Link } from "react-router-dom";
import { 
  Home, 
  Droplet, 
  Wallet, 
  TrendingUp, 
  DollarSign, 
  User, 
  Activity, 
  HelpCircle, 
  FileText,
  Palette,
  Camera,
  Layout,
  Code,
  Layers,
  Box,
  Shapes,
  Waves,
  Cookie,
  Menu,
  Table,
  CreditCard,
  BarChart3,
  Settings,
  Package,
  ArrowRight
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { RangeBandIcon } from "../components/RangeBandIcon";

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  category: string;
  description: string;
  badge?: string;
}

export function ComponentOverviewPage() {
  const navigationItems: NavigationItem[] = [
    // Core Pages
    {
      path: "/",
      label: "Home",
      icon: <Home className="h-5 w-5" />,
      category: "Core Pages",
      description: "Landing page met hero, value props, en CTAs"
    },
    {
      path: "/pools",
      label: "My Portfolio",
      icon: <Droplet className="h-5 w-5" />,
      category: "Core Pages",
      description: "Portfolio overzicht met actieve liquidity posities"
    },
    {
      path: "/pool/1",
      label: "Pool Detail",
      icon: <BarChart3 className="h-5 w-5" />,
      category: "Core Pages",
      description: "Gedetailleerde pool analytics met RangeBand"
    },
    {
      path: "/pool/1/pro",
      label: "Pool Detail Pro",
      icon: <TrendingUp className="h-5 w-5" />,
      category: "Core Pages",
      description: "PRO analytics met risk insights",
      badge: "PRO"
    },
    {
      path: "/pool/1/universe",
      label: "Pool Universe View",
      icon: <Layers className="h-5 w-5" />,
      category: "Core Pages",
      description: "Deep analytics across all LPs, DEXes en fee tiers",
      badge: "PRO"
    },
    {
      path: "/koen",
      label: "Wallet Overview",
      icon: <Wallet className="h-5 w-5" />,
      category: "Core Pages",
      description: "Portfolio stats en active positions"
    },
    
    // Info Pages
    {
      path: "/rangeband",
      label: "RangeBand Explainer",
      icon: <RangeBandIcon size={20} />,
      category: "Info Pages",
      description: "Educatieve pagina over RangeBand™"
    },
    {
      path: "/pricing",
      label: "Pricing",
      icon: <DollarSign className="h-5 w-5" />,
      category: "Info Pages",
      description: "Pricing tiers en feature comparison"
    },
    {
      path: "/status",
      label: "Status",
      icon: <Activity className="h-5 w-5" />,
      category: "Info Pages",
      description: "System status en incident history"
    },
    {
      path: "/faq",
      label: "FAQ",
      icon: <HelpCircle className="h-5 w-5" />,
      category: "Info Pages",
      description: "Veelgestelde vragen"
    },
    {
      path: "/legal/terms",
      label: "Legal Pages",
      icon: <FileText className="h-5 w-5" />,
      category: "Info Pages",
      description: "Terms, Privacy, Cookies, Disclaimer"
    },
    
    // Account & Tools
    {
      path: "/account",
      label: "Account",
      icon: <User className="h-5 w-5" />,
      category: "Account & Tools",
      description: "Profile, subscription, en developer tools"
    },
    {
      path: "/icons",
      label: "Icon Showcase",
      icon: <Shapes className="h-5 w-5" />,
      category: "Account & Tools",
      description: "Overzicht alle iconen met search",
      badge: "DEV"
    },
    {
      path: "/screenshot-generator",
      label: "Screenshot Generator",
      icon: <Camera className="h-5 w-5" />,
      category: "Account & Tools",
      description: "Automated screenshot generation",
      badge: "DEV"
    },
    {
      path: "/rangeband-ds",
      label: "RangeBand Design System",
      icon: <RangeBandIcon size={20} />,
      category: "Account & Tools",
      description: "Design system showcase voor RangeBand™",
      badge: "DEV"
    },
    {
      path: "/ds-summary",
      label: "DS & Screens Summary",
      icon: <FileText className="h-5 w-5" />,
      category: "Account & Tools",
      description: "Complete developer handoff documentatie",
      badge: "DEV"
    },
  ];

  interface ComponentItem {
    name: string;
    file: string;
    icon: React.ReactNode;
    category: string;
    description: string;
    usage: string;
  }

  const components: ComponentItem[] = [
    {
      name: "Navigation",
      file: "/components/Navigation.tsx",
      icon: <Menu className="h-5 w-5" />,
      category: "Layout",
      description: "Main navigation bar met wallet status",
      usage: "App.tsx (global)"
    },
    {
      name: "Rangeband",
      file: "/components/Rangeband.tsx",
      icon: <RangeBandIcon size={20} />,
      category: "Core Components",
      description: "USP component - 3 variants (list, card, hero)",
      usage: "Pools, Pool Detail, RangeBand Explainer"
    },
    {
      name: "PoolCard",
      file: "/components/PoolCard.tsx",
      icon: <CreditCard className="h-5 w-5" />,
      category: "Core Components",
      description: "Card view van liquidity pool (grid layout)",
      usage: "Pools Overview (grid view)"
    },
    {
      name: "PoolTable",
      file: "/components/PoolTable.tsx",
      icon: <Table className="h-5 w-5" />,
      category: "Core Components",
      description: "Table rows voor pool list view",
      usage: "Pools Overview (list view), My Positions"
    },
    {
      name: "TokenIcon",
      file: "/components/TokenIcon.tsx",
      icon: <Package className="h-5 w-5" />,
      category: "Core Components",
      description: "Token icons en token pair visualisatie",
      usage: "Pool cards, tables, headers"
    },
    {
      name: "WaveBackground",
      file: "/components/WaveBackground.tsx",
      icon: <Waves className="h-5 w-5" />,
      category: "Visual",
      description: "Animated wave hero background",
      usage: "HomePage, hero sections"
    },
    {
      name: "CookieBanner",
      file: "/components/CookieBanner.tsx",
      icon: <Cookie className="h-5 w-5" />,
      category: "Utility",
      description: "Cookie consent banner met persistence",
      usage: "App.tsx (global)"
    },
    {
      name: "ScreenshotButton",
      file: "/components/ScreenshotButton.tsx",
      icon: <Camera className="h-5 w-5" />,
      category: "Utility",
      description: "Floating screenshot capture button",
      usage: "App.tsx (global)"
    },
    {
      name: "Icons",
      file: "/components/Icons.tsx",
      icon: <Shapes className="h-5 w-5" />,
      category: "Utility",
      description: "Centralized icon exports (lucide-react)",
      usage: "Import named icons"
    },
  ];

  const uiComponents = [
    { name: "button.tsx", description: "Primary actions, verschillende variants" },
    { name: "badge.tsx", description: "Status indicators, plan labels" },
    { name: "tabs.tsx", description: "View switching (list/grid, timeframes)" },
    { name: "select.tsx", description: "Filters (DEX, strategy)" },
    { name: "input.tsx", description: "Search, form fields" },
    { name: "alert-dialog.tsx", description: "Confirmaties, warnings" },
    { name: "accordion.tsx", description: "FAQ section" },
    { name: "card.tsx", description: "Card container met header, content, footer" },
    { name: "table.tsx", description: "Responsive table component" },
    { name: "tooltip.tsx", description: "Hover popups voor info" },
    { name: "sonner.tsx", description: "Toast notifications" },
    { name: "chart.tsx", description: "Recharts integration" },
    { name: "switch.tsx", description: "Toggle controls" },
    { name: "checkbox.tsx", description: "Form checkboxes" },
    { name: "separator.tsx", description: "Visuele content scheiding" },
  ];

  const categories = Array.from(new Set(navigationItems.map(item => item.category)));
  const componentCategories = Array.from(new Set(components.map(item => item.category)));

  return (
    <div className="min-h-screen bg-[#0B1530] px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
              <Layout className="h-6 w-6 text-[#3B82F6]" />
            </div>
            <div>
              <h1 className="font-heading text-white/95">
                Component Overview
              </h1>
              <p className="font-['Inter',sans-serif] text-white/70">
                Navigeer naar alle pagina's, componenten en tools van Liquilab
              </p>
            </div>
          </div>
        </div>

        {/* Developer Handoff Banner */}
        <Link to="/ds-summary">
          <div className="bg-gradient-to-r from-[#3B82F6]/20 to-[#1BE8D2]/20 border-2 border-[#3B82F6]/40 rounded-xl p-6 mb-8 hover:border-[#3B82F6]/60 transition-all cursor-pointer group">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-[#3B82F6]/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6 text-[#3B82F6]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-heading text-white/95">
                      Design System & Screens Summary
                    </h3>
                    <Badge className="bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30">
                      Developer Handoff
                    </Badge>
                  </div>
                  <p className="font-['Inter',sans-serif] text-white/70 mb-2">
                    Complete documentatie voor het implementeren van Liquilab in Next.js. Bevat routes, componenten, design tokens, en implementatie notes.
                  </p>
                  <p className="font-['Inter',sans-serif] text-white/[0.58] text-sm">
                    💡 <strong className="text-white/70">Direct bereikbaar via:</strong> /#/ds-summary in je browser adresbalk
                  </p>
                </div>
              </div>
              <div className="text-[#3B82F6] group-hover:translate-x-1 transition-transform">
                →
              </div>
            </div>
          </div>
        </Link>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center">
                <Layout className="h-5 w-5 text-[#3B82F6]" />
              </div>
              <div>
                <div className="font-['Inter',sans-serif] numeric text-white/95">
                  {navigationItems.length}
                </div>
                <div className="font-['Inter',sans-serif] text-white/[0.58]">
                  Pagina's
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center">
                <Box className="h-5 w-5 text-[#3B82F6]" />
              </div>
              <div>
                <div className="font-['Inter',sans-serif] numeric text-white/95">
                  {components.length}
                </div>
                <div className="font-['Inter',sans-serif] text-white/[0.58]">
                  Componenten
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center">
                <Layers className="h-5 w-5 text-[#3B82F6]" />
              </div>
              <div>
                <div className="font-['Inter',sans-serif] numeric text-white/95">
                  {uiComponents.length}
                </div>
                <div className="font-['Inter',sans-serif] text-white/[0.58]">
                  UI Components
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center">
                <Code className="h-5 w-5 text-[#3B82F6]" />
              </div>
              <div>
                <div className="font-['Inter',sans-serif] numeric text-white/95">
                  {categories.length + componentCategories.length}
                </div>
                <div className="font-['Inter',sans-serif] text-white/[0.58]">
                  Categorieën
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pages Navigation */}
        <div className="mb-16">
          <h2 className="font-heading text-white/95 mb-6">
            Alle Pagina's
          </h2>
          
          {categories.map(category => (
            <div key={category} className="mb-8">
              <h3 className="font-heading text-white/70 mb-4">
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {navigationItems
                  .filter(item => item.category === category)
                  .map(item => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="bg-[#0F1A36]/95 border border-white/10 hover:border-[#3B82F6]/50 rounded-lg p-6 transition-all duration-200 hover:scale-[1.02] group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#3B82F6]/30 transition-colors">
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-heading text-white/95 group-hover:text-[#3B82F6] transition-colors">
                              {item.label}
                            </h4>
                            {item.badge && (
                              <Badge 
                                variant="outline" 
                                className="border-[#3B82F6] text-[#3B82F6] text-xs px-2 py-0"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="font-['Inter',sans-serif] text-white/[0.58]">
                            {item.description}
                          </p>
                          <p className="font-['Inter',sans-serif] text-white/40 mt-2 font-mono">
                            {item.path}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Components Overview */}
        <div className="mb-16">
          <h2 className="font-heading text-white/95 mb-6">
            Herbruikbare Componenten
          </h2>
          
          {componentCategories.map(category => (
            <div key={category} className="mb-8">
              <h3 className="font-heading text-white/70 mb-4">
                {category}
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {components
                  .filter(item => item.category === category)
                  .map(component => (
                    <div
                      key={component.name}
                      className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6"
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center flex-shrink-0">
                          {component.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-heading text-white/95 mb-1">
                            {component.name}
                          </h4>
                          <p className="font-['Inter',sans-serif] text-white/[0.58] mb-2">
                            {component.description}
                          </p>
                          <div className="flex flex-col gap-1">
                            <p className="font-['Inter',sans-serif] text-white/40 font-mono">
                              {component.file}
                            </p>
                            <p className="font-['Inter',sans-serif] text-white/[0.58]">
                              <span className="text-white/40">Gebruikt in: </span>
                              {component.usage}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* ShadCN UI Components */}
        <div className="mb-16">
          <h2 className="font-heading text-white/95 mb-4">
            ShadCN UI Components
          </h2>
          <p className="font-['Inter',sans-serif] text-white/70 mb-6">
            Pre-built UI primitives in <code className="text-[#3B82F6] bg-[#3B82F6]/10 px-2 py-1 rounded">/components/ui/</code>
          </p>
          
          <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uiComponents.map(component => (
                <div key={component.name} className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-2" />
                  <div className="flex-1 min-w-0">
                    <div className="font-['Inter',sans-serif] text-white/95 font-mono">
                      {component.name}
                    </div>
                    <div className="font-['Inter',sans-serif] text-white/[0.58]">
                      {component.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Design System Resources */}
        <div>
          <h2 className="font-heading text-white/95 mb-6">
            Design System Resources
          </h2>
          
          <div className="grid grid-cols-1 gap-6">
            {/* Design Tokens - Full Width */}
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                  <Palette className="h-6 w-6 text-[#3B82F6]" />
                </div>
                <div>
                  <h3 className="font-heading text-white/95">
                    Design Tokens
                  </h3>
                  <p className="font-['Inter',sans-serif] text-white/[0.58]">
                    /styles/globals.css
                  </p>
                </div>
              </div>

              {/* Primary & Semantic Colors */}
              <div className="mb-6">
                <div className="font-['Inter',sans-serif] text-white/70 mb-3">Primary & Semantic</div>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded bg-[#3B82F6] border border-white/20" />
                    <div>
                      <div className="font-['Inter',sans-serif] text-white/95">Electric Blue</div>
                      <div className="font-['Inter',sans-serif] text-white/[0.58] font-mono">#3B82F6</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded bg-[#1BE8D2] border border-white/20" />
                    <div>
                      <div className="font-['Inter',sans-serif] text-white/95">Signal Aqua</div>
                      <div className="font-['Inter',sans-serif] text-white/[0.58] font-mono">#1BE8D2</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded bg-[#10B981] border border-white/20" />
                    <div>
                      <div className="font-['Inter',sans-serif] text-white/95">Success</div>
                      <div className="font-['Inter',sans-serif] text-white/[0.58] font-mono">#10B981</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded bg-[#F59E0B] border border-white/20" />
                    <div>
                      <div className="font-['Inter',sans-serif] text-white/95">Warning</div>
                      <div className="font-['Inter',sans-serif] text-white/[0.58] font-mono">#F59E0B</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded bg-[#EF4444] border border-white/20" />
                    <div>
                      <div className="font-['Inter',sans-serif] text-white/95">Error</div>
                      <div className="font-['Inter',sans-serif] text-white/[0.58] font-mono">#EF4444</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blue Variants */}
              <div className="mb-6 pb-6 border-b border-white/5">
                <div className="font-['Inter',sans-serif] text-white/70 mb-3">Blauw Varianten</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="font-['Inter',sans-serif] text-white/[0.58]">Chart Event Kleuren</div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded bg-[#CBD5E1] border border-white/40" />
                      <div>
                        <div className="font-['Inter',sans-serif] text-white/95">Slate Gray</div>
                        <div className="font-['Inter',sans-serif] text-white/[0.58] font-mono">#CBD5E1</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded bg-[#3B82F6] border border-white/40" />
                      <div>
                        <div className="font-['Inter',sans-serif] text-white/95">Electric Blue</div>
                        <div className="font-['Inter',sans-serif] text-white/[0.58] font-mono">#3B82F6</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded bg-[#1E3A8A] border border-white/40" />
                      <div>
                        <div className="font-['Inter',sans-serif] text-white/95">Navy Blue</div>
                        <div className="font-['Inter',sans-serif] text-white/[0.58] font-mono">#1E3A8A</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="font-['Inter',sans-serif] text-white/[0.58]">Overlay & Backgrounds</div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded bg-[#3B82F6]/20 border border-white/20" />
                      <div>
                        <div className="font-['Inter',sans-serif] text-white/95">Primary /20</div>
                        <div className="font-['Inter',sans-serif] text-white/[0.58]">Icon backgrounds</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded border border-[#3B82F6]/50 bg-[#0B1530]" />
                      <div>
                        <div className="font-['Inter',sans-serif] text-white/95">Primary /50</div>
                        <div className="font-['Inter',sans-serif] text-white/[0.58]">Hover borders</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded border-2 border-[#3B82F6] bg-[#0B1530]" />
                      <div>
                        <div className="font-['Inter',sans-serif] text-white/95">Primary Solid</div>
                        <div className="font-['Inter',sans-serif] text-white/[0.58]">Active states</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* White Variants */}
              <div className="mb-6 pb-6 border-b border-white/5">
                <div className="font-['Inter',sans-serif] text-white/70 mb-3">Wit Varianten</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="font-['Inter',sans-serif] text-white/[0.58]">Text Opacity</div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-16 rounded bg-white/95 border border-white/20" />
                      <div>
                        <div className="font-['Inter',sans-serif] text-white/95">white/95</div>
                        <div className="font-['Inter',sans-serif] text-white/[0.58]">Primary text</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-16 rounded bg-white/70 border border-white/20" />
                      <div>
                        <div className="font-['Inter',sans-serif] text-white/95">white/70</div>
                        <div className="font-['Inter',sans-serif] text-white/[0.58]">Secondary text</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-16 rounded bg-white/[0.58] border border-white/20" />
                      <div>
                        <div className="font-['Inter',sans-serif] text-white/95">white/[0.58]</div>
                        <div className="font-['Inter',sans-serif] text-white/[0.58]">Tertiary/labels</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="font-['Inter',sans-serif] text-white/[0.58]">Surfaces & Borders</div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-16 rounded bg-[#0F1A36]/95 border border-white/20" />
                      <div>
                        <div className="font-['Inter',sans-serif] text-white/95">#0F1A36/95</div>
                        <div className="font-['Inter',sans-serif] text-white/[0.58]">Card surface</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-16 rounded border border-white/10 bg-[#0B1530]" />
                      <div>
                        <div className="font-['Inter',sans-serif] text-white/95">white/10</div>
                        <div className="font-['Inter',sans-serif] text-white/[0.58]">Card borders</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-16 rounded border border-white/5 bg-[#0B1530]" />
                      <div>
                        <div className="font-['Inter',sans-serif] text-white/95">white/5</div>
                        <div className="font-['Inter',sans-serif] text-white/[0.58]">Table borders</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Usage Rules */}
              <div className="mb-6 pb-6 border-b border-white/5">
                <div className="font-['Inter',sans-serif] text-white/70 mb-3">Color Usage Rules</div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#3B82F6] flex-shrink-0 mt-2" />
                    <div className="font-['Inter',sans-serif] text-white/70">
                      <span className="text-[#3B82F6]">Electric Blue (#3B82F6)</span> → Interactive elementen, links, buttons, active states, hover borders
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-2" />
                    <div className="font-['Inter',sans-serif] text-white/70">
                      <span className="text-[#1BE8D2]">Signal Aqua (#1BE8D2)</span> → Bullets, opsommingen, badges, checkmarks, accent elementen
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#10B981] flex-shrink-0 mt-2" />
                    <div className="font-['Inter',sans-serif] text-white/70">
                      <span className="text-[#10B981]">Success (#10B981)</span> → ALLEEN voor positieve APR, in-range status, positieve PnL, range efficiency
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#F59E0B] flex-shrink-0 mt-2" />
                    <div className="font-['Inter',sans-serif] text-white/70">
                      <span className="text-[#F59E0B]">Warning (#F59E0B)</span> → ALLEEN voor near-range warnings en gematigde alerts
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#EF4444] flex-shrink-0 mt-2" />
                    <div className="font-['Inter',sans-serif] text-white/70">
                      <span className="text-[#EF4444]">Error (#EF4444)</span> → ALLEEN voor negatieve APR, out-of-range status, negatieve PnL
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-white/40 flex-shrink-0 mt-2" />
                    <div className="font-['Inter',sans-serif] text-white/70">
                      <span className="text-white/95">Grijs-wit borders</span> → Alle cards (white/10), tables (white/5), hover → Primary/50
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div>
                <div className="font-['Inter',sans-serif] text-white/70 mb-2">Typografie</div>
                <div className="font-['Inter',sans-serif] text-white/[0.58]">
                  Manrope (headings) • Inter (body)
                </div>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-[#3B82F6]" />
                </div>
                <div>
                  <h3 className="font-heading text-white/95">
                    Guidelines
                  </h3>
                  <p className="font-['Inter',sans-serif] text-white/[0.58]">
                    /guidelines/Guidelines.md
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#1BE8D2]" />
                  <div className="font-['Inter',sans-serif] text-white/70">
                    Component Architecture
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#1BE8D2]" />
                  <div className="font-['Inter',sans-serif] text-white/70">
                    Design System
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#1BE8D2]" />
                  <div className="font-['Inter',sans-serif] text-white/70">
                    Routing Structure
                  </div>
                </div>
              </div>
            </div>

            {/* DS Summary - NEW */}
            <div className="bg-gradient-to-br from-[#3B82F6]/20 to-[#1BE8D2]/20 border border-[#3B82F6]/30 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                  <Layers className="h-6 w-6 text-[#1BE8D2]" />
                </div>
                <div>
                  <h3 className="font-heading text-white/95">
                    Figma_MAKE_DS_SUMMARY
                  </h3>
                  <p className="font-['Inter',sans-serif] text-white/[0.58]">
                    /ds-summary-page
                  </p>
                </div>
              </div>
              <p className="font-['Inter',sans-serif] text-white/70 mb-4">
                Complete Design System reference for Strategy C screens (Portfolio, Pool Detail, Pool Universe). Visual examples of foundations, components, and layout templates.
              </p>
              <Link to="/ds-summary-page">
                <Button className="w-full bg-[#3B82F6] hover:bg-[#3B82F6]/90 flex items-center justify-center gap-2">
                  <span>View DS Summary</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Developer Tools */}
        <div className="mb-16">
          <h2 className="font-heading text-white/95 mb-6">
            Developer Tools
          </h2>
          
          <div className="bg-[#0F1A36]/95 border border-[#3B82F6]/30 rounded-lg p-8">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-['Inter',sans-serif] text-white/95 mb-1">Screenshot Generator</div>
                  <p className="font-['Inter',sans-serif] text-white/[0.58]">
                    Generate screenshots of all pages for Uizard/Figma export
                  </p>
                </div>
                
                <Link to="/screenshot-generator">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border-[#3B82F6]/30 text-[#3B82F6] hover:bg-[#3B82F6]/10"
                  >
                    Open Generator
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-start justify-between pt-4 border-t border-white/5">
                <div>
                  <div className="font-['Inter',sans-serif] text-white/95 mb-1">iDepot UX Documentatie</div>
                  <p className="font-['Inter',sans-serif] text-white/[0.58]">
                    Gestructureerde UX documentatie voor IP-aanvraag met screenshots en beschrijvingen
                  </p>
                </div>
                
                <Link to="/idepot-doc">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border-[#3B82F6]/30 text-[#3B82F6] hover:bg-[#3B82F6]/10"
                  >
                    Open Document
                  </Button>
                </Link>
              </div>

              <div className="flex items-start justify-between pt-4 border-t border-white/5">
                <div>
                  <div className="font-['Inter',sans-serif] text-white/95 mb-1">Technical Integration Brief</div>
                  <p className="font-['Inter',sans-serif] text-white/[0.58]">
                    Comprehensive briefing for account manager about Figma Make → Production integration
                  </p>
                </div>
                
                <Link to="/technical-brief">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border-[#3B82F6]/30 text-[#3B82F6] hover:bg-[#3B82F6]/10"
                  >
                    View Brief
                  </Button>
                </Link>
              </div>

              <div className="flex items-start justify-between pt-4 border-t border-white/5">
                <div>
                  <div className="font-['Inter',sans-serif] text-white/95 mb-1">Weekly Report Template</div>
                  <p className="font-['Inter',sans-serif] text-white/[0.58]">
                    Professional A4 report template for Flare V3 LP Universe analytics (Week 47, 2025)
                  </p>
                </div>
                
                <Link to="/weekly-report-template">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border-[#3B82F6]/30 text-[#3B82F6] hover:bg-[#3B82F6]/10"
                  >
                    View Template
                  </Button>
                </Link>
              </div>

              <div className="flex items-start justify-between pt-4 border-t border-white/5">
                <div>
                  <div className="font-['Inter',sans-serif] text-white/95 mb-1">App Landing Page</div>
                  <p className="font-['Inter',sans-serif] text-white/[0.58]">
                    Elegant "coming soon" placeholder for app.liquilab.io with hero wave and contact CTA
                  </p>
                </div>
                
                <Link to="/app-landing">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border-[#3B82F6]/30 text-[#3B82F6] hover:bg-[#3B82F6]/10"
                  >
                    View Landing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}