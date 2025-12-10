import type { NextPage } from "next";
import Image from "next/image";
import { GlobalCtaButton } from '@/components/GlobalCtaButton';
import { Navigation } from '@/components/Navigation';

const HomePage: NextPage = () => {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        fontFamily:
          "'Manrope', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Dark base layer */}
      <div
        style={{
          position: "fixed",
          inset: "0",
          backgroundColor: "#0B1530",
          zIndex: 0,
        }}
      />

      {/* Background image - water wave at bottom */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          height: "70vh",
          zIndex: 1,
          pointerEvents: "none",
        }}
      >
        <Image
          src="/media/wave-hero.png"
          alt=""
          fill
          style={{
            objectFit: "cover",
            objectPosition: "bottom center",
          }}
          priority
          quality={95}
          className="opacity-90"
        />
      </div>

      {/* Smooth gradient overlay - from dark navy to transparent */}
      <div
        style={{
          position: "fixed",
          inset: "0",
          zIndex: 2,
          pointerEvents: "none",
          background:
            "linear-gradient(to bottom, #0B1530 0%, #0B1530 15%, rgba(11, 21, 48, 0.95) 25%, rgba(11, 21, 48, 0.85) 35%, rgba(11, 21, 48, 0.65) 45%, rgba(11, 21, 48, 0.4) 55%, rgba(11, 21, 48, 0.2) 65%, rgba(11, 21, 48, 0.05) 75%, transparent 85%)",
        }}
      />

      {/* Global Navigation */}
      <Navigation className="relative z-50 bg-transparent" />

      {/* Content */}
      <main
        style={{
          position: "relative",
          zIndex: 3,
          minHeight: "calc(100vh - 84px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: "42rem",
            textAlign: "center",
          }}
        >
          {/* Logo - Removed as it is now in Navigation */}
          
          {/* Heading */}
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 700,
              color: "rgba(255, 255, 255, 0.98)",
              lineHeight: 1.15,
              marginBottom: "1.25rem",
              marginTop: "-4rem", // Slight visual offset to center vertically
            }}
          >
            Non-custodial liquidity analytics for Flare LPs.
          </h1>

          {/* Subheading */}
          <p
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.125rem)",
              color: "rgba(255, 255, 255, 0.75)",
              maxWidth: "38rem",
              margin: "0 auto 2.5rem",
              lineHeight: 1.6,
            }}
          >
            Liquilab is preparing its first public release. Track your
            concentrated liquidity positions on Flare with RangeBand™ insights
            and Universe analytics.
          </p>

          {/* Contact CTA */}
          <div
            style={{
              marginTop: "2.5rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <p
              style={{
                fontSize: "0.875rem",
                color: "rgba(255, 255, 255, 0.65)",
                fontWeight: 500,
              }}
            >
              Want to know more, or interested in early access?
            </p>
            <GlobalCtaButton className="mt-6" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
