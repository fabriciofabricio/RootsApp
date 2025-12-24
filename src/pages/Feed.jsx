import FeedHeader from '../components/feed/FeedHeader';
import QuickPostBar from '../components/feed/QuickPostBar';
import FeedCard from '../components/feed/FeedCard';

// Mock Data
const MOCK_POSTS = [
    {
        id: 1,
        author: { name: 'Sarah Jenkins', avatar: 'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=random' },
        timeAgo: '5 min ago',
        content: 'Dinner is ready! Veggie pasta for everyone in the main kitchen 🍝',
        likes: 12,
        comments: 3,
        canJoin: true,
        type: 'user'
    },
    {
        id: 2,
        author: { name: 'System', avatar: 'https://ui-avatars.com/api/?name=R&background=000&color=fff' },
        timeAgo: '1h ago',
        content: 'Cleaning shift checklist for Room 104 is now complete. Great job team! ✨',
        likes: 5,
        comments: 0,
        canJoin: false,
        type: 'system'
    },
    {
        id: 3,
        author: { name: 'Mike Ross', avatar: 'https://ui-avatars.com/api/?name=Mike+Ross&background=random' },
        timeAgo: '2h ago',
        content: 'Anyone want to join for a canal tour later? I have 2 extra tickets.',
        likes: 8,
        comments: 4,
        canJoin: true,
        type: 'user'
    }
];

const Feed = () => {
    return (
        <div className="max-w-2xl mx-auto pb-20 md:pb-0">
            <FeedHeader />
            <QuickPostBar />

            <div className="space-y-4">
                <h2 className="text-lg font-bold text-main mb-4 px-1">Latest Updates</h2>
                {MOCK_POSTS.map(post => (
                    <FeedCard key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
};

export default Feed;


