import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from 'lucide-react';
import clsx from 'clsx';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const EVENTS = [
    { id: 1, date: '2026-01-01', title: 'Student Night', type: 'student_night' },
    { id: 2, date: '2026-01-01', title: 'actie vereist MEWS', type: 'warning' },
    { id: 3, date: '2026-01-01', title: 'Muntjes voor bar', type: 'task' },
    { id: 4, date: '2026-01-02', title: 'kerstvakantie NL', type: 'holiday' },
    { id: 5, date: '2026-01-02', title: 'Muntjes voor bar', type: 'task' },
    { id: 6, date: '2026-01-03', title: 'kerstvakantie NL', type: 'holiday' },
    { id: 7, date: '2026-01-03', title: 'Muntjes voor bar', type: 'task' },
    { id: 8, date: '2026-01-04', title: 'kerstvakantie NL', type: 'holiday' },
    { id: 9, date: '2026-01-04', title: 'Klusweek', type: 'general' },

    // Week 1
    { id: 10, date: '2025-12-29', title: 'kerstvakantie NL', type: 'holiday' },
    { id: 11, date: '2025-12-29', title: 'B.C. bathroom&kitchen', type: 'task' },
    { id: 12, date: '2025-12-30', title: 'kerstvakantie NL', type: 'holiday' },
    { id: 13, date: '2025-12-30', title: 'FO meeting', type: 'meeting' },
    { id: 14, date: '2025-12-30', title: 'B.C. rooms', type: 'task' },
    { id: 15, date: '2025-12-31', title: 'kerstvakantie NL', type: 'holiday' },
    { id: 16, date: '2025-12-31', title: 'Volunteer meeting', type: 'meeting' },

    // Week 2
    { id: 20, date: '2026-01-05', title: 'Klusweek', type: 'general' },
    { id: 21, date: '2026-01-05', title: 'B.C. bathroom&kitchen', type: 'task' },
    { id: 22, date: '2026-01-06', title: 'FO meeting', type: 'meeting' },
    { id: 23, date: '2026-01-06', title: 'Klusweek', type: 'general' },
    { id: 24, date: '2026-01-06', title: 'B.C. rooms', type: 'task' },
    { id: 25, date: '2026-01-07', title: 'Volunteer meeting', type: 'meeting' },
    { id: 26, date: '2026-01-07', title: 'Klusweek', type: 'task' }, // Typo in image? says Klusweek under Volunteer meeting
    { id: 27, date: '2026-01-08', title: 'Student Night', type: 'student_night' },
    { id: 28, date: '2026-01-08', title: 'Klusweek', type: 'general' },
    { id: 29, date: '2026-01-09', title: 'Klusweek', type: 'general' },

    // Week 3
    { id: 30, date: '2026-01-12', title: 'B.C. bathroom&kitchen', type: 'task' },
    { id: 31, date: '2026-01-13', title: 'FO meeting', type: 'meeting' },
    { id: 32, date: '2026-01-13', title: 'B.C. rooms', type: 'task' },
    { id: 33, date: '2026-01-14', title: 'Volunteer meeting', type: 'meeting' },
    { id: 34, date: '2026-01-15', title: 'Student Night', type: 'student_night' },
];

