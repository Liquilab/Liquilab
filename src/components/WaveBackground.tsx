import React from "react";

type Props = {
  className?: string;
  opacity?: number;
};

export default function WaveBackground({ className = "", opacity = 0.22 }: Props) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          opacity,
          background:
            "radial-gradient(1200px 600px at 50% 10%, rgba(59,130,246,0.30), transparent 60%)," +
            "radial-gradient(900px 500px at 20% 35%, rgba(27,232,210,0.20), transparent 55%)," +
            "radial-gradient(900px 500px at 80% 45%, rgba(59,130,246,0.18), transparent 55%)",
        }}
      />
      <div
        className="absolute -bottom-24 left-1/2 h-[420px] w-[1600px] -translate-x-1/2 rounded-[100%]"
        style={{
          opacity: opacity * 0.9,
          background:
            "linear-gradient(180deg, rgba(11,21,48,0) 0%, rgba(11,21,48,0.55) 45%, rgba(11,21,48,1) 100%)",
          filter: "blur(0px)",
        }}
      />
    </div>
  );
}
