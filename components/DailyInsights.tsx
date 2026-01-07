import React, { useState, useEffect } from 'react';
import { DailyDashboard } from './DailyDashboard';
import { DailyLog, UserProfileData, LogEntry } from '../types';
import { subscribeToTodayLog, updateDailyLog } from '../services/firebaseUtils';
import { analyzeDailyIntake } from '../services/geminiService';
import { Sparkles, Utensils, CheckCircle, Brain, Clock } from 'lucide-react';

interface DailyInsightsProps {
    userProfile: UserProfileData | null;
}

export const DailyInsights: React.FC<DailyInsightsProps> = ({ userProfile }) => {
    const [log, setLog] = useState<DailyLog | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Timeline Text Logic
    let timelineText = undefined;
    if (userProfile?.currentWeight && userProfile?.targetWeight && userProfile?.goalPace) {
        const diff = Math.abs(userProfile.currentWeight - userProfile.targetWeight);
        if (diff > 0) {
            const weeks = Math.round(diff / userProfile.goalPace);
            timelineText = `Goal expected in ${weeks} weeks`;
        } else if (userProfile.goal === 'maintain') {
            timelineText = "Maintaining current weight";
        }
    }

    useEffect(() => {
        const unsubscribe = subscribeToTodayLog((data) => {
            setLog(data);
        });
        return () => unsubscribe();
    }, []);

    // Auto-analyze daily summary when logs change (if not already present or needs update?)
    // For now, let's keep it manual OR trigger if we detect new entries but no summary?
    // User asked "insight generated for each time a log". 
    // The *Entry* feedback is already generated.
    // The *Daily* feedback might need a re-run.
    useEffect(() => {
        if (log?.entries?.length && !isAnalyzing) {
            // Optional: Check if we should re-analyze. 
            // To avoid spamming API, maybe only if user requests or if it's completely missing
            // But the user said "i dont want a 'generate insight' option".
            // So we should try to keep it up to date.
            // Strategy: If analysis is missing, run it. Re-running on every edit is expensive.

            if (!log.dailyFeedback && log.entries.length > 0) {
                handleAnalyzeDay(log.entries);
            }
        }
    }, [log]);


    const handleAnalyzeDay = async (currentEntries: LogEntry[]) => {
        setIsAnalyzing(true);
        try {
            const result = await analyzeDailyIntake(currentEntries, userProfile?.goal || "maintain health");

            await updateDailyLog({
                dailyFeedback: result.summary,
            });

        } catch (e) {
            console.error("Analysis failed", e);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Dashboard Section */}
            <div>
                <DailyDashboard
                    goal={userProfile?.dailyBudget || 2500}
                    timeline={timelineText}
                    metrics={userProfile?.additionalMetrics}
                />
            </div>

            {/* Daily Summary (Whole Day Feedback) */}
            {log?.dailyFeedback && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-3xl border border-indigo-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-indigo-500">
                        <Brain size={64} />
                    </div>
                    <div className="flex items-start space-x-3 relative z-10">
                        <Sparkles className="text-indigo-600 mt-1 flex-shrink-0" size={24} />
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Daily Summary & Tips</h3>
                            <p className="text-gray-700 leading-relaxed italic">"{log.dailyFeedback}"</p>
                        </div>
                    </div>
                </div>
            )}

            {!log?.dailyFeedback && log?.entries?.length && (
                <div className="hidden">
                    {/* Hidden loading state or placeholder while auto-analyzing */}
                </div>
            )}

            {/* Meal Entries List */}
            <div>
                <div className="flex items-center space-x-2 mb-4 px-2">
                    <Utensils className="text-orange-500" size={20} />
                    <h3 className="text-lg font-bold text-gray-900">Today's Meals</h3>
                </div>

                <div className="space-y-6">
                    {log?.entries && log.entries.length > 0 ? (
                        log.entries.slice().reverse().map((entry, idx) => ( // Show newest first
                            <div key={idx} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4 border-b border-gray-50 pb-3">
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900">{entry.title}</h4>
                                        <div className="flex items-center text-xs text-gray-400 mt-1 space-x-1">
                                            <Clock size={12} />
                                            <span>{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-xl font-extrabold text-orange-600">{entry.totalCalories}</span>
                                        <span className="text-xs text-gray-400">kcal</span>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="space-y-2 mb-4">
                                    {entry.items.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-200"></div>
                                                <span className="text-gray-700 font-medium">{item.name}</span>
                                                <span className="text-gray-400 text-xs">({item.portionSize})</span>
                                            </div>
                                            <span className="text-gray-500 text-xs">{item.calories}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Entry Feedback */}
                                {entry.entryFeedback && (
                                    <div className="bg-green-50 p-3 rounded-xl flex items-start space-x-2 text-sm text-green-800">
                                        <CheckCircle size={16} className="mt-0.5 flex-shrink-0 text-green-600" />
                                        <span className="italic">"{entry.entryFeedback}"</span>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-gray-200">
                            <p className="text-gray-400">No meals logged today yet.</p>
                            <p className="text-xs text-gray-300 mt-1">Tap the camera to start!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
