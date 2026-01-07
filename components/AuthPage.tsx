import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ChefHat, Mail, Lock, ArrowRight, Loader2, User } from 'lucide-react';
import { DatePicker } from './DatePicker';

export const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login, signup, loginAnonymously } = useAuth();

    const handleGuestLogin = async () => {
        setError(null);
        setIsLoading(true);

        try {
            await loginAnonymously();
        } catch (err: any) {
            console.error("Guest login error:", err);
            if (err.code === 'auth/admin-restricted-operation') {
                setError("Guest login is not enabled in the Firebase Console. Please enable 'Anonymous' sign-in method in Authentication settings.");
            } else {
                setError("Failed to continue as guest: " + err.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                if (!name || !dob) {
                    throw new Error("Please fill in all fields.");
                }
                await signup(email, password, name, dob);
            }
        } catch (err: any) {
            // Firebase auth errors
            let msg = err.message || "Failed to authenticate.";
            if (err.code === 'auth/invalid-email') msg = "Invalid email address.";
            if (err.code === 'auth/user-disabled') msg = "User account disabled.";
            if (err.code === 'auth/user-not-found') msg = "User not found.";
            if (err.code === 'auth/wrong-password') msg = "Invalid password.";
            if (err.code === 'auth/email-already-in-use') msg = "Email already in use.";
            if (err.code === 'auth/weak-password') msg = "Password is too weak.";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-orange-50 flex flex-col justify-center items-center px-4">
            <div className="mb-8 text-center animate-fade-in-up">
                <div className="bg-orange-500 p-3 rounded-2xl text-white inline-block mb-4 shadow-lg shadow-orange-200">
                    <ChefHat size={48} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    Thali<span className="text-orange-600">Lens</span>
                </h1>
                <p className="text-gray-500 mt-2">Your Personal AI Nutritionist</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md animate-fade-in-up delay-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 flex items-center">
                        <span className="mr-2">⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Date of Birth</label>
                                <DatePicker value={dob} onChange={setDob} placeholder="Select Date of Birth" />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2 active:scale-[0.98] transform duration-100 mt-2"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <>
                                <span>{isLogin ? 'Sign In' : 'Sign Up'}</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-orange-600 font-semibold ml-1 hover:text-orange-700 transition-colors"
                        >
                            {isLogin ? 'Create one' : 'Sign in'}
                        </button>
                    </p>

                    <div className="mt-6 border-t border-gray-100 pt-4">
                        <button
                            type="button"
                            onClick={handleGuestLogin}
                            disabled={isLoading}
                            className="text-gray-500 hover:text-orange-600 font-medium transition-colors text-sm"
                        >
                            Continue as Guest
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
