import React, { useState } from 'react';
import { FoodItem, NutritionInfo } from '../types';
import { MacroBadge } from './MacroBadge';
import { NutritionChart } from './NutritionChart';
import { Utensils, Pencil, Check, X, Save, Loader2, RotateCcw } from 'lucide-react';

interface AnalysisResultProps {
  items: FoodItem[];
  onReset: () => void;
  onUpdateItem: (index: number, newName: string) => Promise<void>;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ items, onReset, onUpdateItem, onSave, isSaving }) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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

  const startEditing = (index: number, currentName: string) => {
    setEditingIndex(index);
    setEditName(currentName);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditName('');
  };

  const saveEdit = async (index: number) => {
    if (!editName.trim()) return;
    setIsUpdating(true);
    try {
      await onUpdateItem(index, editName);
      setEditingIndex(null);
    } catch (error) {
      console.error("Failed to update item", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up">

      {/* Total Summary Card */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border border-orange-100">
        <div className="p-6 bg-gradient-to-br from-orange-500 to-red-600 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-1">Total Nutrition</h2>
              <p className="text-orange-100 text-sm">Review items below before saving</p>
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

      <h3 className="text-xl font-bold text-gray-800 mb-4 px-2 flex items-center justify-between">
        <div className="flex items-center">
          <Utensils className="w-5 h-5 mr-2 text-orange-500" />
          Identified Dishes
        </div>
        <span className="text-xs font-normal text-gray-400">Tap pencil to edit</span>
      </h3>

      {/* List of Items */}
      <div className="space-y-4 mb-8">
        {items.map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm border border-orange-50 p-5 transition hover:shadow-md">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-grow pr-4">
                {editingIndex === idx ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-grow p-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 font-bold"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(idx)}
                      disabled={isUpdating}
                      className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                    >
                      {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="group flex items-center">
                    <h4 className="text-lg font-bold text-gray-900 mr-2">{item.name}</h4>
                    <button
                      onClick={() => startEditing(idx, item.name)}
                      className="text-gray-400 hover:text-orange-500 transition opacity-0 group-hover:opacity-100"
                      title="Edit dish name"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                )}

                {!editingIndex || editingIndex !== idx ? (
                  <p className="text-sm text-gray-500 font-medium">{item.portionSize}</p>
                ) : null}
              </div>
              <div className="text-right flex-shrink-0">
                <span className="block text-lg font-bold text-gray-900">{item.calories} <span className="text-sm font-normal text-gray-500">kcal</span></span>
              </div>
            </div>

            {(!editingIndex || editingIndex !== idx) && (
              <>
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
              </>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pb-12">
        <button
          onClick={onReset}
          className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
        >
          <RotateCcw size={18} />
          <span>Scan Again</span>
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center justify-center space-x-2 px-8 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition shadow-lg shadow-green-200"
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span>Save to Daily Log</span>
        </button>
      </div>

    </div>
  );
};