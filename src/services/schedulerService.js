import { db } from './firebaseConfig';
import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    query,
    where,
    getDocs
} from 'firebase/firestore';

const COLLECTION_NAME = 'schedules';

export const schedulerService = {
    /**
     * Fetch the schedule for a specific week.
     * @param {string} weekId - Format "YYYY-wWW" (e.g., "2023-w42")
     * @returns {Promise<Object>} The schedule document data or a default structure
     */
    async getWeekSchedule(weekId) {
        try {
            const docRef = doc(db, COLLECTION_NAME, weekId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data();
            } else {
                // Return default empty structure if it doesn't exist
                return {
                    id: weekId,
                    shifts: []
                };
            }
        } catch (error) {
            console.error("Error fetching week schedule:", error);
            throw error;
        }
    },

    /**
     * Save or update an entire week's schedule.
     * @param {string} weekId 
     * @param {Object} scheduleData 
     */
    async saveWeekSchedule(weekId, scheduleData) {
        try {
            const docRef = doc(db, COLLECTION_NAME, weekId);
            await setDoc(docRef, scheduleData, { merge: true });
        } catch (error) {
            console.error("Error saving week schedule:", error);
            throw error;
        }
    },

    /**
     * Add or update a single shift locally within the shifts array and save the doc.
     * Note: Firestore doesn't support updating a specific array element by index easily without reading first.
     * We will implement this by reading, modifying, and writing back for simplicity in this version,
     * or by using arrayRemove/arrayUnion if we treat immutable objects.
     * 
     * For this implementation, since we need to validate constraints potentially against the whole week,
     * it is safer to handle logic in the UI/business layer and use saveWeekSchedule, 
     * but we provide a helper here if needed.
     */
    async addShift(weekId, shift) {
        try {
            const docRef = doc(db, COLLECTION_NAME, weekId);
            // We use arrayUnion, but this requires the object to be exactly unique. 
            // Better to use a read-modify-write pattern for updates.
            await updateDoc(docRef, {
                shifts: arrayUnion(shift)
            });
        } catch (error) {
            // If doc doesn't exist, Create it
            try {
                const docRef = doc(db, COLLECTION_NAME, weekId);
                await setDoc(docRef, { id: weekId, shifts: [shift] }, { merge: true });
            } catch (innerError) {
                console.error("Error creating week with shift:", innerError);
                throw innerError;
            }
        }
    },

    /**
     * Remove a shift
     */
    async removeShift(weekId, shift) {
        try {
            const docRef = doc(db, COLLECTION_NAME, weekId);
            await updateDoc(docRef, {
                shifts: arrayRemove(shift)
            });
        } catch (error) {
            console.error("Error removing shift:", error);
            throw error;
        }
    },

    // --- Validation Helpers (can be used by UI) ---

    validateVolunteerConstraints(volunteer, newShift, currentWeekShifts) {
        const errors = [];
        const warnings = [];
        const isVolunteer = ['breakfast', 'cleaning', 'bar', 'volunteer'].includes(volunteer.role?.toLowerCase()) || volunteer.isVolunteer;

        if (!isVolunteer) return { valid: true, errors: [], warnings: [] };

        // 1. Restricted Areas (Error)
        if (['Front Office', 'Intern'].includes(newShift.role)) {
            errors.push("Volunteers cannot be assigned to Front Office or Intern shifts.");
        }

        // 2. Max 1 shift per day (Error)
        const shiftsOnSameDay = currentWeekShifts.filter(s =>
            s.userId === volunteer.id &&
            s.day === newShift.day &&
            s.id !== newShift.id // Exclude self if updating
        );

        if (shiftsOnSameDay.length > 0) {
            errors.push("Volunteers can only have one shift per day.");
        }

        // 3. Mandatory Rest: At least 2 days off per week (Warning Only)
        // We count distinct days worked including the new one
        const daysWorked = new Set(currentWeekShifts.filter(s => s.userId === volunteer.id).map(s => s.day));
        daysWorked.add(newShift.day);

        // If days worked > 5, then days off < 2 (assuming 7 day week)
        if (daysWorked.size > 5) {
            warnings.push("Warning: Volunteer has less than two days off this week.");
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
};