const Calendar = () => {
    // Start with January 2026 as requested in the image context
    const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Adjust to make Monday index 0
    };

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Generate calendar grid days
    // We need to show some days from previous month and next month to fill the grid
    const days = [];

    // Previous month days
    const prevMonthDays = getFirstDayOfMonth(year, month);
    const daysInPrevMonth = getDaysInMonth(year, month - 1);

    for (let i = prevMonthDays - 1; i >= 0; i--) {
        days.push({
            day: daysInPrevMonth - i,
            month: month - 1,
            year: month === 0 ? year - 1 : year,
            isCurrentMonth: false
        });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        days.push({
            day: i,
            month: month,
            year: year,
            isCurrentMonth: true
        });
    }

    // Next month days to fill 6 weeks (42 days)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
        days.push({
            day: i,
            month: month + 1,
            year: month === 11 ? year + 1 : year,
            isCurrentMonth: false
        });
    }

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToToday = () => setCurrentDate(new Date());

    const getEventsForDay = (dayObj) => {
        const dateStr = `${dayObj.year}-${String(dayObj.month + 1).padStart(2, '0')}-${String(dayObj.day).padStart(2, '0')}`;
        return EVENTS.filter(e => e.date === dateStr);
    };

    const isToday = (dayObj) => {
        const today = new Date();
        return dayObj.day === today.getDate() &&
            dayObj.month === today.getMonth() &&
            dayObj.year === today.getFullYear();
    };

    const getEventStyle = (type) => {
        switch (type) {
            case 'student_night':
                return 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-500';
            case 'warning':
                return 'bg-orange-500 text-white font-bold animate-pulse'; // "actie vereist" looks urgent
            case 'holiday':
                return 'bg-gray-500/20 text-gray-400 italic';
            case 'meeting':
                return 'bg-purple-500/10 text-purple-400 border-l-2 border-purple-500 font-medium';
            case 'task':
                return 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500 text-xs';
            case 'general':
                return 'bg-amber-500/10 text-amber-500';
            default:
                return 'bg-white/5 text-muted border-l-2 border-gray-500/50';
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-20 md:pb-10 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-main tracking-tight">
                        Internal Calendar
                    </h1>
                    <p className="text-muted text-sm font-medium tracking-wide">
                        EVENT SCHEDULE & PLANNING
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={goToToday}
                        className="px-4 py-2 bg-surface border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider text-muted hover:text-main transition-colors"
                    >
                        Today
                    </button>
                    <div className="flex items-center gap-2 bg-surface/50 border border-white/10 p-1.5 rounded-xl backdrop-blur-sm shadow-xl shadow-black/20">
                        <button
                            onClick={prevMonth}
                            className="p-2 hover:bg-gray-200 dark:bg-white/10 rounded-lg text-muted hover:text-main transition-all active:scale-95"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="flex items-center gap-3 text-sm font-bold text-main px-4 min-w-[160px] justify-center">
                            <CalendarIcon size={16} className="text-primary" />
                            <span className="uppercase tracking-wider">
                                {MONTHS[month]} {year}
                            </span>
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

            {/* Calendar Grid */}
            <div className="bg-surface backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden shadow-2xl ring-1 ring-white/5">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 border-b border-white/5 bg-surface/50">
                    {DAYS.map((day) => (
                        <div key={day} className="py-3 text-center text-xs font-bold text-muted uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 auto-rows-[minmax(120px,auto)] divide-x divide-white/5 bg-surface/30">
                    {days.map((dayObj, idx) => {
                        const dayEvents = getEventsForDay(dayObj);
                        const isCurrent = isToday(dayObj);
                        const isWeekend = (idx + 1) % 7 === 0 || (idx + 1) % 7 === 6; // idx is 0-based flat index? No, need check logic
                        // Actually straightforward:
                        // 0=Mon, ..., 5=Sat, 6=Sun
                        const dayIndex = idx % 7;
                        const isSatSun = dayIndex === 5 || dayIndex === 6;

                        return (
                            <div
                                key={`${dayObj.year}-${dayObj.month}-${dayObj.day}`}
                                className={clsx(
                                    "relative p-2 min-h-[140px] transition-colors group border-b border-white/5 hover:bg-gray-100 dark:hover:bg-white/[0.02]",
                                    !dayObj.isCurrentMonth && "bg-gray-50 dark:bg-black/20 text-muted/50",
                                    isCurrent && "bg-primary/[0.03]",
                                    isSatSun && dayObj.isCurrentMonth && "bg-white/[0.01]"
                                )}
                            >
                                {/* Date Number */}
                                <div className="flex justify-between items-start mb-2">
                                    <span className={clsx(
                                        "text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full",
                                        isCurrent
                                            ? "bg-primary text-black shadow-lg shadow-primary/20 scale-110"
                                            : "text-muted group-hover:text-main"
                                    )}>
                                        {dayObj.day}
                                    </span>
                                    {dayObj.day === 1 && (
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider mr-1">
                                            {MONTHS[dayObj.month].substring(0, 3)}
                                        </span>
                                    )}
                                </div>

                                {/* Events List */}
                                <div className="space-y-1">
                                    {dayEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            className={clsx(
                                                "text-[10px] px-1.5 py-1 rounded w-full truncate font-medium",
                                                getEventStyle(event.type)
                                            )}
                                            title={event.title}
                                        >
                                            {event.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend / Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-surface border border-white/5 flex items-center gap-3">
                    <div className="w-3 h-3 rounded bg-blue-500/50 border border-blue-500"></div>
                    <span className="text-xs text-muted font-medium">Student Night</span>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-white/5 flex items-center gap-3">
                    <div className="w-3 h-3 rounded bg-orange-500"></div>
                    <span className="text-xs text-muted font-medium">Action Required</span>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-white/5 flex items-center gap-3">
                    <div className="w-3 h-3 rounded bg-gray-500/20 border border-gray-500/50"></div>
                    <span className="text-xs text-muted font-medium">Holiday</span>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-white/5 flex items-center gap-3">
                    <Info size={14} className="text-primary" />
                    <span className="text-xs text-muted font-medium">Week numbers on left edge</span>
                </div>
            </div>
        </div>
    );
};

export default Calendar;
