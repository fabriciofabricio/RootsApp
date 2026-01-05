import { X, Send, Image as ImageIcon, Loader2, AtSign, Users, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { uploadPostImage } from '../../services/storageService';
import { addDoc, collection, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';

const PRESETS = [
    "Lunch is ready 🥗",
    "Dinner is ready! 🍝",
    "Play pool 🎱",
    "Let's go out 🍻",
    "Movie night 🎬",
    "Anyone for a walk? 🚶"
];

const AVAILABLE_ROLES = [
    { id: 'volunteer', label: 'Volunteers', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { id: 'staff', label: 'Staff', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { id: 'manager', label: 'Managers', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    { id: 'admin', label: 'Admins', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
];

const CreatePostModal = ({ isOpen, onClose }) => {
    const { currentUser } = useAuth();
    const [message, setMessage] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    // Tagging State
    const [showTagSelector, setShowTagSelector] = useState(false);
    const [taggedRoles, setTaggedRoles] = useState([]);
    const [taggedUsers, setTaggedUsers] = useState([]);
    const [workspaceUsers, setWorkspaceUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Fetch workspace users when modal opens
    useEffect(() => {
        if (isOpen && currentUser?.workspaceId) {
            const fetchUsers = async () => {
                setLoadingUsers(true);
                try {
                    const q = query(
                        collection(db, "users"),
                        where("workspaceId", "==", currentUser.workspaceId)
                    );
                    const snapshot = await getDocs(q);
                    const users = [];
                    snapshot.forEach((doc) => {
                        // Exclude current user from the list
                        if (doc.id !== currentUser.uid) {
                            users.push({ id: doc.id, ...doc.data() });
                        }
                    });
                    setWorkspaceUsers(users);
                } catch (error) {
                    console.error("Error fetching users:", error);
                } finally {
                    setLoadingUsers(false);
                }
            };
            fetchUsers();
        }
    }, [isOpen, currentUser]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setMessage('');
            setImage(null);
            setImagePreview(null);
            setShowTagSelector(false);
            setTaggedRoles([]);
            setTaggedUsers([]);
        }
    }, [isOpen]);

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

    const toggleRole = (roleId) => {
        setTaggedRoles(prev =>
            prev.includes(roleId)
                ? prev.filter(r => r !== roleId)
                : [...prev, roleId]
        );
    };

    const toggleUser = (userId) => {
        setTaggedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(u => u !== userId)
                : [...prev, userId]
        );
    };

    const removeTag = (type, id) => {
        if (type === 'role') {
            setTaggedRoles(prev => prev.filter(r => r !== id));
        } else {
            setTaggedUsers(prev => prev.filter(u => u !== id));
        }
    };

    const getUserName = (userId) => {
        const user = workspaceUsers.find(u => u.id === userId);
        return user?.name || user?.email || 'Unknown';
    };

    const handlePost = async () => {
        if (!message.trim() && !image) return;

        // Guard clause: ensure workspaceId exists
        if (!currentUser?.workspaceId) {
            alert("Unable to create post: Your account is missing workspace information. Please contact an administrator.");
            console.error("CreatePostModal: workspaceId is undefined for user:", currentUser?.uid);
            return;
        }

        setIsLoading(true);

        try {
            let imageUrl = null;

            if (image) {
                imageUrl = await uploadPostImage(image, currentUser.uid);
            }

            // Create Post in Firestore with tags
            const now = new Date();
            const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

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
                type: 'user',
                // New tag fields
                taggedRoles: taggedRoles,
                taggedUsers: taggedUsers,
                month_year: monthYear
            });

            setMessage('');
            removeImage();
            setTaggedRoles([]);
            setTaggedUsers([]);
            onClose();

        } catch (error) {
            console.error("Error creating post:", error);
            alert("Failed to create post. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const hasAnyTags = taggedRoles.length > 0 || taggedUsers.length > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-surface border border-gray-800 rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-main">New Post</h3>
                    <button onClick={onClose} className="p-2 text-muted hover:text-main rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
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

                    {/* Selected Tags Display */}
                    {hasAnyTags && (
                        <div className="flex flex-wrap gap-2">
                            {taggedRoles.map(roleId => {
                                const role = AVAILABLE_ROLES.find(r => r.id === roleId);
                                return (
                                    <span
                                        key={`role-${roleId}`}
                                        className={clsx(
                                            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                                            role?.color || "bg-gray-500/20 text-gray-400"
                                        )}
                                    >
                                        <Users size={12} />
                                        {role?.label}
                                        <button
                                            onClick={() => removeTag('role', roleId)}
                                            className="ml-1 hover:text-white transition-colors"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                );
                            })}
                            {taggedUsers.map(userId => (
                                <span
                                    key={`user-${userId}`}
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-primary/20 text-primary border-primary/30"
                                >
                                    <AtSign size={12} />
                                    {getUserName(userId)}
                                    <button
                                        onClick={() => removeTag('user', userId)}
                                        className="ml-1 hover:text-white transition-colors"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

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

                    {/* Action Buttons */}
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
                        <button
                            onClick={() => setShowTagSelector(!showTagSelector)}
                            className={clsx(
                                "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all",
                                showTagSelector || hasAnyTags
                                    ? "bg-primary/20 border-primary/50 text-primary"
                                    : "bg-gray-100 dark:bg-white/5 border-gray-800 text-muted hover:text-primary hover:border-primary/50"
                            )}
                        >
                            <AtSign size={16} />
                            Tag
                            {hasAnyTags && (
                                <span className="bg-primary text-background text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    {taggedRoles.length + taggedUsers.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Tag Selector Panel */}
                    {showTagSelector && (
                        <div className="bg-background border border-gray-800 rounded-xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            {/* Role Selection */}
                            <div>
                                <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Tag Roles</p>
                                <div className="flex flex-wrap gap-2">
                                    {AVAILABLE_ROLES.map(role => (
                                        <button
                                            key={role.id}
                                            onClick={() => toggleRole(role.id)}
                                            className={clsx(
                                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
                                                taggedRoles.includes(role.id)
                                                    ? role.color
                                                    : "bg-gray-100 dark:bg-white/5 border-gray-700 text-muted hover:border-gray-600"
                                            )}
                                        >
                                            {taggedRoles.includes(role.id) && <Check size={12} />}
                                            {role.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* User Selection */}
                            <div>
                                <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Tag People</p>
                                {loadingUsers ? (
                                    <div className="flex items-center gap-2 text-muted text-sm">
                                        <Loader2 size={14} className="animate-spin" />
                                        Loading users...
                                    </div>
                                ) : workspaceUsers.length === 0 ? (
                                    <p className="text-muted text-sm">No other users in workspace</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                        {workspaceUsers.map(user => (
                                            <button
                                                key={user.id}
                                                onClick={() => toggleUser(user.id)}
                                                className={clsx(
                                                    "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
                                                    taggedUsers.includes(user.id)
                                                        ? "bg-primary/20 border-primary/50 text-primary"
                                                        : "bg-gray-100 dark:bg-white/5 border-gray-700 text-muted hover:border-gray-600"
                                                )}
                                            >
                                                {taggedUsers.includes(user.id) && <Check size={12} />}
                                                {user.name || user.email}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

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
                                            : "bg-gray-100 dark:bg-white/5 border-gray-800 text-muted hover:bg-gray-200 dark:hover:bg-white/10 hover:text-main hover:border-gray-700"
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
