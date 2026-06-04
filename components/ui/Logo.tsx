import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  id?: string;
}

export default function Logo({ className = "", size = 24, id = "default" }: LogoProps) {
  const gradientId = `veyrGradientLogo-${id}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="20" y1="80" x2="80" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="50%" stopColor="#2dd4bf" />
        </linearGradient>
      </defs>

      {/* The Main Vertex Track */}
      <path
        d="M20 35 L45 80 L80 25"
        stroke={`url(#${gradientId})`}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* The Forward Arrowhead */}
      <path
        d="M55 25 L80 25 L80 50"
        stroke={`url(#${gradientId})`}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* The System Nodes */}
      <circle cx="32.5" cy="57.5" r="6" fill="#09090b" stroke={`url(#${gradientId})`} strokeWidth="3" />
      <circle cx="62.5" cy="50" r="6" fill="#09090b" stroke={`url(#${gradientId})`} strokeWidth="3" />
    </svg>
  );
}
