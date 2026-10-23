import { ImageResponse } from "next/og";
import { photos } from "@/lib/sample-data";

// The preview card shown when someone shares a Pawred link (1200×630).
export const alt = "Pawred: careful matchmaking for dogs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Load the Gloock display face from Google Fonts (TTF, which ImageResponse needs).
// If that fails, the image still renders with the default font.
async function loadGloock() {
  try {
    const css = await fetch("https://fonts.googleapis.com/css2?family=Gloock&display=swap", {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1)" }, // older UA → TTF instead of WOFF2
    }).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
    return url ? await fetch(url).then((r) => r.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

export default async function OpenGraphImage() {
  const gloock = await loadGloock();
  const display = gloock ? "Gloock" : "serif";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f4ede1", color: "#1e1a16", padding: 72 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: display, fontSize: 44 }}>
            <div style={{ width: 44, height: 44, borderRadius: 44, background: "#e8a13a", border: "6px solid #c9831f" }} />
            Pawred
          </div>
          <div style={{ display: "flex", fontFamily: display, fontSize: 92, lineHeight: 1, letterSpacing: -2, maxWidth: 820 }}>
            Find a match your dog would choose.
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#5b5248", maxWidth: 700 }}>
            Health-checked profiles, breed-aware matching, and likes that say why.
          </div>
        </div>
        <div style={{ display: "flex", width: 300, background: "#16352a", borderRadius: 32, marginLeft: 40, overflow: "hidden" }}>
          {/* Same Unsplash photo as the landing page hero. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${photos.bruno}?w=600&h=972&fit=crop&q=75`} alt="" width={300} height={486} style={{ objectFit: "cover" }} />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: gloock ? [{ name: "Gloock", data: gloock, style: "normal", weight: 400 }] : undefined,
    },
  );
}
