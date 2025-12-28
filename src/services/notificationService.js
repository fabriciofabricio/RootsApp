import { getToken, onMessage } from "firebase/messaging";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db, getFirebaseMessaging } from "./firebaseConfig";

// VAPID Key from Firebase Console
const VAPID_KEY = "BMjaqoKEhqIdDX3Iq6_qJvJNaAscGzwa_2FkeYeDxdqUqGBWzZ2yGYjFPuBvxYxa6cQ-wT7pLosUSJVis8weRuc";

/**
 * Request notification permission from the user
 * @returns {Promise<boolean>} Whether permission was granted
 */
export const requestNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
    }
};

/**
 * Check if notifications are supported in this browser/context
 * @returns {boolean}
 */
export const isNotificationSupported = () => {
    return 'Notification' in window &&
        'serviceWorker' in navigator &&
        'PushManager' in window;
};

/**
 * Check if user has already granted notification permission
 * @returns {boolean}
 */
export const hasNotificationPermission = () => {
    return Notification.permission === 'granted';
};

/**
 * Register the service worker and get FCM token
 * @param {string} userId - The current user's UID
 * @returns {Promise<string|null>} The FCM token or null if failed
 */
export const registerForPushNotifications = async (userId) => {
    if (!isNotificationSupported()) {
        console.log('Push notifications not supported');
        return null;
    }

    try {
        // Request permission first
        const permissionGranted = await requestNotificationPermission();
        if (!permissionGranted) {
            console.log('Notification permission denied');
            return null;
        }

        // Register service worker (managed by vite-plugin-pwa now, but we get the registration here)
        let registration = await navigator.serviceWorker.getRegistration('/sw.js');

        if (!registration) {
            // Fallback if PWA plugin didn't register it yet, or to ensure it's the right one
            registration = await navigator.serviceWorker.register('/sw.js');
        }
        console.log('Service Worker registered:', registration);

        // Get messaging instance
        const messaging = await getFirebaseMessaging();
        if (!messaging) {
            console.log('Messaging not supported');
            return null;
        }

        // Get FCM token
        const token = await getToken(messaging, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration
        });

        if (token) {
            console.log('FCM Token obtained:', token.substring(0, 20) + '...');

            // Save token to user's Firestore document
            await saveTokenToFirestore(userId, token);

            return token;
        } else {
            console.log('No FCM token available');
            return null;
        }
    } catch (error) {
        console.error('Error registering for push notifications:', error);
        return null;
    }
};

/**
 * Save FCM token to user's Firestore document
 * @param {string} userId 
 * @param {string} token 
 */
const saveTokenToFirestore = async (userId, token) => {
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            fcmTokens: arrayUnion(token)
        });
        console.log('FCM token saved to Firestore');
    } catch (error) {
        console.error('Error saving FCM token:', error);
    }
};

/**
 * Remove FCM token from user's Firestore document
 * @param {string} userId 
 * @param {string} token 
 */
export const removeTokenFromFirestore = async (userId, token) => {
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            fcmTokens: arrayRemove(token)
        });
        console.log('FCM token removed from Firestore');
    } catch (error) {
        console.error('Error removing FCM token:', error);
    }
};

/**
 * Setup foreground message listener
 * @param {Function} callback - Function to call when message received
 */
export const setupForegroundMessageListener = async (callback) => {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return;

    onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);

        // Show notification manually for foreground
        if (Notification.permission === 'granted') {
            const notification = new Notification(payload.notification?.title || 'New Notification', {
                body: payload.notification?.body || '',
                icon: '/icons/icon-192.png',
                tag: payload.data?.postId || 'default'
            });

            notification.onclick = () => {
                window.focus();
                if (payload.data?.url) {
                    window.location.href = payload.data.url;
                }
            };
        }

        if (callback) {
            callback(payload);
        }
    });
};
