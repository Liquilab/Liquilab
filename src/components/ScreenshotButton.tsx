import { useState } from "react";
import { Camera, Download, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner@2.0.3";

export function ScreenshotButton() {
  const [isCapturing, setIsCapturing] = useState(false);

  const captureScreenshot = async () => {
    setIsCapturing(true);
    
    try {
      // Dynamic import of html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      // Get the root element
      const element = document.documentElement;
      
      // Scroll to top for full capture
      const originalScrollPosition = window.scrollY;
      window.scrollTo(0, 0);
      
      // Wait a bit for scroll to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      let canvas;
      
      try {
        // Try with foreignObjectRendering first (better for modern CSS)
        canvas = await html2canvas(element, {
          allowTaint: true,
          useCORS: true,
          scrollY: -window.scrollY,
          scrollX: -window.scrollX,
          windowWidth: document.documentElement.scrollWidth,
          windowHeight: document.documentElement.scrollHeight,
          backgroundColor: '#0B1530',
          foreignObjectRendering: true,
          scale: 2,
          logging: false,
          ignoreElements: (el) => {
            if (el.tagName === 'IFRAME' || el.tagName === 'SCRIPT') {
              return true;
            }
            return false;
          },
        });
      } catch (foreignObjectError) {
        console.warn('Foreign object rendering failed, trying standard rendering:', foreignObjectError);
        
        // Fallback to standard rendering without foreignObjectRendering
        canvas = await html2canvas(element, {
          allowTaint: true,
          useCORS: true,
          scrollY: -window.scrollY,
          scrollX: -window.scrollX,
          windowWidth: document.documentElement.scrollWidth,
          windowHeight: document.documentElement.scrollHeight,
          backgroundColor: '#0B1530',
          scale: 2,
          logging: false,
          ignoreElements: (el) => {
            if (el.tagName === 'IFRAME' || el.tagName === 'SCRIPT') {
              return true;
            }
            return false;
          },
          // Skip computed styles that might have oklab
          onclone: (clonedDoc) => {
            // Remove potentially problematic styles from cloned document
            const allElements = clonedDoc.querySelectorAll('*');
            allElements.forEach((el) => {
              if (el instanceof HTMLElement) {
                const style = el.style;
                // Reset any properties that might use oklab/oklch
                const computedStyle = window.getComputedStyle(el);
                if (computedStyle.color && (computedStyle.color.includes('oklab') || computedStyle.color.includes('oklch'))) {
                  style.color = '#ffffff';
                }
                if (computedStyle.backgroundColor && (computedStyle.backgroundColor.includes('oklab') || computedStyle.backgroundColor.includes('oklch'))) {
                  style.backgroundColor = '#0B1530';
                }
              }
            });
          },
        });
      }
      
      // Restore scroll position
      window.scrollTo(0, originalScrollPosition);
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error("Failed to create screenshot");
          return;
        }
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        // Generate filename with timestamp and page name
        const pageName = window.location.hash.slice(1).replace(/\//g, '-') || 'home';
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        link.download = `liquilab-${pageName}-${timestamp}.png`;
        
        link.href = url;
        link.click();
        
        // Cleanup
        URL.revokeObjectURL(url);
        
        toast.success("Screenshot downloaded successfully");
      }, 'image/png');
      
    } catch (error) {
      console.error('Screenshot error:', error);
      toast.error("Failed to capture screenshot");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
      data-screenshot-button
    >
      {/* Info label (shows on hover) */}
      <div className="opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="bg-[#0F1A36]/95 border border-white/10 rounded-lg px-3 py-2 mb-2">
          <p className="font-['Manrope',sans-serif] text-white/70 whitespace-nowrap">
            Marketing Screenshot
          </p>
        </div>
      </div>
      
      {/* Screenshot button */}
      <Button
        onClick={captureScreenshot}
        disabled={isCapturing}
        className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-14 w-14 rounded-full p-0 group"
        title="Download page screenshot for marketing"
      >
        {isCapturing ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <div className="relative">
            <Camera className="h-6 w-6 transition-transform group-hover:scale-110" />
            <Download className="h-3 w-3 absolute -bottom-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </Button>
      
      {/* Subtle indicator */}
      {isCapturing && (
        <div className="absolute -top-2 -right-2">
          <span className="flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1BE8D2] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#1BE8D2]"></span>
          </span>
        </div>
      )}
    </div>
  );
}