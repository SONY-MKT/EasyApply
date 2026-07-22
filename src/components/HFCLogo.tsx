import React from 'react';

interface HFCLogoProps {
  className?: string;
  size?: number;
  src?: string;
}

export const HFCLogo: React.FC<HFCLogoProps> = ({ className = 'w-16 h-16', size, src }) => {
  const style = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  if (src) {
    return <img src={src} alt="HFC Logo" className={`${className} object-contain`} style={style} />;
  }

  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <defs>
        <linearGradient id="hfc-ribbon-1" x1="50" y1="50" x2="450" y2="450" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E11D48" />
          <stop offset="35%" stopColor="#C2185B" />
          <stop offset="70%" stopColor="#B91C1C" />
          <stop offset="100%" stopColor="#881337" />
        </linearGradient>

        <linearGradient id="hfc-ribbon-2" x1="120" y1="80" x2="420" y2="420" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F43F5E" />
          <stop offset="50%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#9F1239" />
        </linearGradient>

        <filter id="hfc-shadow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#991B1B" floodOpacity="0.25" />
        </filter>
      </defs>

      <g filter="url(#hfc-shadow)">
        {/* Left Calligraphic Loop (H/Flourish) */}
        <path
          d="M 50 280 C 20 370, 70 470, 180 470 C 280 470, 280 370, 210 320 C 140 270, 90 200, 160 120 C 210 60, 270 80, 260 140 C 250 190, 200 200, 185 180 C 170 160, 185 140, 200 150 C 210 158, 205 175, 190 175 C 175 175, 170 160, 180 140 C 190 120, 220 120, 215 150 C 210 180, 150 230, 110 300 C 60 380, 100 440, 180 440 C 250 440, 250 360, 190 320 C 130 280, 75 350, 120 400"
          fill="url(#hfc-ribbon-1)"
        />

        {/* Ribbon Body Left Main Arc */}
        <path
          d="M 60 290 C 25 360, 65 460, 175 460 C 265 460, 265 370, 200 325 C 145 285, 100 215, 165 130 C 210 75, 260 90, 250 145 C 240 190, 198 200, 185 182 C 175 168, 185 150, 198 158 C 205 162, 202 172, 192 172 C 182 172, 178 162, 185 148 L 175 130 C 105 210, 150 280, 205 320 L 195 335 C 120 380, 80 340, 100 290 Z"
          fill="url(#hfc-ribbon-2)"
          opacity="0.95"
        />

        {/* Right Calligraphic Flourish (B/C/Loop) */}
        <path
          d="M 230 280 C 270 200, 340 100, 420 130 C 480 150, 490 230, 420 270 C 360 305, 290 265, 330 215 C 360 180, 430 190, 420 235 C 410 265, 360 260, 380 230 C 390 215, 410 220, 400 232 C 390 242, 375 238, 380 225 L 390 205 C 430 205, 400 280, 320 280 C 270 280, 220 330, 260 410 C 300 480, 420 480, 460 410 C 490 360, 470 280, 410 280 L 420 255 C 490 265, 510 360, 470 425 C 420 500, 280 500, 235 415 C 190 330, 240 270, 290 260 Z"
          fill="url(#hfc-ribbon-1)"
        />

        {/* Center Connecting Swirl */}
        <path
          d="M 160 280 C 210 250, 280 250, 320 280 C 300 295, 230 295, 170 285 Z"
          fill="url(#hfc-ribbon-2)"
        />
      </g>
    </svg>
  );
};

