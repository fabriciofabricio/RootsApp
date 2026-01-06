import { initializeApp, getApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";

// Re-use the config from your main config file or duplicate it here if not exported
const firebaseConfig = {
    apiKey: "AIzaSyATnf5KrLEPWG-zk2-23jpSRgnHPg1Aki8",
    authDomain: "rootsvolunteerapp.firebaseapp.com",
    projectId: "rootsvolunteerapp",
    storageBucket: "rootsvolunteerapp.firebasestorage.app",
    messagingSenderId: "398460717016",
    appId: "1:398460717016:web:86127bac1d9d51235614ad"
};

/**
 * Creates a new user in Firebase Auth and Firestore without logging out the current user.
 * 
 * @param {string} email 
 * @param {string} password 
 * @param {string} role - 'volunteer' | 'staff' | 'manager'
 * @param {object} adminUser - The current admin user object (must contain workspaceId)
 */
export const createSecondaryUser = async (email, password, role, name, adminUser) => {
    // 1. Initialize a secondary app instance
    const secondaryAppName = "secondaryApp";
    let secondaryApp;

    try {
        secondaryApp = getApp(secondaryAppName);
    } catch (e) {
        secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
    }

    const secondaryAuth = getAuth(secondaryApp);

    try {
        // 2. Create the user in Auth
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        const newUser = userCredential.user;

        // 3. Create the user in Firestore (using the PRIMARY app's db instance)
        // We use the primary 'db' because we are authenticated as Admin there, 
        // and usually Admins have permission to write to 'users' collection.
        // If security rules require the NEW user to write their own doc, this might fail,
        // but typically Admins create the doc.

        await setDoc(doc(db, "users", newUser.uid), {
            email: newUser.email,
            role: role,
            name: name,
            workspaceId: adminUser.workspaceId,
            hostelName: adminUser.hostelName || '',
            createdAt: new Date().toISOString(),
            createdBy: adminUser.uid
        });

        // 4. Sign out the secondary user immediately so it doesn't interfere
        await signOut(secondaryAuth);

        return newUser;

    } catch (error) {
        throw error;
    } finally {
        // 5. Clean up the secondary app
        if (secondaryApp) {
            await deleteApp(secondaryApp);
        }
    }
};

/**
 * Updates a user's name and records the previous name in history.
 * 
 * @param {string} userId - The ID of the user to update
 * @param {string} newName - The new name to set
 * @param {string} oldName - The current name (to be moved to history)
 */
export const updateUserName = async (userId, newName, oldName) => {
    if (!userId || !newName) return;

    const userRef = doc(db, "users", userId);

    const updateData = {
        name: newName
    };

    if (oldName) {
        updateData.nameHistory = arrayUnion({
            name: oldName,
            changedAt: Timestamp.now()
        });
    }

    await updateDoc(userRef, updateData);
};
