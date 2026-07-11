// src/common/components/ShalaOneLogo.jsx
// Custom vector mark for ShalaOne ERP — replaces the old KaryaSoft raster logo
// on the login screen. Pure SVG, so it stays crisp at any size and needs no
// image asset.

export default function ShalaOneLogo({ className = '' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="ShalaOne ERP logo"
    >
      <defs>
        <linearGradient id="soGoldFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"  stopColor="#e8c88a" />
          <stop offset="55%" stopColor="#c8a96e" />
          <stop offset="100%" stopColor="#9c7b45" />
        </linearGradient>
      </defs>

      {/* Hexagonal badge outline */}
      <polygon
        points="32,3 58,17.5 58,46.5 32,61 6,46.5 6,17.5"
        fill="none"
        stroke="url(#soGoldFill)"
        strokeWidth="2"
      />

      {/* "S" monogram, echoes the Playfair Display wordmark beside it */}
      <text
        x="32"
        y="41"
        textAnchor="middle"
        fontFamily="'Playfair Display', serif"
        fontSize="27"
        fontWeight="700"
        fill="url(#soGoldFill)"
      >
        S
      </text>

      {/* Accent dot — nods to "One" as a single unified platform */}
      <circle cx="45.5" cy="19" r="3" fill="#e8c88a" />
    </svg>
  );
}
