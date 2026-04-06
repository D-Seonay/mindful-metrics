import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Mindful Metrics Training";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const title = params.slug.replace(/-/g, " ").toUpperCase();

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
          color: "#f4f4f5", 
          fontSize: 84, 
          fontWeight: 900, 
          letterSpacing: "-0.05em",
          display: "flex"
        }}>
          {title}
        </div>
        <div style={{ 
          color: "#a1a1aa", 
          fontSize: 32, 
          marginTop: 24,
          letterSpacing: "0.2em",
          display: "flex"
        }}>
          MINDFUL METRICS // COGNITIVE AGILITY
        </div>
      </div>
    ),
    { ...size }
  );
}
