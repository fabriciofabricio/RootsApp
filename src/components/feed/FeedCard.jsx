import { Heart, MessageCircle, MoreHorizontal, CheckCircle2, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useState } from 'react';

const FeedCard = ({ post }) => {
    const { currentUser } = useAuth();
    const [showMenu, setShowMenu] = useState(false);

    // Handle Timestamp data from Firestore
    const timeAgo = post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'Just now';

    // Normalize author data (handle both old mock structure and new firestore structure)
    const authorName = post.authorName || post.author?.name || 'Unknown';
    const authorAvatar = post.authorPhoto || post.author?.avatar || `https://ui-avatars.com/api/?name=${authorName}&background=random`;

    // Permission Check: Author OR Admin
    const canDelete = currentUser && (currentUser.uid === post.authorId || currentUser.role === 'admin');

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            await deleteDoc(doc(db, "posts", post.id));
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("Failed to delete post.");
        }
    };

    return (
        <div className="bg-surface rounded-2xl p-4 mb-4 border border-white/5 shadow-sm relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <img src={authorAvatar} alt={authorName} className="w-10 h-10 rounded-full bg-gray-700 object-cover" />
                    <div>
                        <h3 className="font-semibold text-main text-sm">{authorName}</h3>
                        <p className="text-xs text-gray-500">{timeAgo}</p>
                    </div>
                </div>
                {post.type === 'system' && (
                    <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-wide">System</span>
                )}

                {/* Menu / Delete Action */}
                {post.type !== 'system' && (
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="text-gray-500 hover:text-main p-1 rounded-full hover:bg-white/5 transition-colors"
                        >
                            <MoreHorizontal size={18} />
                        </button>

                        {/* Dropdown Menu */}
                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
                                <div className="absolute right-0 top-full mt-1 w-32 bg-surface border border-white/10 rounded-xl shadow-xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                    {canDelete && (
                                        <button
                                            onClick={handleDelete}
                                            className="w-full text-left px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-400/10 flex items-center gap-2"
                                        >
                                            <Trash2 size={14} />
                                            Delete
                                        </button>
                                    )}
                                    {!canDelete && (
                                        <div className="px-4 py-2 text-xs text-muted italic">No actions</div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="mb-4">
                <p className="text-muted text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                {post.image && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-white/5">
                        <img src={post.image} alt="Post content" className="w-full h-auto" />
                    </div>
                )}
            </div>

            {/* Actions / Interactions */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1.5 text-muted hover:text-red-400 transition-colors group">
                        <Heart size={18} className="group-hover:fill-red-400/20" />
                        <span className="text-xs">{post.likes ? post.likes.length : 0}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-muted hover:text-primary transition-colors">
                        <MessageCircle size={18} />
                        <span className="text-xs">{post.comments || 0}</span>
                    </button>
                </div>

                {post.canJoin && (
                    <button className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/5 hover:bg-primary hover:text-background text-muted px-3 py-1.5 rounded-lg text-xs font-semibold transition-all">
                        <CheckCircle2 size={14} />
                        I'm In
                    </button>
                )}
            </div>
        </div>
    );
};

export default FeedCard;
