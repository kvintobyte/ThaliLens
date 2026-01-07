import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously, signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { createUserProfile } from '../services/firebaseUtils';
import { updateProfile } from 'firebase/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signup: (email: string, pass: string, name: string, dob: string) => Promise<void>;
    login: (email: string, pass: string) => Promise<void>;
    loginAnonymously: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signup = async (email: string, pass: string, name: string, dob: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        // Create user profile in Firestore
        await createUserProfile(userCredential.user.uid, {
            email: userCredential.user.email,
            displayName: name,
            dateOfBirth: dob
        });
        // Update Auth profile displayName
        await updateProfile(userCredential.user, {
            displayName: name
        });
    };

    const login = async (email: string, pass: string) => {
        await signInWithEmailAndPassword(auth, email, pass);
    };

    const logout = async () => {
        await signOut(auth);
    };

    const value = {
        user,
        loading,
        signup,
        login,
        loginAnonymously: async () => {
            await signInAnonymously(auth);
        },
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
