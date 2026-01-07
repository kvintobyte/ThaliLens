import React, { useState } from 'react';
import { UserProfileData } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../services/firebaseUtils';
import { ChevronRight, Check, Activity, Target, Ruler } from 'lucide-react';

interface OnboardingProps {
    onComplete: (data: Partial<UserProfileData>) => void;
    baseProfile: UserProfileData;
}

export const OnboardingFlow: React.FC<OnboardingProps> = ({ onComplete, baseProfile }) => {
    const { user, logout } = useAuth();
    const [step, setStep] = useState(1);

    // Form State
    const [sex, setSex] = useState<'male' | 'female'>('male');
    const [height, setHeight] = useState('');
    const [currentWeight, setCurrentWeight] = useState('');
    const [age, setAge] = useState(''); // New state for manual age entry
    const [activityLevel, setActivityLevel] = useState(1.2);
    const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('lose');
    const [targetWeight, setTargetWeight] = useState('');
    const [goalPace, setGoalPace] = useState(0.5);

    const steps = 3;

    // Calculations
    const calculateAge = (dob: string) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const calculateResults = () => {
        const weight = parseFloat(currentWeight);
        const h = parseFloat(height);

        let calculatedAge = 0;
        if (baseProfile.dateOfBirth) {
            calculatedAge = calculateAge(baseProfile.dateOfBirth);
        } else if (age) {
            calculatedAge = parseInt(age);
        } else {
            calculatedAge = 25; // Should be blocked by validation
        }

        // BMR (Mifflin-St Jeor)
        let bmr = (10 * weight) + (6.25 * h) - (5 * calculatedAge);
        if (sex === 'male') bmr += 5;
        else bmr -= 161;

        // TDEE
        const tdee = bmr * activityLevel;

        // Daily Budget
        let dailyBudget = tdee;
        if (goal === 'lose') {
            const deficit = (goalPace * 7700) / 7;
            dailyBudget = tdee - deficit;
        } else if (goal === 'gain') {
            dailyBudget = tdee + 300;
        }

        return {
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            dailyBudget: Math.round(dailyBudget)
        };
    };

    const handleExit = async () => {
        try {
            await logout();
        } catch (e) {
            console.error("Logout failed", e);
        }
    };

    const handleNext = async () => {
        // Validation per step if needed
        if (step === 1) {
            if (!height || !currentWeight) return alert("Please fill in height and weight");
            if (!baseProfile.dateOfBirth && !age) return alert("Please enter your age");
        }
        if (step === 3 && (goal !== 'maintain' && !targetWeight)) return alert("Please set target weight");

        if (step < steps) {
            setStep(step + 1);
        } else {
            // Final Step - Process
            const results = calculateResults();
            const data: Partial<UserProfileData> = {
                sex,
                height: parseFloat(height),
                currentWeight: parseFloat(currentWeight),
                activityLevel,
                goal,
                targetWeight: parseFloat(targetWeight || currentWeight),
                goalPace,
                ...results
            };

            if (user) {
                await updateUserProfile(user.uid, data);
                onComplete(data);
            }
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-lg mx-auto border border-orange-100 animate-fade-in-up">
            <div className="bg-orange-500 p-6 text-white text-center">
                <h2 className="text-2xl font-bold">Let's Personalize ThaliLens</h2>
                <div className="flex justify-center mt-4 space-x-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1.5 w-8 rounded-full ${i <= step ? 'bg-white' : 'bg-orange-300'}`} />
                    ))}
                </div>
            </div>

            <div className="p-8">
                {step === 1 && (
                    <div className="space-y-6 animate-fade-in-up">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center">
                            <Ruler className="text-orange-500 mr-2" />
                            Physical Biometrics
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setSex('male')}
                                className={`p-4 rounded-xl border-2 text-center transition ${sex === 'male' ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold' : 'border-gray-200 text-gray-500 hover:border-orange-200'}`}
                            >
                                Male
                            </button>
                            <button
                                onClick={() => setSex('female')}
                                className={`p-4 rounded-xl border-2 text-center transition ${sex === 'female' ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold' : 'border-gray-200 text-gray-500 hover:border-orange-200'}`}
                            >
                                Female
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                            <input
                                type="number"
                                value={height}
                                onChange={e => setHeight(e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                placeholder="e.g. 175"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Weight (kg)</label>
                            <input
                                type="number"
                                value={currentWeight}
                                onChange={e => setCurrentWeight(e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                placeholder="e.g. 70"
                            />
                        </div>

                        {!baseProfile.dateOfBirth && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                                <input
                                    type="number"
                                    value={age}
                                    onChange={e => setAge(e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                    placeholder="e.g. 25"
                                />
                            </div>
                        )}
                    </div>
                )}

                {step === 2 && ( // Activity
                    <div className="space-y-6 animate-fade-in-up">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center">
                            <Activity className="text-orange-500 mr-2" />
                            Activity Level
                        </h3>

                        <div className="space-y-3">
                            {[
                                { val: 1.2, label: "Sedentary", desc: "Little to no exercise" },
                                { val: 1.375, label: "Lightly Active", desc: "Light exercise 1-3 days/week" },
                                { val: 1.55, label: "Moderately Active", desc: "Moderate exercise 3-5 days/week" },
                                { val: 1.725, label: "Very Active", desc: "Hard exercise 6-7 days/week" },
                            ].map((opt) => (
                                <button
                                    key={opt.val}
                                    onClick={() => setActivityLevel(opt.val)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition flex justify-between items-center ${activityLevel === opt.val ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-200'}`}
                                >
                                    <div>
                                        <div className={`font-bold ${activityLevel === opt.val ? 'text-orange-700' : 'text-gray-800'}`}>{opt.label}</div>
                                        <div className="text-xs text-gray-500">{opt.desc}</div>
                                    </div>
                                    {activityLevel === opt.val && <Check size={20} className="text-orange-500" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 3 && ( // Goal
                    <div className="space-y-6 animate-fade-in-up">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center">
                            <Target className="text-orange-500 mr-2" />
                            Your Goal
                        </h3>

                        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                            {(['lose', 'maintain', 'gain'] as const).map(g => (
                                <button
                                    key={g}
                                    onClick={() => setGoal(g)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition ${goal === g ? 'bg-white shadow text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {g} weight
                                </button>
                            ))}
                        </div>

                        {goal !== 'maintain' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Weight (kg)</label>
                                    <input
                                        type="number"
                                        value={targetWeight}
                                        onChange={e => setTargetWeight(e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                        placeholder="e.g. 65"
                                    />
                                </div>

                                {goal === 'lose' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Weekly Pace: {goalPace} kg/week</label>
                                        <input
                                            type="range"
                                            min="0.25" max="1.0" step="0.25"
                                            value={goalPace}
                                            onChange={e => setGoalPace(parseFloat(e.target.value))}
                                            className="w-full"
                                        />
                                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                                            <span>Slow (0.25)</span>
                                            <span>Fast (1.0)</span>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                <div className="mt-8">
                    <button
                        onClick={handleNext}
                        className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition flex items-center justify-center space-x-2"
                    >
                        <span>{step === steps ? 'Calculate Plan' : 'Next Step'}</span>
                        <ChevronRight size={20} />
                    </button>

                    <button
                        onClick={step === 1 ? handleExit : () => setStep(step - 1)}
                        className="w-full mt-3 text-gray-500 py-2 text-sm hover:text-gray-700 hover:bg-gray-50 rounded-lg transition"
                    >
                        {step === 1 ? 'Cancel & Return to Login' : 'Go Back'}
                    </button>
                </div>
            </div>
        </div>
    );
};
