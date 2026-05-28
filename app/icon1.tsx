import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
  width: 192,
  height: 192,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#09090b",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="192"
          height="192"
          viewBox="0 0 100 100"
          fill="none"
          style={{ width: "100%", height: "100%" }}
        >
          <defs>
            <linearGradient id="veyrGradient" x1="20" y1="80" x2="80" y2="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="50%" stopColor="#2dd4bf" />
            </linearGradient>
          </defs>

          {/* The Main Vertex Track */}
          <path
            d="M20 35 L45 80 L80 25"
            stroke="url(#veyrGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* The Forward Arrowhead */}
          <path
            d="M55 25 L80 25 L80 50"
            stroke="url(#veyrGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* The System Nodes */}
          <circle cx="32.5" cy="57.5" r="6" fill="#09090b" stroke="url(#veyrGradient)" strokeWidth="3" />
          <circle cx="62.5" cy="50" r="6" fill="#09090b" stroke="url(#veyrGradient)" strokeWidth="3" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
