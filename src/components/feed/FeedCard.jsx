import { Heart, MessageCircle, MoreHorizontal, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

const FeedCard = ({ post }) => {
    return (
        <div className="bg-surface rounded-2xl p-4 mb-4 border border-white/5 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full bg-gray-700" />
                    <div>
                        <h3 className="font-semibold text-main text-sm">{post.author.name}</h3>
                        <p className="text-xs text-gray-500">{post.timeAgo}</p>
                    </div>
                </div>
                {post.type === 'system' && (
                    <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-wide">System</span>
                )}
                {post.type !== 'system' && (
                    <button className="text-gray-500 hover:text-main"><MoreHorizontal size={18} /></button>
                )}
            </div>

            {/* Content */}
            <div className="mb-4">
                <p className="text-muted text-sm leading-relaxed">{post.content}</p>
            </div>

            {/* Actions / Interactions */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1.5 text-muted hover:text-red-400 transition-colors group">
                        <Heart size={18} className="group-hover:fill-red-400/20" />
                        <span className="text-xs">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-muted hover:text-primary transition-colors">
                        <MessageCircle size={18} />
                        <span className="text-xs">{post.comments}</span>
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



