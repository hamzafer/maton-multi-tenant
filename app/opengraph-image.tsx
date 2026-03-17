import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Maton — Multi-tenant API Gateway Demo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#060608",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background grid dots */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Emerald glow - top left */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(52,211,153,0.15) 0%, transparent 70%)",
            top: -150,
            left: -100,
            filter: "blur(80px)",
          }}
        />

        {/* Indigo glow - bottom right */}
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(129,140,248,0.08) 0%, transparent 70%)",
            bottom: -120,
            right: -80,
            filter: "blur(80px)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* Logo mark */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "rgba(52,211,153,0.1)",
              border: "1px solid rgba(52,211,153,0.2)",
              marginBottom: 32,
              boxShadow: "0 0 60px rgba(52,211,153,0.15)",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#34d399"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
              />
            </svg>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#f0f0f4",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            Maton
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 22,
              color: "#9494a8",
              textAlign: "center",
              maxWidth: 600,
              lineHeight: 1.5,
            }}
          >
            Multi-tenant API gateway demo
          </div>

          {/* App pills */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 40,
            }}
          >
            {[
              { name: "Sheets", color: "#34A853" },
              { name: "Slack", color: "#E01E5A" },
              { name: "Gmail", color: "#EA4335" },
              { name: "Notion", color: "#FFFFFF" },
              { name: "GitHub", color: "#FFFFFF" },
            ].map((app) => (
              <div
                key={app.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: app.color,
                    opacity: 0.8,
                  }}
                />
                <span style={{ fontSize: 14, color: "#9494a8", fontWeight: 500 }}>
                  {app.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            background: "linear-gradient(to right, transparent, rgba(52,211,153,0.4), transparent)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
