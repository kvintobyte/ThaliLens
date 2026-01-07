import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { NutritionInfo } from '../types';

interface NutritionChartProps {
  data: NutritionInfo;
}

export const NutritionChart: React.FC<NutritionChartProps> = ({ data }) => {
  const chartData = [
    { name: 'Protein', value: data.protein, color: '#3b82f6' }, // Blue
    { name: 'Carbs', value: data.carbs, color: '#eab308' },   // Yellow
    { name: 'Fat', value: data.fat, color: '#ef4444' },       // Red
  ];

  // Prevent rendering if all values are 0
  if (data.protein === 0 && data.carbs === 0 && data.fat === 0) return null;

  return (
    <div className="h-48 w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${value}g`, '']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <p className="text-xs text-gray-500 font-medium">Calories</p>
        <p className="text-2xl font-bold text-gray-800">{data.calories}</p>
      </div>
    </div>
  );
};