
import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Users } from 'lucide-react';
import clsx from 'clsx';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const ROLES = ['Front Office', 'Intern', 'Breakfast', 'Cleaning', 'Bar'];

// Mock Staff Data
const STAFF_MEMBERS = [
    { id: 1, name: 'Ana Silva', role: 'Front Office', avatar: 'https://ui-avatars.com/api/?name=Ana+Silva&background=3B82F6&color=fff' },
    { id: 2, name: 'João Santos', role: 'Bar', avatar: 'https://ui-avatars.com/api/?name=Joao+Santos&background=A855F7&color=fff' }, // Volunteer role specific
    { id: 3, name: 'Maria Costa', role: 'Cleaning', avatar: 'https://ui-avatars.com/api/?name=Maria+Costa&background=06B6D4&color=fff' }, // Volunteer role specific
    { id: 4, name: 'Pedro Oliver', role: 'Intern', avatar: 'https://ui-avatars.com/api/?name=Pedro+Oliver&background=F97316&color=fff' },
    { id: 5, name: 'Lucas Fern', role: 'Intern', avatar: 'https://ui-avatars.com/api/?name=Lucas+Fern&background=10B981&color=fff' },
    { id: 6, name: 'Sofia R.', role: 'Breakfast', avatar: 'https://ui-avatars.com/api/?name=Sofia+R&background=EC4899&color=fff' }, // Volunteer role specific
];

// Generate Grid Data: Staff -> Days -> Shift
const generateStaffSchedule = () => {
    return STAFF_MEMBERS.map(staff => {
        const schedule = DAYS.map(day => {
            // Randomly assign shifts
            if (Math.random() > 0.3) {
                let availableRoles = [];

                if (staff.role === 'Front Office') availableRoles = ['Front Office'];
                else if (staff.role === 'Intern') availableRoles = ['Intern'];
                else availableRoles = ['Breakfast', 'Cleaning', 'Bar']; // Volunteers can do these

                // Select a role consistent with their type/assignment
                // For this mock, we assume 'Bar', 'Cleaning', 'Breakfast' users are volunteers generally available for those, 
                // or we strictly stick to their assigned role for simplicity, OR let volunteers rotate.
                // User Request: "volunteers can only have break fast, cleaning or bar shift"
                // Let's assume the 'role' in STAFF_MEMBERS is their primary, but volunteers can rotate.

                let assignedRole = staff.role;
                if (['Breakfast', 'Cleaning', 'Bar'].includes(staff.role)) {
                    // It's a volunteer, they can potentially do any of the 3? 
                    // Or are they locked? "volunteers can only have..." suggests a pool.
                    // Let's pick randomly from the volunteer pool for variety in the mock.
                    assignedRole = ['Breakfast', 'Cleaning', 'Bar'][Math.floor(Math.random() * 3)];
                }

                const startHour = Math.floor(Math.random() * 14) + 6; // 6am to 8pm
                return {
                    day,
                    role: assignedRole,
                    time: `${startHour}:00 - ${startHour + 5}:00`,
                    isActive: true
                };
            }
            return { day, isActive: false };
        });
        return { ...staff, schedule };
    });
};

const SCHEDULE_DATA = generateStaffSchedule();

const RoleBadge = ({ role, time, minimal = false }) => {
    const colors = {
        'Front Office': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'Intern': 'bg-green-500/10 text-green-400 border-green-500/20',
        'Breakfast': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        'Cleaning': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        'Bar': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    };

    if (minimal) {
        return (
            <div className={clsx("h-full w-full rounded p-1 flex items-center justify-center border text-[10px]", colors[role])}>
                {role[0]}
            </div>
        );
    }

    return (
        <div className={clsx("p-2 rounded-lg border text-xs flex flex-col items-center gap-1 text-center h-full justify-center transition-all hover:brightness-110", colors[role] || "bg-gray-800 text-muted")}>
            <span className="font-bold uppercase tracking-wider text-[10px]">{role}</span>
            <span className="flex items-center gap-1 opacity-80 font-mono">
                {time}
            </span>
        </div>
    );
};

