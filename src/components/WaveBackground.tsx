import React from "react";

type Props = { 
  className?: string;
  children?: React.ReactNode;
};

export function WaveBackground({ className = "", children }: Props) {
  // If no children, just render the background layer (absolute positioned, no height)
  if (!children) {
    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden z-0 ${className}`}>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1200px 600px at 50% 10%, rgba(59,130,246,0.30), transparent 60%)," +
              "radial-gradient(900px 500px at 20% 35%, rgba(27,232,210,0.20), transparent 55%)," +
              "radial-gradient(900px 500px at 80% 45%, rgba(59,130,246,0.18), transparent 55%)",
            opacity: 1,
          }}
        />
      </div>
    );
  }

  // If children provided, wrap them with the background
  return (
    <div className={`relative min-h-screen ${className}`}>
      {/* Wave gradient background layer */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1200px 600px at 50% 10%, rgba(59,130,246,0.30), transparent 60%)," +
              "radial-gradient(900px 500px at 20% 35%, rgba(27,232,210,0.20), transparent 55%)," +
              "radial-gradient(900px 500px at 80% 45%, rgba(59,130,246,0.18), transparent 55%)",
            opacity: 1,
          }}
        />
      </div>
      {/* Content */}
      {children}
    </div>
  );
}

export default WaveBackground;
