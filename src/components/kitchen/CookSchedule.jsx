import { useState } from 'react';
import { ChefHat, ChevronLeft, ChevronRight, User } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';

// Mock Data (Consistent with other parts of the app)
const VOLUNTEERS = [
    { id: 1, name: 'Ana Silva', avatar: 'https://ui-avatars.com/api/?name=Ana+Silva&background=3B82F6&color=fff' },
    { id: 2, name: 'João Santos', avatar: 'https://ui-avatars.com/api/?name=Joao+Santos&background=A855F7&color=fff' },
    { id: 3, name: 'Maria Costa', avatar: 'https://ui-avatars.com/api/?name=Maria+Costa&background=06B6D4&color=fff' },
    { id: 4, name: 'Pedro Oliver', avatar: 'https://ui-avatars.com/api/?name=Pedro+Oliver&background=F97316&color=fff' },
    { id: 5, name: 'Sofia R.', avatar: 'https://ui-avatars.com/api/?name=Sofia+R&background=EC4899&color=fff' },
    { id: 6, name: 'Lucas Fern', avatar: 'https://ui-avatars.com/api/?name=Lucas+Fern&background=10B981&color=fff' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CookSchedule = () => {
    const { currentUser } = useAuth();
    // State for weekly assignments: { "Mon": volunteerId, ... }
    const [assignments, setAssignments] = useState({
        'Mon': 1,
        'Wed': 3,
        'Fri': 5,
        'Sun': 2
    });

    const getVolunteer = (id) => {
        // If the ID matches the current user's UID (string), return their profile
        if (currentUser && id === currentUser.uid) {
            return {
                id: currentUser.uid,
                name: currentUser.displayName || 'You',
                avatar: currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName || 'Me'}&background=random&color=fff`
            };
        }
        // Otherwise look up in mock volunteers (numbers)
        return VOLUNTEERS.find(v => v.id === id);
    };

    const handleToggleDay = (day) => {
        if (!currentUser) return; // Guard clause if not logged in

        setAssignments(prev => {
            const currentAssignee = prev[day];

            // If current user is already assigned, remove them
            if (currentAssignee === currentUser.uid) {
                const newAssignments = { ...prev };
                delete newAssignments[day];
                return newAssignments;
            }

            // Otherwise, assign current user (overwriting anyone else)
            return {
                ...prev,
                [day]: currentUser.uid
            };
        });
    };

    return (
        <div className="bg-surface rounded-2xl border border-white/5 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-main flex items-center gap-2">
                        <ChefHat className="text-primary" size={24} />
                        Cook Schedule
                    </h2>
                    <p className="text-sm text-muted">Tap a day to sign up for meal prep</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {DAYS.map((day, index) => {
                    const assignedId = assignments[day];
                    const cook = assignedId ? getVolunteer(assignedId) : null;
                    const isToday = new Date().getDay() === (index + 1) % 7;
                    const isMe = currentUser && assignedId === currentUser.uid;

                    return (
                        <button
                            key={day}
                            onClick={() => handleToggleDay(day)}
                            className={clsx(
                                "flex flex-col gap-3 p-3 rounded-xl border transition-all relative group text-left",
                                isMe
                                    ? "bg-primary/10 border-primary/50"
                                    : isToday
                                        ? "bg-primary/5 border-primary/30"
                                        : "bg-background border-white/5 hover:border-white/10"
                            )}
                        >
                            <div className="flex items-center justify-between w-full">
                                <span className={clsx("text-sm font-bold", isToday ? "text-primary" : "text-muted")}>
                                    {day}
                                </span>
                                {isToday && <span className="text-[10px] bg-primary text-main px-1.5 rounded-full">Today</span>}
                            </div>

                            {/* Cook Display */}
                            <div className="flex-1 flex flex-col items-center justify-center min-h-[80px] text-center w-full">
                                {cook ? (
                                    <>
                                        <div className="relative mb-2">
                                            <img
                                                src={cook.avatar}
                                                alt={cook.name}
                                                className={clsx(
                                                    "w-10 h-10 rounded-full border-2 shadow-md",
                                                    isMe ? "border-primary" : "border-surface"
                                                )}
                                            />
                                            <div className="absolute -bottom-1 -right-1 bg-surface rounded-full p-0.5">
                                                <ChefHat size={12} className={isMe ? "text-primary" : "text-orange-400"} />
                                            </div>
                                        </div>
                                        <p className={clsx("text-xs font-medium line-clamp-1", isMe ? "text-primary" : "text-main")}>
                                            {cook.name}
                                        </p>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center border border-dashed border-white/20">
                                            <User size={16} />
                                        </div>
                                        <p className="text-xs text-gray-500">Available</p>
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CookSchedule;



