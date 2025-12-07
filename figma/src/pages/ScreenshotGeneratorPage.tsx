import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { 
  Camera, 
  Download, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft,
  FileImage,
  Upload,
  ExternalLink,
  Info
} from "lucide-react";

interface PageRoute {
  path: string;
  name: string;
  description: string;
  category: "Core" | "Detail" | "Account" | "Info" | "DevTools";
}

const pages: PageRoute[] = [
  // Core Pages
  { path: "/", name: "HomePage", description: "Hero + value propositions", category: "Core" },
  { path: "/pools", name: "PoolsOverview", description: "Grid + List views", category: "Core" },
  { path: "/rangeband", name: "RangeBandExplainer", description: "Educational page", category: "Core" },
  { path: "/pricing", name: "PricingPage", description: "3 tiers + comparison", category: "Core" },
  
  // Detail Pages
  { path: "/pool/22003", name: "PoolDetailPage", description: "Standard analytics view", category: "Detail" },
  { path: "/pool/22003/pro", name: "PoolDetailProPage", description: "PRO analytics view", category: "Detail" },
  { path: "/koen", name: "WalletOverview", description: "Portfolio + positions", category: "Detail" },
  
  // Account & Settings
  { path: "/account", name: "AccountPage", description: "Profile + subscription", category: "Account" },
  { path: "/status", name: "StatusPage", description: "System status", category: "Account" },
  
  // Info Pages
  { path: "/faq", name: "FAQPage", description: "Frequently asked questions", category: "Info" },
  { path: "/legal/terms", name: "Legal-Terms", description: "Terms of service", category: "Info" },
  { path: "/legal/privacy", name: "Legal-Privacy", description: "Privacy policy", category: "Info" },
  { path: "/legal/cookies", name: "Legal-Cookies", description: "Cookie policy", category: "Info" },
  
  // Dev Tools (optional - uncomment to include in screenshots)
  // { path: "/overview", name: "ComponentOverview", description: "Navigation hub", category: "DevTools" },
  // { path: "/icons", name: "IconShowcase", description: "All icons", category: "DevTools" },
  // { path: "/rangeband-ds", name: "RangeBandDS", description: "Design system", category: "DevTools" },
];

type ScreenshotStatus = "pending" | "processing" | "success" | "error";

interface ScreenshotResult {
  page: PageRoute;
  status: ScreenshotStatus;
  blob?: Blob;
  error?: string;
}

