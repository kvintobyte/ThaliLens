import React, { useState } from 'react';
import { ImageUpload } from './ImageUpload';
import { AnalysisResult } from './AnalysisResult';
import { analyzeIndianFood, getNutritionForText, analyzeMealEntry } from '../services/geminiService';
import { FoodItem, AppState, LogEntry } from '../types';
import { addLogEntry, updateWater } from '../services/firebaseUtils';
import { AlertCircle, Droplets, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const ScanPage: React.FC = () => {
    const [appState, setAppState] = useState<AppState>(AppState.IDLE);
    const [items, setItems] = useState<FoodItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [waterAdding, setWaterAdding] = useState(false); // Feedback state for button
    const [customWaterAmount, setCustomWaterAmount] = useState<string>(''); // Allow user input

    const handleImageSelected = async (file: File) => {
        setAppState(AppState.ANALYZING);
        setError(null);
        try {
            const result = await analyzeIndianFood(file);
            setItems(result);
            setAppState(AppState.SUCCESS);
        } catch (err) {
            setAppState(AppState.ERROR);
            setError(err instanceof Error ? err.message : "Failed to analyze image. Please try again.");
        }
    };

    const handleUpdateItem = async (index: number, newName: string) => {
        try {
            const newItem = await getNutritionForText(newName);
            const newItems = [...items];
            newItems[index] = newItem;
            setItems(newItems);
        } catch (err) {
            console.error("Failed to update item", err);
            alert("Failed to fetch nutrition for " + newName);
        }
    };

    const handleSaveLog = async () => {
        setIsSaving(true);
        try {

            // 1. Analyze Meal for Insight & Title
            const analysis = await analyzeMealEntry(items);

            // 2. Calculate Totals
            const totalCalories = items.reduce((acc, item) => acc + item.calories, 0);

            // 3. Create Log Entry
            const entry: LogEntry = {
                id: uuidv4(),
                timestamp: new Date().toISOString(),
                title: analysis.title,
                items: items,
                totalCalories: totalCalories,
                entryFeedback: analysis.feedback || "Good job logging!"
            };

            // 4. Save to Firebase
            await addLogEntry(entry);

            handleReset();
        } catch (err) {
            console.error("Failed to save log", err);
            setError("Failed to save meals. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // Updated to handle custom input
    const handleCustomAddWater = async () => {
        const amount = parseInt(customWaterAmount);
        if (!amount || isNaN(amount) || amount <= 0) return;

        setWaterAdding(true);
        try {
            await updateWater(amount);
            setCustomWaterAmount(''); // Clear input
        } catch (e) {
            console.error("Error adding water", e);
        } finally {
            setTimeout(() => setWaterAdding(false), 500);
        }
    };

    const handleReset = () => {
        setAppState(AppState.IDLE);
        setItems([]);
        setError(null);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 pt-8 animate-fade-in-up pb-24">
            <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                    Track Your Intake
                </h2>
                <p className="text-gray-600 max-w-lg mx-auto">
                    Scan a meal or quickly log water.
                </p>
            </div>

            {(appState === AppState.IDLE || appState === AppState.ANALYZING || appState === AppState.ERROR) && (
                <div className="space-y-12 animate-fade-in-up">

                    {/* Main Scanner */}
                    <div>
                        <ImageUpload
                            onImageSelected={handleImageSelected}
                            isLoading={appState === AppState.ANALYZING}
                        />
                        {appState === AppState.ERROR && error && (
                            <div className="max-w-md mx-auto mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-pulse">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Water Logging Section */}
                    <div className="max-w-md mx-auto">
                        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl p-6 border border-cyan-100 relative overflow-hidden">
                            {/* Decorative bg icon */}
                            <div className="absolute -right-4 -bottom-4 text-cyan-100 opacity-50">
                                <Droplets size={120} />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="bg-white p-2 rounded-full shadow-sm text-cyan-500">
                                        <Droplets size={20} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">Hydration Check</h3>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="number"
                                            value={customWaterAmount}
                                            onChange={(e) => setCustomWaterAmount(e.target.value)}
                                            placeholder="Amount"
                                            className="w-full pl-3 pr-8 py-3 rounded-xl border-2 border-cyan-100 focus:border-cyan-400 focus:ring-0 outline-none text-gray-700 font-bold placeholder-gray-300"
                                        />
                                        <span className="absolute right-3 top-3.5 text-xs text-gray-400 font-bold uppercase pointer-events-none">ml</span>
                                    </div>
                                    <button
                                        onClick={handleCustomAddWater}
                                        disabled={waterAdding || !customWaterAmount}
                                        className="bg-cyan-500 hover:bg-cyan-600 text-white p-3.5 rounded-xl shadow-lg shadow-cyan-200 transition active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                                    >
                                        <Plus size={20} strokeWidth={3} />
                                    </button>
                                </div>

                                {waterAdding && (
                                    <p className="text-center text-xs text-cyan-600 mt-2 font-medium animate-pulse">Adding water...</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {appState === AppState.SUCCESS && (
                <AnalysisResult
                    items={items}
                    onReset={handleReset}
                    onUpdateItem={handleUpdateItem}
                    onSave={handleSaveLog}
                    isSaving={isSaving}
                />
            )}
        </div>
    );
};