const Schedules = () => {
    const [currentWeek, setCurrentWeek] = useState('Oct 23 - Oct 29');

    return (
        <div className="pb-20 md:pb-0 mx-auto space-y-6 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-main">Weekly Schedule</h1>
                    <p className="text-muted text-sm">View upcoming shifts and team roster</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Date Navigation */}
                    <div className="flex items-center gap-4 bg-surface p-2 rounded-xl border border-white/5">
                        <button className="p-2 hover:bg-gray-200 dark:bg-white/10 rounded-lg text-muted hover:text-main transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex items-center gap-2 text-sm font-medium text-main px-2">
                            <CalendarIcon size={16} className="text-primary" />
                            <span>{currentWeek}</span>
                        </div>
                        <button className="p-2 hover:bg-gray-200 dark:bg-white/10 rounded-lg text-muted hover:text-main transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Roster Table View - Desktop */}
            <div className="hidden md:flex bg-surface rounded-2xl border border-white/5 overflow-hidden flex-col relative w-full shadow-xl">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse min-w-[1000px]">
                        <thead>
                            <tr>
                                <th className="p-4 text-left text-xs font-bold text-muted uppercase tracking-wider border-b border-white/10 bg-surface/95 backdrop-blur sticky left-0 z-20 w-48 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                                    Staff Member
                                </th>
                                {DAYS.map(day => (
                                    <th key={day} className="p-4 text-center text-xs font-bold text-muted uppercase tracking-wider border-b border-white/10 min-w-[140px] bg-surface/50">
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {SCHEDULE_DATA.map((staff) => (
                                <tr key={staff.id} className="group transition-colors odd:bg-transparent even:bg-white/[0.02] hover:bg-gray-100 dark:bg-white/5">
                                    {/* Sticky Staff Column */}
                                    <td className="p-4 bg-surface group-hover:bg-gray-50 dark:group-hover:bg-[#1a1c23] transition-colors sticky left-0 z-20 border-r border-gray-200 dark:border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] w-48 max-w-48">
                                        <div className="flex items-center gap-3">
                                            <img src={staff.avatar} alt={staff.name} className="w-10 h-10 rounded-full shrink-0" />
                                            <div className="min-w-0 overflow-hidden">
                                                <p className="font-bold text-main text-sm truncate" title={staff.name}>{staff.name}</p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {['Breakfast', 'Cleaning', 'Bar'].includes(staff.role) ? 'Volunteer' : staff.role}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Schedule Grid */}
                                    {staff.schedule.map((shift, idx) => (
                                        <td key={idx} className="p-2 border-r border-white/5 last:border-0 relative h-24">
                                            {shift.isActive ? (
                                                <RoleBadge role={shift.role} time={shift.time} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-100 dark:bg-white/5"></span>
                                                </div>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile List View */}
            <div className="md:hidden space-y-4">
                {SCHEDULE_DATA.map((staff) => (
                    <div key={staff.id} className="bg-surface rounded-xl border border-white/5 p-4 space-y-4">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                            <img src={staff.avatar} alt={staff.name} className="w-10 h-10 rounded-full" />
                            <div>
                                <p className="font-bold text-main">{staff.name}</p>
                                <p className="text-xs text-gray-500">
                                    {['Breakfast', 'Cleaning', 'Bar'].includes(staff.role) ? 'Volunteer' : staff.role}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {staff.schedule.some(s => s.isActive) ? (
                                staff.schedule.filter(s => s.isActive).map((shift, idx) => (
                                    <div key={idx} className="flex items-center justify-between gap-4">
                                        <span className="text-sm font-medium text-muted w-12 shrink-0">{shift.day}</span>
                                        <div className="flex-1">
                                            <RoleBadge role={shift.role} time={shift.time} />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-2">No shifts this week</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Schedules;



