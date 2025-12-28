import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import FeedHeader from '../components/feed/FeedHeader';
import QuickPostBar from '../components/feed/QuickPostBar';
import FeedCard from '../components/feed/FeedCard';
import PostDetailsModal from '../components/feed/PostDetailsModal';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const Feed = () => {
    const { currentUser } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usersMap, setUsersMap] = useState({});

    useEffect(() => {
        if (!currentUser?.workspaceId) {
            setLoading(false);
            return;
        }

        // 1. Fetch posts for this workspace
        const qPosts = query(
            collection(db, "posts"),
            where("workspaceId", "==", currentUser.workspaceId),
            orderBy("createdAt", "desc")
        );

        const unsubscribePosts = onSnapshot(qPosts, (snapshot) => {
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

        // 2. Fetch all workspace users for live profile photo updates
        // (Real-time: Client-side join with auto-updates)
        const qUsers = query(
            collection(db, "users"),
            where("workspaceId", "==", currentUser.workspaceId)
        );

        const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
            const userMapping = {};
            snapshot.forEach(doc => {
                userMapping[doc.id] = doc.data();
            });
            setUsersMap(userMapping);
        }, (error) => {
            console.error("Error fetching workspace users:", error);
        });

        return () => {
            unsubscribePosts();
            unsubscribeUsers();
        };
    }, [currentUser]);

    const [selectedPost, setSelectedPost] = useState(null);
    const [openedByCommentClick, setOpenedByCommentClick] = useState(false);
    const location = useLocation();

    // Open post detail if URL has postId
    useEffect(() => {
        if (!loading && posts.length > 0) {
            const params = new URLSearchParams(location.search);
            const postId = params.get('postId');

            if (postId) {
                const post = posts.find(p => p.id === postId);
                if (post) {
                    setSelectedPost(post);
                    setOpenedByCommentClick(false); // Respect natural comment state (only show if > 0)
                    // Optional: Clean URL
                    // window.history.replaceState({}, '', '/feed');
                }
            }
        }
    }, [loading, posts, location.search]);

    const handlePostClick = (post) => {
        setSelectedPost(post);
        setOpenedByCommentClick(false);
    };

    const handleCommentClick = (post) => {
        setSelectedPost(post);
        setOpenedByCommentClick(true);
    };

    // Determine if comments should be shown initially
    // Show comments if: post has comments OR opened via comment button click
    const shouldShowComments = selectedPost
        ? (selectedPost.comments > 0 || openedByCommentClick)
        : false;

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
                        <FeedCard
                            key={post.id}
                            post={post}
                            onClick={handlePostClick}
                            onCommentClick={() => handleCommentClick(post)}
                            usersMap={usersMap}
                        />
                    ))
                )}
            </div>

            {/* Post Details Modal */}
            {selectedPost && (
                <PostDetailsModal
                    post={selectedPost}
                    onClose={() => {
                        setSelectedPost(null);
                        setOpenedByCommentClick(false);
                    }}
                    showCommentsInitially={shouldShowComments}
                    usersMap={usersMap}
                />
            )}
        </div>
    );
};

export default Feed;


