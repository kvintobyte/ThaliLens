import React from 'react';

interface MacroBadgeProps {
  label: string;
  value: number;
  unit?: string;
  colorClass: string;
}

export const MacroBadge: React.FC<MacroBadgeProps> = ({ label, value, unit = 'g', colorClass }) => {
  return (
    <div className={`flex flex-col items-center p-2 rounded-lg ${colorClass} bg-opacity-10 min-w-[70px]`}>
      <span className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</span>
      <span className="text-lg font-bold">
        {value}<span className="text-xs font-normal ml-0.5">{unit}</span>
      </span>
    </div>
  );
};