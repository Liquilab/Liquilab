import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";
import { toast } from "sonner@2.0.3";
import { AlertTriangle, TrendingUp, Package } from "lucide-react";
import { RangeBandIcon } from "../components/RangeBandIcon";

export function AccountPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [rangebandAlerts, setRangebandAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  
  // Current plan state - can be "premium", "pro", or "enterprise"
  const [currentPlan] = useState<"premium" | "pro" | "enterprise">("premium");
  const [poolBundles, setPoolBundles] = useState(1); // Number of 5-pool bundles (1 = base 5 pools)
  const [hasRangeBandAlerts] = useState(false); // Only for Premium users
  const [usedPools] = useState(4); // Currently tracking 4 pools

  const handleSaveProfile = () => {
    toast.success("Profile updated successfully");
  };

  const handleSavePreferences = () => {
    toast.success("Preferences saved");
  };
  
  const handleUpgradePlan = () => {
    toast.success("Redirecting to upgrade...");
  };
  
  const handleDowngradePlan = () => {
    toast.success("Downgrade scheduled for next billing cycle");
  };
  
  const handleAddPoolBundle = () => {
    setPoolBundles(prev => prev + 1);
    toast.success("Pool bundle added. Changes will apply on next billing cycle.");
  };
  
  const handleRemovePoolBundle = () => {
    if (poolBundles > 1) {
      setPoolBundles(prev => prev - 1);
      toast.success("Pool bundle removed. Changes will apply on next billing cycle.");
    }
  };
  
  const handleAddRangeBandAlerts = () => {
    toast.success("RangeBand™ Alerts add-on added. Changes will apply on next billing cycle.");
  };
  
  const handleContactSales = () => {
    toast.success("Redirecting to contact form...");
  };
  
  // Calculate pricing
  const basePrices = {
    premium: 14.95,
    pro: 24.95,
    enterprise: 0
  };
  
  const bundlePrices = {
    premium: 9.95,
    pro: 14.95,
    enterprise: 0
  };
  
  const rangeBandAlertPrice = 2.49;
  
  const calculateTotalPrice = () => {
    if (currentPlan === "enterprise") return "Custom";
    
    const basePrice = basePrices[currentPlan];
    const bundlePrice = bundlePrices[currentPlan] * (poolBundles - 1);
    const alertPrice = currentPlan === "premium" && hasRangeBandAlerts 
      ? rangeBandAlertPrice * poolBundles 
      : 0;
    
    return (basePrice + bundlePrice + alertPrice).toFixed(2);
  };
  
  const totalPools = poolBundles * 5;

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10 max-w-[900px] mx-auto px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-['Quicksand',sans-serif] text-white/95 mb-3">
            Account Settings
          </h1>
          <p className="font-['Inter',sans-serif] text-white/70">
            Manage your profile, subscription, and preferences
          </p>
        </div>

        {/* Profile Section - Lighter styling */}
        <section className="bg-[#0F1A36]/80 border border-white/5 rounded-lg p-6 mb-6">
          <h3 className="font-['Quicksand',sans-serif] text-white/95 mb-6" style={{ fontSize: '18px' }}>
            Profile
          </h3>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="wallet" className="font-['Inter',sans-serif] text-white/70">
                Connected Wallet
              </Label>
              <div className="mt-2 flex items-center gap-3">
                <Input 
                  id="wallet"
                  value="0x7a8f9b2c1e4d6a3f8e9c2b1a7d4e6f3a8b9c2d1e" 
                  readOnly
                  className="bg-[#0B1530] border-white/10 text-white/[0.58] font-mono numeric"
                />
                <Badge variant="outline" className="text-[#1BE8D2] border-[#1BE8D2]/30">
                  Verified
                </Badge>
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="font-['Inter',sans-serif] text-white/70">
                Email Address
              </Label>
              <Input 
                id="email"
                type="email"
                placeholder="your@email.com"
                className="mt-2 bg-[#0B1530] border-white/10 text-white/95 placeholder:text-white/40"
              />
              <p className="font-['Inter',sans-serif] text-white/[0.58] mt-1">
                Used for notifications and account recovery
              </p>
            </div>

            <div>
              <Label htmlFor="timezone" className="font-['Inter',sans-serif] text-white/70">
                Timezone
              </Label>
              <Select defaultValue="utc">
                <SelectTrigger className="mt-2 bg-[#0B1530] border-white/10 text-white/95">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utc">UTC (GMT+0)</SelectItem>
                  <SelectItem value="est">Eastern Time (GMT-5)</SelectItem>
                  <SelectItem value="pst">Pacific Time (GMT-8)</SelectItem>
                  <SelectItem value="cet">Central European Time (GMT+1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button 
              onClick={handleSaveProfile}
              className="bg-[#3B82F6] hover:bg-[#3B82F6]/90"
            >
              Save Changes
            </Button>
          </div>
        </section>

        {/* Subscription Section - PRIMARY ZONE */}
        <section className="bg-gradient-to-br from-[#0F1A36]/95 to-[#0B1530]/95 border-2 border-[#3B82F6]/30 rounded-xl p-8 mb-8 shadow-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="size-5 text-[#3B82F6]" />
            </div>
            <h2 className="font-['Quicksand',sans-serif] text-white/95">
              Subscription & Billing
            </h2>
          </div>
          
          {/* Current Plan - NO NESTED CARD */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-['Quicksand',sans-serif] text-white/95" style={{ fontSize: '20px' }}>
                    {currentPlan === "premium" && "Premium Plan"}
                    {currentPlan === "pro" && "Pro Plan"}
                    {currentPlan === "enterprise" && "Enterprise Plan"}
                  </span>
                  <Badge className="bg-[#10B981] text-white">
                    Active
                  </Badge>
                </div>
                <p className="font-['Inter',sans-serif] text-white/[0.58] mb-3" style={{ fontSize: '13px' }}>
                  {currentPlan === "premium" && "Perfect for active liquidity providers"}
                  {currentPlan === "pro" && "For professional traders & portfolio managers"}
                  {currentPlan === "enterprise" && "For teams, desks, and custom integrations"}
                </p>
                <p className="font-['Inter',sans-serif] text-white/70 mb-1">
                  {currentPlan === "premium" && `${totalPools} pools with full analytics`}
                  {currentPlan === "pro" && `${totalPools} pools with PRO analytics & alerts included`}
                  {currentPlan === "enterprise" && "Custom pool limits with bespoke features"}
                </p>
                {currentPlan !== "enterprise" && (
                  <p className="font-['Inter',sans-serif] text-white/[0.58]">
                    Next billing: December 17, 2025 • <span className="numeric">${calculateTotalPrice()}</span>
                    <span className="text-white/40 ml-1">(€{(parseFloat(calculateTotalPrice() as string) * 0.97).toFixed(2)})</span>
                  </p>
                )}
              </div>
              
              <div className="flex gap-2">
                {currentPlan === "premium" && (
                  <Button 
                    onClick={handleUpgradePlan}
                    className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
                  >
                    Upgrade to Pro
                  </Button>
                )}
                {currentPlan === "pro" && (
                  <>
                    <Button 
                      onClick={handleDowngradePlan}
                      variant="outline" 
                      className="border-white/20 text-white/70 hover:bg-white/5"
                    >
                      Downgrade to Premium
                    </Button>
                    <Button 
                      onClick={handleContactSales}
                      className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
                    >
                      Contact for Enterprise
                    </Button>
                  </>
                )}
                {currentPlan === "enterprise" && (
                  <Button 
                    onClick={handleContactSales}
                    variant="outline"
                    className="border-white/20 text-white/70 hover:bg-white/5"
                  >
                    Contact Account Manager
                  </Button>
                )}
              </div>
            </div>

            {/* Plan Features Summary */}
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10">
              <div>
                <div className="font-['Inter',sans-serif] text-white/40 mb-1">Base price</div>
                <div className="font-['Inter',sans-serif] text-white/95 numeric">
                  {currentPlan !== "enterprise" ? `$${basePrices[currentPlan]}/month` : "Custom"}
                </div>
              </div>
              <div>
                <div className="font-['Inter',sans-serif] text-white/40 mb-1">Pool bundles</div>
                <div className="font-['Inter',sans-serif] text-white/95 numeric">
                  {poolBundles} × 5 pools = {totalPools} pools
                </div>
              </div>
              {currentPlan === "premium" && (
                <div>
                  <div className="font-['Inter',sans-serif] text-white/40 mb-1">RangeBand™ Alerts</div>
                  <div className="font-['Inter',sans-serif] text-white/95">
                    {hasRangeBandAlerts ? `$${(rangeBandAlertPrice * poolBundles).toFixed(2)}/month` : "Not active"}
                  </div>
                </div>
              )}
              {currentPlan === "pro" && (
                <div>
                  <div className="font-['Inter',sans-serif] text-white/40 mb-1">RangeBand™ Alerts</div>
                  <div className="font-['Inter',sans-serif] text-white/95 flex items-center gap-2">
                    Included
                    <Badge variant="outline" className="bg-[#10B981]/20 border-[#10B981]/30 text-[#10B981]">
                      PRO
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator className="my-8 bg-white/10" />

          {/* Pool Usage - NO NESTED CARD */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                <Package className="size-5 text-[#3B82F6]" />
              </div>
              <div className="flex-1">
                <div className="font-['Inter',sans-serif] font-medium text-white/95">Pool Usage</div>
                <div className="font-['Inter',sans-serif] text-white/[0.58] numeric" style={{ fontSize: '13px' }}>
                  {usedPools} of {totalPools} pools tracked
                </div>
              </div>
              <div className="font-['Inter',sans-serif] text-white/40 numeric" style={{ fontSize: '24px' }}>
                {Math.round((usedPools / totalPools) * 100)}%
              </div>
            </div>
            
            {/* Progress Bar with Better Contrast */}
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-4">
              <div 
                className={`h-full rounded-full transition-all ${
                  usedPools / totalPools >= 0.8 
                    ? 'bg-[#F59E0B]' 
                    : 'bg-[#3B82F6]'
                }`}
                style={{ width: `${(usedPools / totalPools) * 100}%` }} 
              />
            </div>
            
            {/* Upsell Routes - ALWAYS VISIBLE */}
            {currentPlan !== "enterprise" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Add Bundle - Secondary */}
                <Button 
                  onClick={handleAddPoolBundle}
                  variant="outline"
                  className="bg-[#0B1530] border-white/20 text-white/95 hover:bg-white/5 hover:border-white/30 flex flex-col items-start h-auto py-4 px-4"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="size-4 text-white/70" />
                    <span className="font-['Inter',sans-serif] font-medium">Add 5 pools</span>
                  </div>
                  <span className="font-['Inter',sans-serif] text-white/[0.58]" style={{ fontSize: '12px' }}>
                    +${bundlePrices[currentPlan]}/month per bundle
                  </span>
                </Button>

                {/* Upgrade to Pro - Primary Electric Blue */}
                {currentPlan === "premium" && (
                  <Button 
                    onClick={handleUpgradePlan}
                    className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white flex flex-col items-start h-auto py-4 px-4"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="size-4" />
                      <span className="font-['Inter',sans-serif] font-medium">Upgrade to Pro</span>
                      <Badge className="bg-white/20 text-white text-xs">Better value</Badge>
                    </div>
                    <span className="font-['Inter',sans-serif] text-white/90" style={{ fontSize: '12px' }}>
                      Pro analytics, alerts included, export-ready data
                    </span>
                  </Button>
                )}
              </div>
            )}

            {/* Near Limit Warning */}
            {usedPools >= totalPools * 0.8 && currentPlan !== "enterprise" && (
              <div className="mt-3 p-3 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="size-4 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                  <div className="font-['Inter',sans-serif] text-white/70" style={{ fontSize: '13px' }}>
                    {usedPools === totalPools 
                      ? `Pool limit reached (${usedPools}/${totalPools}). Add capacity to monitor more positions.`
                      : `Nearing limit (${usedPools}/${totalPools}). Consider adding capacity now.`
                    }
                  </div>
                </div>
              </div>
            )}
            
            {/* Remove Bundle Option */}
            {poolBundles > 1 && (
              <div className="mt-3">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={handleRemovePoolBundle}
                  className="text-white/40 hover:text-white/70 hover:bg-white/5"
                >
                  Remove bundle (-${bundlePrices[currentPlan]}/month)
                </Button>
              </div>
            )}
          </div>

          {/* Upgrade to Pro Suggestion (when on Premium with multiple bundles) */}
          {currentPlan === "premium" && poolBundles >= 2 && (
            <>
              <Separator className="my-8 bg-white/10" />
              <div className="p-4 bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-['Inter',sans-serif] text-white/95">
                        Save with Pro
                      </div>
                      <Badge className="bg-[#10B981] text-white text-xs">
                        Better value
                      </Badge>
                    </div>
                    <div className="font-['Inter',sans-serif] text-white/70">
                      With {poolBundles} pool bundles, Pro offers better value: save ${
                        ((basePrices.premium + bundlePrices.premium * (poolBundles - 1)) - 
                         (basePrices.pro + bundlePrices.pro * (poolBundles - 1))).toFixed(2)
                      }/month while getting PRO analytics and RangeBand™ Alerts included.
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    onClick={handleUpgradePlan}
                    className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white flex-shrink-0"
                  >
                    Upgrade to Pro
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* RangeBand™ Alerts Add-on */}
          {currentPlan === "premium" && (
            <>
              <Separator className="my-8 bg-white/10" />
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <RangeBandIcon size={20} className="opacity-100" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-['Inter',sans-serif] font-medium text-white/95">RangeBand™ Alerts Add-on</div>
                    {hasRangeBandAlerts && (
                      <Badge className="bg-[#10B981] text-white text-xs">Active</Badge>
                    )}
                  </div>
                  <p className="font-['Inter',sans-serif] text-white/70 mb-3" style={{ fontSize: '13px' }}>
                    Never miss when your positions move near or out of range. Get instant notifications for all {totalPools} pools.
                  </p>
                  {hasRangeBandAlerts ? (
                    <div className="font-['Inter',sans-serif] text-white/[0.58]" style={{ fontSize: '12px' }}>
                      Monitoring alerts for {totalPools} pools • ${(rangeBandAlertPrice * poolBundles).toFixed(2)}/month
                    </div>
                  ) : (
                    <Button 
                      onClick={handleAddRangeBandAlerts}
                      className="bg-[#1BE8D2] hover:bg-[#1BE8D2]/90 text-[#0B1530] font-medium"
                    >
                      Add for ${(rangeBandAlertPrice * poolBundles).toFixed(2)}/month
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
          
          {currentPlan === "pro" && (
            <>
              <Separator className="my-8 bg-white/10" />
              <div className="p-4 bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <RangeBandIcon size={20} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-['Inter',sans-serif] text-white/95 mb-1">RangeBand™ Alerts Included</div>
                    <div className="font-['Inter',sans-serif] text-white/70" style={{ fontSize: '13px' }}>
                      Your Pro plan includes RangeBand™ Alerts for all {totalPools} pools at no extra cost.
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Trial Info */}
          <div className="mt-8 p-4 bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-[#3B82F6]">ℹ️</span>
              </div>
              <div>
                <div className="font-['Inter',sans-serif] text-white/95 mb-1">Trial period active</div>
                <div className="font-['Inter',sans-serif] text-white/70">
                  You have 12 days left in your free trial. No charges until December 5, 2025.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Preferences Section - Lighter styling */}
        <section className="bg-[#0F1A36]/80 border border-white/5 rounded-lg p-6 mb-6">
          <h3 className="font-['Quicksand',sans-serif] text-white/95 mb-6" style={{ fontSize: '18px' }}>
            Notification Preferences
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifs" className="font-['Inter',sans-serif] text-white/95">
                  Email Notifications
                </Label>
                <p className="font-['Inter',sans-serif] text-white/[0.58] mt-1" style={{ fontSize: '13px' }}>
                  Receive account updates, billing notifications, and important system alerts
                </p>
              </div>
              <Switch 
                id="email-notifs"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <Separator className="bg-white/10" />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="rangeband-alerts" className="font-['Inter',sans-serif] text-white/95">
                  RangeBand™ Alerts
                </Label>
                <p className="font-['Inter',sans-serif] text-white/[0.58] mt-1" style={{ fontSize: '13px' }}>
                  Get instant email alerts when your positions move near or out of range
                  {currentPlan === "premium" && !hasRangeBandAlerts && (
                    <span className="text-[#F59E0B] ml-1">(Add-on required)</span>
                  )}
                  {currentPlan === "pro" && (
                    <span className="text-[#10B981] ml-1">(Included in Pro)</span>
                  )}
                </p>
              </div>
              <Switch 
                id="rangeband-alerts"
                checked={rangebandAlerts}
                onCheckedChange={setRangebandAlerts}
                disabled={currentPlan === "premium" && !hasRangeBandAlerts}
              />
            </div>

            <Separator className="bg-white/10" />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weekly-reports" className="font-['Inter',sans-serif] text-white/95">
                  Weekly Performance Reports
                </Label>
                <p className="font-['Inter',sans-serif] text-white/[0.58] mt-1" style={{ fontSize: '13px' }}>
                  Receive weekly summaries of pool performance, fees earned, and portfolio insights
                </p>
              </div>
              <Switch 
                id="weekly-reports"
                checked={weeklyReports}
                onCheckedChange={setWeeklyReports}
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button 
              onClick={handleSavePreferences}
              className="bg-[#3B82F6] hover:bg-[#3B82F6]/90"
            >
              Save Preferences
            </Button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-gradient-to-br from-red-500/5 to-red-500/10 border-2 border-red-500/40 rounded-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="size-5 text-red-400" />
            </div>
            <h2 className="font-['Quicksand',sans-serif] text-red-400">
              Danger Zone
            </h2>
          </div>
          
          <div className="flex items-start justify-between">
            <div>
              <div className="font-['Inter',sans-serif] text-white/95 mb-2">Delete Account</div>
              <p className="font-['Inter',sans-serif] text-white/70 mb-1">
                Permanently delete your account and all associated data.
              </p>
              <p className="font-['Inter',sans-serif] text-red-400" style={{ fontSize: '13px' }}>
                ⚠️ This action cannot be undone. All your pool tracking, alerts, and settings will be lost forever.
              </p>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#0F1A36]/95 border-red-500/30">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-['Quicksand',sans-serif] text-white/95">
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="font-['Inter',sans-serif] text-white/70">
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-[#0B1530] border-white/10 text-white/95 hover:bg-white/5">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction className="bg-red-500 hover:bg-red-600 text-white">
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>
      </div>
    </div>
  );
}