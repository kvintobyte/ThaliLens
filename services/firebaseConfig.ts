import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "***REMOVED***",
    authDomain: "thalilens.firebaseapp.com",
    projectId: "thalilens",
    storageBucket: "thalilens.firebasestorage.app",
    messagingSenderId: "41273663924",
    appId: "1:41273663924:web:9fd6ebccfa8d6e481152e1",
    measurementId: "G-FKXV3XXYM1"
};

import { getAuth } from "firebase/auth";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
