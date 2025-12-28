/**
 * Cloud Functions for Roots App
 * Handles push notifications when users are tagged in posts
 */

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

// Initialize Firebase Admin
initializeApp();

const db = getFirestore();
const messaging = getMessaging();

/**
 * Trigger: When a new post is created
 * Action: Send push notifications to tagged users and users with tagged roles
 */
exports.sendPostNotification = onDocumentCreated("posts/{postId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        console.log("No data in document");
        return null;
    }

    const post = snapshot.data();
    const postId = event.params.postId;

    // Check if there are any tags
    const taggedUsers = post.taggedUsers || [];
    const taggedRoles = post.taggedRoles || [];

    if (taggedUsers.length === 0 && taggedRoles.length === 0) {
        console.log("No tags in post, skipping notification");
        return null;
    }

    console.log(`Processing post ${postId} with ${taggedUsers.length} tagged users and ${taggedRoles.length} tagged roles`);

    try {
        // Collect all FCM tokens to notify
        const tokensToNotify = new Set();
        const userIdsToNotify = new Set();

        // 1. Get tokens for directly tagged users
        if (taggedUsers.length > 0) {
            taggedUsers.forEach(uid => userIdsToNotify.add(uid));

            const userDocs = await Promise.all(
                taggedUsers.map(userId => db.collection("users").doc(userId).get())
            );

            userDocs.forEach(doc => {
                if (doc.exists) {
                    const userData = doc.data();
                    const tokens = userData.fcmTokens || [];
                    tokens.forEach(token => tokensToNotify.add(token));
                }
            });
        }

        // 2. Get tokens for users with tagged roles
        if (taggedRoles.length > 0) {
            const roleUsersSnapshot = await db.collection("users")
                .where("workspaceId", "==", post.workspaceId)
                .where("role", "in", taggedRoles)
                .get();

            roleUsersSnapshot.forEach(doc => {
                userIdsToNotify.add(doc.id);
                const userData = doc.data();
                const tokens = userData.fcmTokens || [];
                tokens.forEach(token => tokensToNotify.add(token));
            });
        }

        // Remove author's own tokens (don't notify yourself)
        if (post.authorId) {
            userIdsToNotify.delete(post.authorId);

            const authorDoc = await db.collection("users").doc(post.authorId).get();
            if (authorDoc.exists) {
                const authorTokens = authorDoc.data().fcmTokens || [];
                authorTokens.forEach(token => tokensToNotify.delete(token));
            }
        }

        // 3. Save notifications to Firestore for persistent history
        const batch = db.batch();

        // Batch write notifications
        const notificationData = {
            type: 'post_tag',
            postId: postId,
            content: post.content ? (post.content.length > 50 ? post.content.substring(0, 50) + "..." : post.content) : "New post",
            authorName: post.authorName || "Someone",
            authorPhoto: post.authorPhoto || null,
            createdAt: FieldValue.serverTimestamp(),
            read: false,
            url: `/feed?postId=${postId}`
        };

        userIdsToNotify.forEach(uid => {
            const ref = db.collection("users").doc(uid).collection("notifications").doc();
            batch.set(ref, notificationData);
        });

        await batch.commit();
        console.log(`Saved notifications to DB for ${userIdsToNotify.size} users`);

        const tokens = Array.from(tokensToNotify);

        if (tokens.length === 0) {
            console.log("No valid tokens to notify (but DB notifications saved)");
            return null;
        }

        console.log(`Sending notification to ${tokens.length} device(s)`);

        // Build notification message
        const authorName = post.authorName || "Someone";
        const contentPreview = post.content
            ? (post.content.length > 50 ? post.content.substring(0, 50) + "..." : post.content)
            : "New post";

        const message = {
            // Use data-only payload to let service worker handle notification display
            // This prevents duplicate notifications (FCM auto-display + SW display)
            data: {
                title: `${authorName} tagged you`,
                body: contentPreview,
                image: post.image || "",
                authorPhoto: post.authorPhoto || "",
                icon: "/icons/icon-192.png",
                postId: postId,
                url: `/feed?postId=${postId}`,
                type: "post_tag"
            },
            // Android-specific configuration (data-only, no notification object)
            android: {
                priority: "high",
                ttl: 86400000 // 24 hours in milliseconds - message stays pending
            },
            // Web push configuration (data-only, no notification object)
            webpush: {
                headers: {
                    Urgency: "high",
                    TTL: "86400" // 24 hours - message stays pending on push service
                },
                fcmOptions: {
                    link: `/feed?postId=${postId}`
                }
            },
            tokens: tokens
        };

        // Send notifications
        const response = await messaging.sendEachForMulticast(message);

        console.log(`Successfully sent ${response.successCount} notifications`);

        // Handle failed tokens (remove invalid ones from Firestore)
        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(tokens[idx]);
                    console.log(`Failed to send to token: ${resp.error?.message}`);
                }
            });

            // Remove invalid tokens from users (optional cleanup)
            // This helps keep the database clean of expired tokens
            console.log(`${failedTokens.length} tokens failed and should be cleaned up`);
        }

        return { success: true, sentCount: response.successCount };

    } catch (error) {
        console.error("Error sending notifications:", error);
        return { success: false, error: error.message };
    }
});


