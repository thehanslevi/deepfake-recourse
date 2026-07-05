import { ImageResponse } from "next/og";

// Social-share card. Rendered at request time by next/og; brand colors are
// inlined because CSS variables are not available in this context.
export const runtime = "edge";
export const alt =
  "Deepfake Recourse. Recourse for a voice or likeness cloned without consent.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#dfe4dc",
          color: "#16180f",
          padding: 72,
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 28,
          }}
        >
          <span>
            deepfake recourse<span style={{ color: "#2f2bd1" }}>*</span>
          </span>
          <span style={{ color: "#5f665a", letterSpacing: 4 }}>V1</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          <div style={{ width: 64, height: 4, background: "#2f2bd1" }} />
          <div
            style={{
              fontSize: 64,
              lineHeight: 1.1,
              maxWidth: 980,
              fontFamily: "serif",
            }}
          >
            Recourse for a voice or likeness cloned without consent.
          </div>
          <div style={{ fontSize: 28, color: "#5f665a" }}>
            The tool assembles and drafts. A human files.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
