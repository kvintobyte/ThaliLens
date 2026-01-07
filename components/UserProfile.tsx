import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchMonthlyLogs, fetchUserProfile, updateUserProfile } from '../services/firebaseUtils';
import { DailyLog, UserProfileData } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { LogOut, User as UserIcon, Calendar, RefreshCcw, Settings, ToggleLeft, ToggleRight } from 'lucide-react';

interface UserProfileProps {
    onRetakeOnboarding?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onRetakeOnboarding }) => {
    const { user, logout } = useAuth();
    const [monthlyLogs, setMonthlyLogs] = useState<DailyLog[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
    const [stats, setStats] = useState({ totalCalories: 0, avgCalories: 0, daysTracked: 0 });

    useEffect(() => {
        const loadStats = async () => {
            if (!user) return;
            const now = new Date();
            const logs = await fetchMonthlyLogs(now.getFullYear(), now.getMonth() + 1);
            setMonthlyLogs(logs);

            const total = logs.reduce((acc, log) => acc + log.totalCalories, 0);
            const avg = logs.length > 0 ? Math.round(total / logs.length) : 0;

            setStats({
                totalCalories: total,
                avgCalories: avg,
                daysTracked: logs.length
            });

            const profile = await fetchUserProfile(user.uid);
            setUserProfile(profile);
        };
        loadStats();
    }, [user]);

    const calculateAge = (dobString?: string) => {
        if (!dobString) return null;
        const birthDate = new Date(dobString);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const toggleMetric = async (metric: 'protein' | 'fat' | 'water' | 'carbs') => {
        if (!userProfile || !user) return;

        const currentMetrics = userProfile.additionalMetrics || [];
        let newMetrics;
        if (currentMetrics.includes(metric)) {
            newMetrics = currentMetrics.filter(m => m !== metric);
        } else {
            newMetrics = [...currentMetrics, metric];
        }

        setUserProfile({ ...userProfile, additionalMetrics: newMetrics });
        await updateUserProfile(user.uid, { additionalMetrics: newMetrics });
    };

    const chartData = monthlyLogs.map(log => ({
        day: log.date.split('-')[2],
        calories: log.totalCalories
    }));

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 w-full max-w-4xl mx-auto animate-fade-in-up pb-24">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                        <UserIcon size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {userProfile?.displayName || user?.displayName || 'My Profile'}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {user?.email}
                            {userProfile?.dateOfBirth && ` • ${calculateAge(userProfile.dateOfBirth)} years old`}
                            {userProfile?.currentWeight && (
                                <span className="block mt-1 text-xs text-orange-600 bg-orange-50 inline-block px-2 py-1 rounded-md font-medium">
                                    Current: {userProfile.currentWeight} kg
                                    {userProfile.targetWeight && ` • Target: ${userProfile.targetWeight} kg`}
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
                >
                    <LogOut size={18} />
                    <span className="hidden sm:inline">Sign Out</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-orange-50 p-4 rounded-2xl">
                    <p className="text-orange-600 text-xs font-medium uppercase tracking-wider mb-1">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalCalories.toLocaleString()} <span className="text-sm font-normal text-gray-500">kcal</span></p>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl">
                    <p className="text-blue-600 text-xs font-medium uppercase tracking-wider mb-1">Daily Average</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.avgCalories.toLocaleString()} <span className="text-sm font-normal text-gray-500">kcal</span></p>
                </div>
                <div className="bg-green-50 p-4 rounded-2xl">
                    <p className="text-green-600 text-xs font-medium uppercase tracking-wider mb-1">Days Tracked</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.daysTracked} <span className="text-sm font-normal text-gray-500">days</span></p>
                </div>
            </div>

            <div className="mb-8">
                <div className="flex items-center space-x-2 mb-4">
                    <Calendar size={18} className="text-gray-400" />
                    <h3 className="font-semibold text-gray-800">Monthly Overview</h3>
                </div>
                <div className="h-64 w-full">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="day"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    hide
                                    domain={['dataMin', 'auto']}
                                />
                                <Tooltip
                                    cursor={{ stroke: '#f3f4f6', strokeWidth: 2 }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                {userProfile?.dailyBudget && (
                                    <ReferenceLine
                                        y={userProfile.dailyBudget}
                                        stroke="#10b981"
                                        strokeDasharray="3 3"
                                        label={{
                                            value: 'Goal',
                                            position: 'right',
                                            fill: '#10b981',
                                            fontSize: 10
                                        }}
                                    />
                                )}
                                <Line
                                    type="monotone"
                                    dataKey="calories"
                                    stroke="#fb923c"
                                    strokeWidth={3}
                                    dot={{ fill: '#fb923c', r: 4, strokeWidth: 0 }}
                                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <p>No data recorded for this month yet.</p>
                            <p className="text-xs mt-1">Scan a meal to start tracking!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Settings & Preferences */}
            <div className="space-y-6">
                <div className="flex items-center space-x-2">
                    <Settings size={18} className="text-gray-400" />
                    <h3 className="font-semibold text-gray-800">Preferences</h3>
                </div>

                {/* Dashboard Metrics Toggle */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <h4 className="text-sm font-bold text-gray-700 mb-3">Dashboard Display</h4>
                    <div className="space-y-2">
                        {['protein', 'carbs', 'fat', 'water'].map((m) => {
                            const isActive = userProfile?.additionalMetrics?.includes(m as any);
                            return (
                                <button
                                    key={m}
                                    onClick={() => toggleMetric(m as any)}
                                    className="flex items-center justify-between w-full p-2 hover:bg-white rounded-lg transition"
                                >
                                    <span className="capitalize text-sm text-gray-600">{m} Ring</span>
                                    {isActive ? <ToggleRight className="text-orange-500" /> : <ToggleLeft className="text-gray-400" />}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Retake Survey */}
                {onRetakeOnboarding && (
                    <button
                        onClick={onRetakeOnboarding}
                        className="w-full flex items-center justify-center space-x-2 p-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition"
                    >
                        <RefreshCcw size={18} />
                        <span>Retake Plan Survey</span>
                    </button>
                )}
            </div>
        </div>
    );
};
