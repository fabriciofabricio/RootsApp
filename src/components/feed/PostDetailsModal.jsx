import { useState, useEffect, useRef } from 'react';
import { X, Send, Trash2, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    doc,
    updateDoc,
    increment,
    deleteDoc
} from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import FeedCard from './FeedCard';

const PostDetailsModal = ({ post, onClose, showCommentsInitially = true, usersMap }) => {
    const { currentUser } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showComments, setShowComments] = useState(showCommentsInitially);
    const [replyingTo, setReplyingTo] = useState(null); // { id, authorName }
    const commentsEndRef = useRef(null);

    // Fetch Comments
    useEffect(() => {
        if (!post?.id) return;

        const q = query(
            collection(db, "posts", post.id, "comments"),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setComments(commentsData);
        });

        return () => unsubscribe();
    }, [post?.id]);

    // Scroll to bottom on new comment (only if not a reply, or maybe just always?)
    useEffect(() => {
        // Only auto-scroll on initial load or if user just sent a root message
        if (!replyingTo && comments.length > 0) {
            // commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [comments.length]);

    const handleSendComment = async () => {
        if (!newComment.trim()) return;
        setIsSubmitting(true);

        try {
            const commentData = {
                content: newComment,
                authorId: currentUser.uid,
                authorName: currentUser.name || currentUser.email,
                authorPhoto: currentUser.photoURL || null,
                createdAt: serverTimestamp()
            };

            if (replyingTo) {
                commentData.parentId = replyingTo.id;
            }

            await addDoc(collection(db, "posts", post.id, "comments"), commentData);

            await updateDoc(doc(db, "posts", post.id), {
                comments: increment(1)
            });

            setNewComment("");
            setReplyingTo(null); // Clear reply state
        } catch (error) {
            console.error("Error adding comment:", error);
            alert("Failed to send comment.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Delete this comment?")) return;
        try {
            await deleteDoc(doc(db, "posts", post.id, "comments", commentId));
            await updateDoc(doc(db, "posts", post.id), {
                comments: increment(-1)
            });
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    if (!post) return null;

    // Show comments section when a new comment is added (if hidden)
    useEffect(() => {
        if (comments.length > 0 && !showComments) {
            setShowComments(true);
        }
    }, [comments.length]);

    // Check if a comment is a reply
    const getReplies = (parentId) => comments.filter(c => c.parentId === parentId);
    const rootComments = comments.filter(c => !c.parentId);

    const CommentItem = ({ comment, depth = 0 }) => {
        const commentAuthor = usersMap ? usersMap[comment.authorId] : null;
        const authorAvatar = commentAuthor?.photoURL || comment.authorPhoto || `https://ui-avatars.com/api/?name=${comment.authorName}&background=random`;
        const authorName = commentAuthor?.name || comment.authorName;
        const replies = getReplies(comment.id);

        return (
            <div className={`flex flex-col ${depth > 0 ? 'ml-8 relative' : ''}`}>
                {/* Thread line for nested comments */}
                {depth > 0 && (
                    <div className="absolute -left-5 top-0 bottom-0 w-0.5 bg-white/10 rounded-full" />
                )}

                <div className="flex gap-3 group relative">
                    {/* Curved connector for replies */}
                    {depth > 0 && (
                        <div className="absolute -left-5 top-4 w-4 h-4 border-l-2 border-b-2 border-white/10 rounded-bl-xl" />
                    )}

                    <img
                        src={authorAvatar}
                        alt={authorName}
                        className="w-6 h-6 rounded-full bg-gray-700 object-cover shrink-0 mt-1 ring-2 ring-black/20"
                    />
                    <div className="flex-1 max-w-[90%]">
                        <div className="bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-2xl rounded-tl-sm px-3 py-2 transition-colors relative border border-white/5">
                            <div className="flex justify-between items-baseline mb-0.5">
                                <span className="text-xs font-bold text-white/90 mr-2">{authorName}</span>
                                <span className="text-[10px] text-white/40">
                                    {comment.createdAt?.toDate ? formatDistanceToNow(comment.createdAt.toDate()) : '...'}
                                </span>
                            </div>
                            <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">{comment.content}</p>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 mt-1">
                                <button
                                    onClick={() => setReplyingTo({ id: comment.id, authorName })}
                                    className="text-[10px] text-white/40 hover:text-primary font-medium transition-colors"
                                >
                                    Reply
                                </button>

                                {(currentUser?.uid === comment.authorId || currentUser?.role === 'admin') && (
                                    <button
                                        onClick={() => handleDeleteComment(comment.id)}
                                        className="text-[10px] text-white/20 hover:text-red-400 transition-colors"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recursive Replies */}
                {replies.length > 0 && (
                    <div className="mt-2 space-y-3">
                        {replies.map(reply => (
                            <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto no-scrollbar">
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />

            {/* Wrapper to center content */}
            <div className="relative w-full max-w-xl flex flex-col my-auto pointer-events-none">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white transition-colors z-10 pointer-events-auto"
                >
                    <X size={24} />
                </button>

                {/* The Main Post Card - Always centered, dominant */}
                <div className="pointer-events-auto shadow-2xl shadow-black/50 rounded-3xl">
                    <FeedCard
                        post={post}
                        onCommentClick={() => setShowComments(true)}
                        usersMap={usersMap}
                    />
                </div>

                {/* Comments Section - Minimalist, transparent, flows below */}
                {showComments && (
                    <div className="mt-6 pointer-events-auto relative pb-20 animate-in slide-in-from-top-4 fade-in duration-300">
                        {/* Connecting line idea or just clean space */}

                        <div className="space-y-4 pl-2 md:pl-0">
                            {comments.length === 0 ? (
                                <div className="text-center py-4 text-white/30 text-xs italic">
                                    No comments yet
                                </div>
                            ) : (
                                rootComments.map(comment => (
                                    <CommentItem key={comment.id} comment={comment} />
                                ))
                            )}
                            <div ref={commentsEndRef} />
                        </div>

                        {/* Floating Input */}
                        <div className="sticky bottom-0 mt-6 pt-0 bg-transparent">
                            {/* Reply Indicator */}
                            {replyingTo && (
                                <div className="flex items-center justify-between bg-surface/80 backdrop-blur-md px-4 py-2 rounded-t-xl border border-white/10 border-b-0 mx-2 text-xs">
                                    <span className="text-white/70">
                                        Replying to <span className="font-bold text-primary">@{replyingTo.authorName}</span>
                                    </span>
                                    <button
                                        onClick={() => setReplyingTo(null)}
                                        className="p-1 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <X size={14} className="text-white/50" />
                                    </button>
                                </div>
                            )}

                            <div className={`pb-2 pt-2 bg-gradient-to-t from-black/80 to-transparent ${replyingTo ? 'bg-black/40 backdrop-blur-sm rounded-b-xl' : ''}`}>
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl p-1.5 rounded-full border border-white/10 shadow-lg ring-1 ring-white/5 hover:ring-white/20 transition-all">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendComment()}
                                        placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
                                        className="flex-1 bg-transparent border-none px-4 py-2 text-sm text-white placeholder-white/30 outline-none"
                                        autoFocus={!!replyingTo}
                                    />
                                    <button
                                        onClick={handleSendComment}
                                        disabled={!newComment.trim() || isSubmitting}
                                        className="p-2 bg-primary text-black rounded-full hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all transform active:scale-95"
                                    >
                                        {isSubmitting ? (
                                            <div className="w-4 h-4 border-2 border-black/50 border-t-black rounded-full animate-spin" />
                                        ) : (
                                            <Send size={16} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostDetailsModal;
