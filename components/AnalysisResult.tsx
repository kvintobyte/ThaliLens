import React from 'react';
import { FoodItem, NutritionInfo } from '../types';
import { MacroBadge } from './MacroBadge';
import { NutritionChart } from './NutritionChart';
import { ChevronDown, Utensils } from 'lucide-react';

interface AnalysisResultProps {
  items: FoodItem[];
  onReset: () => void;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ items, onReset }) => {
  // Calculate totals
  const total: NutritionInfo = items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
      
      {/* Total Summary Card */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border border-orange-100">
        <div className="p-6 bg-gradient-to-br from-orange-500 to-red-600 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-1">Total Nutrition</h2>
              <p className="text-orange-100 text-sm">Based on visible items</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-xl px-4 py-2">
              <span className="block text-xs font-medium uppercase tracking-wider text-orange-50">Calories</span>
              <span className="block text-3xl font-bold">{total.calories}</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
             {/* Chart */}
            <div className="flex justify-center">
                <NutritionChart data={total} />
            </div>

            {/* Macro Breakdown */}
            <div className="grid grid-cols-3 gap-3">
              <MacroBadge label="Protein" value={total.protein} colorClass="bg-blue-100 text-blue-800" />
              <MacroBadge label="Carbs" value={total.carbs} colorClass="bg-yellow-100 text-yellow-800" />
              <MacroBadge label="Fat" value={total.fat} colorClass="bg-red-100 text-red-800" />
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-800 mb-4 px-2 flex items-center">
        <Utensils className="w-5 h-5 mr-2 text-orange-500" />
        Identified Dishes
      </h3>

      {/* List of Items */}
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm border border-orange-50 p-5 transition hover:shadow-md">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="text-lg font-bold text-gray-900">{item.name}</h4>
                <p className="text-sm text-gray-500 font-medium">{item.portionSize}</p>
              </div>
              <div className="text-right">
                 <span className="block text-lg font-bold text-gray-900">{item.calories} <span className="text-sm font-normal text-gray-500">kcal</span></span>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">{item.description}</p>
            
            <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-3">
               <div className="text-center">
                  <span className="block text-xs text-gray-400 font-semibold">PROTEIN</span>
                  <span className="block text-sm font-bold text-blue-600">{item.protein}g</span>
               </div>
               <div className="text-center border-l border-gray-100">
                  <span className="block text-xs text-gray-400 font-semibold">CARBS</span>
                  <span className="block text-sm font-bold text-yellow-600">{item.carbs}g</span>
               </div>
               <div className="text-center border-l border-gray-100">
                  <span className="block text-xs text-gray-400 font-semibold">FAT</span>
                  <span className="block text-sm font-bold text-red-600">{item.fat}g</span>
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center pb-12">
        <button 
          onClick={onReset}
          className="bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
        >
          Analyze Another Meal
        </button>
      </div>

    </div>
  );
};