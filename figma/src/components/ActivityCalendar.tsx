import { useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Plus, Minus, DollarSign, RefreshCw, Settings, Lock, ArrowRight } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

interface DayActivity {
  date: string;
  count: number;
  events: {
    type: "added" | "removed" | "claimed" | "rebalanced" | "rflr";
    pool: string;
    tokenId: string;
    amount?: string;
  }[];
}

interface ActivityCalendarProps {
  className?: string;
  isPro?: boolean;
}

export function ActivityCalendar({ className = "", isPro = false }: ActivityCalendarProps) {
  // Simple seeded random function
  const seededRandom = (seed: string): number => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const x = Math.sin(hash) * 10000;
    return x - Math.floor(x);
  };

  // Generate mock activity data for the last year
  const generateMockData = (): DayActivity[] => {
    const data: DayActivity[] = [];
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    // Start from exactly 1 year ago
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    // Adjust to previous Sunday (to match grid start)
    const startDate = new Date(oneYearAgo);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);
    startDate.setHours(0, 0, 0, 0);
    
    // Adjust end to next Saturday (to match grid end)
    const endDate = new Date(today);
    const endDayOfWeek = endDate.getDay();
    endDate.setDate(endDate.getDate() + (6 - endDayOfWeek));
    endDate.setHours(23, 59, 59, 999);

    // Generate data for every day from startDate to endDate
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const random = seededRandom(dateStr);
      
      // 60% chance of no activity, 40% chance of activity
      if (random > 0.6) {
        const eventCount = Math.floor(seededRandom(dateStr + 'count') * 4) + 1;
        const events = [];
        
        for (let i = 0; i < eventCount; i++) {
          const eventType = seededRandom(dateStr + 'event' + i);
          const pools = ["WFLR/USDT", "WFLR/FXRP", "XRP/USDT", "ETH/XRP", "BTC/WFLR"];
          const pool = pools[Math.floor(seededRandom(dateStr + 'pool' + i) * pools.length)];
          const tokenId = `#${18000 + Math.floor(seededRandom(dateStr + 'token' + i) * 5000)}`;
          
          if (eventType < 0.25) {
            events.push({ type: "added" as const, pool, tokenId, amount: `$${(seededRandom(dateStr + 'amountA' + i) * 10000 + 1000).toFixed(0)}` });
          } else if (eventType < 0.45) {
            events.push({ type: "claimed" as const, pool, tokenId, amount: `$${(seededRandom(dateStr + 'amountC' + i) * 500 + 50).toFixed(0)}` });
          } else if (eventType < 0.65) {
            events.push({ type: "removed" as const, pool, tokenId, amount: `$${(seededRandom(dateStr + 'amountR' + i) * 8000 + 500).toFixed(0)}` });
          } else if (eventType < 0.80) {
            events.push({ type: "rebalanced" as const, pool, tokenId });
          } else {
            // rFLR added (20% chance) - dagelijks toegekend, niet geclaimd
            const rflrAmount = (seededRandom(dateStr + 'rflrAmount' + i) * 200 + 50).toFixed(0); // 50-250 rFLR
            events.push({ type: "rflr" as const, pool, tokenId, amount: `${rflrAmount} rFLR` });
          }
        }
        
        data.push({ date: dateStr, count: eventCount, events });
      } else {
        data.push({ date: dateStr, count: 0, events: [] });
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
  };

  const activityData = useMemo(() => generateMockData(), []);

  // Get intensity level based on activity count (Liquilab style)
  const getIntensity = (count: number): string => {
    if (count === 0) return "bg-white/[0.03]"; // Very subtle gray (no activity)
    if (count === 1) return "bg-[#3B82F6]/20"; // Light Electric Blue
    if (count === 2) return "bg-[#3B82F6]/40"; // Medium Electric Blue
    if (count === 3) return "bg-[#3B82F6]/60"; // Strong Electric Blue
    return "bg-[#3B82F6]/80"; // Very strong Electric Blue
  };

  // Build calendar grid: Dynamic weeks based on exactly 1 year
  const buildCalendarGrid = () => {
    const DAYS = 7;
    
    // Create activity map for quick lookup
    const activityMap = new Map<string, DayActivity>();
    activityData.forEach(activity => {
      activityMap.set(activity.date, activity);
    });
    
    // Start date: exactly 1 year ago from today
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    // Find Sunday of the week containing "1 year ago"
    const startDate = new Date(oneYearAgo);
    const startDayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDayOfWeek);
    startDate.setHours(0, 0, 0, 0);
    
    // Find Saturday of the week containing "today"
    const endDate = new Date(today);
    const endDayOfWeek = endDate.getDay();
    endDate.setDate(endDate.getDate() + (6 - endDayOfWeek));
    endDate.setHours(23, 59, 59, 999);
    
    // Calculate exact number of weeks between start and end
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const WEEKS = Math.ceil(daysDiff / 7); // Remove the +1 to exclude last incomplete column
    
    // Build grid: 7 rows (days) × WEEKS columns
    const grid: (DayActivity | null)[][] = [];
    for (let day = 0; day < DAYS; day++) {
      const row: (DayActivity | null)[] = [];
      for (let week = 0; week < WEEKS; week++) {
        // Calculate date for this cell: startDate + (week * 7 + day) days
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + (week * 7 + day));
        
        const dateStr = cellDate.toISOString().split('T')[0];
        const activity = activityMap.get(dateStr);
        row.push(activity || null);
      }
      grid.push(row);
    }
    
    // Calculate month labels
    const monthLabels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    
    for (let week = 0; week < WEEKS; week++) {
      // Check first day (Sunday) of this week
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + (week * 7));
      
      const month = cellDate.getMonth();
      if (month !== lastMonth) {
        const monthName = cellDate.toLocaleDateString('en-US', { month: 'short' });
        monthLabels.push({ month: monthName, weekIndex: week });
        lastMonth = month;
      }
    }
    
    return { grid, monthLabels, startDate, WEEKS };
  };

  const { grid, monthLabels, startDate, WEEKS } = buildCalendarGrid();
  const totalActivity = activityData.reduce((sum, day) => sum + day.count, 0);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "added": return Plus;
      case "removed": return Minus;
      case "claimed": return DollarSign;
      case "rebalanced": return RefreshCw;
      case "rflr": return DollarSign;
      default: return Plus;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "added": return "text-white/70";
      case "removed": return "text-white/70";
      case "claimed": return "text-white/70";
      case "rebalanced": return "text-white/70";
      case "rflr": return "text-white/70";
      default: return "text-white/70";
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case "added": return "Liquidity Added";
      case "removed": return "Liquidity Removed";
      case "claimed": return "Fees Claimed";
      case "rebalanced": return "Position Rebalanced";
      case "rflr": return "rFLR added";
      default: return type;
    }
  };

  const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];

  return (
    <div className="bg-[#0F1A36]/95 border border-white/10 rounded-xl p-5 max-w-full">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-white/95 mb-1">
          Activity Calendar
        </h2>
        <p className="text-white/50">
          {totalActivity} activities in the last year in your Portfolio
        </p>
      </div>

      {/* Calendar container with horizontal scroll on smaller screens */}
      <div className="overflow-x-auto">
        {/* Month labels */}
        <div className="relative h-[20px] mb-1.5 ml-[39px] min-w-[800px]">
          {monthLabels.map((label, i) => {
            const cellWidth = 15; // 11px cell + 4px gap
            const position = label.weekIndex * cellWidth + 6; // +6px to center over first dot (11px / 2, rounded)
            
            return (
              <div
                key={i}
                className="absolute text-white/[0.58] text-[15px]"
                style={{ 
                  left: `${position}px`
                }}
              >
                {label.month}
              </div>
            );
          })}
        </div>

        {/* Calendar grid */}
        <div className="flex">
          {/* Day labels (left side) */}
          <div className="flex flex-col gap-[4px] mr-2.5">
            {dayLabels.map((label, idx) => (
              <div 
                key={idx} 
                className="text-white/[0.58] text-[15px] h-[11px] flex items-center justify-end w-[28px]"
                style={{ visibility: idx % 2 === 1 ? 'visible' : 'hidden' }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Grid: 7 rows (days) × dynamic columns (weeks) */}
          <div className="flex flex-col gap-[4px]">
            {grid.map((row, rowIdx) => (
              <div key={rowIdx} className="flex gap-[4px]">
                {row.map((dayData, colIdx) => {
                  // Render empty cells with light gray background
                  if (!dayData) {
                    return (
                      <div 
                        key={colIdx} 
                        className="w-[11px] h-[11px] rounded-full bg-white/[0.03] border border-white/5" 
                      />
                    );
                  }

                  const date = new Date(dayData.date + 'T12:00:00');
                  const formattedDate = date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  });

                  return (
                    <TooltipProvider key={colIdx} delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-[11px] h-[11px] rounded-full ${getIntensity(dayData.count)} border border-white/10 transition-all hover:border-[#3B82F6] hover:scale-110 cursor-pointer`}
                          />
                        </TooltipTrigger>
                        <TooltipContent 
                          side="top" 
                          className="bg-[#0F1A36]/98 border-white/20 max-w-[280px] p-3"
                          sideOffset={5}
                        >
                          <div>
                            <div className="text-white/95 mb-1">{formattedDate}</div>
                            {dayData.count === 0 ? (
                              <div className="text-white/[0.58] text-sm">No activity</div>
                            ) : (
                              <>
                                <div className="text-white/70 text-sm mb-2">
                                  {dayData.count} {dayData.count === 1 ? 'activity' : 'activities'}
                                </div>
                                {dayData.events.map((event, i) => {
                                  const Icon = getEventIcon(event.type);
                                  return (
                                    <div key={i} className="flex items-start gap-2 text-sm">
                                      <Icon className={`size-4 flex-shrink-0 mt-0.5 ${getEventColor(event.type)}`} />
                                      <div className="flex-1 min-w-0">
                                        <div className="text-white/95">{getEventLabel(event.type)}</div>
                                        <div className="text-white/[0.58] text-xs">
                                          {event.pool} · {event.tokenId}
                                          {event.amount && ` · ${event.amount}`}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer: Learn link + Legend */}
      <div className="mt-5 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between">
          <a 
            href="#" 
            className="text-[#3B82F6] text-sm hover:underline pl-[39px]"
          >
            Learn how we count activities
          </a>
          
          <div className="flex items-center gap-3">
            <span className="text-white/[0.58] text-[15px]">Less</span>
            <div className="flex gap-1">
              <div className="w-[13px] h-[13px] rounded-full bg-white/[0.03] border border-white/10" />
              <div className="w-[13px] h-[13px] rounded-full bg-[#3B82F6]/20 border border-white/10" />
              <div className="w-[13px] h-[13px] rounded-full bg-[#3B82F6]/40 border border-white/10" />
              <div className="w-[13px] h-[13px] rounded-full bg-[#3B82F6]/60 border border-white/10" />
              <div className="w-[13px] h-[13px] rounded-full bg-[#3B82F6]/80 border border-white/10" />
            </div>
            <span className="text-white/[0.58] text-[15px]">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}