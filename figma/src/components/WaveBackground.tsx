import backgroundImage from "figma:asset/17488f69d506bd0cdc4765b3014fd6f2d1e0243a.png";

export function WaveBackground() {
  return (
    <>
      {/* Dark base layer - matching the image */}
      <div className="fixed inset-0 bg-[#111216] z-0" />
      
      {/* Background image - full viewport */}
      <div 
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Subtle gradient overlay - from dark (top) to transparent (middle/bottom) */}
      <div 
        className="fixed inset-0 z-[2] pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(17, 18, 22, 0.3) 0%, transparent 40%)',
        }}
      />
    </>
  );
}