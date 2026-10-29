import { ImageResponse } from "next/og";

export const alt = "Foundly — Get recommended when customers ask AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social share card for every page without its own image. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#f7f7f3", color: "#20221e" }}>
        <div style={{ fontSize: 40, fontWeight: 700 }}>Foundly</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>Get recommended when customers ask AI.</div>
          <div style={{ fontSize: 32, color: "#4b554f" }}>AI search visibility for local businesses on ChatGPT, Gemini, Perplexity and Claude.</div>
        </div>
        <div style={{ fontSize: 26, color: "#65745e" }}>foundly.co.in</div>
      </div>
    ),
    size,
  );
}
