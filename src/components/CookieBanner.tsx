import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { X } from "lucide-react";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem("cookie-consent", "rejected");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      role="dialog" 
      aria-label="Cookie consent banner"
      aria-describedby="cookie-description"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0B1530] border-t border-white/20 shadow-2xl"
    >
      <div className="max-w-[1400px] mx-auto px-8 py-6">
        <div className="flex items-center justify-between gap-8">
          <div className="flex-1">
            <p id="cookie-description" className="text-sm text-slate-300">
              We use cookies to enhance your experience, analyze site traffic, and for marketing purposes. 
              By clicking "Accept all", you consent to our use of cookies.{" "}
              <a 
                href="/legal/cookies" 
                className="text-[#3B82F6] hover:underline focus:outline-2 focus:outline-[#3B82F6]"
              >
                Learn more about cookies
              </a>
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleRejectAll}
              className="border-white/20 text-slate-300 hover:bg-white/5"
            >
              Reject all
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="border-white/20 text-slate-300 hover:bg-white/5"
            >
              Cookie settings
            </Button>
            <Button 
              size="sm"
              onClick={handleAcceptAll}
              className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
            >
              Accept all
            </Button>
            <button
              onClick={handleRejectAll}
              aria-label="Close cookie banner"
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
