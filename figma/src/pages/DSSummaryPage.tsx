import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Plus,
  DollarSign,
  Minus,
  AlertTriangle,
  Gift,
  Lock,
  TrendingUp,
} from "lucide-react";

export function DSSummaryPage() {
  return (
    <div className="min-h-screen bg-[#0B1530] px-6 py-12">
      <div className="max-w-[1920px] mx-auto">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="text-white/95 mb-4">
            Figma_MAKE_DS_SUMMARY
          </h1>
          <p className="text-white/70">
            LiquiLab Design System — Strategy C Screens Reference (2025-11-23)
          </p>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
          
          {/* ========================================
              COLUMN 1: FOUNDATIONS
          ======================================== */}
          <div>
            <h2 className="text-white/95 mb-8">
              Foundations
            </h2>

            {/* 1.1 Colors & Semantics */}
            <div className="mb-10">
              <h3 className="text-white/95 mb-4">
                Colors & Semantics
              </h3>

              {/* Palette Swatches */}
              <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6 mb-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#3B82F6]"></div>
                    <div>
                      <div className="text-white/95 text-sm">Primary</div>
                      <div className="text-white/[0.58] text-xs">Electric Blue #3B82F6</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#1BE8D2]"></div>
                    <div>
                      <div className="text-white/95 text-sm">Accent</div>
                      <div className="text-white/[0.58] text-xs">Signal Aqua #1BE8D2</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#0B1530] border border-white/20"></div>
                    <div>
                      <div className="text-white/95 text-sm">Canvas</div>
                      <div className="text-white/[0.58] text-xs">Navy #0B1530</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#0F1A36]/95 border border-white/20"></div>
                    <div>
                      <div className="text-white/95 text-sm">Surface</div>
                      <div className="text-white/[0.58] text-xs">#0F1A36/95</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Semantic Colors */}
              <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6 mb-4">
                <div className="text-white/95 text-sm mb-3">Semantic Usage:</div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] flex-shrink-0 mt-1.5"></div>
                    <span className="text-white/70 text-sm">
                      Green: positive APR, positive PnL, "in range", good efficiency
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] flex-shrink-0 mt-1.5"></div>
                    <span className="text-white/70 text-sm">
                      Amber: warnings (near range, borderline efficiency)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] flex-shrink-0 mt-1.5"></div>
                    <span className="text-white/70 text-sm">
                      Red: negative APR, negative PnL, "out of range", extreme/unhealthy
                    </span>
                  </div>
                </div>
              </div>

              {/* Critical Note */}
              <div className="bg-[#F59E0B]/10 border-2 border-[#F59E0B]/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="size-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                  <div className="text-white/70 text-sm">
                    Semantic colors are reserved for <strong className="text-white/95">APR, PnL, RangeBand/Range Efficiency</strong> and health statuses — not for decorative icons or event list icons.
                  </div>
                </div>
              </div>
            </div>

            {/* 1.2 Typography & Numbers */}
            <div className="mb-10">
              <h3 className="text-white/95 mb-4">
                Typography & Numbers
              </h3>

              <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6 mb-4">
                <div className="space-y-4">
                  <div>
                    <div className="text-white/[0.58] text-xs mb-2">Headings (Manrope)</div>
                    <div className="space-y-2">
                      <div className="text-white/95" style={{ fontSize: '32px' }}>H1 Example</div>
                      <div className="text-white/95" style={{ fontSize: '24px' }}>H2 Example</div>
                      <div className="text-white/95" style={{ fontSize: '18px' }}>H3 Example</div>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4">
                    <div className="text-white/[0.58] text-xs mb-2">Body Text Opacities</div>
                    <div className="space-y-1">
                      <div className="text-white/95">Primary (95%) — Main headings, key values</div>
                      <div className="text-white/70">Secondary (70%) — Body copy, descriptions</div>
                      <div className="text-white/[0.58]">Tertiary (58%) — Labels, hints, timestamps</div>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4">
                    <div className="text-white/[0.58] text-xs mb-2">Numeric Rules</div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5"></div>
                        <span className="text-white/70 text-sm">
                          All numbers use tabular-nums (<code className="text-[#3B82F6]">.numeric</code>)
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5"></div>
                        <span className="text-white/70 text-sm">
                          $ amounts: 16px (default body size)
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5"></div>
                        <span className="text-white/70 text-sm">
                          Token amounts: 12px (<code className="text-[#3B82F6]">text-xs</code>) below $ value
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4">
                    <div className="text-white/[0.58] text-xs mb-2">Example</div>
                    <div className="text-white/95 numeric">$124,580</div>
                    <div className="text-white/[0.58] text-xs numeric">370 XRP · 1,254 USDT0</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 1.3 Icon Containers & Bullets */}
            <div className="mb-10">
              <h3 className="text-white/95 mb-4">
                Icon Containers & Bullets
              </h3>

              <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6 mb-4">
                <div className="text-white/95 text-sm mb-4">Icon Container Pattern:</div>
                
                {/* Visual Examples */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="size-5 text-[#CBD5E1]" />
                  </div>
                  <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="size-5 text-[#10B981]" />
                  </div>
                  <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="size-5 text-[#EF4444]" />
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5"></div>
                    <span className="text-white/70">
                      Background: <code className="text-[#3B82F6]">bg-[#3B82F6]/20</code> (Electric Blue /20) — ALWAYS
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5"></div>
                    <span className="text-white/70">
                      Icon color: neutral (slate grey) unless semantic reason
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5"></div>
                    <span className="text-white/70">
                      No icons in section titles (h2/h3) or tab labels
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
                <div className="text-white/95 text-sm mb-3">Bullet Pattern:</div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5"></div>
                    <span className="text-white/70 text-sm">Signal Aqua dots for all lists</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5"></div>
                    <span className="text-white/70 text-sm">Not CheckCircle2 icons</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5"></div>
                    <span className="text-white/70 text-sm">Size: w-1.5 h-1.5 rounded-full</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 1.4 Event List Icons */}
            <div className="mb-10">
              <h3 className="text-white/95 mb-4">
                Event List Icons
              </h3>

              {/* Example Event Row */}
              <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6 mb-4">
                <div className="text-white/95 text-sm mb-4">Example Event Row:</div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Plus className="size-5 text-[#CBD5E1]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white/95">Liquidity Added</div>
                    <div className="text-white/70 text-sm">125,000 WFLR + 98,039 FXRP</div>
                    <div className="text-white/[0.58] text-xs">25 days ago</div>
                  </div>
                  <div className="text-white/95 numeric">+$52,000</div>
                </div>
              </div>

              {/* Icon Mapping */}
              <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6 mb-4">
                <div className="text-white/95 text-sm mb-3">Icon Mapping:</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                      <Plus className="size-4 text-[#CBD5E1]" />
                    </div>
                    <span className="text-white/70 text-sm">Liquidity Added</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="size-4 text-[#CBD5E1]" />
                    </div>
                    <span className="text-white/70 text-sm">Fees Claimed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                      <Minus className="size-4 text-[#CBD5E1]" />
                    </div>
                    <span className="text-white/70 text-sm">Liquidity Removed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="size-4 text-[#CBD5E1]" />
                    </div>
                    <span className="text-white/70 text-sm">Out of Range</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                      <Gift className="size-4 text-[#CBD5E1]" />
                    </div>
                    <span className="text-white/70 text-sm">Incentive Claimed</span>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-[#EF4444]/10 border-2 border-[#EF4444]/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="size-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
                  <div className="text-white/70 text-sm">
                    Event icons are ALWAYS slate grey (<code className="text-[#3B82F6]">#CBD5E1</code>) inside Electric Blue /20 containers. <strong className="text-white/95">Do NOT use green/red/amber</strong> — text already conveys the event type.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================
              COLUMN 2: COMPONENTS & PATTERNS
          ======================================== */}
          <div>
            <h2 className="text-white/95 mb-8">
              Components & Patterns
            </h2>

            {/* 2.1 KPI Cards */}
            <div className="mb-10">
              <h3 className="text-white/95 mb-4">
                KPI Cards
              </h3>

              <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6 mb-4">
                <div className="text-white/[0.58] text-xs mb-2">Total Portfolio Value</div>
                <div className="text-white/95 numeric mb-2" style={{ fontSize: '32px' }}>
                  $124,580
                </div>
                <Badge variant="outline" className="text-[#10B981] border-[#10B981]/30 mb-2">
                  +12.8%
                </Badge>
                <div className="text-xs text-white/[0.58]">
                  P&L 30D: +8.2% / $9,455
                </div>
              </div>

              <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
                <div className="text-white/95 text-sm mb-3">Pattern Rules:</div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5"></div>
                    <span className="text-white/70 text-sm">Label: 12px, tertiary (white/58)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5"></div>
                    <span className="text-white/70 text-sm">Hero value: large numeric (32px)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5"></div>
                    <span className="text-white/70 text-sm">Optional badge below hero</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5"></div>
                    <span className="text-white/70 text-sm">Subtext: 12px, tertiary</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#EF4444]/10 border-2 border-[#EF4444]/30 rounded-xl p-4 mt-4">
                <div className="text-white/95 text-sm mb-1">❌ No icons in KPI headers</div>
                <div className="text-white/70 text-sm">KPI cards are typography-first</div>
              </div>
            </div>

            {/* 2.2 Incentives Pattern */}
            <div className="mb-10">
              <h3 className="text-white/95 mb-4">
                Incentives Pattern
              </h3>

              <div className="bg-gradient-to-br from-[#3B82F6]/20 to-[#1BE8D2]/20 border-2 border-[#3B82F6]/30 rounded-xl p-6 mb-4">
                <div className="text-white/95 text-sm mb-2">MANDATORY Two-Line Pattern:</div>
                <div className="bg-[#0B1530]/60 border border-white/10 rounded-lg p-4">
                  <div className="text-white/95 numeric mb-1">Lifetime incentives: $3,240.12</div>
                  <div className="text-white/[0.58] text-xs numeric">
                    Token0 (WFLR): 1,234.56 · Token1 (USDT0): 987.65
                  </div>
                </div>
              </div>

              <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
                <div className="text-white/95 text-sm mb-3">Required Usage:</div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5"></div>
                    <span className="text-white/70 text-sm">Rewards & Incentives KPI card</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5"></div>
                    <span className="text-white/70 text-sm">Unclaimed Fees & Rewards card</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5"></div>
                    <span className="text-white/70 text-sm">Any rewards widgets in Value & Earnings</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2.3 Promo Cards */}
            <div className="mb-10">
              <h3 className="text-white/95 mb-4">
                Promo / Insight Cards
              </h3>

              <div className="bg-gradient-to-br from-[#3B82F6]/20 to-[#1BE8D2]/20 border border-[#3B82F6]/30 rounded-xl p-6 mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lock className="size-6 text-[#3B82F6]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-white/95">Unlock Pro Analytics</h3>
                      <Badge className="bg-[#1BE8D2]/20 text-[#1BE8D2] border-[#1BE8D2]/30 text-xs">
                        Pro
                      </Badge>
                    </div>
                    <p className="text-white/70 text-sm mb-4">
                      Get deeper insights with advanced APR tracking and peer comparisons.
                    </p>
                    <Button className="bg-[#3B82F6] hover:bg-[#3B82F6]/90">
                      Upgrade to Pro
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5"></div>
                    <span className="text-white/70">
                      Icon containers allowed in promo/insight cards
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5"></div>
                    <span className="text-white/70">
                      Section titles (h2/h3) remain icon-free
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2.4 RangeBand */}
            <div className="mb-10">
              <h3 className="text-white/95 mb-4">
                RangeBand™ Component
              </h3>

              <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6 mb-4">
                <div className="text-center mb-4">
                  <div className="text-white/70 text-sm mb-2">Balanced (25.0%)</div>
                  
                  {/* Strategy Axis Visual */}
                  <div className="flex items-center justify-between mb-2 text-xs text-white/40">
                    <span>Aggressive</span>
                    <span>Balanced</span>
                    <span>Conservative</span>
                  </div>
                  
                  {/* Band Visual */}
                  <div className="relative h-12 bg-[#0B1530] rounded-lg border border-white/5 mb-3">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-[65%] h-1 bg-gradient-to-r from-[#3B82F6]/50 via-[#3B82F6] to-[#3B82F6]/50 rounded-full"></div>
                      <div className="absolute w-4 h-4 bg-[#10B981] rounded-full border-2 border-white/40 shadow-lg" style={{ left: '45%' }}></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-white/[0.58] mb-3">
                    <span className="numeric">Min: $0.98</span>
                    <span className="numeric text-white/95">Current: $1.275</span>
                    <span className="numeric">Max: $1.93</span>
                  </div>

                  <div className="text-xs text-white/70 mb-4">WFLR/FXRP</div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#0B1530]/60 rounded-lg p-2">
                      <div className="text-white/[0.58]">Time in range</div>
                      <div className="text-white/95 numeric">24/28 days</div>
                    </div>
                    <div className="bg-[#0B1530]/60 rounded-lg p-2">
                      <div className="text-white/[0.58]">Range Efficiency</div>
                      <div className="text-white/95 numeric">86%</div>
                    </div>
                    <div className="bg-[#0B1530]/60 rounded-lg p-2">
                      <div className="text-white/[0.58]">Times out</div>
                      <div className="text-white/95 numeric">4</div>
                    </div>
                    <div className="bg-[#0B1530]/60 rounded-lg p-2">
                      <div className="text-white/[0.58]">Band width</div>
                      <div className="text-white/95 numeric">25.0%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
                <div className="text-white/95 text-sm mb-3">Reused in:</div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5"></div>
                    <span className="text-white/70 text-sm">Portfolio Pro (aggregated health)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5"></div>
                    <span className="text-white/70 text-sm">PoolDetail (per pool)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5"></div>
                    <span className="text-white/70 text-sm">Pool Universe (RangeBand landscape)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================
              COLUMN 3: LAYOUT TEMPLATES
          ======================================== */}
          <div>
            <h2 className="text-white/95 mb-8">
              Layout Templates
            </h2>

            {/* 3.1 Portfolio P&A */}
            <div className="mb-10">
              <h3 className="text-white/95 mb-4">
                Portfolio P&A
              </h3>

              <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6 mb-4">
                <div className="space-y-3 text-xs">
                  <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded p-2">
                    <div className="text-white/95 text-sm mb-1">Header</div>
                    <div className="text-white/70">Title + Status + Time Range + Plan Badge</div>
                  </div>

                  <div className="bg-[#0B1530]/60 border border-white/10 rounded p-2">
                    <div className="text-white/95 text-sm mb-1">Zone A — KPI Belt (8 cards, 2 rows)</div>
                    <div className="text-white/70 text-xs space-y-0.5">
                      <div>1. Total Portfolio Value</div>
                      <div>2. Fees Earned</div>
                      <div>3. Rewards & Incentives</div>
                      <div>4. Average APR (30D)</div>
                      <div>5. Net Yield (30D)</div>
                      <div>6. Range Efficiency</div>
                      <div>7. Unclaimed Fees & Rewards</div>
                      <div>8. Active Positions & DEX Spread</div>
                    </div>
                  </div>

                  <div className="bg-[#0B1530]/60 border border-white/10 rounded p-2">
                    <div className="text-white/95 text-sm mb-1">Zone B — Activity Row</div>
                    <div className="text-white/70">
                      Left: Activity Calendar (70%)
                      <br />
                      Right: Premium = Promo / Pro = Peer Summary (30%)
                    </div>
                  </div>

                  <div className="bg-[#0B1530]/60 border border-white/10 rounded p-2">
                    <div className="text-white/95 text-sm mb-1">Zone C — Value & Earnings</div>
                    <div className="text-white/70 text-xs space-y-0.5">
                      <div>• Portfolio Value & P&L (chart + stats)</div>
                      <div>• Trading Fees card</div>
                      <div>• Rewards & Incentives card (USD+Token pattern)</div>
                    </div>
                  </div>

                  <div className="bg-[#0B1530]/60 border border-white/10 rounded p-2">
                    <div className="text-white/95 text-sm mb-1">Zone D — Efficiency, Behaviour & Risk</div>
                    <div className="text-white/70 text-xs space-y-0.5">
                      <div>• Net Yield vs HODL</div>
                      <div>• Range Efficiency</div>
                      <div>• Unclaimed Health</div>
                      <div>• DEX Exposure</div>
                      <div>• Activity & Claim Behaviour</div>
                      <div>• Concentration & Largest Pools</div>
                    </div>
                  </div>

                  <div className="bg-[#1BE8D2]/10 border border-[#1BE8D2]/30 rounded p-2">
                    <div className="text-white/95 text-sm mb-1">Zone E — Pro Analytics (Pro only)</div>
                    <div className="text-white/70 text-xs space-y-0.5">
                      <div>• Peer Comparison</div>
                      <div>• Strategy Distribution</div>
                      <div>• Optional: DEX Detail</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#3B82F6]/10 border-2 border-[#3B82F6]/30 rounded-xl p-4">
                <div className="text-white/95 text-sm mb-1">✓ Layout Rule</div>
                <div className="text-white/70 text-sm">
                  Pro = Premium baseline + extra peer/universe lines + Pro Analytics section. Same layout hierarchy.
                </div>
              </div>
            </div>

            {/* 3.2 Pool Detail */}
            <div className="mb-10">
              <h3 className="text-white/95 mb-4">
                Pool Detail Layouts
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Premium */}
                <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-4">
                  <div className="text-white/95 text-sm mb-3">Premium</div>
                  <div className="space-y-2 text-xs">
                    <div className="bg-[#0B1530]/60 border border-white/10 rounded p-1.5">
                      <div className="text-white/70">Hero + "Upgrade to Pro"</div>
                    </div>
                    <div className="bg-[#0B1530]/60 border border-white/10 rounded p-1.5">
                      <div className="text-white/70">Price Chart</div>
                    </div>
                    <div className="bg-[#0B1530]/60 border border-white/10 rounded p-1.5">
                      <div className="text-white/70">4 KPI cards</div>
                    </div>
                    <div className="bg-[#0B1530]/60 border border-white/10 rounded p-1.5">
                      <div className="text-white/70">RangeBand Status</div>
                    </div>
                    <div className="bg-[#0B1530]/60 border border-white/10 rounded p-1.5">
                      <div className="text-white/70">My Positions</div>
                    </div>
                    <div className="bg-[#0B1530]/60 border border-white/10 rounded p-1.5">
                      <div className="text-white/70">Pool Activity</div>
                    </div>
                    <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded p-1.5">
                      <div className="text-white/70">Pro Teaser</div>
                    </div>
                  </div>
                </div>

                {/* Pro */}
                <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-4">
                  <div className="text-white/95 text-sm mb-3">Pro</div>
                  <div className="space-y-2 text-xs">
                    <div className="bg-[#1BE8D2]/10 border border-[#1BE8D2]/30 rounded p-1.5">
                      <div className="text-white/70">Hero + Pro + Universe link</div>
                    </div>
                    <div className="bg-[#1BE8D2]/10 border border-[#1BE8D2]/30 rounded p-1.5">
                      <div className="text-white/70">Chart + Pro overlays</div>
                    </div>
                    <div className="bg-[#1BE8D2]/10 border border-[#1BE8D2]/30 rounded p-1.5">
                      <div className="text-white/70">4 KPI + peer sublines</div>
                    </div>
                    <div className="bg-[#1BE8D2]/10 border border-[#1BE8D2]/30 rounded p-1.5">
                      <div className="text-white/70">RangeBand + universe</div>
                    </div>
                    <div className="bg-[#1BE8D2]/10 border border-[#1BE8D2]/30 rounded p-1.5">
                      <div className="text-white/70">Positions + peer info</div>
                    </div>
                    <div className="bg-[#1BE8D2]/10 border border-[#1BE8D2]/30 rounded p-1.5">
                      <div className="text-white/70">Activity + toggle + Pro</div>
                    </div>
                    <div className="bg-[#1BE8D2]/10 border border-[#1BE8D2]/30 rounded p-1.5">
                      <div className="text-white/70">Pro Analytics Section</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3.3 Pool Universe */}
            <div className="mb-10">
              <h3 className="text-white/95 mb-4">
                Pool Universe View
              </h3>

              <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
                <div className="space-y-2 text-xs">
                  <div className="bg-[#1BE8D2]/10 border border-[#1BE8D2]/30 rounded p-2">
                    <div className="text-white/95 text-sm">Universe Hero Tiles</div>
                    <div className="text-white/70">Pool TVL · Fees 30d · Avg APR · LP count · In-range %</div>
                  </div>
                  <div className="bg-[#0B1530]/60 border border-white/10 rounded p-2">
                    <div className="text-white/70">DEX Breakdown + Fee Tier Breakdown</div>
                  </div>
                  <div className="bg-[#0B1530]/60 border border-white/10 rounded p-2">
                    <div className="text-white/70">LP Population & Concentration</div>
                  </div>
                  <div className="bg-[#0B1530]/60 border border-white/10 rounded p-2">
                    <div className="text-white/70">RangeBand Landscape & Price Zones</div>
                  </div>
                  <div className="bg-[#0B1530]/60 border border-white/10 rounded p-2">
                    <div className="text-white/70">Fee & APR Distribution + Missed Fees</div>
                  </div>
                  <div className="bg-[#0B1530]/60 border border-white/10 rounded p-2">
                    <div className="text-white/70">Claim Behaviour & Cash-flow</div>
                  </div>
                  <div className="bg-[#0B1530]/60 border border-white/10 rounded p-2">
                    <div className="text-white/70">Wallet Flows & Top Changes</div>
                  </div>
                  <div className="bg-[#0B1530]/60 border border-white/10 rounded p-2">
                    <div className="text-white/70">Market Regimes</div>
                  </div>
                  <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded p-2">
                    <div className="text-white/95 text-sm">Insight Block</div>
                    <div className="text-white/70">"How this pool context affects your position"</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================
            FOOTER — PRACTICAL NOTES
        ======================================== */}
        <div className="bg-[#0A1020] border-t border-white/10 rounded-xl p-8">
          <h3 className="text-white/95 mb-6">
            Usage Notes
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
              <div className="text-white/95 text-sm mb-3">Source of Truth:</div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5"></div>
                  <span className="text-white/70 text-sm">
                    <code className="text-[#3B82F6]">/guidelines/Guidelines.md</code>
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1BE8D2] flex-shrink-0 mt-1.5"></div>
                  <span className="text-white/70 text-sm">
                    <code className="text-[#3B82F6]">PROJECT_STATE.md</code> (changelog ≥ 2025-11-23)
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="text-white/95 text-sm mb-2">Update Process:</div>
                <div className="text-white/70 text-sm">
                  When in doubt: update Guidelines first → then this summary → then UI
                </div>
              </div>
            </div>

            <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-6">
              <div className="text-white/95 text-sm mb-3">Implementation Checklist:</div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 border border-white/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-[#1BE8D2] rounded-sm"></div>
                  </div>
                  <span className="text-white/70 text-sm">No icons in h2/h3 titles or tab labels</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 border border-white/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-[#1BE8D2] rounded-sm"></div>
                  </div>
                  <span className="text-white/70 text-sm">KPI cards follow DS pattern</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 border border-white/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-[#1BE8D2] rounded-sm"></div>
                  </div>
                  <span className="text-white/70 text-sm">Incentives use USD + Token0/Token1 pattern</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 border border-white/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-[#1BE8D2] rounded-sm"></div>
                  </div>
                  <span className="text-white/70 text-sm">Event lists use neutral slate-grey icons</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 border border-white/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-[#1BE8D2] rounded-sm"></div>
                  </div>
                  <span className="text-white/70 text-sm">Layouts match Strategy C templates</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#3B82F6]/10 to-[#1BE8D2]/10 border border-[#3B82F6]/20 rounded-xl p-6">
            <div className="text-center">
              <div className="text-white/95 text-sm mb-2">
                LiquiLab Design System Summary · Strategy C Screens Reference
              </div>
              <div className="text-white/[0.58] text-xs">
                Last updated: 2025-11-23 · Maintained by LiquiLab Design & Engineering
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
