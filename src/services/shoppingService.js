import { db } from "./firebaseConfig";
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    limit
} from "firebase/firestore";

const SHOPPING_LIST_COLLECTION = "shopping_list";
const SHOPPING_LOGS_COLLECTION = "shopping_logs";

// Subscribe to shopping list changes
export const subscribeToShoppingList = (callback) => {
    const q = query(
        collection(db, SHOPPING_LIST_COLLECTION),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(items);
    });
};

// Log an action
const logAction = async (action, itemLabel, user, metadata = {}) => {
    try {
        await addDoc(collection(db, SHOPPING_LOGS_COLLECTION), {
            action,
            itemLabel,
            performedBy: {
                uid: user.uid,
                name: user.name || user.displayName || user.email || "Unknown User",
                email: user.email
            },
            metadata: metadata, // Store extra info like who created/completed the item
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Error logging action:", error);
    }
};

// Add a new item
export const addItem = async (label, user) => {
    if (!label.trim()) return;

    try {
        const newItem = {
            label: label.trim(),
            checked: false,
            createdAt: serverTimestamp(),
            createdBy: {
                uid: user.uid,
                name: user.name || user.displayName || user.email || "Unknown User"
            },
            completedBy: null,
            completedAt: null
        };

        await addDoc(collection(db, SHOPPING_LIST_COLLECTION), newItem);

        await logAction("add", label.trim(), user);
    } catch (error) {
        console.error("Error adding item:", error);
        throw error;
    }
};

// Toggle item status (check/uncheck)
export const toggleItemStatus = async (item, user) => {
    try {
        const itemRef = doc(db, SHOPPING_LIST_COLLECTION, item.id);
        const newCheckedStatus = !item.checked;

        await updateDoc(itemRef, {
            checked: newCheckedStatus,
            completedBy: newCheckedStatus ? {
                uid: user.uid,
                name: user.name || user.displayName || user.email || "Unknown User"
            } : null,
            completedAt: newCheckedStatus ? serverTimestamp() : null
        });

        await logAction(
            newCheckedStatus ? "complete" : "uncomplete",
            item.label,
            user,
            {
                createdBy: item.createdBy,
                createdAt: item.createdAt
            }
        );
    } catch (error) {
        console.error("Error toggling item:", error);
        throw error;
    }
};

// Delete an item
export const deleteItem = async (item, user) => {
    try {
        await deleteDoc(doc(db, SHOPPING_LIST_COLLECTION, item.id));
        await logAction("delete", item.label, user, {
            createdBy: item.createdBy,
            createdAt: item.createdAt,
            completedBy: item.completedBy,
            completedAt: item.completedAt
        });
    } catch (error) {
        console.error("Error deleting item:", error);
        throw error;
    }
};

// Clear all completed items
export const clearCompletedItems = async (items, user) => {
    const completedItems = items.filter(i => i.checked);

    for (const item of completedItems) {
        await deleteItem(item, user);
    }
};

// Get logs
export const subscribeToShoppingLogs = (callback, logLimit = 50) => {
    const q = query(
        collection(db, SHOPPING_LOGS_COLLECTION),
        orderBy("timestamp", "desc"),
        limit(logLimit)
    );

    return onSnapshot(q, (snapshot) => {
        const logs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(logs);
    });
};
