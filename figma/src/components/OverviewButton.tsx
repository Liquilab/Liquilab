import { useNavigate, useLocation } from "react-router-dom";
import { Layout, X } from "lucide-react";
import { Button } from "./ui/button";

export function OverviewButton() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Don't show on the overview page itself
  const isOnOverviewPage = location.pathname === "/overview" || location.hash === "#/overview";
  
  if (isOnOverviewPage) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2"
      data-overview-button
    >
      {/* Info label (shows on hover) */}
      <div className="opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg px-3 py-2 mb-2">
          <p className="font-['Manrope',sans-serif] text-white/70 whitespace-nowrap">
            Component Overview
          </p>
        </div>
      </div>
      
      {/* Overview button */}
      <Button
        onClick={() => navigate("/overview")}
        className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-14 w-14 rounded-full p-0 group"
        title="Open Component Overview - navigeer naar alle pagina's en componenten"
      >
        <div className="relative">
          <Layout className="h-6 w-6 transition-transform group-hover:scale-110" />
        </div>
      </Button>
    </div>
  );
}