import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, UserPlus, UserMinus, Search, Filter } from 'lucide-react';
import clsx from 'clsx';

// Mock Volunteer Data
const VOLUNTEERS = [
    { id: 1, name: 'Ana Silva', role: 'Volunteer', arrival: '2025-10-01', departure: '2025-11-15', avatar: 'https://ui-avatars.com/api/?name=Ana+Silva&background=3B82F6&color=fff' },
    { id: 2, name: 'João Santos', role: 'Volunteer', arrival: '2025-10-10', departure: '2025-10-25', avatar: 'https://ui-avatars.com/api/?name=Joao+Santos&background=A855F7&color=fff' },
    { id: 3, name: 'Maria Costa', role: 'Volunteer', arrival: '2025-09-20', departure: '2025-10-15', avatar: 'https://ui-avatars.com/api/?name=Maria+Costa&background=06B6D4&color=fff' },
    { id: 4, name: 'Pedro Oliver', role: 'Intern', arrival: '2025-10-05', departure: '2025-12-01', avatar: 'https://ui-avatars.com/api/?name=Pedro+Oliver&background=F97316&color=fff' },
    { id: 5, name: 'Sofia R.', role: 'Volunteer', arrival: '2025-10-20', departure: '2025-11-10', avatar: 'https://ui-avatars.com/api/?name=Sofia+R&background=EC4899&color=fff' },
    { id: 6, name: 'Lucas Fern', role: 'Volunteer', arrival: '2025-10-01', departure: '2025-10-31', avatar: 'https://ui-avatars.com/api/?name=Lucas+Fern&background=10B981&color=fff' },
    // New additions
    { id: 7, name: 'Emma Wilson', role: 'Intern', arrival: '2025-10-01', departure: '2025-12-20', avatar: 'https://ui-avatars.com/api/?name=Emma+Wilson&background=F59E0B&color=fff' },
    { id: 8, name: 'Liam Brown', role: 'Volunteer', arrival: '2025-10-15', departure: '2025-11-05', avatar: 'https://ui-avatars.com/api/?name=Liam+Brown&background=14B8A6&color=fff' },
    { id: 9, name: 'Noah Davis', role: 'Volunteer', arrival: '2025-09-25', departure: '2025-10-30', avatar: 'https://ui-avatars.com/api/?name=Noah+Davis&background=6366F1&color=fff' },
];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const VolunteerCalendar = () => {
    // State for current view (October 2025 as starting point to match mock data)
    const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 1)); // Month is 0-indexed (9 = October)
    const [searchTerm, setSearchTerm] = useState('');

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // Helper to check if a volunteer is present on a given day
    const getStayStatus = (volunteer, day) => {
        const currentDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        // Simple string comparison for dates YYYY-MM-DD
        if (currentDayStr >= volunteer.arrival && currentDayStr <= volunteer.departure) {
            if (currentDayStr === volunteer.arrival) return 'start';
            if (currentDayStr === volunteer.departure) return 'end';
            return 'during';
        }
        return null;
    };

    const isToday = (day) => {
        const today = new Date(); // In real app, this would be actual today. Here "today" might be relative to mock data.
        return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
    };

    const isWeekend = (day) => {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        return dayOfWeek === 0 || dayOfWeek === 6;
    };

    // Filter Logic: Only allow specific volunteer/intern roles
    const ALLOWED_ROLES = ['Intern', 'Volunteer'];

    // Base filter for allowed roles (Volunteers + Interns)
    // This is used for Stats calculation to exclude Staff/Front Office from counts
    const activeVolunteers = VOLUNTEERS.filter(v => ALLOWED_ROLES.includes(v.role));

    // Search filter applied on top of valid roles
    const filteredVolunteers = activeVolunteers.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.role.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
        // Prioritize Interns
        if (a.role === 'Intern' && b.role !== 'Intern') return -1;
        if (a.role !== 'Intern' && b.role === 'Intern') return 1;
        return 0;
    });

    return (
        <div className="max-w-7xl mx-auto pb-20 md:pb-10 space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-main tracking-tight">
                        Volunteers
                    </h1>
                    <p className="text-muted text-sm font-medium tracking-wide">
                        MANAGE SCHEDULES & AVAILABILITY
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    {/* Search Bar */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-gray-500 group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search volunteer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 bg-surface/50 border border-white/10 text-main text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-600 backdrop-blur-sm"
                        />
                    </div>

                    {/* Month Navigator */}
                    <div className="flex items-center gap-2 bg-surface/50 border border-white/10 p-1.5 rounded-xl backdrop-blur-sm shadow-xl shadow-black/20">
                        <button
                            onClick={prevMonth}
                            className="p-2 hover:bg-gray-200 dark:bg-white/10 rounded-lg text-muted hover:text-main transition-all active:scale-95"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="flex items-center gap-3 text-sm font-bold text-main px-4 min-w-[160px] justify-center">
                            <CalendarIcon size={16} className="text-primary" />
                            <span className="uppercase tracking-wider">{MONTHS[month]} {year}</span>
                        </div>
                        <button
                            onClick={nextMonth}
                            className="p-2 hover:bg-gray-200 dark:bg-white/10 rounded-lg text-muted hover:text-main transition-all active:scale-95"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Calendar Area */}
                <div className="lg:col-span-3">
                    {/* Desktop Calendar View */}
                    <div className="hidden md:flex bg-surface backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden shadow-2xl flex-col h-full ring-1 ring-white/5">
                        <div className="overflow-x-auto custom-scrollbar">
                            <div className="min-w-full w-fit">
                                {/* Header Row */}
                                <div className="flex border-b border-white/5 bg-surface/80 sticky top-0 z-20 backdrop-blur-md">
                                    <div className="w-72 p-4 shrink-0 font-bold text-muted text-xs uppercase tracking-widest sticky left-0 bg-surface z-30 border-r border-white/5 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.5)] flex items-center">
                                        Volunteer
                                        <span className="ml-auto text-[10px] bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full text-gray-500">
                                            {filteredVolunteers.length}
                                        </span>
                                    </div>
                                    <div className="flex-1 flex">
                                        {daysArray.map(day => {
                                            const dateObj = new Date(year, month, day);
                                            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'narrow' });
                                            const isWknd = isWeekend(day);
                                            const isTdy = isToday(day);

                                            return (
                                                <div key={day} className={clsx(
                                                    "flex-1 min-w-[36px] flex flex-col items-center justify-center py-3 border-r border-white/5 last:border-0 relative group transition-colors duration-300",
                                                    isWknd ? "bg-white/[0.02]" : "",
                                                    isTdy ? "bg-primary/5" : "hover:bg-white/[0.02]"
                                                )}>
                                                    {isTdy && <div className="absolute top-0 inset-x-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(255,215,0,0.5)]" />}
                                                    <span className={clsx(
                                                        "text-[10px] font-medium mb-1 transition-colors",
                                                        isTdy ? "text-primary" : "text-gray-500"
                                                    )}>{dayName}</span>
                                                    <span className={clsx(
                                                        "text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full transition-all",
                                                        isTdy ? "bg-primary text-black shadow-lg shadow-primary/20 scale-110" : "text-muted group-hover:text-main group-hover:bg-gray-200 dark:bg-white/10"
                                                    )}>{day}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Body Rows */}
                                <div className="divide-y divide-white/5">
                                    {filteredVolunteers.length > 0 ? (
                                        filteredVolunteers.map((volunteer, idx) => (
                                            <div key={volunteer.id} className="flex group transition-colors hover:bg-white/[0.01]">
                                                {/* Sticky Volunteer Info */}
                                                <div className="w-72 p-3 shrink-0 sticky left-0 bg-surface group-hover:bg-gray-50 dark:group-hover:bg-[#161616] transition-colors z-10 border-r border-white/5 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.5)] flex items-center gap-4">
                                                    <div className="relative">
                                                        <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/50 to-purple-500/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-sm"></div>
                                                        <img src={volunteer.avatar} alt={volunteer.name} className="relative w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-800 border-2 border-surface group-hover:border-transparent transition-all object-cover" />
                                                    </div>
                                                    <div className="overflow-hidden min-w-0 flex-1">
                                                        <p className="font-bold text-muted group-hover:text-main text-sm truncate transition-colors">{volunteer.name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={clsx(
                                                                "text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide font-semibold truncate",
                                                                volunteer.role === 'Intern' ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"
                                                            )}>
                                                                {volunteer.role}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Days Grid */}
                                                <div className="flex-1 flex relative">
                                                    {/* Background styling for weekends */}
                                                    <div className="absolute inset-0 flex pointer-events-none">
                                                        {daysArray.map(day => (
                                                            <div key={day} className={clsx(
                                                                "flex-1 min-w-[36px] border-r border-white/5 last:border-0",
                                                                isWeekend(day) ? "bg-white/[0.01]" : "",
                                                                isToday(day) ? "bg-primary/[0.02]" : ""
                                                            )} />
                                                        ))}
                                                    </div>

                                                    {/* Timeline Bars */}
                                                    {daysArray.map(day => {
                                                        const status = getStayStatus(volunteer, day);
                                                        let barClass = "";

                                                        if (status === 'start') {
                                                            barClass = "bg-gradient-to-r from-transparent to-primary/80 ml-2 rounded-l-full";
                                                        } else if (status === 'end') {
                                                            barClass = "bg-gradient-to-r from-primary/80 to-transparent mr-2 rounded-r-full";
                                                        } else if (status === 'during') {
                                                            barClass = "bg-primary/80";
                                                        }

                                                        return (
                                                            <div key={day} className="flex-1 min-w-[36px] relative h-[72px] flex items-center justify-center z-0">
                                                                {status && (
                                                                    <div className={clsx(
                                                                        "h-2 w-full absolute transition-all duration-300 shadow-[0_0_10px_rgba(255,215,0,0.2)]",
                                                                        "group-hover:h-3 group-hover:shadow-[0_0_15px_rgba(255,215,0,0.4)]",
                                                                        barClass
                                                                    )}
                                                                    >
                                                                        {status === 'start' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform duration-300 origin-center" />}
                                                                        {status === 'end' && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform duration-300 origin-center" />}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-12 text-center text-gray-500">
                                            <p>No volunteers found matching "{searchTerm}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile List View */}
                    <div className="md:hidden space-y-4">
                        {filteredVolunteers.length > 0 ? (
                            filteredVolunteers.map((volunteer) => (
                                <div key={volunteer.id} className="bg-surface backdrop-blur-xl rounded-xl border border-white/5 p-4 space-y-4">
                                    <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                                        <img src={volunteer.avatar} alt={volunteer.name} className="w-12 h-12 rounded-full border-2 border-surface" />
                                        <div>
                                            <p className="font-bold text-main text-lg">{volunteer.name}</p>
                                            <span className={clsx(
                                                "text-[10px] px-2 py-0.5 rounded uppercase tracking-wide font-bold",
                                                volunteer.role === 'Intern' ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"
                                            )}>
                                                {volunteer.role}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Arrival</p>
                                            <div className="flex items-center gap-2 text-main">
                                                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400">
                                                    <CalendarIcon size={16} />
                                                </div>
                                                <span className="text-sm font-medium">{new Date(volunteer.arrival).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Departure</p>
                                            <div className="flex items-center gap-2 text-main">
                                                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                                                    <CalendarIcon size={16} />
                                                </div>
                                                <span className="text-sm font-medium">{new Date(volunteer.departure).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500 bg-surface rounded-xl border border-white/5">
                                <p>No volunteers found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar / Stats Area */}
                <div className="space-y-6">
                    {/* Stats Card */}
                    <div className="bg-surface backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-xl ring-1 ring-white/5">
                        <h3 className="text-lg font-bold text-main mb-6 flex items-center gap-2">
                            <Filter size={18} className="text-primary" />
                            Overview
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 group hover:border-primary/30 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-muted text-xs font-medium uppercase tracking-wider">Total Active</span>
                                    <Users size={16} className="text-blue-400 group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="text-3xl font-black text-main">{activeVolunteers.length}</span>
                                <div className="w-full bg-gray-700 h-1 rounded-full mt-3 overflow-hidden">
                                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '100%' }}></div>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 group hover:border-primary/30 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-muted text-xs font-medium uppercase tracking-wider">Arrivals</span>
                                    <UserPlus size={16} className="text-status-green group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="text-3xl font-black text-main">
                                    {activeVolunteers.filter(v => {
                                        const d = new Date(v.arrival);
                                        return d.getMonth() === month && d.getFullYear() === year;
                                    }).length}
                                </span>
                                <p className="text-xs text-status-green mt-1 font-medium">Coming this month</p>
                            </div>

                            <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 group hover:border-primary/30 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-muted text-xs font-medium uppercase tracking-wider">Departures</span>
                                    <UserMinus size={16} className="text-orange-400 group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="text-3xl font-black text-main">
                                    {activeVolunteers.filter(v => {
                                        const d = new Date(v.departure);
                                        return d.getMonth() === month && d.getFullYear() === year;
                                    }).length}
                                </span>
                                <p className="text-xs text-orange-400 mt-1 font-medium">Leaving this month</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Legend */}
                    <div className="bg-surface backdrop-blur-xl p-6 rounded-2xl border border-white/5 shadow-xl ring-1 ring-white/5">
                        <h3 className="text-sm font-bold text-muted mb-4 uppercase tracking-wider">Status Legend</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-2 rounded-full bg-gradient-to-r from-transparent to-primary/80 relative">
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>
                                </div>
                                <span className="text-sm text-muted">Arrival Day</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-2 rounded-full bg-primary/80"></div>
                                <span className="text-sm text-muted">On Stay</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-2 rounded-full bg-gradient-to-r from-primary/80 to-transparent relative">
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>
                                </div>
                                <span className="text-sm text-muted">Departure Day</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VolunteerCalendar;




