import React from 'react';

interface CardCornerMarksProps {
  showLaserBeam?: boolean;
  showGlare?: boolean;
  glowColor?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'indigo';
}

export const CardCornerMarks: React.FC<CardCornerMarksProps> = ({
  showLaserBeam = true,
  showGlare = true,
  glowColor = 'cyan',
}) => {
  const getCornerBorderClass = () => {
    switch (glowColor) {
      case 'emerald':
        return 'border-emerald-400/80';
      case 'amber':
        return 'border-amber-400/80';
      case 'rose':
        return 'border-rose-400/80';
      case 'indigo':
        return 'border-indigo-400/80';
      case 'cyan':
      default:
        return 'border-cyan-400/80';
    }
  };

  const cornerColor = getCornerBorderClass();

  return (
    <>
      {/* 4 HUD Precision Aerospace Corner Accents */}
      <span className={`hud-corner hud-corner-tl ${cornerColor}`} aria-hidden="true" />
      <span className={`hud-corner hud-corner-tr ${cornerColor}`} aria-hidden="true" />
      <span className={`hud-corner hud-corner-bl ${cornerColor}`} aria-hidden="true" />
      <span className={`hud-corner hud-corner-br ${cornerColor}`} aria-hidden="true" />

      {/* Laser Scanning Edge Highlight */}
      {showLaserBeam && <div className="card-laser-beam" aria-hidden="true" />}

      {/* Specular Shimmer Sweep on Hover */}
      {showGlare && <div className="card-specular-glare" aria-hidden="true" />}
    </>
  );
};
