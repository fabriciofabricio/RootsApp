import { X, Send } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

const PRESETS = [
    "Lunch is ready 🥗",
    "Dinner is ready! 🍝",
    "Play pool 🎱",
    "Let's go out 🍻",
    "Movie night 🎬",
    "Anyone for a walk? 🚶"
];

const CreatePostModal = ({ isOpen, onClose }) => {
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const handlePresetClick = (preset) => {
        setMessage(preset);
    };

    const handlePost = () => {
        if (!message.trim()) return;
        console.log("Posting message:", message);
        setMessage('');
        onClose();
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
                            disabled={!message.trim()}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-background font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                        >
                            <Send size={18} />
                            Post
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePostModal;



