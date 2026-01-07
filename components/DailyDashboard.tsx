import React, { useState, useEffect } from 'react';
import { subscribeToTodayLog } from '../services/firebaseUtils';

interface ProgressRingProps {
    radius: number;
    stroke: number;
    progress: number;
    color: string;
    label: string;
    value: number;
    unit: string;
    subLabel?: string;
    limit?: number;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ radius, stroke, progress, color, label, value, unit, subLabel }) => {
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - progress * circumference;

    return (
        <div className="relative flex items-center justify-center">
            <svg
                height={radius * 2}
                width={radius * 2}
                className="transform -rotate-90"
            >
                {/* Background Ring */}
                <circle
                    stroke="#f3f4f6"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    strokeLinecap="round"
                />

                {/* Progress Ring */}
                <circle
                    stroke={color}
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-out' }}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-extrabold text-gray-900 leading-none">
                    {Math.round(value)}
                </span>
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wide mt-0.5">
                    {label}
                </span>
            </div>
        </div>
    );
};


interface DailyDashboardProps {
    goal?: number;
    timeline?: string;
    metrics?: ('fat' | 'protein' | 'water' | 'carbs')[];
}

export const DailyDashboard: React.FC<DailyDashboardProps> = ({ goal = 2500, timeline, metrics = [] }) => {
    const [stats, setStats] = useState({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        water: 0
    });

    useEffect(() => {
        const unsubscribe = subscribeToTodayLog((log) => {
            if (log) {
                // Determine if we need to sum from entries or use flat values
                // Since we migrated to 'entries', let's prioritize reducing that if available
                // If log.entries exists, sum from there. If not (old data), check log.meals.

                let calculated = { calories: 0, protein: 0, carbs: 0, fat: 0 };

                if (log.entries && log.entries.length > 0) {
                    calculated = log.entries.reduce((acc, entry) => {
                        const entryMacros = entry.items.reduce((mAcc, item) => ({
                            calories: mAcc.calories + item.calories,
                            protein: mAcc.protein + item.protein,
                            carbs: mAcc.carbs + item.carbs,
                            fat: mAcc.fat + item.fat
                        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

                        return {
                            calories: acc.calories + entryMacros.calories,
                            protein: acc.protein + entryMacros.protein,
                            carbs: acc.carbs + entryMacros.carbs,
                            fat: acc.fat + entryMacros.fat
                        };
                    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

                } else {
                    // Fallback or empty
                }

                setStats({
                    ...calculated,
                    water: log.waterIntake
                });
            } else {
                setStats({ calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 });
            }
        });
        return () => unsubscribe();
    }, []);

    // Main Calorie Ring Config
    const calorieRadius = 90; // Slightly larger
    const calorieStroke = 14; // Thicker
    const calorieProgress = Math.min(stats.calories / goal, 1);
    const calorieRemaining = Math.max(goal - stats.calories, 0);

    const calorieCircumference = (calorieRadius - calorieStroke * 2) * 2 * Math.PI;
    const splitOffset = calorieCircumference - calorieProgress * calorieCircumference;

    return (
        <div className="w-full max-w-sm mx-auto animate-fade-in-up">

            {/* Main Stats Card */}
            <div className="bg-white rounded-[2rem] shadow-lg shadow-orange-50/50 border border-orange-50 p-6 mb-6">

                <div className="mb-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Today's Target</h2>
                        <p className="text-xs text-gray-400 font-medium">Keep it up!</p>
                    </div>
                    {timeline && (
                        <div className="bg-orange-100 text-orange-700 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                            {timeline}
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-center">
                    {/* Main Ring */}
                    <div className="relative flex items-center justify-center mb-6">
                        <svg
                            height={calorieRadius * 2}
                            width={calorieRadius * 2}
                            className="transform -rotate-90 drop-shadow-xl"
                            style={{ filter: 'drop-shadow(0px 10px 10px rgba(249, 115, 22, 0.1))' }}
                        >
                            {/* Track */}
                            <circle
                                stroke="#fff7ed"
                                fill="transparent"
                                strokeWidth={calorieStroke}
                                r={calorieRadius - calorieStroke * 2}
                                cx={calorieRadius}
                                cy={calorieRadius}
                                strokeLinecap="round"
                            />
                            {/* Indicator */}
                            <circle
                                stroke="#f97316"
                                fill="transparent"
                                strokeWidth={calorieStroke}
                                strokeDasharray={calorieCircumference + ' ' + calorieCircumference}
                                style={{ strokeDashoffset: splitOffset, transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
                                strokeLinecap="round"
                                r={calorieRadius - calorieStroke * 2}
                                cx={calorieRadius}
                                cy={calorieRadius}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Remaining</span>
                            <span className="text-3xl font-black text-gray-900 leading-none tracking-tight">
                                {Math.round(calorieRemaining)}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium mt-1">
                                kcal
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 w-full text-center divide-x divide-gray-100">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Goal</p>
                            <p className="font-bold text-gray-900">{goal}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Eaten</p>
                            <p className="font-bold text-orange-500">{Math.round(stats.calories)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Metrics Rings Grid */}
            {metrics.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4"> {/* Mobile: 2 cols, Desktop: 4 cols */}
                    {metrics.map((metric) => {
                        let color, label, value, goalV;
                        switch (metric) {
                            case 'protein': color = '#3b82f6'; label = 'Protein'; value = stats.protein; goalV = 150; break;
                            case 'carbs': color = '#eab308'; label = 'Carbs'; value = stats.carbs; goalV = 250; break;
                            case 'fat': color = '#ef4444'; label = 'Fat'; value = stats.fat; goalV = 70; break;
                            case 'water': color = '#06b6d4'; label = 'Water'; value = stats.water; goalV = 2500; break;
                            default: return null;
                        }

                        return (
                            <div key={metric} className="bg-white p-1 rounded-2xl shadow-sm border border-gray-50 flex flex-col items-center transition hover:shadow-md">
                                <ProgressRing
                                    radius={40} stroke={5}
                                    progress={Math.min(value / goalV, 1)}
                                    color={color}
                                    label={label}
                                    value={value}
                                    unit={metric === 'water' ? 'ml' : 'g'}
                                />
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};
