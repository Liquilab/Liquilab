import { Link, useLocation } from "react-router-dom";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Wallet, CreditCard, HelpCircle, LogOut, User, ChevronDown } from "lucide-react";
import { Logo } from "./Logo";
import flareIcon from "figma:asset/9e8c55689d823feccef746972489a12269659ce9.png";

interface NavigationProps {
  walletConnected?: boolean;
  planType?: "Visitor" | "Premium" | "Pro";
}

export function Navigation({ walletConnected = false, planType = "Visitor" }: NavigationProps) {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: "/portfolio", label: "Portfolio" },
    { path: "/rangeband", label: "RangeBand™" },
    { path: "/pricing", label: "Pricing" },
    { path: "/faq", label: "FAQ" },
  ];

  return (
    <nav className="border-b border-white/5 bg-[#0B1530]/95 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-[1400px] mx-auto px-8 py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="group">
            <Logo size="md" />
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-8">
            {navItems.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-white/70 transition-all relative ${
                  isActive(link.path) 
                    ? "text-[#3B82F6]" 
                    : "hover:text-white"
                }`}
              >
                {link.label}
                {isActive(link.path) && (
                  <span className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-[#3B82F6]" />
                )}
              </Link>
            ))}
          </div>

          {/* Right Side: Plan Badge, Wallet, Account */}
          <div className="flex items-center gap-4">
            {walletConnected ? (
              <>
                <div className="flex items-center gap-2 text-white">
                  <img src={flareIcon} alt="Flare" className="size-4" />
                  <span>Flare</span>
                </div>
                <Button variant="outline" size="sm" className="gap-2 border-white/20 text-white hover:bg-white/5">
                  <Wallet className="size-4" />
                  <span className="numeric">0x7a8f...3d2e</span>
                </Button>
              </>
            ) : (
              <Button size="sm" className="gap-2 bg-[#3B82F6] hover:bg-[#3B82F6]/90">
                <Wallet className="size-4" />
                Connect Wallet
              </Button>
            )}

            {/* Account Dropdown - Only visible when logged in */}
            {walletConnected && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-white/70 hover:text-white hover:bg-white/5"
                  >
                    <User className="size-4" />
                    <ChevronDown className="size-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 bg-[#0F1A36]/98 border-white/10 backdrop-blur-sm"
                >
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/account" 
                      className="flex items-center gap-3 cursor-pointer text-white/95 hover:text-white focus:text-white focus:bg-white/5"
                    >
                      <CreditCard className="size-4" />
                      Your plan
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/account" 
                      className="flex items-center gap-3 cursor-pointer text-white/95 hover:text-white focus:text-white focus:bg-white/5"
                    >
                      <CreditCard className="size-4" />
                      Billing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/faq" 
                      className="flex items-center gap-3 cursor-pointer text-white/95 hover:text-white focus:text-white focus:bg-white/5"
                    >
                      <HelpCircle className="size-4" />
                      Contact support
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem 
                    className="flex items-center gap-3 cursor-pointer text-white/95 hover:text-white focus:text-white focus:bg-white/5"
                    onClick={() => {
                      // Handle logout
                      console.log("Logging out...");
                    }}
                  >
                    <LogOut className="size-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}