export function ScreenshotGeneratorPage() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<ScreenshotResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const generateScreenshots = async () => {
    setIsGenerating(true);
    setResults([]);
    setCurrentIndex(0);
    setProgress(0);

    const newResults: ScreenshotResult[] = pages.map(page => ({
      page,
      status: "pending" as ScreenshotStatus
    }));
    setResults(newResults);

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      
      // Update status to processing
      newResults[i].status = "processing";
      setResults([...newResults]);
      setCurrentIndex(i);

      try {
        // Navigate to page
        navigate(page.path);
        
        // Wait for page to render
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Hide screenshot button if present
        const screenshotBtn = document.querySelector('[data-screenshot-button]');
        if (screenshotBtn) {
          (screenshotBtn as HTMLElement).style.display = 'none';
        }

        // Dynamic import of html2canvas
        const html2canvas = (await import('html2canvas@1.4.1')).default;

        // Take screenshot
        const canvas = await html2canvas(document.body, {
          backgroundColor: '#0B1530',
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
        });

        // Show screenshot button again
        if (screenshotBtn) {
          (screenshotBtn as HTMLElement).style.display = '';
        }

        // Convert to blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), 'image/png');
        });

        newResults[i].status = "success";
        newResults[i].blob = blob;
      } catch (error) {
        // Show screenshot button again in case of error
        const screenshotBtn = document.querySelector('[data-screenshot-button]');
        if (screenshotBtn) {
          (screenshotBtn as HTMLElement).style.display = '';
        }
        
        newResults[i].status = "error";
        newResults[i].error = error instanceof Error ? error.message : "Unknown error";
      }

      setResults([...newResults]);
      setProgress(((i + 1) / pages.length) * 100);
    }

    // Navigate back to screenshot generator
    navigate("/screenshot-generator");
    setIsGenerating(false);

    // Auto-download all successful screenshots
    setTimeout(() => {
      newResults.forEach((result, index) => {
        if (result.blob) {
          const url = URL.createObjectURL(result.blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Liquilab-${String(index + 1).padStart(2, '0')}-${result.page.name}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      });
    }, 500);
  };

  const downloadAll = () => {
    results.forEach((result, index) => {
      if (result.blob) {
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Liquilab-${String(index + 1).padStart(2, '0')}-${result.page.name}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    });
  };

  const downloadSingle = (result: ScreenshotResult, index: number) => {
    if (result.blob) {
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Liquilab-${String(index + 1).padStart(2, '0')}-${result.page.name}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const successCount = results.filter(r => r.status === "success").length;
  const errorCount = results.filter(r => r.status === "error").length;

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10 max-w-[1200px] mx-auto px-8 py-8">
        {/* Header */}
        <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-[#3B82F6] mb-6 transition-colors">
          <ArrowLeft className="size-4" />
          Back to Home
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="bg-[#3B82F6]/20 rounded-lg p-3">
              <Camera className="size-8 text-[#3B82F6]" />
            </div>
            <div>
              <h1 className="text-white/95">
                Screenshot Generator
              </h1>
              <p className="text-white/70">
                Generate screenshots of all Liquilab pages for Uizard export
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <Info className="size-5 text-[#3B82F6] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white/95 font-medium mb-2">How to use</h3>
              <ol className="text-sm text-white/70 space-y-2 list-decimal list-inside">
                <li>Click "Generate All Screenshots" to start automatic capture</li>
                <li>Wait while the tool navigates through all {pages.length} pages (~{pages.length * 2} seconds)</li>
                <li>Download all screenshots when complete</li>
                <li>Go to <a href="https://uizard.io" target="_blank" rel="noopener noreferrer" className="text-[#3B82F6] hover:underline inline-flex items-center gap-1">uizard.io <ExternalLink className="size-3" /></a> and create a new project</li>
                <li>Choose "Screenshot" as input method and upload your images</li>
                <li>Uizard AI will convert them to editable designs ✨</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-heading text-white/95 mb-2">
                {pages.length} Pages Ready
              </h2>
              <p className="text-sm text-white/70">
                {isGenerating ? `Processing ${currentIndex + 1}/${pages.length}...` : "Click to start generating screenshots"}
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={generateScreenshots}
                disabled={isGenerating}
                className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Camera className="size-4" />
                    Generate All Screenshots
                  </>
                )}
              </Button>

              {successCount > 0 && (
                <Button
                  onClick={downloadAll}
                  variant="outline"
                  className="border-white/20 text-white/95 hover:bg-white/5 gap-2"
                >
                  <Download className="size-4" />
                  Download All ({successCount})
                </Button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {isGenerating && (
            <div className="mb-6">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-white/70 mt-2">
                {Math.round(progress)}% complete
              </p>
            </div>
          )}

          {/* Summary Stats */}
          {results.length > 0 && !isGenerating && (
            <div className="flex gap-4 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-[#10B981]" />
                <span className="text-white/95 numeric">{successCount}</span>
                <span className="text-white/70 text-sm">Successful</span>
              </div>
              {errorCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="size-5 rounded-full bg-[#EF4444]/20 flex items-center justify-center">
                    <div className="size-2 rounded-full bg-[#EF4444]" />
                  </div>
                  <span className="text-white/95 numeric">{errorCount}</span>
                  <span className="text-white/70 text-sm">Failed</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pages List */}
        <div className="space-y-4">
          {["Core", "Detail", "Account", "Info"].map((category) => {
            const categoryPages = pages.filter(p => p.category === category);
            const categoryResults = results.filter(r => r.page.category === category);
            
            return (
              <div key={category}>
                <h3 className="text-lg font-heading text-white/95 mb-3">
                  {category} Pages ({categoryPages.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryPages.map((page, idx) => {
                    const pageIndex = pages.indexOf(page);
                    const result = results[pageIndex];
                    
                    return (
                      <div
                        key={page.path}
                        className="bg-[#0F1A36]/95 border border-white/10 rounded-lg p-6 hover:border-white/20 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-white/95">{page.name}</h4>
                              {result?.status === "success" && (
                                <CheckCircle2 className="size-4 text-[#10B981]" />
                              )}
                              {result?.status === "processing" && (
                                <Loader2 className="size-4 text-[#3B82F6] animate-spin" />
                              )}
                              {result?.status === "error" && (
                                <div className="size-4 rounded-full bg-[#EF4444]/20 flex items-center justify-center">
                                  <div className="size-2 rounded-full bg-[#EF4444]" />
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-white/[0.58]">{page.description}</p>
                            <code className="text-xs text-white/40 mt-1 block">{page.path}</code>
                          </div>
                          
                          {result?.status === "success" && (
                            <Button
                              onClick={() => downloadSingle(result, pageIndex)}
                              variant="ghost"
                              size="sm"
                              className="text-white/70 hover:text-white/95"
                            >
                              <Download className="size-4" />
                            </Button>
                          )}
                        </div>

                        {result?.error && (
                          <p className="text-xs text-[#EF4444] mt-2">
                            Error: {result.error}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Upload to Uizard CTA */}
        {successCount > 0 && (
          <div className="bg-gradient-to-r from-[#3B82F6]/20 to-[#1BE8D2]/20 border border-[#3B82F6]/30 rounded-lg p-8 mt-8">
            <div className="flex items-center gap-4">
              <div className="bg-[#3B82F6]/20 rounded-lg p-4">
                <Upload className="size-8 text-[#3B82F6]" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-heading text-white/95 mb-2">
                  Ready to Upload to Uizard
                </h3>
                <p className="text-white/70 mb-4">
                  You have {successCount} screenshot{successCount !== 1 ? 's' : ''} ready to upload. Go to Uizard and create a new project from screenshots.
                </p>
                <Button
                  onClick={() => window.open('https://uizard.io/projects', '_blank')}
                  className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 gap-2"
                >
                  Open Uizard
                  <ExternalLink className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}