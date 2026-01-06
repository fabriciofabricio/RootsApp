import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../services/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import {
    registerForPushNotifications,
    setupForegroundMessageListener,
    isNotificationSupported,
    hasNotificationPermission
} from "../services/notificationService";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notificationStatus, setNotificationStatus] = useState('unknown'); // 'unknown' | 'granted' | 'denied' | 'unsupported'

    useEffect(() => {
        let userUnsubscribe;

        const authUnsubscribe = onAuthStateChanged(auth, (user) => {
            // Clean up previous user listener if exists
            if (userUnsubscribe) {
                userUnsubscribe();
                userUnsubscribe = null;
            }

            if (user) {
                // Subscribe to real-time user updates
                const userDocRef = doc(db, "users", user.uid);
                userUnsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
                    if (docSnapshot.exists()) {
                        const userData = { ...user, ...docSnapshot.data() };
                        setCurrentUser(userData);
                    } else {
                        // Fallback if no firestore doc yet
                        setCurrentUser(user);
                    }
                    setLoading(false);

                    // Setup push notifications after user data is loaded
                    setupNotifications(user.uid);
                }, (error) => {
                    console.error("Error fetching user data:", error);
                    setCurrentUser(user);
                    setLoading(false);
                });
            } else {
                setCurrentUser(null);
                setNotificationStatus('unknown');
                setLoading(false);
            }
        });

        return () => {
            authUnsubscribe();
            if (userUnsubscribe) userUnsubscribe();
        };
    }, []);

    // Setup push notifications
    const setupNotifications = async (userId) => {
        if (!isNotificationSupported()) {
            setNotificationStatus('unsupported');
            return;
        }

        // Check current permission status
        if (hasNotificationPermission()) {
            setNotificationStatus('granted');
            // Register for push notifications silently if permission already granted
            await registerForPushNotifications(userId);
            setupForegroundMessageListener();
        } else if (Notification.permission === 'denied') {
            setNotificationStatus('denied');
        } else {
            setNotificationStatus('unknown'); // Not yet asked
        }
    };

    // Function to request notifications (can be called from UI)
    const requestNotifications = async () => {
        if (!currentUser?.uid) return false;

        const token = await registerForPushNotifications(currentUser.uid);
        if (token) {
            setNotificationStatus('granted');
            setupForegroundMessageListener();
            return true;
        } else {
            setNotificationStatus('denied');
            return false;
        }
    };

    const value = {
        currentUser,
        notificationStatus,
        requestNotifications
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
