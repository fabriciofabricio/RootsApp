import { X, Send, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { uploadPostImage } from '../../services/storageService';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';

const PRESETS = [
    "Lunch is ready 🥗",
    "Dinner is ready! 🍝",
    "Play pool 🎱",
    "Let's go out 🍻",
    "Movie night 🎬",
    "Anyone for a walk? 🚶"
];

const CreatePostModal = ({ isOpen, onClose }) => {
    const { currentUser } = useAuth();
    const [message, setMessage] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handlePresetClick = (preset) => {
        setMessage(preset);
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handlePost = async () => {
        if (!message.trim() && !image) return;
        setIsLoading(true);

        try {
            let imageUrl = null;

            if (image) {
                imageUrl = await uploadPostImage(image, currentUser.uid);
            }

            // Create Post in Firestore
            await addDoc(collection(db, "posts"), {
                content: message,
                image: imageUrl,
                authorId: currentUser.uid,
                authorName: currentUser.name || currentUser.email,
                authorPhoto: currentUser.photoURL || null,
                workspaceId: currentUser.workspaceId,
                createdAt: serverTimestamp(),
                likes: [],
                comments: 0,
                type: 'user'
            });

            setMessage('');
            removeImage();
            onClose();

        } catch (error) {
            console.error("Error creating post:", error);
            alert("Failed to create post. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-surface border border-gray-800 rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-main">New Post</h3>
                    <button onClick={onClose} className="p-2 text-muted hover:text-main rounded-full hover:bg-gray-200 dark:bg-white/10 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="What's happening?"
                        className="w-full h-32 bg-background rounded-xl p-4 text-main placeholder-gray-500 resize-none border border-gray-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        autoFocus
                    />

                    {imagePreview && (
                        <div className="relative rounded-xl overflow-hidden border border-white/10 max-h-48">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            <button
                                onClick={removeImage}
                                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImageSelect}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-800 text-muted hover:text-primary hover:border-primary/50 transition-all text-sm font-medium"
                        >
                            <ImageIcon size={16} />
                            Add Image
                        </button>
                    </div>

                    <div>
                        <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Quick Presets</p>
                        <div className="flex flex-wrap gap-2">
                            {PRESETS.map((preset) => (
                                <button
                                    key={preset}
                                    onClick={() => handlePresetClick(preset)}
                                    className={clsx(
                                        "px-3 py-1.5 rounded-full border text-sm transition-all active:scale-95",
                                        message === preset
                                            ? "bg-primary text-background border-primary font-medium"
                                            : "bg-gray-100 dark:bg-white/5 border-gray-800 text-muted hover:bg-gray-200 dark:bg-white/10 hover:text-main hover:border-gray-700"
                                    )}
                                >
                                    {preset}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handlePost}
                            disabled={(!message.trim() && !image) || isLoading}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-background font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                        >
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            Post
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePostModal;



