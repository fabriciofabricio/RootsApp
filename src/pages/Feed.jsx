import { useState, useEffect } from 'react';
import FeedHeader from '../components/feed/FeedHeader';
import QuickPostBar from '../components/feed/QuickPostBar';
import FeedCard from '../components/feed/FeedCard';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const Feed = () => {
    const { currentUser } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser?.workspaceId) {
            setLoading(false);
            return;
        }

        // Fetch posts for this workspace
        const q = query(
            collection(db, "posts"),
            where("workspaceId", "==", currentUser.workspaceId),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const postsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPosts(postsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching posts:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    return (
        <div className="max-w-2xl mx-auto pb-20 md:pb-0">
            <FeedHeader />
            <QuickPostBar />

            <div className="space-y-4">
                <h2 className="text-lg font-bold text-main mb-4 px-1">Latest Updates</h2>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-primary" size={30} />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-10 bg-surface rounded-2xl border border-white/5">
                        <p className="text-muted">No posts yet. Be the first to share something!</p>
                    </div>
                ) : (
                    posts.map(post => (
                        <FeedCard key={post.id} post={post} />
                    ))
                )}
            </div>
        </div>
    );
};

export default Feed;


