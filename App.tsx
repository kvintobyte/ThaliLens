import React, { useState, useEffect } from 'react';
import { ChefHat, Home, User, Scan, Camera } from 'lucide-react';
import { AppState, UserProfileData } from './types';
import { fetchUserProfile } from './services/firebaseUtils';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/AuthPage';
import { UserProfile } from './components/UserProfile';
import { OnboardingFlow } from './components/OnboardingFlow';
import { ResultsScreen } from './components/ResultsScreen';
import { ScanPage } from './components/ScanPage';
import { DailyInsights } from './components/DailyInsights';

function AppContent() {
  const { user, loading } = useAuth();

  // App Logic State
  const [currentView, setCurrentView] = useState<'home' | 'scan' | 'profile'>('home');
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [onboardingStatus, setOnboardingStatus] = useState<'loading' | 'onboarding' | 'results' | 'complete'>('loading');

  const loadProfile = async () => {
    if (user) {
      const p = await fetchUserProfile(user.uid);
      console.log("Fetched profile:", p);
      setUserProfile(p);
      if (p && p.dailyBudget) {
        setOnboardingStatus('complete');
      } else {
        setOnboardingStatus('onboarding');
      }
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin text-orange-500">Loading...</div></div>;
  if (!user) return <AuthPage />;

  // Handle Onboarding Flow
  if (onboardingStatus === 'onboarding') {
    // if (!userProfile) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin text-orange-500">Loading Profile...</div></div>;
    // Actually we can start onboarding even if profile is partial.

    return (
      <div className="min-h-screen bg-orange-50 p-4 flex items-center justify-center">
        <OnboardingFlow
          baseProfile={userProfile || { uid: user.uid, displayName: user.displayName || '', dateOfBirth: '', createdAt: '', email: user.email }}
          onComplete={(data) => {
            setUserProfile(prev => {
              const base = prev || { uid: user.uid, displayName: user.displayName || 'Guest', dateOfBirth: '', createdAt: new Date().toISOString(), email: user.email };
              return { ...base, ...data };
            });
            setOnboardingStatus('results');
          }}
        />
      </div>
    );
  }

  if (onboardingStatus === 'results') {
    if (!userProfile) return null;
    return (
      <div className="min-h-screen bg-orange-50 p-4 flex items-center justify-center">
        <ResultsScreen
          data={userProfile}
          onContinue={() => setOnboardingStatus('complete')}
        />
      </div>
    );
  }

  // Retake Handler
  const handleRetakeOnboarding = () => {
    setOnboardingStatus('onboarding');
    setCurrentView('home'); // Reset view for when they come back
  };

  return (
    <div className="min-h-screen bg-orange-50 pb-24">
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
          {/* <div className="text-xs font-medium text-gray-400 uppercase tracking-widest hidden sm:block">
             Step {onboardingStatus === 'complete' ? 'Track' : 'Start'}
          </div> */}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8">

        {currentView === 'profile' ? (
          <UserProfile onRetakeOnboarding={handleRetakeOnboarding} />
        ) : currentView === 'scan' ? (
          <ScanPage />
        ) : (
          <DailyInsights userProfile={userProfile} />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/50 pb-safe pt-2 px-6 shadow-2xl z-50 transition-all duration-300">
        <div className="max-w-md mx-auto flex justify-between items-center h-16">
          <button
            onClick={() => { setCurrentView('home'); loadProfile(); }} // Reload profile on home click to refresh metrics if changed
            className={`flex flex-col items-center space-y-1 w-1/3 ${currentView === 'home' ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Home size={24} strokeWidth={currentView === 'home' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Daily</span>
          </button>

          <button
            onClick={() => setCurrentView('scan')}
            className="relative -top-6 bg-orange-500 text-white p-4 rounded-full shadow-lg shadow-orange-200 hover:scale-105 transition transform"
          >
            <Camera size={28} />
          </button>

          <button
            onClick={() => setCurrentView('profile')}
            className={`flex flex-col items-center space-y-1 w-1/3 ${currentView === 'profile' ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <User size={24} strokeWidth={currentView === 'profile' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;