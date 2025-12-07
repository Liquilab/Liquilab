import { FileText, Download } from "lucide-react";
import { Button } from "../components/ui/button";

export function IDepotDocPage() {
  const downloadHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Liquilab UX - IP Documentation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: #ffffff;
            padding: 40px 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        header {
            margin-bottom: 48px;
            padding-bottom: 24px;
            border-bottom: 2px solid #e5e5e5;
        }
        
        h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
            color: #0B1530;
        }
        
        .subtitle {
            font-size: 16px;
            color: #666;
            margin-bottom: 16px;
        }
        
        .meta {
            font-size: 14px;
            color: #999;
        }
        
        .frame-section {
            margin-bottom: 64px;
            page-break-inside: avoid;
        }
        
        .frame-header {
            font-size: 24px;
            font-weight: 600;
            color: #0B1530;
            margin-bottom: 24px;
            padding-bottom: 12px;
            border-bottom: 1px solid #e5e5e5;
        }
        
        .frame-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            align-items: start;
        }
        
        .screenshot-column {
            position: sticky;
            top: 20px;
        }
        
        .screenshot-placeholder {
            width: 100%;
            aspect-ratio: 3/4;
            background: #f5f5f5;
            border: 2px dashed #d5d5d5;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #999;
            font-size: 14px;
        }
        
        .description-column {
            padding-left: 20px;
        }
        
        .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #3B82F6;
            margin-bottom: 12px;
            margin-top: 24px;
        }
        
        .section-title:first-child {
            margin-top: 0;
        }
        
        ul {
            list-style: none;
            padding-left: 0;
        }
        
        li {
            position: relative;
            padding-left: 20px;
            margin-bottom: 8px;
            color: #444;
            font-size: 15px;
        }
        
        li::before {
            content: '';
            position: absolute;
            left: 0;
            top: 10px;
            width: 6px;
            height: 6px;
            background: #1BE8D2;
            border-radius: 50%;
        }
        
        strong {
            color: #0B1530;
            font-weight: 600;
        }
        
        .highlight {
            background: #FEF3C7;
            padding: 2px 6px;
            border-radius: 3px;
        }
        
        footer {
            margin-top: 64px;
            padding-top: 24px;
            border-top: 2px solid #e5e5e5;
            text-align: center;
            color: #999;
            font-size: 14px;
        }
        
        @media print {
            body {
                padding: 20px;
            }
            
            .frame-section {
                page-break-after: always;
            }
            
            .screenshot-column {
                position: relative;
            }
        }
        
        @media (max-width: 768px) {
            .frame-content {
                grid-template-columns: 1fr;
                gap: 24px;
            }
            
            .screenshot-column {
                position: relative;
            }
            
            .description-column {
                padding-left: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Liquilab - UX Documentation for iDepot</h1>
            <p class="subtitle">Premium DeFi Liquidity Analytics App for Flare Network</p>
            <p class="meta">Documentation generated: <span id="date"></span></p>
        </header>

        <!-- Frame 1: Home -->
        <section class="frame-section">
            <h2 class="frame-header">1. Home</h2>
            <div class="frame-content">
                <div class="screenshot-column">
                    <div class="screenshot-placeholder">
                        Screenshot: Home
                        <br><small>(Add Figma frame)</small>
                    </div>
                </div>
                <div class="description-column">
                    <div class="section-title">Hero</div>
                    <ul>
                        <li>Value proposition: Manage Flare LPs with RangeBand™</li>
                        <li>CTA: Start trial</li>
                    </ul>

                    <div class="section-title">Featured Pools grid</div>
                    <ul>
                        <li>Pool cards with token pairs, metrics (TVL, fees, APR)</li>
                        <li><strong class="highlight">RangeBand™ element:</strong> horizontal band with min/max/current price, strategy % labels</li>
                        <li>Status indicator (in/near/out of range)</li>
                    </ul>

                    <div class="section-title">Social proof</div>
                    <ul>
                        <li>Metrics dashboard (TVL, pools, alerts)</li>
                        <li>Testimonial over RangeBand™ alerts</li>
                    </ul>
                </div>
            </div>
        </section>

        <!-- Frame 2: Wallet Overview -->
        <section class="frame-section">
            <h2 class="frame-header">2. Wallet Overview</h2>
            <div class="frame-content">
                <div class="screenshot-column">
                    <div class="screenshot-placeholder">
                        Screenshot: Wallet Overview
                        <br><small>(Add Figma frame)</small>
                    </div>
                </div>
                <div class="description-column">
                    <div class="section-title">Portfolio metrics</div>
                    <ul>
                        <li>4 KPI cards: Portfolio Value, Active Positions, Unclaimed Fees, Avg APR</li>
                    </ul>

                    <div class="section-title">Filter section</div>
                    <ul>
                        <li>Search bar + DEX filters (All/Ēnosys/SparkDEX)</li>
                        <li>Strategy filters (Aggressive/Balanced/Conservative)</li>
                        <li>Sort dropdown + List/Grid toggle</li>
                    </ul>

                    <div class="section-title">Positions table</div>
                    <ul>
                        <li>Per position: Token pair, pool info (DEX, fee tier, ID)</li>
                        <li>Metrics: TVL, Unclaimed fees, APR</li>
                        <li><strong class="highlight">RangeBand™ visualization:</strong> horizontal band with current price indicator, min/max labels, strategy %</li>
                        <li>Status dot (green/yellow/red) for in/near/out of range</li>
                    </ul>
                </div>
            </div>
        </section>

        <!-- Frame 3: Pool Detail Premium -->
        <section class="frame-section">
            <h2 class="frame-header">3. Pool Detail (Premium)</h2>
            <div class="frame-content">
                <div class="screenshot-column">
                    <div class="screenshot-placeholder">
                        Screenshot: Pool Detail Premium
                        <br><small>(Add Figma frame)</small>
                    </div>
                </div>
                <div class="description-column">
                    <div class="section-title">Pool header</div>
                    <ul>
                        <li>Token pair + key metrics (TVL, 24H volume, fees, APR)</li>
                        <li>"View Pro Analytics" button</li>
                    </ul>

                    <div class="section-title">Price chart</div>
                    <ul>
                        <li>Line chart with overlayed range boundaries (min/max dotted lines)</li>
                        <li>Current price indicator (green line)</li>
                    </ul>

                    <div class="section-title">RangeBand™ status section</div>
                    <ul>
                        <li>Large horizontal band visualization (hero variant)</li>
                        <li>Strategy label with % (Aggressive/Balanced/Conservative)</li>
                        <li>Status badge: In Range/Near Band/Out of Range</li>
                        <li>Current price prominent central</li>
                    </ul>

                    <div class="section-title">My Positions table</div>
                    <ul>
                        <li>Wallet-specific positions in this pool</li>
                        <li>Columns: Position info (provider, ID, mint date), liquidity, fees, APR</li>
                        <li><strong class="highlight">RangeBand™ column:</strong> full component per position with min/max/current price</li>
                    </ul>
                </div>
            </div>
        </section>

        <!-- Frame 4: Pool Detail Pro -->
        <section class="frame-section">
            <h2 class="frame-header">4. Pool Detail Pro</h2>
            <div class="frame-content">
                <div class="screenshot-column">
                    <div class="screenshot-placeholder">
                        Screenshot: Pool Detail Pro
                        <br><small>(Add Figma frame)</small>
                    </div>
                </div>
                <div class="description-column">
                    <div class="section-title">Header</div>
                    <ul>
                        <li>PRO badge + "View Standard Analytics" toggle button</li>
                        <li>Global time-range selector (24H/7D/30D/90D)</li>
                    </ul>

                    <div class="section-title">PRO KPI strip</div>
                    <ul>
                        <li>6 metrics: Fees earned, Incentives, Total earned, Realized APR, Realized PnL, Range Efficiency</li>
                        <li>Sparkles icon (✨) by "Pro" labels</li>
                    </ul>

                    <div class="section-title">RangeBand™ Status (hero variant)</div>
                    <ul>
                        <li>Large central visualization with strategy details</li>
                        <li>Status insights: Days in range, efficiency %, out-of-range events count</li>
                    </ul>

                    <div class="section-title">Risk & Range Insights section (PRO-only)</div>
                    <ul>
                        <li>Risk profile badge (Aggressive/Balanced/Conservative)</li>
                        <li>Sensitivity metrics (downside/upside %)</li>
                        <li>Contextual recommendations with Signal Aqua bullets</li>
                        <li>"What this means" interpretation panel</li>
                    </ul>

                    <div class="section-title">My Positions table</div>
                    <ul>
                        <li>Identical to Premium: RangeBand™ column with full component</li>
                    </ul>
                </div>
            </div>
        </section>

        <!-- Frame 5: Pool Universe -->
        <section class="frame-section">
            <h2 class="frame-header">5. Pool Universe (PRO)</h2>
            <div class="frame-content">
                <div class="screenshot-column">
                    <div class="screenshot-placeholder">
                        Screenshot: Pool Universe
                        <br><small>(Add Figma frame)</small>
                    </div>
                </div>
                <div class="description-column">
                    <div class="section-title">Hero section</div>
                    <ul>
                        <li>"Universe View" for one token pair across all DEXes/LPs</li>
                        <li>Global time-range toggle (24H/7D/30D/90D)</li>
                        <li>6 KPIs: Total TVL, Volume, Fees, Pool APR, Active Positions, Active Wallets</li>
                    </ul>

                    <div class="section-title">DEX & Fee-tier breakdown</div>
                    <ul>
                        <li>Side-by-side bar charts with tables</li>
                        <li>Metrics per DEX and per fee tier (0.05%/0.3%/1%)</li>
                    </ul>

                    <div class="section-title">LP Population & Concentration</div>
                    <ul>
                        <li>Donut chart: Wallet-size distribution (Retail/Mid/Whale)</li>
                        <li>Top 1/Top 10 wallet share metrics</li>
                        <li>Position count timeline + churn analysis</li>
                    </ul>

                    <div class="section-title">RangeBand™ Landscape</div>
                    <ul>
                        <li>Strategy distribution pie chart (Aggressive/Balanced/Conservative)</li>
                        <li>Range status pie chart (In/Near/Out of range)</li>
                        <li>Liquidity concentration heatmap</li>
                    </ul>

                    <div class="section-title">Fee & APR Distribution</div>
                    <ul>
                        <li>Histogram: Realized APR across all positions</li>
                        <li>Median APR, quartile ranges, fairness index</li>
                    </ul>

                    <div class="section-title">"What This Means for You" panel</div>
                    <ul>
                        <li>6 decision points with Signal Aqua bullets</li>
                        <li>Links universe data to user's own position</li>
                        <li>CTAs: "View Your Position Analytics"</li>
                    </ul>
                </div>
            </div>
        </section>

        <!-- Frame 6: RangeBand Explainer -->
        <section class="frame-section">
            <h2 class="frame-header">6. RangeBand™ Explainer</h2>
            <div class="frame-content">
                <div class="screenshot-column">
                    <div class="screenshot-placeholder">
                        Screenshot: RangeBand Explainer
                        <br><small>(Add Figma frame)</small>
                    </div>
                </div>
                <div class="description-column">
                    <div class="section-title">Hero</div>
                    <ul>
                        <li>RangeBand™ demo (hero variant): horizontal band with min/max/current price</li>
                        <li>Strategy label "Balanced (25.0%)"</li>
                        <li>Status indicator with glow effect</li>
                        <li>CTAs: "Try RangeBand™" + "Start trial"</li>
                    </ul>

                    <div class="section-title">Before & After comparison</div>
                    <ul>
                        <li>Two-column card:</li>
                        <li>Before: 40% out of range, Poor badge (red), missed fees</li>
                        <li>After: 12% out of range, Excellent badge (green), improved earnings</li>
                        <li>Performance metrics with CheckCircle/XCircle icons</li>
                    </ul>

                    <div class="section-title">Strategy examples</div>
                    <ul>
                        <li>3 cards: Aggressive (30% band), Balanced (65% band), Conservative (100% band)</li>
                        <li>Each with RangeBand™ visualization in card variant</li>
                        <li>Tradeoff bullets with Signal Aqua dots</li>
                    </ul>

                    <div class="section-title">Real-Time Health Status</div>
                    <ul>
                        <li>3 status states: In Range (green), Near Band (yellow), Out of Range (red)</li>
                        <li>Each with RangeBand™ component + status-specific messaging</li>
                    </ul>

                    <div class="section-title">Final CTA</div>
                    <ul>
                        <li>Gradient background card</li>
                        <li>"Ready to try RangeBand™?" with primary/secondary buttons</li>
                    </ul>
                </div>
            </div>
        </section>

        <footer>
            <p><strong>Liquilab</strong> - Premium DeFi Liquidity Analytics for Flare Network</p>
            <p>iDepot Documentation - Unique UX elements: RangeBand™ visualization, Universe View, PRO analytics</p>
            <p style="margin-top: 12px; color: #ccc; font-size: 12px;">
                Design system: Navy canvas (#0B1530), Electric Blue (#3B82F6), Signal Aqua (#1BE8D2), Manrope typeface
            </p>
        </footer>
    </div>

    <script>
        // Set current date
        document.getElementById('date').textContent = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'iDepot-Liquilab-UX.html';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0B1530] px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
              <FileText className="h-6 w-6 text-[#3B82F6]" />
            </div>
            <div>
              <h1 className="font-heading text-white/95">
                iDepot UX Documentation
              </h1>
              <p className="font-['Inter',sans-serif] text-white/70">
                Structured UX documentation for IP application
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8 mb-8">
          <h2 className="font-heading text-white/95 mb-4">
            About this document
          </h2>
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5" />
              <p className="font-['Inter',sans-serif] text-white/70">
                6 frames with screenshots and descriptions for iDepot application
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5" />
              <p className="font-['Inter',sans-serif] text-white/70">
                Two-column layout: screenshots left, descriptions right
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5" />
              <p className="font-['Inter',sans-serif] text-white/70">
                Print-friendly with page breaks between frames
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5" />
              <p className="font-['Inter',sans-serif] text-white/70">
                RangeBand™ elements are marked with highlights
              </p>
            </div>
          </div>

          <Button
            onClick={downloadHTML}
            className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Download HTML Document
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8">
          <h2 className="font-heading text-white/95 mb-4">
            Next steps
          </h2>
          <ol className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-[#3B82F6]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="font-['Inter',sans-serif] text-white/95">1</span>
              </div>
              <div>
                <div className="font-['Inter',sans-serif] text-white/95 mb-1">
                  Download the HTML document
                </div>
                <div className="font-['Inter',sans-serif] text-white/[0.58]">
                  Click the button above to download the file
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-[#3B82F6]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="font-['Inter',sans-serif] text-white/95">2</span>
              </div>
              <div>
                <div className="font-['Inter',sans-serif] text-white/95 mb-1">
                  Open the file in your browser
                </div>
                <div className="font-['Inter',sans-serif] text-white/[0.58]">
                  Double-click the downloaded HTML file
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-[#3B82F6]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="font-['Inter',sans-serif] text-white/95">3</span>
              </div>
              <div>
                <div className="font-['Inter',sans-serif] text-white/95 mb-1">
                  Add screenshots
                </div>
                <div className="font-['Inter',sans-serif] text-white/[0.58]">
                  Export the 6 frames from Figma and paste them into the placeholders
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-[#3B82F6]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="font-['Inter',sans-serif] text-white/95">4</span>
              </div>
              <div>
                <div className="font-['Inter',sans-serif] text-white/95 mb-1">
                  Export to PDF
                </div>
                <div className="font-['Inter',sans-serif] text-white/[0.58]">
                  Print the document as PDF for your iDepot application
                </div>
              </div>
            </li>
          </ol>
        </div>

        {/* Frames Preview */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-8 mt-8">
          <h2 className="font-heading text-white/95 mb-4">
            Frames in document
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { num: 1, title: "Home", desc: "Hero, Featured Pools, Social proof" },
              { num: 2, title: "Wallet Overview", desc: "Portfolio metrics, Filters, Positions table" },
              { num: 3, title: "Pool Detail (Premium)", desc: "Pool header, Price chart, RangeBand™ status" },
              { num: 4, title: "Pool Detail Pro", desc: "PRO KPI strip, Risk & Range Insights" },
              { num: 5, title: "Pool Universe (PRO)", desc: "DEX breakdown, LP Population, RangeBand™ Landscape" },
              { num: 6, title: "RangeBand™ Explainer", desc: "Hero, Before/After, Strategy examples" }
            ].map(frame => (
              <div key={frame.num} className="bg-[#0B1530]/50 border border-white/5 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center flex-shrink-0">
                    <span className="font-['Inter',sans-serif] text-white/95">{frame.num}</span>
                  </div>
                  <div>
                    <div className="font-['Inter',sans-serif] text-white/95 mb-1">
                      {frame.title}
                    </div>
                    <div className="font-['Inter',sans-serif] text-white/[0.58]">
                      {frame.desc}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}