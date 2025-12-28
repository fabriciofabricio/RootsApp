import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'

// Clean up old caches
cleanupOutdatedCaches()

// Precache and route assets
precacheAndRoute(self.__WB_MANIFEST)

// Skip waiting to activate new SW immediately
self.skipWaiting()

// Claim clients immediately
clientsClaim()

// --- Firebase Messaging Logic ---
import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

// Initialize Firebase in the service worker
const firebaseApp = initializeApp({
    apiKey: "AIzaSyATnf5KrLEPWG-zk2-23jpSRgnHPg1Aki8",
    authDomain: "rootsvolunteerapp.firebaseapp.com",
    projectId: "rootsvolunteerapp",
    storageBucket: "rootsvolunteerapp.firebasestorage.app",
    messagingSenderId: "398460717016",
    appId: "1:398460717016:web:86127bac1d9d51235614ad"
});

const messaging = getMessaging(firebaseApp);

// Handle background messages
onBackgroundMessage(messaging, (payload) => {
    console.log('[SW] Background message received:', payload);

    // Parse data-only payload
    const data = payload.data || {};
    const notificationTitle = data.title || 'New Notification';
    const notificationOptions = {
        body: data.body || '',
        icon: (data.authorPhoto && data.authorPhoto.startsWith('http')) ? data.authorPhoto : '/icons/icon-192.png',
        image: data.image || undefined, // Show post image if available
        badge: '/icons/icon-192.png', // Small app icon for the status bar
        tag: data.postId || 'default',
        data: {
            url: data.url || '/',
            postId: data.postId
        },
        vibrate: [100, 50, 100],
        requireInteraction: true,
        actions: [
            {
                action: 'open',
                title: 'View Post'
            }
        ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event);
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Check if app is already open
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.navigate(urlToOpen);
                    return client.focus();
                }
            }
            // Open new window if app not open
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
