import { db, auth } from './firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, increment, collection, onSnapshot, getDocs, query, where } from 'firebase/firestore';
import { DailyLog, LogEntry, UserProfileData } from '../types';

const getUserId = () => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    return user.uid;
};

const getTodayDateString = (): string => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getDailyLogRef = () => {
    // If not authenticated, this might throw or fail. 
    // Ideally we ensure auth before calling this.
    try {
        const userId = getUserId();
        const dateStr = getTodayDateString();
        return doc(db, 'users', userId, 'daily_logs', dateStr);
    } catch (e) {
        throw e;
    }
};

export const fetchTodayLog = async (): Promise<DailyLog | null> => {
    try {
        const docRef = getDailyLogRef();
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            // Migration helper for old 'meals' array if needed, but for now we assume new structure or empty
            return data as DailyLog;
        } else {
            return null;
        }
    } catch (e) {
        console.error("Error fetching log:", e);
        return null;
    }
};

export const initializeTodayLog = async (currentWeight: number = 0) => {
    try {
        const docRef = getDailyLogRef();
        const dateStr = getTodayDateString();

        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            const newLog: DailyLog = {
                date: dateStr,
                totalCalories: 0,
                waterIntake: 0,
                currentWeight: currentWeight,
                entries: []
            };
            await setDoc(docRef, newLog);
            return newLog;
        }
        return docSnap.data() as DailyLog;
    } catch (e) {
        console.error("Error initializing log:", e);
        throw e;
    }
}

export const addLogEntry = async (entry: LogEntry) => {
    try {
        const docRef = getDailyLogRef();
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            await setDoc(docRef, {
                date: getTodayDateString(),
                totalCalories: entry.totalCalories,
                waterIntake: 0,
                currentWeight: 0,
                entries: [entry]
            });
        } else {
            await updateDoc(docRef, {
                entries: arrayUnion(entry),
                totalCalories: increment(entry.totalCalories)
            });
        }
    } catch (e) {
        console.error("Error adding entry:", e);
        throw e;
    }
}

export const updateWater = async (amount: number) => {
    try {
        const docRef = getDailyLogRef();
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            await setDoc(docRef, {
                date: getTodayDateString(),
                totalCalories: 0,
                waterIntake: amount,
                currentWeight: 0,
                entries: []
            });
        } else {
            await updateDoc(docRef, {
                waterIntake: increment(amount)
            });
        }
    } catch (e) {
        console.error("Error updating water:", e);
        throw e;
    }
};

export const updateDailyLog = async (data: Partial<DailyLog>) => {
    try {
        const docRef = getDailyLogRef();
        await updateDoc(docRef, data);
    } catch (e) {
        console.error("Error updating daily log:", e);
        throw e;
    }
}

export const subscribeToTodayLog = (callback: (log: DailyLog | null) => void) => {
    try {
        const docRef = getDailyLogRef();
        return onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                // Simple migration check: if 'meals' exists but 'entries' does not, we should technically migrate, but for this demo let's assume new structure or handle it gracefully in UI.
                // Actually let's just return what we have.
                callback(data as DailyLog);
            } else {
                callback(null);
            }
        });
    } catch (e) {
        console.error("Subscription error (likely not logged in):", e);
        callback(null);
        return () => { };
    }
};

export const fetchMonthlyLogs = async (year: number, month: number): Promise<DailyLog[]> => {
    try {
        const userId = getUserId();
        const monthStr = String(month).padStart(2, '0');
        const startDate = `${year}-${monthStr}-01`;
        const endDate = `${year}-${monthStr}-31`;

        const logsRef = collection(db, 'users', userId, 'daily_logs');
        const q = query(logsRef, where('date', '>=', startDate), where('date', '<=', endDate));

        const querySnapshot = await getDocs(q);
        const logs: DailyLog[] = [];
        querySnapshot.forEach((doc) => {
            logs.push(doc.data() as DailyLog);
        });
        return logs.sort((a, b) => a.date.localeCompare(b.date));
    } catch (e) {
        console.error("Error fetching monthly logs:", e);
        return [];
    }
};

export const createUserProfile = async (userId: string, data: Omit<UserProfileData, 'uid' | 'createdAt'>) => {
    try {
        const docRef = doc(db, 'users', userId);
        const newProfile: UserProfileData = {
            uid: userId,
            createdAt: new Date().toISOString(),
            ...data
        };
        await setDoc(docRef, newProfile);
        return newProfile;
    } catch (e) {
        console.error("Error creating user profile:", e);
        throw e;
    }
};

export const fetchUserProfile = async (userId: string): Promise<UserProfileData | null> => {
    try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as UserProfileData;
        }
        return null;
    } catch (e) {
        console.error("Error fetching user profile:", e);
        return null;
    }
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfileData>) => {
    try {
        const docRef = doc(db, 'users', userId);
        await updateDoc(docRef, data);
    } catch (e) {
        console.error("Error updating user profile:", e);
        throw e;
    }
};
