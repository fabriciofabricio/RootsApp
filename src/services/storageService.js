import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebaseConfig";

/**
 * Uploads a profile photo to Firebase Storage.
 * 
 * @param {File} file - The file to upload.
 * @param {string} userId - The ID of the user uploading the photo.
 * @returns {Promise<string>} - The download URL of the uploaded photo.
 */
export const uploadProfilePhoto = async (file, userId) => {
    try {
        // Create a reference to 'profile_photos/<userId>'
        const fileRef = ref(storage, `profile_photos/${userId}`);

        await uploadBytes(fileRef, file);
        const photoURL = await getDownloadURL(fileRef);

        return photoURL;
    } catch (error) {
        console.error("Error uploading profile photo:", error);
        throw error;
    }
};

/**
 * Uploads a post image to Firebase Storage.
 * 
 * @param {File} file - The file to upload.
 * @param {string} userId - The ID of the user uploading the photo.
 * @returns {Promise<string>} - The download URL of the uploaded photo.
 */
export const uploadPostImage = async (file, userId) => {
    try {
        const timestamp = Date.now();
        const fileRef = ref(storage, `posts/${userId}/${timestamp}_${file.name}`);

        await uploadBytes(fileRef, file);
        const photoURL = await getDownloadURL(fileRef);

        return photoURL;
    } catch (error) {
        console.error("Error uploading post image:", error);
        throw error;
    }
};
