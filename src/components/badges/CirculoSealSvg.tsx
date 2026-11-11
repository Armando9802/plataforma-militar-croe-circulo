import React from 'react';

interface CirculoSealSvgProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const CirculoSealSvg: React.FC<CirculoSealSvgProps> = ({
  className = '',
  size = 64,
  glow = false
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${glow ? 'drop-shadow-[0_0_12px_rgba(200,160,81,0.5)]' : 'drop-shadow-md'} transition-transform duration-300 ${className}`}
      aria-label="Sello Institucional Círculo Militar del Ecuador"
      role="img"
    >
      <defs>
        {/* Navy Gradient */}
        <linearGradient id="circuloNavyGradient" x1="20" y1="20" x2="220" y2="220" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#254B82" />
          <stop offset="50%" stopColor="#1B365D" />
          <stop offset="100%" stopColor="#0B1526" />
        </linearGradient>

        {/* Imperial Gold Gradient */}
        <linearGradient id="imperialGoldGradient" x1="0" y1="0" x2="240" y2="240" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF4D0" />
          <stop offset="20%" stopColor="#E5C578" />
          <stop offset="55%" stopColor="#C8A051" />
          <stop offset="85%" stopColor="#8C6826" />
          <stop offset="100%" stopColor="#D8B263" />
        </linearGradient>

        {/* Steel Blade Gradient */}
        <linearGradient id="bladeSteel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#E2E8F0" />
          <stop offset="70%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        {/* Deep Core Navy */}
        <radialGradient id="circuloCoreNavy" cx="120" cy="120" r="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2B528D" />
          <stop offset="70%" stopColor="#132742" />
          <stop offset="100%" stopColor="#091424" />
        </radialGradient>

        {/* Text Paths */}
        {/* Top curved path for CÍRCULO MILITAR DEL ECUADOR */}
        <path
          id="circuloTopTextPath"
          d="M 32 120 A 88 88 0 0 1 208 120"
          fill="none"
        />
        {/* Bottom curved path for FUNDADO EN 1918 */}
        <path
          id="circuloBottomTextPath"
          d="M 206 120 A 86 86 0 0 1 34 120"
          fill="none"
        />

        {/* Bevel Filter */}
        <filter id="circuloBevel" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Outer Military Medal Cog / Dentated Rim (Beaded border) */}
      <circle
        cx="120"
        cy="120"
        r="114"
        fill="url(#imperialGoldGradient)"
        stroke="#594011"
        strokeWidth="1.5"
      />
      {/* 36 Decorative Military Rivets/Dots along the outer perimeter */}
      {Array.from({ length: 36 }).map((_, i) => {
        const angle = (i * 360) / 36 * (Math.PI / 180);
        const x = 120 + 110 * Math.cos(angle);
        const y = 120 + 110 * Math.sin(angle);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="1.75"
            fill="#FFF6D8"
            stroke="#594011"
            strokeWidth="0.5"
          />
        );
      })}

      {/* Outer Gold Ring Step */}
      <circle
        cx="120"
        cy="120"
        r="104"
        fill="#11233D"
        stroke="url(#imperialGoldGradient)"
        strokeWidth="2.5"
      />

      {/* Broad Navy Blue Lettering Ring */}
      <circle
        cx="120"
        cy="120"
        r="102"
        fill="url(#circuloNavyGradient)"
      />

      {/* Inner Gold Border Ring */}
      <circle
        cx="120"
        cy="120"
        r="72"
        fill="none"
        stroke="url(#imperialGoldGradient)"
        strokeWidth="3"
        filter="url(#circuloBevel)"
      />

      {/* Inner Central Field */}
      <circle
        cx="120"
        cy="120"
        r="70"
        fill="url(#circuloCoreNavy)"
      />

      {/* Radiant Sunburst Rays in Central Field */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i * 22.5) * (Math.PI / 180);
        const x2 = 120 + 68 * Math.cos(angle);
        const y2 = 120 + 68 * Math.sin(angle);
        return (
          <line
            key={i}
            x1="120"
            y1="120"
            x2={x2}
            y2={y2}
            stroke="#C8A051"
            strokeWidth="0.75"
            opacity="0.25"
          />
        );
      })}

      {/* Top Arc Curved Typography: CÍRCULO MILITAR DEL ECUADOR */}
      <text
        fill="url(#imperialGoldGradient)"
        fontSize="12.5"
        fontWeight="800"
        fontFamily="'Cinzel', 'Georgia', serif"
        letterSpacing="2.2"
        filter="url(#circuloBevel)"
      >
        <textPath
          href="#circuloTopTextPath"
          startOffset="50%"
          textAnchor="middle"
        >
          CÍRCULO MILITAR DEL ECUADOR
        </textPath>
      </text>

      {/* Bottom Arc Curved Typography: • FUNDADO EN 1918 • */}
      <text
        fill="url(#imperialGoldGradient)"
        fontSize="11"
        fontWeight="700"
        fontFamily="'Cinzel', 'Georgia', serif"
        letterSpacing="3"
        filter="url(#circuloBevel)"
      >
        <textPath
          href="#circuloBottomTextPath"
          startOffset="50%"
          textAnchor="middle"
        >
          ★ FUNDADO EN 1918 ★
        </textPath>
      </text>

      {/* Crossed Officer Sabres / Swords */}
      <g filter="url(#circuloBevel)">
        {/* Sword 1: Top-Left to Bottom-Right */}
        <g transform="rotate(45 120 120)">
          {/* Blade */}
          <path
            d="M 118 64 L 120 48 L 122 64 L 121.5 146 L 118.5 146 Z"
            fill="url(#bladeSteel)"
            stroke="#334155"
            strokeWidth="0.5"
          />
          {/* Blood groove / fuller */}
          <line x1="120" y1="66" x2="120" y2="140" stroke="#64748B" strokeWidth="0.8" />
          {/* Crossguard / Quillon in Gold */}
          <path
            d="M 108 146 C 114 145 126 145 132 146 C 133 148 131 150 120 150 C 109 150 107 148 108 146 Z"
            fill="url(#imperialGoldGradient)"
            stroke="#594011"
            strokeWidth="0.5"
          />
          {/* Hilt / Grip in Dark Leather */}
          <rect x="118.5" y="150" width="3" height="14" rx="1" fill="#1E293B" stroke="#94A3B8" strokeWidth="0.3" />
          {/* Pommel */}
          <circle cx="120" cy="167" r="3.5" fill="url(#imperialGoldGradient)" stroke="#594011" strokeWidth="0.5" />
        </g>

        {/* Sword 2: Top-Right to Bottom-Left */}
        <g transform="rotate(-45 120 120)">
          {/* Blade */}
          <path
            d="M 118 64 L 120 48 L 122 64 L 121.5 146 L 118.5 146 Z"
            fill="url(#bladeSteel)"
            stroke="#334155"
            strokeWidth="0.5"
          />
          {/* Fuller */}
          <line x1="120" y1="66" x2="120" y2="140" stroke="#64748B" strokeWidth="0.8" />
          {/* Crossguard */}
          <path
            d="M 108 146 C 114 145 126 145 132 146 C 133 148 131 150 120 150 C 109 150 107 148 108 146 Z"
            fill="url(#imperialGoldGradient)"
            stroke="#594011"
            strokeWidth="0.5"
          />
          {/* Grip */}
          <rect x="118.5" y="150" width="3" height="14" rx="1" fill="#1E293B" stroke="#94A3B8" strokeWidth="0.3" />
          {/* Pommel */}
          <circle cx="120" cy="167" r="3.5" fill="url(#imperialGoldGradient)" stroke="#594011" strokeWidth="0.5" />
        </g>
      </g>

      {/* Central Golden Sun of Honor & Laurel Wreath at Center Intersection */}
      <g filter="url(#circuloBevel)">
        {/* Laurel branches hugging center */}
        <path
          d="M 88 126 C 85 110 92 98 100 92 C 96 102 96 114 102 122 Z"
          fill="url(#imperialGoldGradient)"
        />
        <path
          d="M 152 126 C 155 110 148 98 140 92 C 144 102 144 114 138 122 Z"
          fill="url(#imperialGoldGradient)"
        />
        {/* Center Shield / Golden Medallion */}
        <circle
          cx="120"
          cy="120"
          r="13"
          fill="url(#imperialGoldGradient)"
          stroke="#4D3507"
          strokeWidth="1"
        />
        <circle
          cx="120"
          cy="120"
          r="9.5"
          fill="#1B365D"
          stroke="url(#imperialGoldGradient)"
          strokeWidth="1"
        />
        {/* Center 5-point star */}
        <polygon
          points="120,113 122,118 127,118 123,121 125,126 120,123 115,126 117,121 113,118 118,118"
          fill="url(#imperialGoldGradient)"
        />
      </g>

      {/* Glass / Specular Sheen across the upper half */}
      <path
        d="M 40 100 C 60 48 180 48 200 100 C 180 62 60 62 40 100 Z"
        fill="#FFFFFF"
        opacity="0.12"
      />
    </svg>
  );
};
