import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { uploadMomentImage } from '../../services/storageService';
import { db } from '../../services/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { X, Upload, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import clsx from 'clsx';

const CATEGORIES = [
    { id: 'team', label: 'Team' },
    { id: 'fun', label: 'Event' },
    { id: 'kitchen', label: 'Cozinha' },
];

const NewMomentModal = ({ onClose }) => {
    const { currentUser } = useAuth();
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!image || !selectedCategory) return;

        setLoading(true);
        try {
            // 1. Upload Image
            const imageUrl = await uploadMomentImage(image, currentUser.uid);

            // 2. Create Firestore Document
            const now = new Date();
            const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

            await addDoc(collection(db, 'moments'), {
                imageUrl,
                tag: selectedCategory,
                createdAt: serverTimestamp(),
                authorId: currentUser.uid,
                authorName: currentUser.displayName || currentUser.email.split('@')[0],
                authorPhoto: currentUser.photoURL || null,
                likes: 0,
                workspaceId: currentUser.workspaceId || null,
                month_year: monthYear
            });

            onClose();
        } catch (error) {
            console.error("Error creating moment:", error);
            alert("Failed to create moment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <h2 className="text-lg font-bold text-main">New Moment</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted hover:text-main">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Image Upload Area */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={clsx(
                            "relative aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group",
                            previewUrl
                                ? "border-transparent"
                                : "border-white/10 hover:border-primary/50 hover:bg-white/5"
                        )}
                    >
                        {previewUrl ? (
                            <>
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <p className="text-white font-medium flex items-center gap-2">
                                        <ImageIcon size={20} />
                                        Change Image
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="text-center p-6">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-primary">
                                    <Upload size={32} />
                                </div>
                                <p className="text-main font-medium mb-1">Click to upload photo</p>
                                <p className="text-xs text-muted">Supports JPG, PNG</p>
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageSelect}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    {/* Category Selection */}
                    <div>
                        <label className="block text-sm font-medium text-muted mb-3">Select Category</label>
                        <div className="grid grid-cols-3 gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={clsx(
                                        "py-2 px-3 rounded-lg text-sm font-medium transition-all border",
                                        selectedCategory === cat.id
                                            ? "bg-primary text-background border-primary shadow-[0_0_15px_-3px_rgba(255,215,0,0.3)]"
                                            : "bg-white/5 text-muted border-white/5 hover:bg-white/10 hover:text-main"
                                    )}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!image || !selectedCategory || loading}
                        className={clsx(
                            "w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
                            (!image || !selectedCategory || loading)
                                ? "bg-white/5 text-muted cursor-not-allowed"
                                : "bg-gradient-to-r from-primary to-yellow-400 text-background shadow-lg hover:shadow-[0_0_20px_-5px_#FFD700] transform active:scale-[0.98]"
                        )}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Posting...
                            </>
                        ) : (
                            <>
                                <Check size={20} />
                                Post Moment
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewMomentModal;
