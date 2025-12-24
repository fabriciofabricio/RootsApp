import { useState } from 'react';
import { PenSquare } from 'lucide-react';
import CreatePostModal from './CreatePostModal';

const QuickPostBar = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="mb-8">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-surface border border-white/5 hover:bg-gray-100 dark:bg-white/5 hover:border-white/10 transition-all group text-left"
                >
                    <div className="w-10 h-10 rounded-full bg-background border border-gray-800 flex items-center justify-center text-muted group-hover:text-primary group-hover:border-primary/50 transition-colors">
                        <PenSquare size={20} />
                    </div>
                    <span className="text-muted group-hover:text-muted transition-colors font-medium">What's happening?</span>
                </button>
            </div>

            <CreatePostModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
};

export default QuickPostBar;


