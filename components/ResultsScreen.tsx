import React from 'react';
import { UserProfileData } from '../types';
import { ArrowRight, Activity, Flame, Target } from 'lucide-react';

interface ResultsProps {
    data: Partial<UserProfileData>;
    onContinue: () => void;
}

export const ResultsScreen: React.FC<ResultsProps> = ({ data, onContinue }) => {
    return (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-lg mx-auto border border-orange-100 animate-fade-in-up">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-orange-500 opacity-20 rounded-full blur-2xl"></div>

                <h2 className="text-3xl font-bold mb-2 relative z-10">Your Plan is Ready!</h2>
                <p className="text-gray-300 relative z-10">
                    Based on your biometrics and goal to <span className="text-white font-bold">{data.goal} weight</span>.
                </p>
            </div>

            <div className="p-8 space-y-6">

                {/* Main Number */}
                <div className="text-center py-4 bg-orange-50 rounded-2xl border border-orange-100">
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Your Daily Budget</p>
                    <div className="text-5xl font-extrabold text-orange-600 tracking-tight">
                        {data.dailyBudget} <span className="text-xl text-gray-400 font-normal">kcal</span>
                    </div>
                    {data.goal !== 'maintain' && (
                        <p className="text-sm text-gray-600 mt-2 px-6">
                            To reach <span className="font-bold">{data.targetWeight} kg</span>
                            {data.goalPace && ` at ${data.goalPace} kg/week`}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center space-x-2 mb-2 text-gray-500">
                            <Flame size={16} />
                            <span className="text-xs font-bold uppercase">BMR</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{data.bmr}</p>
                        <p className="text-xs text-gray-400">Basal Metabolic Rate</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center space-x-2 mb-2 text-gray-500">
                            <Activity size={16} />
                            <span className="text-xs font-bold uppercase">TDEE</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{data.tdee}</p>
                        <p className="text-xs text-gray-400">Maintenance Calories</p>
                    </div>
                </div>

                {/* Explanation */}
                <div className="text-sm text-gray-500 bg-blue-50 p-4 rounded-xl border border-blue-100 italic">
                    "This budget creates the calorie deficit needed to hit your goal. Track consistently!"
                </div>

                <button
                    onClick={onContinue}
                    className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-700 transition shadow-lg shadow-orange-200 flex items-center justify-center space-x-2 mt-4"
                >
                    <span>Let's Go</span>
                    <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};
