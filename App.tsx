import React, { useState } from 'react';
import { ChefHat, AlertCircle } from 'lucide-react';
import { ImageUpload } from './components/ImageUpload';
import { AnalysisResult } from './components/AnalysisResult';
import { analyzeIndianFood } from './services/geminiService';
import { FoodItem, AppState } from './types';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [items, setItems] = useState<FoodItem[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setItems([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-orange-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-orange-500 p-2 rounded-lg text-white">
              <ChefHat size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Thali<span className="text-orange-600">Lens</span>
            </h1>
          </div>
          <div className="text-xs font-medium text-gray-400 uppercase tracking-widest hidden sm:block">
            AI Nutrition Tracker
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8">
        {/* Intro / Hero - Only show when IDLE or ANALYZING without results */}
        {(appState === AppState.IDLE || appState === AppState.ANALYZING || appState === AppState.ERROR) && (
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              What's on your plate?
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto">
              Instant nutrition breakdown for Indian cuisine. From butter chicken to pani puri, we've got you covered.
            </p>
          </div>
        )}

        {/* Upload Section */}
        {(appState === AppState.IDLE || appState === AppState.ANALYZING || appState === AppState.ERROR) && (
          <div className="animate-fade-in-up">
            <ImageUpload
              onImageSelected={handleImageSelected}
              isLoading={appState === AppState.ANALYZING}
            />
          </div>
        )}

        {/* Error Message */}
        {appState === AppState.ERROR && error && (
          <div className="max-w-md mx-auto mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-pulse">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {appState === AppState.SUCCESS && (
          <AnalysisResult items={items} onReset={handleReset} />
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-400 text-sm mt-8">
        <p>Powered by Gemini AI. Estimates may vary.</p>
      </footer>
    </div>
  );
}

export default App;