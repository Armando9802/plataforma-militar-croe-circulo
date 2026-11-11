import React from 'react';

interface CroeShieldSvgProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const CroeShieldSvg: React.FC<CroeShieldSvgProps> = ({
  className = '',
  size = 64,
  glow = false
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${glow ? 'drop-shadow-[0_0_12px_rgba(212,175,55,0.45)]' : 'drop-shadow-md'} transition-transform duration-300 ${className}`}
      aria-label="Escudo Oficial CROE"
      role="img"
    >
      <defs>
        {/* Granate Gradient */}
        <linearGradient id="croeRedGradient" x1="20" y1="20" x2="180" y2="220" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A82930" />
          <stop offset="45%" stopColor="#8B1E24" />
          <stop offset="100%" stopColor="#550C10" />
        </linearGradient>

        {/* Gold Metal Gradient */}
        <linearGradient id="croeGoldGradient" x1="0" y1="0" x2="200" y2="240" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF2B2" />
          <stop offset="25%" stopColor="#D4AF37" />
          <stop offset="60%" stopColor="#9E7C1D" />
          <stop offset="85%" stopColor="#E5C768" />
          <stop offset="100%" stopColor="#8C6A10" />
        </linearGradient>

        {/* Dark Gold Gradient for Shadows */}
        <linearGradient id="croeGoldDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#6E520A" />
        </linearGradient>

        {/* Inner Shadow / Shield Depth */}
        <radialGradient id="croeCenterLight" cx="100" cy="80" r="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C43B43" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#300305" stopOpacity="0.8" />
        </radialGradient>

        {/* Star Facet Gradients */}
        <linearGradient id="starLight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFF6CC" />
          <stop offset="100%" stopColor="#E5C768" />
        </linearGradient>
        <linearGradient id="starDark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C59B27" />
          <stop offset="100%" stopColor="#7D5C0B" />
        </linearGradient>

        {/* Filter for subtle bevel */}
        <filter id="croeBevel" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* External Shield Trim (Outer Gold Border) */}
      <path
        d="M 100 8 C 150 8 186 24 186 52 C 186 132 152 186 100 216 C 48 186 14 132 14 52 C 14 24 50 8 100 8 Z"
        fill="url(#croeGoldGradient)"
        stroke="#6E520A"
        strokeWidth="1.5"
      />

      {/* Shield Main Body (Wine Red Field) */}
      <path
        d="M 100 14 C 146 14 178 28 178 54 C 178 128 146 178 100 206 C 54 178 22 128 22 54 C 22 28 54 14 100 14 Z"
        fill="url(#croeRedGradient)"
      />

      {/* Radial Depth Overlay */}
      <path
        d="M 100 14 C 146 14 178 28 178 54 C 178 128 146 178 100 206 C 54 178 22 128 22 54 C 22 28 54 14 100 14 Z"
        fill="url(#croeCenterLight)"
      />

      {/* Inner Filigree / Secondary Inset Gold Line */}
      <path
        d="M 100 20 C 142 20 171 33 171 56 C 171 123 142 170 100 196 C 58 170 29 123 29 56 C 29 33 58 20 100 20 Z"
        fill="none"
        stroke="url(#croeGoldGradient)"
        strokeWidth="1.2"
        strokeDasharray="4 2"
        opacity="0.85"
      />

      {/* Shield Top Header Banner / Arch */}
      <path
        d="M 40 28 C 65 24 135 24 160 28 L 156 46 C 132 43 68 43 44 46 Z"
        fill="url(#croeGoldGradient)"
        filter="url(#croeBevel)"
      />
      <text
        x="100"
        y="42"
        fill="#3A080B"
        fontSize="14"
        fontWeight="900"
        fontFamily="'Cinzel', 'Georgia', serif"
        textAnchor="middle"
        letterSpacing="3.5"
      >
        C.R.O.E.
      </text>

      {/* Laurel Wreath Left */}
      <g fill="url(#croeGoldGradient)" stroke="#6E520A" strokeWidth="0.4">
        {/* Left leaves */}
        <path d="M 62 126 C 52 118 46 106 50 94 C 54 104 60 114 62 126 Z" />
        <path d="M 52 108 C 42 100 38 88 44 76 C 48 86 52 96 52 108 Z" />
        <path d="M 46 88 C 38 78 36 66 44 56 C 47 67 49 76 46 88 Z" />
        <path d="M 58 136 C 50 134 46 126 50 118 C 55 125 57 130 58 136 Z" />
        {/* Right leaves */}
        <path d="M 138 126 C 148 118 154 106 150 94 C 146 104 140 114 138 126 Z" />
        <path d="M 148 108 C 158 100 162 88 156 76 C 152 86 148 96 148 108 Z" />
        <path d="M 154 88 C 162 78 164 66 156 56 C 153 67 151 76 154 88 Z" />
        <path d="M 142 136 C 150 134 154 126 150 118 C 145 125 143 130 142 136 Z" />
        {/* Laurel ribbon node at bottom */}
        <circle cx="100" cy="148" r="4" fill="url(#croeGoldGradient)" />
      </g>

      {/* 3D Faceted Central Military Star (Center: 100, 102 - Radius ~32px) */}
      <g filter="url(#croeBevel)">
        {/* Top Point */}
        <polygon points="100,70 100,102 91,95" fill="url(#starLight)" />
        <polygon points="100,70 109,95 100,102" fill="url(#starDark)" />
        {/* Top-Right Point */}
        <polygon points="130,92 100,102 107,112" fill="url(#starLight)" />
        <polygon points="130,92 119,84 100,102" fill="url(#starDark)" />
        {/* Bottom-Right Point */}
        <polygon points="119,132 100,102 100,116" fill="url(#starLight)" />
        <polygon points="119,132 112,118 100,102" fill="url(#starDark)" />
        {/* Bottom-Left Point */}
        <polygon points="81,132 100,102 88,118" fill="url(#starLight)" />
        <polygon points="81,132 100,116 100,102" fill="url(#starDark)" />
        {/* Top-Left Point */}
        <polygon points="70,92 100,102 81,84" fill="url(#starLight)" />
        <polygon points="70,92 93,112 100,102" fill="url(#starDark)" />
        {/* Center Star Diamond Core */}
        <circle cx="100" cy="102" r="3.5" fill="#FFF8D6" stroke="#9E7C1D" strokeWidth="0.8" />
      </g>

      {/* Lower Motto Ribbon / Phylactery ("EL PLACER DE SERVIR") */}
      <g filter="url(#croeBevel)">
        {/* Ribbon folded ends */}
        <path
          d="M 22 176 L 36 166 L 36 182 Z"
          fill="#6E520A"
        />
        <path
          d="M 178 176 L 164 166 L 164 182 Z"
          fill="#6E520A"
        />
        {/* Ribbon Back Folds */}
        <path
          d="M 28 178 L 48 168 L 48 184 L 28 192 Z"
          fill="url(#croeGoldDark)"
        />
        <path
          d="M 172 178 L 152 168 L 152 184 L 172 192 Z"
          fill="url(#croeGoldDark)"
        />
        {/* Ribbon Main Banner Body */}
        <path
          d="M 32 176 C 70 186 130 186 168 176 L 164 195 C 128 205 72 205 36 195 Z"
          fill="url(#croeGoldGradient)"
          stroke="#553F05"
          strokeWidth="0.8"
        />
        {/* Motto Text */}
        <text
          x="100"
          y="190"
          fill="#350608"
          fontSize="8.5"
          fontWeight="900"
          fontFamily="'Cinzel', 'Georgia', serif"
          textAnchor="middle"
          letterSpacing="1.2"
        >
          EL PLACER DE SERVIR
        </text>
      </g>

      {/* Subtle Metallic Specular Reflection on Upper Left */}
      <path
        d="M 32 54 C 32 40 50 26 80 20 C 50 28 34 42 32 54 Z"
        fill="#FFFFFF"
        opacity="0.25"
      />
    </svg>
  );
};
