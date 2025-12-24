import { useState } from 'react';
import { ChefHat, ChevronLeft, ChevronRight, User } from 'lucide-react';
import clsx from 'clsx';

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
    // State for weekly assignments: { "Mon": volunteerId, ... }
    const [assignments, setAssignments] = useState({
        'Mon': 1,
        'Wed': 3,
        'Fri': 5,
        'Sun': 2
    });

    const [isEditing, setIsEditing] = useState(null); // Day currently being edited

    const getVolunteer = (id) => VOLUNTEERS.find(v => v.id === id);

    const handleAssign = (day, volunteerId) => {
        setAssignments(prev => ({
            ...prev,
            [day]: volunteerId
        }));
        setIsEditing(null);
    };

    return (
        <div className="bg-surface rounded-2xl border border-white/5 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-main flex items-center gap-2">
                        <ChefHat className="text-primary" size={24} />
                        Cook Schedule
                    </h2>
                    <p className="text-sm text-muted">Weekly meal preparation roster</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {DAYS.map((day, index) => {
                    const assignedId = assignments[day];
                    const cook = assignedId ? getVolunteer(assignedId) : null;
                    const isToday = new Date().getDay() === (index + 1) % 7; // Simple Mon-Sun mapping check (Sunday is 0 in JS)

                    return (
                        <div
                            key={day}
                            className={clsx(
                                "flex flex-col gap-3 p-3 rounded-xl border transition-all relative group",
                                isToday ? "bg-primary/5 border-primary/30" : "bg-background border-white/5",
                                isEditing === day && "ring-2 ring-primary border-transparent"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <span className={clsx("text-sm font-bold", isToday ? "text-primary" : "text-muted")}>
                                    {day}
                                </span>
                                {isToday && <span className="text-[10px] bg-primary text-main px-1.5 rounded-full">Today</span>}
                            </div>

                            {/* Cook Display */}
                            <div className="flex-1 flex flex-col items-center justify-center min-h-[80px] text-center">
                                {isEditing === day ? (
                                    <div className="absolute inset-0 bg-surface z-10 p-2 rounded-xl border border-white/10 flex flex-col gap-2 overflow-y-auto custom-scrollbar max-h-[200px] shadow-xl">
                                        <p className="text-xs text-muted font-medium sticky top-0 bg-surface pb-1">Select Cook:</p>
                                        {VOLUNTEERS.map(v => (
                                            <button
                                                key={v.id}
                                                onClick={() => handleAssign(day, v.id)}
                                                className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:bg-white/5 rounded-lg text-left"
                                            >
                                                <img src={v.avatar} alt={v.name} className="w-6 h-6 rounded-full" />
                                                <span className="text-xs text-main truncate">{v.name}</span>
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => handleAssign(day, null)}
                                            className="text-xs text-red-400 p-1 hover:bg-gray-100 dark:bg-white/5 rounded text-center mt-1"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {cook ? (
                                            <>
                                                <div className="relative mb-2">
                                                    <img src={cook.avatar} alt={cook.name} className="w-10 h-10 rounded-full border-2 border-surface shadow-md" />
                                                    <div className="absolute -bottom-1 -right-1 bg-surface rounded-full p-0.5">
                                                        <ChefHat size={12} className="text-orange-400" />
                                                    </div>
                                                </div>
                                                <p className="text-xs font-medium text-main line-clamp-1">{cook.name}</p>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center border border-dashed border-white/20">
                                                    <User size={16} />
                                                </div>
                                                <p className="text-xs text-gray-500">No Cook</p>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => setIsEditing(day)}
                                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            aria-label="Edit cook"
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CookSchedule;



