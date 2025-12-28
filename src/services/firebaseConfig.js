import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyATnf5KrLEPWG-zk2-23jpSRgnHPg1Aki8",
    authDomain: "rootsvolunteerapp.firebaseapp.com",
    projectId: "rootsvolunteerapp",
    storageBucket: "rootsvolunteerapp.firebasestorage.app",
    messagingSenderId: "398460717016",
    appId: "1:398460717016:web:86127bac1d9d51235614ad"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize messaging only if supported (not in SSR, not in unsupported browsers)
let messaging = null;

export const getFirebaseMessaging = async () => {
    if (messaging) return messaging;

    const supported = await isSupported();
    if (supported) {
        messaging = getMessaging(app);
    }
    return messaging;
};

export { app };
