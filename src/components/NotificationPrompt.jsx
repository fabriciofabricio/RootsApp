import { Bell, BellOff, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const NotificationPrompt = () => {
    const { notificationStatus, requestNotifications } = useAuth();
    const [dismissed, setDismissed] = useState(false);
    const [isRequesting, setIsRequesting] = useState(false);

    // Don't show if already granted, denied, unsupported, or dismissed
    if (notificationStatus !== 'unknown' || dismissed) {
        return null;
    }

    const handleEnable = async () => {
        setIsRequesting(true);
        await requestNotifications();
        setIsRequesting(false);
    };

    return (
        <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-surface border border-white/10 rounded-2xl p-4 shadow-2xl z-40 animate-in slide-in-from-bottom-4 duration-300">
            <button
                onClick={() => setDismissed(true)}
                className="absolute top-3 right-3 text-muted hover:text-main transition-colors"
            >
                <X size={16} />
            </button>

            <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/20 rounded-xl">
                    <Bell size={24} className="text-primary" />
                </div>
                <div className="flex-1">
                    <h4 className="text-main font-semibold text-sm mb-1">Stay Updated</h4>
                    <p className="text-muted text-xs leading-relaxed mb-3">
                        Enable notifications to know when you're tagged in posts or important updates.
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={handleEnable}
                            disabled={isRequesting}
                            className="flex-1 bg-primary text-background font-semibold text-xs py-2 px-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {isRequesting ? 'Enabling...' : 'Enable'}
                        </button>
                        <button
                            onClick={() => setDismissed(true)}
                            className="text-muted text-xs py-2 px-3 hover:text-main transition-colors"
                        >
                            Later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationPrompt;
