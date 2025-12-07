import { useState } from "react";
import { Download, FileText, Calendar } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export function WeeklyReportTemplate() {
  const [weekNumber, setWeekNumber] = useState(47);
  const [year, setYear] = useState(2025);

  const downloadPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0B1530]">
      {/* Control Panel - Hidden on Print */}
      <div className="print:hidden bg-[#0F1A36]/95 border-b border-white/10 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FileText className="h-5 w-5 text-[#3B82F6]" />
            <span className="font-['Manrope',sans-serif] text-white/95">
              Weekly Report Template
            </span>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-white/40" />
              <Input
                type="number"
                value={weekNumber}
                onChange={(e) => setWeekNumber(parseInt(e.target.value))}
                className="w-16 h-8 bg-[#0B1530] border-white/10 text-white/95"
              />
              <span className="text-white/40">/</span>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-20 h-8 bg-[#0B1530] border-white/10 text-white/95"
              />
            </div>
          </div>
          <Button
            onClick={downloadPDF}
            className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Report Pages */}
      <div className="report-container">
        {/* Cover Page */}
        <div className="page cover-page relative overflow-hidden bg-[#0B1530]">
          {/* Hero Wave Background - Bottom Half */}
          <div className="absolute bottom-0 left-0 right-0 h-[60%]">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B1530] via-[#1a2847] to-[#0B1530] opacity-40" />
            <svg
              className="absolute bottom-0 w-full h-full"
              viewBox="0 0 1200 600"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#1BE8D2" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <path
                d="M0,300 Q300,200 600,300 T1200,300 L1200,600 L0,600 Z"
                fill="url(#waveGradient)"
              />
              <path
                d="M0,350 Q300,250 600,350 T1200,350 L1200,600 L0,600 Z"
                fill="url(#waveGradient)"
                opacity="0.5"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-between p-16">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-[#3B82F6] flex items-center justify-center">
                  <span className="font-['Manrope',sans-serif] text-white font-bold text-lg">L</span>
                </div>
                <span className="font-['Manrope',sans-serif] text-white/95 text-xl font-semibold">
                  LiquiLab
                </span>
              </div>
            </div>

            {/* Main Title */}
            <div className="text-center space-y-6">
              <h1 className="font-['Manrope',sans-serif] text-6xl font-bold text-white/95 leading-tight">
                LiquiLab Weekly<br />Universe Report
              </h1>
              <div className="space-y-2">
                <p className="font-['Manrope',sans-serif] text-2xl text-white/70">
                  Flare V3 LP Market
                </p>
                <p className="font-['Manrope',sans-serif] text-3xl text-[#3B82F6] font-semibold">
                  Week {weekNumber}, {year}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center space-y-2">
              <p className="font-['Manrope',sans-serif] text-white/60">
                Non-custodial analytics for LPs on Flare V3
              </p>
              <p className="font-['Manrope',sans-serif] text-white/40 text-sm">
                www.liquilab.io
              </p>
            </div>
          </div>
        </div>

        {/* Page 1: Executive Summary */}
        <div className="page content-page">
          <div className="page-header">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-[#3B82F6] flex items-center justify-center">
                <span className="font-['Manrope',sans-serif] text-white text-xs font-bold">L</span>
              </div>
              <span className="font-['Manrope',sans-serif] text-sm text-gray-600">LiquiLab</span>
            </div>
            <span className="font-['Manrope',sans-serif] text-sm text-gray-500">
              Weekly Universe Report · Week {weekNumber}, {year}
            </span>
          </div>

          <div className="page-content">
            <h1 className="chapter-title">1. Executive Summary</h1>

            <div className="grid grid-cols-2 gap-8 mb-8">
              {/* Key Highlights */}
              <div>
                <h2 className="section-title mb-4">Key Highlights</h2>
                <div className="space-y-3">
                  {[
                    "Flare V3 LP market shows 23% TVL growth week-over-week, reaching $4.2M total value locked",
                    "WFLR–USDT0 pair dominates with 67% of total LP wallets, demonstrating strong concentration",
                    "87% of LP positions maintain in-range status, indicating healthy market conditions",
                    "New LP wallet growth of +12% signals increasing platform adoption",
                    "Fee generation up 18% with improved fairness distribution across wallet size buckets"
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-2" />
                      <p className="font-['Manrope',sans-serif] text-gray-700 text-sm leading-relaxed">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* KPI Panel */}
              <div>
                <h2 className="section-title mb-4">Market Snapshot (7D)</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Total TVL", value: "$4.2M", change: "+23%" },
                    { label: "7D Volume", value: "$8.7M", change: "+15%" },
                    { label: "7D Fees", value: "$12.4K", change: "+18%" },
                    { label: "Active LP Wallets", value: "234", change: "+12%" }
                  ].map((kpi, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="font-['Manrope',sans-serif] text-xs text-gray-500 mb-1">
                        {kpi.label}
                      </div>
                      <div className="font-['Manrope',sans-serif] text-2xl font-bold text-gray-900 mb-1">
                        {kpi.value}
                      </div>
                      <div className="font-['Manrope',sans-serif] text-sm text-green-600">
                        {kpi.change}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Report Context */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
              <p className="font-['Manrope',sans-serif] text-gray-700 leading-relaxed">
                This report serves dual purposes: <strong>evidence for the Flare grant program</strong> demonstrating 
                LP ecosystem growth and health, and a <strong>preview of LiquiLab Pro's weekly Universe report</strong> 
                feature. The data covers Week {weekNumber}, {year}, focusing on non-custodial LP positions across 
                Ēnosys and SparkDEX on Flare V3, with special emphasis on the WFLR–USDT0 pair as the market leader.
              </p>
            </div>
          </div>

          <div className="page-footer">
            <span className="font-['Manrope',sans-serif] text-xs text-gray-500">Page 1 of 8</span>
            <span className="font-['Manrope',sans-serif] text-xs text-gray-400">
              LiquiLab · Flare V3 LP analytics · www.liquilab.io
            </span>
          </div>
        </div>

        {/* Page 2: Flare V3 LP Market Overview */}
        <div className="page content-page">
          <div className="page-header">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-[#3B82F6] flex items-center justify-center">
                <span className="font-['Manrope',sans-serif] text-white text-xs font-bold">L</span>
              </div>
              <span className="font-['Manrope',sans-serif] text-sm text-gray-600">LiquiLab</span>
            </div>
            <span className="font-['Manrope',sans-serif] text-sm text-gray-500">
              Weekly Universe Report · Week {weekNumber}, {year}
            </span>
          </div>

          <div className="page-content">
            <h1 className="chapter-title">2. Flare V3 LP Market Overview</h1>

            {/* KPI Table */}
            <div className="mb-8">
              <h2 className="section-title mb-4">Week-over-Week Performance</h2>
              <div className="chart-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="text-left">Metric</th>
                      <th className="text-right">Current (7D)</th>
                      <th className="text-right">Previous (7D)</th>
                      <th className="text-right">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Total TVL</td>
                      <td className="text-right">$4,234,567</td>
                      <td className="text-right">$3,442,891</td>
                      <td className="text-right text-green-600">+23.0%</td>
                    </tr>
                    <tr>
                      <td>7D Volume</td>
                      <td className="text-right">$8,723,445</td>
                      <td className="text-right">$7,585,223</td>
                      <td className="text-right text-green-600">+15.0%</td>
                    </tr>
                    <tr>
                      <td>7D Fees</td>
                      <td className="text-right">$12,434</td>
                      <td className="text-right">$10,537</td>
                      <td className="text-right text-green-600">+18.0%</td>
                    </tr>
                    <tr>
                      <td>Active Pools</td>
                      <td className="text-right">12</td>
                      <td className="text-right">11</td>
                      <td className="text-right text-green-600">+9.1%</td>
                    </tr>
                    <tr>
                      <td>Active LP Wallets</td>
                      <td className="text-right">234</td>
                      <td className="text-right">209</td>
                      <td className="text-right text-green-600">+12.0%</td>
                    </tr>
                    <tr>
                      <td>New LP Wallets</td>
                      <td className="text-right">28</td>
                      <td className="text-right">23</td>
                      <td className="text-right text-green-600">+21.7%</td>
                    </tr>
                    <tr>
                      <td>Avg Pool APR</td>
                      <td className="text-right">14.2%</td>
                      <td className="text-right">13.8%</td>
                      <td className="text-right text-green-600">+2.9%</td>
                    </tr>
                  </tbody>
                </table>
                <p className="chart-caption">
                  All metrics show positive growth, indicating healthy LP ecosystem expansion. 
                  New wallet growth (+21.7%) outpaces overall wallet growth (+12%), suggesting strong new user acquisition.
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-6">
              <div className="chart-container">
                <h3 className="font-['Manrope',sans-serif] text-sm font-semibold text-gray-700 mb-3">
                  Active LP Wallets (90D)
                </h3>
                <div className="h-48 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
                  <span className="font-['Manrope',sans-serif] text-gray-400 text-sm">
                    [Line chart: 90-day wallet growth trend]
                  </span>
                </div>
                <p className="chart-caption">
                  Steady growth with acceleration in last 3 weeks, correlating with increased WFLR–USDT0 activity.
                </p>
              </div>

              <div className="chart-container">
                <h3 className="font-['Manrope',sans-serif] text-sm font-semibold text-gray-700 mb-3">
                  TVL vs Volume vs Fees (90D)
                </h3>
                <div className="h-48 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
                  <span className="font-['Manrope',sans-serif] text-gray-400 text-sm">
                    [Multi-line chart: TVL, Volume, Fees trends]
                  </span>
                </div>
                <p className="chart-caption">
                  TVL growth (+67% over 90D) demonstrates strong capital inflow and LP confidence in the platform.
                </p>
              </div>
            </div>
          </div>

          <div className="page-footer">
            <span className="font-['Manrope',sans-serif] text-xs text-gray-500">Page 2 of 8</span>
            <span className="font-['Manrope',sans-serif] text-xs text-gray-400">
              LiquiLab · Flare V3 LP analytics · www.liquilab.io
            </span>
          </div>
        </div>

        {/* Page 3: LP Population & Fairness */}
        <div className="page content-page">
          <div className="page-header">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-[#3B82F6] flex items-center justify-center">
                <span className="font-['Manrope',sans-serif] text-white text-xs font-bold">L</span>
              </div>
              <span className="font-['Manrope',sans-serif] text-sm text-gray-600">LiquiLab</span>
            </div>
            <span className="font-['Manrope',sans-serif] text-sm text-gray-500">
              Weekly Universe Report · Week {weekNumber}, {year}
            </span>
          </div>

          <div className="page-content">
            <h1 className="chapter-title">3. LP Population & Fairness</h1>

            <div className="grid grid-cols-2 gap-8 mb-8">
              {/* LP Size Distribution Table */}
              <div className="chart-container">
                <h2 className="section-title mb-4">LP Wallet Size Distribution</h2>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="text-left">Bucket</th>
                      <th className="text-right">Wallets</th>
                      <th className="text-right">TVL</th>
                      <th className="text-right">% of TVL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Retail (&lt;$5K)</td>
                      <td className="text-right">156</td>
                      <td className="text-right">$287,234</td>
                      <td className="text-right">6.8%</td>
                    </tr>
                    <tr>
                      <td>Mid ($5K–$50K)</td>
                      <td className="text-right">63</td>
                      <td className="text-right">$1,423,567</td>
                      <td className="text-right">33.6%</td>
                    </tr>
                    <tr>
                      <td>Whale (&gt;$50K)</td>
                      <td className="text-right">15</td>
                      <td className="text-right">$2,523,766</td>
                      <td className="text-right">59.6%</td>
                    </tr>
                  </tbody>
                </table>
                <p className="chart-caption">
                  67% of wallets are retail size, but whales control 60% of TVL. This concentration is typical for early-stage DeFi markets.
                </p>
              </div>

              {/* Concentration Chart */}
              <div className="chart-container">
                <h2 className="section-title mb-4">TVL & Fee Concentration</h2>
                <div className="h-48 bg-gray-50 border border-gray-200 rounded flex items-center justify-center mb-3">
                  <span className="font-['Manrope',sans-serif] text-gray-400 text-sm">
                    [Bar chart: Top 1 / Top 10 share]
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 border border-gray-200 rounded p-3">
                    <div className="font-['Manrope',sans-serif] text-xs text-gray-500 mb-1">Top 1 Wallet</div>
                    <div className="font-['Manrope',sans-serif] font-semibold text-gray-900">18.2% TVL</div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded p-3">
                    <div className="font-['Manrope',sans-serif] text-xs text-gray-500 mb-1">Top 10 Wallets</div>
                    <div className="font-['Manrope',sans-serif] font-semibold text-gray-900">67.3% TVL</div>
                  </div>
                </div>
                <p className="chart-caption mt-3">
                  Moderate concentration—better than typical early DeFi, indicating fair opportunity distribution for the grant context.
                </p>
              </div>
            </div>

            {/* Fairness Summary */}
            <div className="bg-green-50 border border-green-100 rounded-lg p-6">
              <h3 className="font-['Manrope',sans-serif] text-sm font-semibold text-gray-700 mb-3">
                Fairness Assessment
              </h3>
              <p className="font-['Manrope',sans-serif] text-gray-700 leading-relaxed">
                The LP population shows <strong>healthy diversity</strong> with 67% retail participation by wallet count. 
                While whales control the majority of TVL (typical for DeFi), mid-tier wallets hold a substantial 34%, 
                indicating <strong>accessible entry points</strong>. Fee distribution follows TVL proportionally, with no 
                evidence of extraction or unfair advantage. This balance supports the grant goal of fostering an 
                <strong>inclusive, sustainable LP ecosystem</strong> on Flare V3.
              </p>
            </div>
          </div>

          <div className="page-footer">
            <span className="font-['Manrope',sans-serif] text-xs text-gray-500">Page 3 of 8</span>
            <span className="font-['Manrope',sans-serif] text-xs text-gray-400">
              LiquiLab · Flare V3 LP analytics · www.liquilab.io
            </span>
          </div>
        </div>

        {/* Page 4: RangeBand Market Barometer */}
        <div className="page content-page">
          <div className="page-header">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-[#3B82F6] flex items-center justify-center">
                <span className="font-['Manrope',sans-serif] text-white text-xs font-bold">L</span>
              </div>
              <span className="font-['Manrope',sans-serif] text-sm text-gray-600">LiquiLab</span>
            </div>
            <span className="font-['Manrope',sans-serif] text-sm text-gray-500">
              Weekly Universe Report · Week {weekNumber}, {year}
            </span>
          </div>

          <div className="page-content">
            <h1 className="chapter-title">4. RangeBand™ Market Barometer</h1>

            {/* Explainer */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8">
              <p className="font-['Manrope',sans-serif] text-sm text-gray-700 leading-relaxed">
                <strong>RangeBand™</strong> is LiquiLab's proprietary metric for LP position health. Positions are 
                classified as: <span className="text-green-600 font-semibold">In Range</span> (green, earning full fees), 
                <span className="text-amber-600 font-semibold"> Near Band</span> (orange, approaching range limits), or 
                <span className="text-red-600 font-semibold"> Out of Range</span> (red, not earning fees). This barometer 
                measures market-wide position health.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              {/* Market-Wide Status */}
              <div className="chart-container">
                <h2 className="section-title mb-4">Market-Wide Position Status (by TVL)</h2>
                <div className="h-56 bg-gray-50 border border-gray-200 rounded flex items-center justify-center mb-3">
                  <span className="font-['Manrope',sans-serif] text-gray-400 text-sm">
                    [Pie chart: Green 87% / Orange 9% / Red 4%]
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-green-50 border border-green-200 rounded p-2 text-center">
                    <div className="font-['Manrope',sans-serif] text-green-700 font-semibold">87%</div>
                    <div className="font-['Manrope',sans-serif] text-green-600">In Range</div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded p-2 text-center">
                    <div className="font-['Manrope',sans-serif] text-amber-700 font-semibold">9%</div>
                    <div className="font-['Manrope',sans-serif] text-amber-600">Near Band</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded p-2 text-center">
                    <div className="font-['Manrope',sans-serif] text-red-700 font-semibold">4%</div>
                    <div className="font-['Manrope',sans-serif] text-red-600">Out of Range</div>
                  </div>
                </div>
                <p className="chart-caption mt-3">
                  Excellent market health: 87% in-range indicates stable price action relative to LP positions.
                </p>
              </div>

              {/* Strategy Mix by Token Pair */}
              <div className="chart-container">
                <h2 className="section-title mb-4">Strategy Mix by Top Token Pairs</h2>
                <div className="h-56 bg-gray-50 border border-gray-200 rounded flex items-center justify-center mb-3">
                  <span className="font-['Manrope',sans-serif] text-gray-400 text-sm">
                    [Grouped bar chart: AGR/BAL/CONS per pair]
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-gray-50 border border-gray-200 rounded p-2 text-center">
                    <div className="font-['Manrope',sans-serif] text-gray-700 font-semibold">12%</div>
                    <div className="font-['Manrope',sans-serif] text-gray-600">Aggressive</div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded p-2 text-center">
                    <div className="font-['Manrope',sans-serif] text-gray-700 font-semibold">64%</div>
                    <div className="font-['Manrope',sans-serif] text-gray-600">Balanced</div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded p-2 text-center">
                    <div className="font-['Manrope',sans-serif] text-gray-700 font-semibold">24%</div>
                    <div className="font-['Manrope',sans-serif] text-gray-600">Conservative</div>
                  </div>
                </div>
                <p className="chart-caption mt-3">
                  Balanced strategy dominates (64%), showing risk-aware LP behavior. WFLR–USDT0 leads in Conservative positions.
                </p>
              </div>
            </div>

            {/* Insights */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="font-['Manrope',sans-serif] text-sm font-semibold text-gray-700 mb-3">
                Market Barometer Insights
              </h3>
              <div className="space-y-2">
                {[
                  "High in-range percentage (87%) demonstrates effective LP position management and favorable market conditions",
                  "Low out-of-range rate (4%) suggests LPs are actively monitoring or using appropriate strategies",
                  "Balanced strategy preference indicates mature, risk-conscious LP behavior rather than speculation",
                  "This healthy RangeBand distribution supports sustainable fee generation for the Flare V3 ecosystem"
                ].map((insight, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-2" />
                    <p className="font-['Manrope',sans-serif] text-gray-700 text-sm leading-relaxed">
                      {insight}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="page-footer">
            <span className="font-['Manrope',sans-serif] text-xs text-gray-500">Page 4 of 8</span>
            <span className="font-['Manrope',sans-serif] text-xs text-gray-400">
              LiquiLab · Flare V3 LP analytics · www.liquilab.io
            </span>
          </div>
        </div>

        {/* Page 5: Top & Growth Pools */}
        <div className="page content-page">
          <div className="page-header">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-[#3B82F6] flex items-center justify-center">
                <span className="font-['Manrope',sans-serif] text-white text-xs font-bold">L</span>
              </div>
              <span className="font-['Manrope',sans-serif] text-sm text-gray-600">LiquiLab</span>
            </div>
            <span className="font-['Manrope',sans-serif] text-sm text-gray-500">
              Weekly Universe Report · Week {weekNumber}, {year}
            </span>
          </div>

          <div className="page-content">
            <h1 className="chapter-title">5. Top Pools & Growth Pools</h1>

            {/* Top Pools Table */}
            <div className="chart-container mb-8">
              <h2 className="section-title mb-4">Top Pools by Active LP Wallets (7D)</h2>
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="text-left">Token Pair</th>
                    <th className="text-left">DEX</th>
                    <th className="text-right">Active LPs</th>
                    <th className="text-right">TVL</th>
                    <th className="text-right">7D Volume</th>
                    <th className="text-right">7D Fees</th>
                    <th className="text-right">Avg APR</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-blue-50 border-l-4 border-[#3B82F6]">
                    <td className="font-semibold">WFLR–USDT0</td>
                    <td>Combined</td>
                    <td className="text-right">156</td>
                    <td className="text-right">$2,834,567</td>
                    <td className="text-right">$5,234,445</td>
                    <td className="text-right">$7,851</td>
                    <td className="text-right">15.2%</td>
                  </tr>
                  <tr>
                    <td>WFLR–WETH</td>
                    <td>Ēnosys</td>
                    <td className="text-right">38</td>
                    <td className="text-right">$623,445</td>
                    <td className="text-right">$1,423,221</td>
                    <td className="text-right">$2,135</td>
                    <td className="text-right">18.7%</td>
                  </tr>
                  <tr>
                    <td>WFLR–WBTC</td>
                    <td>SparkDEX</td>
                    <td className="text-right">24</td>
                    <td className="text-right">$445,223</td>
                    <td className="text-right">$987,665</td>
                    <td className="text-right">$1,481</td>
                    <td className="text-right">13.4%</td>
                  </tr>
                  <tr>
                    <td>SGB–WFLR</td>
                    <td>Ēnosys</td>
                    <td className="text-right">16</td>
                    <td className="text-right">$331,332</td>
                    <td className="text-right">$678,554</td>
                    <td className="text-right">$1,018</td>
                    <td className="text-right">11.8%</td>
                  </tr>
                </tbody>
              </table>
              <p className="chart-caption">
                <strong className="text-[#3B82F6]">WFLR–USDT0</strong> dominates with 67% of total LP wallets. 
                See detailed deep dive in Chapter 6.
              </p>
            </div>

            {/* Growth Pools Table */}
            <div className="chart-container">
              <h2 className="section-title mb-4">Pools with Highest LP Wallet Growth (7D)</h2>
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="text-left">Token Pair</th>
                    <th className="text-left">DEX</th>
                    <th className="text-right">New LPs</th>
                    <th className="text-right">Growth %</th>
                    <th className="text-right">Current Total LPs</th>
                    <th className="text-right">TVL Change</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>WFLR–USDT0</td>
                    <td>SparkDEX</td>
                    <td className="text-right">+12</td>
                    <td className="text-right text-green-600">+18.5%</td>
                    <td className="text-right">77</td>
                    <td className="text-right text-green-600">+$234K</td>
                  </tr>
                  <tr>
                    <td>WFLR–WETH</td>
                    <td>Ēnosys</td>
                    <td className="text-right">+7</td>
                    <td className="text-right text-green-600">+22.6%</td>
                    <td className="text-right">38</td>
                    <td className="text-right text-green-600">+$142K</td>
                  </tr>
                  <tr>
                    <td>SGB–WFLR</td>
                    <td>Ēnosys</td>
                    <td className="text-right">+4</td>
                    <td className="text-right text-green-600">+33.3%</td>
                    <td className="text-right">16</td>
                    <td className="text-right text-green-600">+$87K</td>
                  </tr>
                  <tr>
                    <td>WFLR–USDC</td>
                    <td>SparkDEX</td>
                    <td className="text-right">+3</td>
                    <td className="text-right text-green-600">+27.3%</td>
                    <td className="text-right">14</td>
                    <td className="text-right text-green-600">+$56K</td>
                  </tr>
                </tbody>
              </table>
              <p className="chart-caption">
                Strong growth across multiple pairs indicates broad ecosystem expansion, not just concentration in one pool. 
                SGB–WFLR shows highest percentage growth (+33.3%), signaling emerging interest in cross-chain pairs.
              </p>
            </div>
          </div>

          <div className="page-footer">
            <span className="font-['Manrope',sans-serif] text-xs text-gray-500">Page 5 of 8</span>
            <span className="font-['Manrope',sans-serif] text-xs text-gray-400">
              LiquiLab · Flare V3 LP analytics · www.liquilab.io
            </span>
          </div>
        </div>

        {/* Page 6: WFLR-USDT0 Deep Dive (Part 1) */}
        <div className="page content-page">
          <div className="page-header">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-[#3B82F6] flex items-center justify-center">
                <span className="font-['Manrope',sans-serif] text-white text-xs font-bold">L</span>
              </div>
              <span className="font-['Manrope',sans-serif] text-sm text-gray-600">LiquiLab</span>
            </div>
            <span className="font-['Manrope',sans-serif] text-sm text-gray-500">
              Weekly Universe Report · Week {weekNumber}, {year}
            </span>
          </div>

          <div className="page-content">
            <h1 className="chapter-title">6. Pool Deep Dive: WFLR–USDT0</h1>
            <p className="font-['Manrope',sans-serif] text-gray-600 mb-6">
              Combined analysis across Ēnosys and SparkDEX
            </p>

            {/* KPI Panel */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { label: "Combined TVL", value: "$2.83M" },
                { label: "Active LP Wallets", value: "156" },
                { label: "7D Volume", value: "$5.23M" },
                { label: "7D Fees Generated", value: "$7,851" }
              ].map((kpi, i) => (
                <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <div className="font-['Manrope',sans-serif] text-xs text-gray-500 mb-1">
                    {kpi.label}
                  </div>
                  <div className="font-['Manrope',sans-serif] text-xl font-bold text-gray-900">
                    {kpi.value}
                  </div>
                </div>
              ))}
            </div>

            {/* DEX Breakdown */}
            <div className="chart-container mb-8">
              <h2 className="section-title mb-4">DEX Breakdown</h2>
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="text-left">DEX</th>
                    <th className="text-right">LP Wallets</th>
                    <th className="text-right">TVL</th>
                    <th className="text-right">% of Pair TVL</th>
                    <th className="text-right">7D Volume</th>
                    <th className="text-right">7D Fees</th>
                    <th className="text-right">Avg APR</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-semibold">Ēnosys</td>
                    <td className="text-right">79</td>
                    <td className="text-right">$1,456,234</td>
                    <td className="text-right">51.4%</td>
                    <td className="text-right">$2,678,223</td>
                    <td className="text-right">$4,017</td>
                    <td className="text-right">14.8%</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">SparkDEX</td>
                    <td className="text-right">77</td>
                    <td className="text-right">$1,378,333</td>
                    <td className="text-right">48.6%</td>
                    <td className="text-right">$2,556,222</td>
                    <td className="text-right">$3,834</td>
                    <td className="text-right">15.6%</td>
                  </tr>
                </tbody>
              </table>
              <p className="chart-caption">
                Near-perfect balance between DEXes (51%/49% TVL split) demonstrates healthy competition and no single platform dominance. 
                SparkDEX shows slightly higher APR due to concentrated liquidity efficiency.
              </p>
            </div>

            {/* 90D Trends Chart */}
            <div className="chart-container">
              <h2 className="section-title mb-4">90-Day TVL & Active Wallet Trends</h2>
              <div className="h-64 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
                <span className="font-['Manrope',sans-serif] text-gray-400 text-sm">
                  [Dual-axis line chart: TVL (left) and Active Wallets (right) over 90 days]
                </span>
              </div>
              <p className="chart-caption">
                TVL grew 89% over 90 days while active wallets increased 67%, indicating both capital growth and user base expansion. 
                Correlation suggests organic, sustainable growth rather than whale-driven pumps.
              </p>
            </div>
          </div>

          <div className="page-footer">
            <span className="font-['Manrope',sans-serif] text-xs text-gray-500">Page 6 of 8</span>
            <span className="font-['Manrope',sans-serif] text-xs text-gray-400">
              LiquiLab · Flare V3 LP analytics · www.liquilab.io
            </span>
          </div>
        </div>

        {/* Page 7: WFLR-USDT0 Deep Dive (Part 2) */}
        <div className="page content-page">
          <div className="page-header">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-[#3B82F6] flex items-center justify-center">
                <span className="font-['Manrope',sans-serif] text-white text-xs font-bold">L</span>
              </div>
              <span className="font-['Manrope',sans-serif] text-sm text-gray-600">LiquiLab</span>
            </div>
            <span className="font-['Manrope',sans-serif] text-sm text-gray-500">
              Weekly Universe Report · Week {weekNumber}, {year}
            </span>
          </div>

          <div className="page-content">
            <h1 className="chapter-title">6. Pool Deep Dive: WFLR–USDT0 (continued)</h1>

            <div className="grid grid-cols-2 gap-8 mb-8">
              {/* LP Distribution */}
              <div className="chart-container">
                <h2 className="section-title mb-4">LP Size Distribution (This Pair)</h2>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="text-left">Bucket</th>
                      <th className="text-right">Wallets</th>
                      <th className="text-right">TVL</th>
                      <th className="text-right">% TVL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Retail</td>
                      <td className="text-right">98</td>
                      <td className="text-right">$178,234</td>
                      <td className="text-right">6.3%</td>
                    </tr>
                    <tr>
                      <td>Mid</td>
                      <td className="text-right">42</td>
                      <td className="text-right">$912,567</td>
                      <td className="text-right">32.2%</td>
                    </tr>
                    <tr>
                      <td>Whale</td>
                      <td className="text-right">16</td>
                      <td className="text-right">$1,743,766</td>
                      <td className="text-right">61.5%</td>
                    </tr>
                  </tbody>
                </table>
                <p className="chart-caption mt-3">
                  Similar to market-wide distribution, showing this pair is representative of overall ecosystem health.
                </p>
              </div>

              {/* RangeBand Status */}
              <div className="chart-container">
                <h2 className="section-title mb-4">RangeBand™ Status (This Pair)</h2>
                <div className="h-40 bg-gray-50 border border-gray-200 rounded flex items-center justify-center mb-3">
                  <span className="font-['Manrope',sans-serif] text-gray-400 text-sm">
                    [Pie chart: Position status breakdown]
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-green-50 border border-green-200 rounded p-2 text-center">
                    <div className="font-['Manrope',sans-serif] text-green-700 font-semibold">91%</div>
                    <div className="font-['Manrope',sans-serif] text-green-600">In Range</div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded p-2 text-center">
                    <div className="font-['Manrope',sans-serif] text-amber-700 font-semibold">7%</div>
                    <div className="font-['Manrope',sans-serif] text-amber-600">Near</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded p-2 text-center">
                    <div className="font-['Manrope',sans-serif] text-red-700 font-semibold">2%</div>
                    <div className="font-['Manrope',sans-serif] text-red-600">Out</div>
                  </div>
                </div>
                <p className="chart-caption mt-3">
                  Excellent 91% in-range rate, above market average (87%), indicating stable WFLR–USDT0 price action.
                </p>
              </div>
            </div>

            {/* APR Distribution & Claim Behavior */}
            <div className="grid grid-cols-2 gap-8">
              <div className="chart-container">
                <h2 className="section-title mb-4">Realized APR Distribution (30D)</h2>
                <div className="h-48 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
                  <span className="font-['Manrope',sans-serif] text-gray-400 text-sm">
                    [Histogram: APR distribution across LPs]
                  </span>
                </div>
                <p className="chart-caption">
                  Median APR: 14.8% | 25-75% range: 11.2–18.4% | Fairness index: 0.82 (good).
                </p>
              </div>

              <div>
                <h2 className="section-title mb-4">Claim Behavior & Missed Fees</h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 border border-gray-200 rounded p-4">
                    <div className="font-['Manrope',sans-serif] text-xs text-gray-500 mb-1">
                      Avg Unclaimed Fees (% of TVL)
                    </div>
                    <div className="font-['Manrope',sans-serif] text-2xl font-bold text-gray-900">
                      0.34%
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded p-4">
                    <div className="font-['Manrope',sans-serif] text-xs text-gray-500 mb-1">
                      Avg Claim Latency
                    </div>
                    <div className="font-['Manrope',sans-serif] text-2xl font-bold text-gray-900">
                      12.3 days
                    </div>
                  </div>
                  <p className="chart-caption">
                    Low unclaimed rate and moderate claim frequency indicate engaged, active LP base. 
                    Most LPs claim within 2 weeks, preventing fee compounding losses.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="page-footer">
            <span className="font-['Manrope',sans-serif] text-xs text-gray-500">Page 7 of 8</span>
            <span className="font-['Manrope',sans-serif] text-xs text-gray-400">
              LiquiLab · Flare V3 LP analytics · www.liquilab.io
            </span>
          </div>
        </div>

        {/* Page 8: Appendix */}
        <div className="page content-page">
          <div className="page-header">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-[#3B82F6] flex items-center justify-center">
                <span className="font-['Manrope',sans-serif] text-white text-xs font-bold">L</span>
              </div>
              <span className="font-['Manrope',sans-serif] text-sm text-gray-600">LiquiLab</span>
            </div>
            <span className="font-['Manrope',sans-serif] text-sm text-gray-500">
              Weekly Universe Report · Week {weekNumber}, {year}
            </span>
          </div>

          <div className="page-content">
            <h1 className="chapter-title">Appendix: ERC-721 Positions (WFLR–USDT0)</h1>
            <p className="font-['Manrope',sans-serif] text-gray-600 mb-6">
              Detailed position data for verification and transparency (sample of 10 positions shown)
            </p>

            <div className="chart-container">
              <table className="data-table text-xs">
                <thead>
                  <tr>
                    <th className="text-left">LP#</th>
                    <th className="text-left">DEX</th>
                    <th className="text-left">Position ID</th>
                    <th className="text-right">TVL (USD)</th>
                    <th className="text-right">Unclaimed</th>
                    <th className="text-right">30D APR</th>
                    <th className="text-left">Strategy</th>
                    <th className="text-center">Status</th>
                    <th className="text-right">In-Range %</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>LP-001</td>
                    <td>Ēnosys</td>
                    <td className="font-mono">0x8a3f...</td>
                    <td className="text-right">$127,445</td>
                    <td className="text-right">$623</td>
                    <td className="text-right">16.2%</td>
                    <td>Balanced</td>
                    <td className="text-center"><span className="inline-block w-2 h-2 rounded-full bg-green-500"></span></td>
                    <td className="text-right">94%</td>
                  </tr>
                  <tr>
                    <td>LP-002</td>
                    <td>SparkDEX</td>
                    <td className="font-mono">0x4b2e...</td>
                    <td className="text-right">$89,223</td>
                    <td className="text-right">$412</td>
                    <td className="text-right">18.4%</td>
                    <td>Aggressive</td>
                    <td className="text-center"><span className="inline-block w-2 h-2 rounded-full bg-green-500"></span></td>
                    <td className="text-right">87%</td>
                  </tr>
                  <tr>
                    <td>LP-003</td>
                    <td>Ēnosys</td>
                    <td className="font-mono">0x7c9a...</td>
                    <td className="text-right">$245,667</td>
                    <td className="text-right">$1,089</td>
                    <td className="text-right">14.7%</td>
                    <td>Balanced</td>
                    <td className="text-center"><span className="inline-block w-2 h-2 rounded-full bg-green-500"></span></td>
                    <td className="text-right">96%</td>
                  </tr>
                  <tr>
                    <td>LP-004</td>
                    <td>SparkDEX</td>
                    <td className="font-mono">0x2f1d...</td>
                    <td className="text-right">$56,889</td>
                    <td className="text-right">$234</td>
                    <td className="text-right">13.2%</td>
                    <td>Conservative</td>
                    <td className="text-center"><span className="inline-block w-2 h-2 rounded-full bg-green-500"></span></td>
                    <td className="text-right">100%</td>
                  </tr>
                  <tr>
                    <td>LP-005</td>
                    <td>Ēnosys</td>
                    <td className="font-mono">0x9e4b...</td>
                    <td className="text-right">$178,334</td>
                    <td className="text-right">$823</td>
                    <td className="text-right">15.9%</td>
                    <td>Balanced</td>
                    <td className="text-center"><span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span></td>
                    <td className="text-right">89%</td>
                  </tr>
                  <tr>
                    <td>LP-006</td>
                    <td>SparkDEX</td>
                    <td className="font-mono">0x6d8c...</td>
                    <td className="text-right">$423,112</td>
                    <td className="text-right">$1,967</td>
                    <td className="text-right">15.1%</td>
                    <td>Balanced</td>
                    <td className="text-center"><span className="inline-block w-2 h-2 rounded-full bg-green-500"></span></td>
                    <td className="text-right">93%</td>
                  </tr>
                  <tr>
                    <td>LP-007</td>
                    <td>Ēnosys</td>
                    <td className="font-mono">0x3a7f...</td>
                    <td className="text-right">$34,556</td>
                    <td className="text-right">$145</td>
                    <td className="text-right">17.3%</td>
                    <td>Aggressive</td>
                    <td className="text-center"><span className="inline-block w-2 h-2 rounded-full bg-green-500"></span></td>
                    <td className="text-right">81%</td>
                  </tr>
                  <tr>
                    <td>LP-008</td>
                    <td>SparkDEX</td>
                    <td className="font-mono">0x5e2a...</td>
                    <td className="text-right">$567,889</td>
                    <td className="text-right">$2,834</td>
                    <td className="text-right">16.8%</td>
                    <td>Balanced</td>
                    <td className="text-center"><span className="inline-block w-2 h-2 rounded-full bg-green-500"></span></td>
                    <td className="text-right">97%</td>
                  </tr>
                  <tr>
                    <td>LP-009</td>
                    <td>Ēnosys</td>
                    <td className="font-mono">0x1b9e...</td>
                    <td className="text-right">$98,223</td>
                    <td className="text-right">$456</td>
                    <td className="text-right">14.1%</td>
                    <td>Conservative</td>
                    <td className="text-center"><span className="inline-block w-2 h-2 rounded-full bg-green-500"></span></td>
                    <td className="text-right">100%</td>
                  </tr>
                  <tr>
                    <td>LP-010</td>
                    <td>SparkDEX</td>
                    <td className="font-mono">0x8f3c...</td>
                    <td className="text-right">$156,445</td>
                    <td className="text-right">$712</td>
                    <td className="text-right">15.5%</td>
                    <td>Balanced</td>
                    <td className="text-center"><span className="inline-block w-2 h-2 rounded-full bg-red-500"></span></td>
                    <td className="text-right">67%</td>
                  </tr>
                </tbody>
              </table>
              <p className="chart-caption">
                Full dataset contains 156 positions across both DEXes. Data extracted from on-chain ERC-721 NFT positions 
                via Flare RPC and indexed by LiquiLab. This sample demonstrates position diversity, range health, and 
                transparent reporting for grant verification purposes.
              </p>
            </div>

            {/* Methodology Note */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
              <h3 className="font-['Manrope',sans-serif] text-sm font-semibold text-gray-700 mb-3">
                Data Sources & Methodology
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5" />
                  <p className="font-['Manrope',sans-serif] text-gray-700">
                    <strong>Time windows:</strong> 7D (rolling week), 30D, 90D as specified
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5" />
                  <p className="font-['Manrope',sans-serif] text-gray-700">
                    <strong>Data sources:</strong> Flare RPC, ANKR indexer, DEX subgraphs
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5" />
                  <p className="font-['Manrope',sans-serif] text-gray-700">
                    <strong>RangeBand™ calculation:</strong> Proprietary algorithm comparing current price to position min/max bounds
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5" />
                  <p className="font-['Manrope',sans-serif] text-gray-700">
                    <strong>Known limitations:</strong> Data reflects on-chain state at snapshot time; off-chain transactions not captured
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="page-footer">
            <span className="font-['Manrope',sans-serif] text-xs text-gray-500">Page 8 of 8</span>
            <span className="font-['Manrope',sans-serif] text-xs text-gray-400">
              LiquiLab · Flare V3 LP analytics · www.liquilab.io
            </span>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          
          .page {
            page-break-after: always;
            page-break-inside: avoid;
            width: 210mm;
            height: 297mm;
            padding: 0;
            margin: 0;
            box-sizing: border-box;
          }
          
          .cover-page {
            background-color: #0B1530 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .content-page {
            background-color: white !important;
          }
        }
        
        .page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto 20px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          position: relative;
        }
        
        .cover-page {
          background-color: #0B1530;
          color: white;
        }
        
        .content-page {
          background-color: white;
          color: #1a1a1a;
          padding: 20mm;
          display: flex;
          flex-direction: column;
        }
        
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          margin-bottom: 24px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .page-content {
          flex: 1;
        }
        
        .page-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          margin-top: 24px;
          border-top: 1px solid #e5e7eb;
        }
        
        .chapter-title {
          font-family: 'Manrope', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 24px;
        }
        
        .section-title {
          font-family: 'Manrope', sans-serif;
          font-size: 18px;
          font-weight: 600;
          color: #374151;
        }
        
        .chart-container {
          margin-bottom: 24px;
        }
        
        .chart-caption {
          font-family: 'Manrope', sans-serif;
          font-size: 10px;
          color: #6b7280;
          margin-top: 8px;
          line-height: 1.5;
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-family: 'Manrope', sans-serif;
          font-size: 11px;
        }
        
        .data-table thead tr {
          border-bottom: 2px solid #e5e7eb;
        }
        
        .data-table th {
          padding: 8px 12px;
          font-weight: 600;
          color: #374151;
          font-size: 11px;
        }
        
        .data-table tbody tr {
          border-bottom: 1px solid #f3f4f6;
        }
        
        .data-table tbody tr:nth-child(even) {
          background-color: #f9fafb;
        }
        
        .data-table td {
          padding: 8px 12px;
          color: #1f2937;
        }
        
        .report-container {
          max-width: 210mm;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}
