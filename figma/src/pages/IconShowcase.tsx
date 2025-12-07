import { useState } from "react";
import * as Icons from "../components/Icons";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export function IconShowcase() {
  const [copiedIcon, setCopiedIcon] = useState<string | null>(null);

  // Get all icon components
  const iconList = Object.entries(Icons).map(([name, Component]) => ({
    name,
    Component,
  }));

  const copyToClipboard = (iconName: string) => {
    const importStatement = `import { ${iconName} } from './components/Icons';`;
    navigator.clipboard.writeText(importStatement);
    setCopiedIcon(iconName);
    toast.success(`${iconName} gekopieerd naar clipboard!`);
    setTimeout(() => setCopiedIcon(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0B1530] relative">
      {/* Dark navy base */}
      <div className="fixed inset-0 bg-[#0B1530] z-0" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-white/10 bg-[#0F1A36]/95 backdrop-blur-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center gap-4 mb-2">
              <Icons.LiquilabIcon size={32} className="text-[#3B82F6]" />
              <h1 className="font-['Quicksand',sans-serif] text-white">
                Liquilab Icon Set
              </h1>
            </div>
            <p className="text-[rgba(255,255,255,0.7)] text-sm">
              Complete set van {iconList.length} premium DeFi iconen • Click om import statement te kopiëren
            </p>
          </div>
        </div>

        {/* Icon Grid */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Categories */}
          {[
            {
              title: "🏦 Wallet & Account",
              icons: ["WalletIcon", "UserIcon", "LockIcon", "UnlockIcon"],
            },
            {
              title: "💧 Pool & Liquidity",
              icons: ["PoolIcon", "LiquidityIcon", "SwapIcon", "RangeBandIcon"],
            },
            {
              title: "📊 Analytics & Charts",
              icons: ["ChartIcon", "BarChartIcon", "TrendingUpIcon", "TrendingDownIcon"],
            },
            {
              title: "✅ Status & Notifications",
              icons: ["CheckCircleIcon", "AlertCircleIcon", "InfoCircleIcon", "WarningIcon"],
            },
            {
              title: "⚡ Actions",
              icons: ["CopyIcon", "ExternalLinkIcon", "RefreshIcon", "DownloadIcon", "UploadIcon"],
            },
            {
              title: "🧭 Navigation",
              icons: ["MenuIcon", "CloseIcon", "ChevronDownIcon", "ChevronUpIcon", "ChevronLeftIcon", "ChevronRightIcon"],
            },
            {
              title: "🔧 Utility",
              icons: ["SearchIcon", "FilterIcon", "SettingsIcon"],
            },
            {
              title: "⭐ Premium Features",
              icons: ["SparklesIcon"],
            },
            {
              title: "💎 DeFi Specific",
              icons: ["TokenIcon", "GasIcon", "APRIcon", "TVLIcon"],
            },
          ].map((category) => (
            <div key={category.title} className="mb-12">
              <h2 className="font-['Quicksand',sans-serif] text-white mb-6">
                {category.title}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {category.icons.map((iconName) => {
                  const iconEntry = iconList.find((i) => i.name === iconName);
                  if (!iconEntry) return null;

                  const { Component } = iconEntry;
                  const isCopied = copiedIcon === iconName;

                  return (
                    <div
                      key={iconName}
                      onClick={() => copyToClipboard(iconName)}
                      className="group bg-[#0F1A36]/95 backdrop-blur-sm rounded-lg border border-white/10 p-6 hover:border-[#3B82F6]/50 transition-all cursor-pointer hover:scale-105 active:scale-95"
                    >
                      {/* Icon display */}
                      <div className="flex flex-col items-center gap-4 mb-4">
                        <div className="text-white group-hover:text-[#3B82F6] transition-colors">
                          <Component size={40} />
                        </div>
                        <p className="text-[rgba(255,255,255,0.7)] text-xs text-center break-all">
                          {iconName}
                        </p>
                      </div>

                      {/* Size variations */}
                      <div className="flex items-center justify-center gap-2 py-2 border-t border-white/5">
                        <Component size={16} className="text-[rgba(255,255,255,0.5)]" />
                        <Component size={20} className="text-[rgba(255,255,255,0.6)]" />
                        <Component size={24} className="text-[rgba(255,255,255,0.8)]" />
                      </div>

                      {/* Copy indicator */}
                      <div className="flex items-center justify-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isCopied ? (
                          <>
                            <Check size={12} className="text-emerald-500" />
                            <span className="text-emerald-500 text-xs">Gekopieerd!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} className="text-[#3B82F6]" />
                            <span className="text-[#3B82F6] text-xs">Kopieer import</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Usage Examples */}
          <div className="mt-16 bg-[#0F1A36]/95 backdrop-blur-sm rounded-lg border border-white/10 p-8">
            <h2 className="font-['Quicksand',sans-serif] text-white mb-6">
              💡 Gebruik voorbeelden
            </h2>
            
            <div className="space-y-6">
              {/* Basic example */}
              <div>
                <p className="text-[rgba(255,255,255,0.7)] text-sm mb-2">Basic gebruik:</p>
                <div className="bg-[#0B1530] rounded-lg p-4 font-mono text-sm">
                  <code className="text-[#1BE8D2]">
                    {'import { WalletIcon } from \'./components/Icons\';'}
                  </code>
                  <br />
                  <br />
                  <code className="text-white">{'<WalletIcon />'}</code>
                </div>
              </div>

              {/* Custom size */}
              <div>
                <p className="text-[rgba(255,255,255,0.7)] text-sm mb-2">Custom grootte:</p>
                <div className="bg-[#0B1530] rounded-lg p-4 font-mono text-sm">
                  <code className="text-white">{'<ChartIcon '}</code>
                  <code className="text-[#3B82F6]">size</code>
                  <code className="text-white">={'={32}'}</code>
                  <code className="text-white">{' />'}</code>
                </div>
                <div className="mt-3 flex items-center gap-4">
                  <Icons.ChartIcon size={20} className="text-white" />
                  <Icons.ChartIcon size={32} className="text-white" />
                  <Icons.ChartIcon size={48} className="text-white" />
                </div>
              </div>

              {/* Custom styling */}
              <div>
                <p className="text-[rgba(255,255,255,0.7)] text-sm mb-2">Custom styling met Tailwind:</p>
                <div className="bg-[#0B1530] rounded-lg p-4 font-mono text-sm">
                  <code className="text-white">{'<TrendingUpIcon '}</code>
                  <br />
                  <code className="text-[#3B82F6]">  className</code>
                  <code className="text-white">={'="text-emerald-500"'}</code>
                  <br />
                  <code className="text-[#3B82F6]">  size</code>
                  <code className="text-white">={'={24}'}</code>
                  <br />
                  <code className="text-white">{'/>'}</code>
                </div>
                <div className="mt-3 flex items-center gap-4">
                  <Icons.TrendingUpIcon size={24} className="text-emerald-500" />
                  <Icons.TrendingDownIcon size={24} className="text-red-500" />
                  <Icons.PoolIcon size={24} className="text-[#3B82F6]" />
                  <Icons.LiquidityIcon size={24} className="text-[#1BE8D2]" />
                </div>
              </div>

              {/* Brand colors */}
              <div>
                <p className="text-[rgba(255,255,255,0.7)] text-sm mb-2">Met Liquilab brand kleuren:</p>
                <div className="bg-[#0B1530] rounded-lg p-4 font-mono text-sm">
                  <code className="text-[#1BE8D2]">// Electric Blue (primary)</code>
                  <br />
                  <code className="text-white">{'<PoolIcon className="text-[#3B82F6]" />'}</code>
                  <br />
                  <br />
                  <code className="text-[#1BE8D2]">// Signal Aqua (accent)</code>
                  <br />
                  <code className="text-white">{'<LiquidityIcon className="text-[#1BE8D2]" />'}</code>
                </div>
                <div className="mt-3 flex items-center gap-4">
                  <Icons.PoolIcon size={32} className="text-[#3B82F6]" />
                  <Icons.SwapIcon size={32} className="text-[#3B82F6]" />
                  <Icons.LiquidityIcon size={32} className="text-[#1BE8D2]" />
                  <Icons.RangeBandIcon size={32} className="text-[#1BE8D2]" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0F1A36]/95 backdrop-blur-sm rounded-lg border border-white/10 p-6 text-center">
              <p className="text-[rgba(255,255,255,0.7)] text-sm mb-1">Totaal iconen</p>
              <p className="font-['Quicksand',sans-serif] text-white numeric text-2xl">{iconList.length}</p>
            </div>
            <div className="bg-[#0F1A36]/95 backdrop-blur-sm rounded-lg border border-white/10 p-6 text-center">
              <p className="text-[rgba(255,255,255,0.7)] text-sm mb-1">Default size</p>
              <p className="font-['Quicksand',sans-serif] text-white numeric text-2xl">24px</p>
            </div>
            <div className="bg-[#0F1A36]/95 backdrop-blur-sm rounded-lg border border-white/10 p-6 text-center">
              <p className="text-[rgba(255,255,255,0.7)] text-sm mb-1">Kleur systeem</p>
              <p className="font-['Quicksand',sans-serif] text-white text-2xl">currentColor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}