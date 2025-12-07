import DSScreensSummary from "./pages/DSScreensSummary";
import { DSSummaryPage } from "./pages/DSSummaryPage";
import { IDepotDocPage } from "./pages/IDepotDocPage";

import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { CookieBanner } from "./components/CookieBanner";
import { ScreenshotButton } from "./components/ScreenshotButton";
import { OverviewButton } from "./components/OverviewButton";
import { Toaster } from "./components/ui/sonner";
import { HomePage } from "./pages/HomePage";
import { PoolsOverview } from "./pages/PoolsOverview";
import { PoolDetailPage } from "./pages/PoolDetailPage";
import { PoolDetailProPage } from "./pages/PoolDetailProPage";
import { PoolUniversePage } from "./pages/PoolUniversePage";
import { PositionProPage } from "./pages/PositionProPage";
import { PoolOverviewPage } from "./pages/PoolOverviewPage";
import { WalletOverview } from "./pages/WalletOverview";
import { WalletOverviewPro } from "./pages/WalletOverviewPro";
import { RangeBandExplainer } from "./pages/RangeBandExplainer";
import { PricingPage } from "./pages/PricingPage";
import { AccountPage } from "./pages/AccountPage";
import { FAQPage } from "./pages/FAQPage";
import { LegalPage } from "./pages/LegalPage";
import { IconShowcase } from "./pages/IconShowcase";
import { ScreenshotGeneratorPage } from "./pages/ScreenshotGeneratorPage";
import { RangeBandDS } from "./pages/RangeBandDS";
import { ComponentOverviewPage } from "./pages/ComponentOverviewPage";
import { TechnicalBriefPage } from "./pages/TechnicalBriefPage";
import { WeeklyReportTemplate } from "./pages/WeeklyReportTemplate";
import { AppLandingPage } from "./pages/AppLandingPage";

// Admin imports
import { AdminDashboard } from "./admin/pages/AdminDashboard";
import { AdminStatusPage } from "./admin/pages/AdminStatusPage";

function AppContent() {
  const location = useLocation();
  
  // Hide navigation and utility buttons on app-landing page
  const isAppLanding = location.pathname === "/app-landing";

  return (
    <div className="min-h-screen bg-[#0B1530]">
      {!isAppLanding && <Navigation walletConnected={true} planType="Premium" />}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/pools" element={<PoolsOverview />} />
        <Route path="/pool/:id" element={<PoolDetailPage />} />
        <Route path="/pool/:id/pro" element={<PoolDetailProPage />} />
        <Route path="/pool/:id/universe" element={<PoolUniversePage />} />
        <Route path="/position/:id/pro" element={<PositionProPage />} />
        <Route path="/pool-overview/:id" element={<PoolOverviewPage />} />
        <Route path="/portfolio" element={<WalletOverview hasPositions={true} isPro={false} />} />
        <Route path="/portfolio/pro" element={<WalletOverviewPro hasPositions={true} />} />
        <Route path="/portfolio-premium" element={<WalletOverview hasPositions={true} isPro={false} />} />
        <Route path="/portfolio-pro" element={<WalletOverviewPro hasPositions={true} />} />
        <Route path="/wallet-empty" element={<WalletOverview hasPositions={false} isPro={false} />} />
        
        {/* Legacy routes - redirect to new names */}
        <Route path="/koen" element={<Navigate to="/portfolio" replace />} />
        <Route path="/koen/pro" element={<Navigate to="/portfolio/pro" replace />} />
        <Route path="/wallet-pro" element={<Navigate to="/portfolio-pro" replace />} />
        
        <Route path="/rangeband" element={<RangeBandExplainer />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/legal/:page" element={<LegalPage />} />
        <Route path="/icons" element={<IconShowcase />} />
        <Route path="/screenshot-generator" element={<ScreenshotGeneratorPage />} />
        <Route path="/rangeband-ds" element={<RangeBandDS />} />
        <Route path="/overview" element={<ComponentOverviewPage />} />
        <Route path="/ds-summary" element={<DSScreensSummary />} />
        <Route path="/ds-summary-page" element={<DSSummaryPage />} />
        <Route path="/idepot-doc" element={<IDepotDocPage />} />
        <Route path="/technical-brief" element={<TechnicalBriefPage />} />
        <Route path="/weekly-report-template" element={<WeeklyReportTemplate />} />
        <Route path="/app-landing" element={<AppLandingPage />} />

        {/* Admin Routes - Internal Only */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/status" element={<AdminStatusPage />} />
        
        {/* Catch-all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!isAppLanding && (
        <>
          <CookieBanner />
          <ScreenshotButton />
          <OverviewButton />
        </>
      )}
      <Toaster position="bottom-right" />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}