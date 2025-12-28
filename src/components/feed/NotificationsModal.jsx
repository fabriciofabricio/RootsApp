import { useState, useEffect } from 'react';
import { X, Bell, Trash2, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, writeBatch, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const NotificationsModal = ({ onClose }) => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch Notifications
    useEffect(() => {
        if (!currentUser?.uid) return;

        const q = query(
            collection(db, "users", currentUser.uid, "notifications"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotifications(notifs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser?.uid]);

    // Handle Click (Go to post + mark read)
    const handleNotificationClick = async (notification) => {
        // Mark as read immediately
        if (!notification.read) {
            try {
                const notifRef = doc(db, "users", currentUser.uid, "notifications", notification.id);
                await updateDoc(notifRef, { read: true });
            } catch (error) {
                console.error("Error marking notification read:", error);
            }
        }

        // Navigate
        onClose();
        if (notification.type === 'post_tag' && notification.postId) {
            navigate(`/feed?postId=${notification.postId}`);
        }
    };

    // Mark all as read
    const handleMarkAllRead = async () => {
        try {
            const batch = writeBatch(db);
            const unreadQuery = query(
                collection(db, "users", currentUser.uid, "notifications"),
                where("read", "==", false)
            );

            const snapshot = await getDocs(unreadQuery);
            if (snapshot.empty) return;

            snapshot.forEach(doc => {
                batch.update(doc.ref, { read: true });
            });

            await batch.commit();
        } catch (error) {
            console.error("Error marking all read:", error);
        }
    };

    // Clear all notifications
    const handleClearAll = async () => {
        if (!window.confirm("Clear all notifications?")) return;

        try {
            const batch = writeBatch(db);
            const snapshot = await getDocs(collection(db, "users", currentUser.uid, "notifications"));

            snapshot.forEach(doc => {
                batch.delete(doc.ref);
            });

            await batch.commit();
        } catch (error) {
            console.error("Error clearing notifications:", error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 overflow-y-auto no-scrollbar">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-sm bg-surface border border-white/10 rounded-2xl shadow-2xl animate-in slide-in-from-right-4 duration-300 flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5 rounded-t-2xl backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        <Bell size={18} className="text-primary" />
                        <h2 className="text-sm font-bold text-main">Notifications</h2>
                    </div>

                    <div className="flex items-center gap-2">
                        {notifications.length > 0 && (
                            <>
                                <button
                                    onClick={handleMarkAllRead}
                                    title="Mark all as read"
                                    className="p-1.5 text-white/40 hover:text-green-400 transition-colors rounded-full hover:bg-white/5"
                                >
                                    <CheckCircle size={16} />
                                </button>
                                <button
                                    onClick={handleClearAll}
                                    title="Clear all"
                                    className="p-1.5 text-white/40 hover:text-red-400 transition-colors rounded-full hover:bg-white/5"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </>
                        )}
                        <button onClick={onClose} className="p-1 text-white/50 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2 no-scrollbar">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-10 px-4">
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Bell size={20} className="text-white/20" />
                            </div>
                            <p className="text-white/40 text-sm">No new notifications</p>
                        </div>
                    ) : (
                        notifications.map(notif => (
                            <div
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif)}
                                className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-all hover:bg-white/5 border ${notif.read ? 'border-transparent opacity-60' : 'border-primary/20 bg-primary/5'}`}
                            >
                                <div className="relative shrink-0">
                                    <img
                                        src={notif.authorPhoto || `https://ui-avatars.com/api/?name=${notif.authorName}&background=random`}
                                        alt={notif.authorName}
                                        className="w-10 h-10 rounded-full object-cover bg-gray-700"
                                    />
                                    {!notif.read && (
                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-surface" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-white/90 leading-snug">
                                        <span className="font-bold text-white">{notif.authorName}</span> tagged you in a post
                                    </p>
                                    <p className="text-[10px] text-white/50 mt-1 truncate">
                                        "{notif.content}"
                                    </p>
                                    <p className="text-[10px] text-primary/60 mt-1 font-medium">
                                        {notif.createdAt?.toDate ? formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsModal;
