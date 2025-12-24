import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, Sparkles, PartyPopper, Music, Camera, Trees, ArrowRight, Check } from 'lucide-react';
import clsx from 'clsx';

const interestsList = [
    { id: 'cooking', label: 'Cooking', icon: Utensils, color: 'text-orange-400' },
    { id: 'cleaning', label: 'Cleaning', icon: Sparkles, color: 'text-blue-400' },
    { id: 'party', label: 'Events/Party', icon: PartyPopper, color: 'text-pink-400' },
    { id: 'music', label: 'Music/Jam', icon: Music, color: 'text-purple-400' },
    { id: 'content', label: 'Content', icon: Camera, color: 'text-red-400' },
    { id: 'garden', label: 'Gardening', icon: Trees, color: 'text-green-400' },
];

const Onboarding = () => {
    const navigate = useNavigate();
    const [selectedInterests, setSelectedInterests] = useState([]);

    const toggleInterest = (id) => {
        setSelectedInterests(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const handleComplete = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-main mb-2">Build Your Profile</h1>
                    <p className="text-muted">Select what you love to do to earn badges.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    {interestsList.map((interest) => {
                        const isSelected = selectedInterests.includes(interest.id);
                        return (
                            <button
                                key={interest.id}
                                onClick={() => toggleInterest(interest.id)}
                                className={clsx(
                                    "relative p-4 rounded-2xl border text-left transition-all duration-200 group",
                                    isSelected
                                        ? "bg-surface border-primary shadow-[0_0_15px_-5px_#FFD700]"
                                        : "bg-surface/50 border-white/5 hover:bg-surface hover:border-white/10"
                                )}
                            >
                                <div className={clsx("mb-3", interest.color)}>
                                    <interest.icon size={24} />
                                </div>
                                <h3 className={clsx("font-semibold", isSelected ? "text-primary" : "text-main")}>
                                    {interest.label}
                                </h3>
                                {isSelected && (
                                    <div className="absolute top-3 right-3 bg-primary text-background rounded-full p-0.5">
                                        <Check size={12} strokeWidth={4} />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center justify-between bg-surface/30 p-4 rounded-xl border border-white/5 mt-auto">
                    <div className="flex -space-x-2">
                        {/* Mock users to show community feel */}
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full bg-gray-600 border-2 border-background" />
                        ))}
                        <div className="w-8 h-8 rounded-full bg-gray-800 border-2 border-background flex items-center justify-center text-[10px] text-muted">+12</div>
                    </div>
                    <p className="text-xs text-gray-500 mr-auto ml-3">Join other volunteers</p>

                    <button
                        onClick={handleComplete}
                        disabled={selectedInterests.length === 0}
                        className="bg-primary text-background px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Start <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;


