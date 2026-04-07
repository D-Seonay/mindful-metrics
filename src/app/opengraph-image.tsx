import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Mindful Metrics - Cognitive Performance Training";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#09090b",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #27272a",
        }}
      >
        <div style={{ 
          display: "flex",
          alignItems: "center",
          gap: "20px",
          marginBottom: "20px"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            background: "#3b82f6",
            borderRadius: "50%"
          }} />
          <div style={{ color: "#f4f4f5", fontSize: 84, fontWeight: 900, letterSpacing: "-0.05em" }}>
            MINDFUL METRICS
          </div>
        </div>
        <div style={{ color: "#a1a1aa", fontSize: 32, letterSpacing: "0.2em" }}>
          SHARPEN YOUR MENTAL AGILITY
        </div>
      </div>
    ),
    { ...size }
  );
}
