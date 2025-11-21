import type { NextPage } from "next";
import Image from "next/image";

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
          src="/water-splash.jpg"
          alt=""
          fill
          style={{
            objectFit: "cover",
            objectPosition: "bottom center",
          }}
          priority
          quality={95}
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

      {/* Content */}
      <main
        style={{
          position: "relative",
          zIndex: 3,
          minHeight: "100vh",
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
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              marginBottom: "2.5rem",
            }}
          >
            <svg
              width="36"
              height="43"
              viewBox="0 0 40 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ flexShrink: 0 }}
            >
              <path
                d="M20 0C20 0 0 18 0 30C0 40.4934 8.95431 48 20 48C31.0457 48 40 40.4934 40 30C40 18 20 0 20 0Z"
                fill="#3B82F6"
              />
            </svg>
            <span
              style={{
                fontSize: "1.75rem",
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.98)",
                letterSpacing: "-0.02em",
              }}
            >
              LiquiLab
            </span>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 700,
              color: "rgba(255, 255, 255, 0.98)",
              lineHeight: 1.15,
              marginBottom: "1.25rem",
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
            LiquiLab is preparing its first public release. Track your
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
            <a
              href="mailto:hello@liquilab.io"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.5rem",
                borderRadius: "9999px",
                backgroundColor: "#3B82F6",
                color: "#ffffff",
                fontSize: "0.9375rem",
                fontWeight: 600,
                textDecoration: "none",
                boxShadow:
                  "0 10px 20px -5px rgba(59, 130, 246, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#2563EB";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 15px 25px -5px rgba(59, 130, 246, 0.5), 0 6px 8px -2px rgba(0, 0, 0, 0.4)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#3B82F6";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 10px 20px -5px rgba(59, 130, 246, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)";
              }}
            >
              hello@liquilab.io
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
