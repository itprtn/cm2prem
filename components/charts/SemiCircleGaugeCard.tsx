import React from 'react';

interface SemiCircleGaugeCardProps {
  title: string;
  value: number;
  maxValue: number;
  unit?: string;
  color?: string; // e.g., 'text-blue-500' or hex like '#4CAF50'
  icon?: React.ReactNode;
}

const SemiCircleGaugeCard: React.FC<SemiCircleGaugeCardProps> = ({
  title,
  value,
  maxValue,
  unit = '',
  color = 'text-primary', // Tailwind class or actual color for SVG
  icon
}) => {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const safePercentage = Math.min(Math.max(percentage, 0), 100); // Cap between 0 and 100
  const angle = (safePercentage / 100) * 180; // 0 to 180 degrees

  // SVG parameters
  const radius = 40;
  const strokeWidth = 8;
  const circumference = Math.PI * radius; // Circumference of a half circle

  const describeArc = (x: number, y: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, r, endAngle);
    const end = polarToCartesian(x, y, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [
      'M', start.x, start.y,
      'A', r, r, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
  };

  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180.0; // Adjust for bottom start
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const gaugePath = describeArc(50, 50, radius, 0, angle);
  const backgroundPath = describeArc(50, 50, radius, 0, 180);

  // Determine if color is a Tailwind class or a direct hex/rgb value
  const isTailwindColor = color.startsWith('text-');
  const strokeColor = isTailwindColor ? 'currentColor' : color;


  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-card-border flex flex-col items-center h-full">
      {icon && <div className={`mb-2 ${isTailwindColor ? color : ''}`} style={!isTailwindColor ? { color: color } : {}}>{icon}</div>}
      <h3 className="text-sm font-medium text-text-secondary text-center mb-1">{title}</h3>
      <div className="relative w-full max-w-[150px] aspect-[2/1]">
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <path
            d={backgroundPath}
            fill="none"
            stroke="#E5E7EB" // bg-slate-200
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <path
            d={gaugePath}
            fill="none"
            stroke={strokeColor}
            className={isTailwindColor ? color : ''} // Apply Tailwind class if it is one
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.3s ease-out' }} // For potential future animation
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className="text-xl font-bold text-text-headings">
            {value.toLocaleString('fr-FR')}
            {unit === '%' ? '%' : ''}
          </span>
          {unit && unit !== '%' && <span className="text-xs text-text-faded -mt-1">{unit}</span>}
        </div>
      </div>
       {maxValue > 0 && value > maxValue && (
        <p className="text-xs text-red-500 mt-1 text-center">Objectif dépassé</p>
      )}
    </div>
  );
};

export default SemiCircleGaugeCard;
