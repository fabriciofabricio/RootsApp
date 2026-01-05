import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, UserPlus, UserMinus, Search, Filter, List, Table as TableIcon, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

import clsx from 'clsx';

// --- DATA MODELS ---

// Status constants for styling
const STATUS_STYLES = {
    'Nightshift': 'bg-gray-800 text-white border-gray-600',
    'housekeeping': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'breakfast/bar': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'reception': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const VISA_STATUS = {
    'EU': 'text-blue-400',
    'x': 'text-red-400',
    'EU citizenship': 'text-green-400'
};

const VOLUNTEERS_ROSTER = [
    { id: 1, name: 'Gabriel (night)', origin: 'Brazil', age: 29, visa: 'x', experience: 'Yes', arrival: '25 jan', departure: '25 jan 2026', flexibel: 'Yes', status: 'Nightshift', opmerking: 'Nightshift', avatar: 'https://ui-avatars.com/api/?name=Gabriel&background=F59E0B&color=fff' },
    { id: 2, name: 'Agathe', origin: 'France', age: '?', visa: 'EU', experience: 'Yes', arrival: '18 jan', departure: '19 feb', flexibel: 'No', status: 'housekeeping', opmerking: 'housekeeping', avatar: 'https://ui-avatars.com/api/?name=Agathe&background=EC4899&color=fff' },
    { id: 3, name: 'Fabricio', origin: 'Brazil', age: 22, visa: 'x', experience: 'Yes', arrival: '-', departure: '-', flexibel: 'Yes', status: 'breakfast/bar', opmerking: 'breakfast/bar', avatar: 'https://ui-avatars.com/api/?name=Fabricio&background=3B82F6&color=fff' },
    { id: 4, name: 'Jorge', origin: 'Mexico', age: 26, visa: 'x', experience: 'Yes', arrival: '9 dec', departure: '-', flexibel: 'Yes', status: 'breakfast/bar', opmerking: 'breakfast/bar', avatar: 'https://ui-avatars.com/api/?name=Jorge&background=EF4444&color=fff' },
    { id: 5, name: 'Tamina', origin: 'Brazil', age: '-', visa: 'EU citizenship', experience: 'Yes', arrival: '19 dec', departure: '20 jan', flexibel: 'No', status: 'housekeeping', opmerking: 'housekeeping', avatar: 'https://ui-avatars.com/api/?name=Tamina&background=10B981&color=fff' },
    { id: 6, name: 'Marco', origin: 'Italie', age: 23, visa: 'EU', experience: 'No', arrival: '10 jan', departure: '9 mrt', flexibel: 'Yes', status: 'housekeeping', opmerking: 'housekeeping', avatar: 'https://ui-avatars.com/api/?name=Marco&background=6366F1&color=fff' },
    { id: 7, name: 'Marta', origin: 'Poland', age: 18, visa: 'EU', experience: 'No', arrival: '4 jan', departure: '31 jan', flexibel: 'Yes', status: 'housekeeping', opmerking: 'housekeeping', avatar: 'https://ui-avatars.com/api/?name=Marta&background=F97316&color=fff' },
    { id: 8, name: 'Vicky', origin: 'Italie', age: 26, visa: 'EU', experience: 'No', arrival: '26 jan', departure: '31 mrt', flexibel: 'No', status: 'housekeeping', opmerking: 'housekeeping', avatar: 'https://ui-avatars.com/api/?name=Vicky&background=8B5CF6&color=fff' },
    { id: 9, name: 'Agnes', origin: 'Italie', age: 25, visa: 'EU', experience: 'No', arrival: '1 feb', departure: '28 feb', flexibel: 'Yes', status: 'housekeeping', opmerking: 'housekeeping', avatar: 'https://ui-avatars.com/api/?name=Agnes&background=EC4899&color=fff' },
];

const SCHEDULE_WEEKS = ['29 - 4 jan', '5 - 11 jan', '12 - 18 jan', '19 - 25 jan', '26 - 1 feb', '2 - 8 feb', '9 - 15 feb', '16 - 22 feb', '23 - 1 mrt', '2 - 8 mrt'];

const CLEANING_SCHEDULE = [
    { name: 'Mina', weeks: { '29 - 4 jan': 'Mina', '5 - 11 jan': '10 jan' } },
    { name: 'Tamina', weeks: { '29 - 4 jan': 'Tamina', '5 - 11 jan': 'Tamina', '12 - 18 jan': '18 jan' } },
    { name: 'Marta', weeks: { '5 - 11 jan': '2 jan Marta', '12 - 18 jan': 'Marta', '19 - 25 jan': 'Marta', '26 - 1 feb': '31 jan' } },
    { name: 'Marco', weeks: { '5 - 11 jan': '10 jan Marco', '12 - 18 jan': 'Marco', '19 - 25 jan': 'Marco', '26 - 1 feb': 'Marco', '2 - 8 feb': 'Marco', '9 - 15 feb': 'Marco', '16 - 22 feb': 'Marco', '23 - 1 mrt': 'Marco', '2 - 8 mrt': 'Marco' } },
    { name: 'Agathe', weeks: { '19 - 25 jan': '19 jan Agathe', '26 - 1 feb': 'Agathe', '2 - 8 feb': 'Agathe', '9 - 15 feb': 'Agathe', '16 - 22 feb': '19 feb' } },
    { name: 'Vicky', weeks: { '19 - 25 jan': '19 jan Vicky', '26 - 1 feb': 'Vicky', '2 - 8 feb': 'Vicky', '9 - 15 feb': 'Vicky', '16 - 22 feb': 'Vicky', '23 - 1 mrt': 'Vicky', '2 - 8 mrt': 'Vicky' } },
    { name: 'Agnes', weeks: { '2 - 8 feb': '1 feb Agnes', '9 - 15 feb': 'Agnes', '16 - 22 feb': 'Agnes', '23 - 1 mrt': '28 feb' } },
    { name: 'Beds', isMetric: true, weeks: { '29 - 4 jan': 3, '5 - 11 jan': 4, '12 - 18 jan': 3, '19 - 25 jan': 4, '26 - 1 feb': 4, '2 - 8 feb': 4, '9 - 15 feb': 4, '16 - 22 feb': 4, '23 - 1 mrt': 3 } }
];

const BREAKFAST_BAR_SCHEDULE = [
    { name: 'Jorge', weeks: { '29 - 4 jan': 'Jorge', '5 - 11 jan': 'Jorge', '12 - 18 jan': 'Jorge', '19 - 25 jan': 'Jorge', '26 - 1 feb': 'Jorge', '2 - 8 feb': 'Jorge', '9 - 15 feb': 'Jorge', '16 - 22 feb': 'Jorge', '23 - 1 mrt': 'Jorge' } },
    { name: 'Fabricio', weeks: { '29 - 4 jan': 'Fabricio', '5 - 11 jan': 'Fabricio', '12 - 18 jan': 'Fabricio', '19 - 25 jan': 'Fabricio', '26 - 1 feb': '26' } },
];


const VolunteerCalendar = () => {
    const [viewMode, setViewMode] = useState('roster'); // 'roster' | 'schedule'
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRoster = VOLUNTEERS_ROSTER.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.origin.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto pb-20 md:pb-10 space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-main tracking-tight">
                        Volunteers
                    </h1>
                    <p className="text-muted text-sm font-medium tracking-wide">
                        ROSTER & ASSIGNMENTS
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    {/* View Toggle */}
                    <div className="bg-surface/50 border border-white/10 p-1 rounded-xl flex">
                        <button
                            onClick={() => setViewMode('roster')}
                            className={clsx(
                                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                                viewMode === 'roster'
                                    ? "bg-primary text-black shadow-lg shadow-primary/20"
                                    : "text-muted hover:text-main hover:bg-white/5"
                            )}
                        >
                            ROSTER
                        </button>
                        <button
                            onClick={() => setViewMode('schedule')}
                            className={clsx(
                                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                                viewMode === 'schedule'
                                    ? "bg-primary text-black shadow-lg shadow-primary/20"
                                    : "text-muted hover:text-main hover:bg-white/5"
                            )}
                        >
                            SCHEDULE
                        </button>
                    </div>

                    {/* Search Bar (Only for Roster) */}
                    {viewMode === 'roster' && (
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
                    )}
                </div>
            </div>

            {/* Content Area */}
            {viewMode === 'roster' ? (
                <div className="bg-surface backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl overflow-hidden ring-1 ring-white/5">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5">
                                    <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Name</th>
                                    <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Origin</th>
                                    <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Age</th>
                                    <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Visa</th>
                                    <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Exp.</th>
                                    <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Arrival</th>
                                    <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Departure</th>
                                    <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Flexible</th>
                                    <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Status</th>
                                    <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Opmerking</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredRoster.map((volunteer) => (
                                    <tr key={volunteer.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <img src={volunteer.avatar} alt={volunteer.name} className="w-8 h-8 rounded-full bg-gray-700" />
                                                <span className="font-bold text-main">{volunteer.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-300">{volunteer.origin}</td>
                                        <td className="p-4 text-sm text-gray-300">{volunteer.age}</td>
                                        <td className={clsx("p-4 text-sm font-medium", VISA_STATUS[volunteer.visa] || 'text-gray-400')}>{volunteer.visa}</td>
                                        <td className="p-4 text-sm text-gray-300">
                                            {volunteer.experience === 'Yes' ? (
                                                <CheckCircle2 size={16} className="text-green-400" />
                                            ) : (
                                                <span className="text-gray-500 text-xs">No</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm text-gray-300">{volunteer.arrival}</td>
                                        <td className="p-4 text-sm text-gray-300">{volunteer.departure}</td>
                                        <td className="p-4 text-sm text-gray-300">
                                            {volunteer.flexibel === 'Yes' ? (
                                                <span className="text-green-400 font-medium">Yes</span>
                                            ) : (
                                                <span className="text-red-400 font-medium">No</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {volunteer.status && (
                                                <div className={clsx("w-6 h-6 rounded bg-green-500", volunteer.status === 'Nightshift' ? '' : 'bg-green-500')}></div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className={clsx(
                                                "px-2 py-1 rounded text-xs font-bold uppercase tracking-wide border",
                                                STATUS_STYLES[volunteer.opmerking] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                            )}>
                                                {volunteer.opmerking}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Cleaning Schedule */}
                    <div className="bg-surface backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl overflow-hidden ring-1 ring-white/5">
                        <div className="p-4 bg-cyan-500/10 border-b border-cyan-500/20 flex items-center gap-3">
                            <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                                <Users size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-cyan-100">CLEANING TEAM</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/5">
                                        <th className="p-3 text-xs font-bold text-muted uppercase tracking-wider sticky left-0 bg-[#1A1A1A] z-10 border-r border-white/5">Name</th>
                                        {SCHEDULE_WEEKS.map(week => (
                                            <th key={week} className="p-3 text-xs font-bold text-muted uppercase tracking-wider whitespace-nowrap min-w-[100px] border-r border-white/5">{week}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {CLEANING_SCHEDULE.map((row, idx) => (
                                        <tr key={idx} className={clsx("group hover:bg-white/[0.02] transition-colors", row.isMetric ? "bg-white/[0.02] font-mono text-xs" : "")}>
                                            <td className={clsx("p-3 font-medium text-main sticky left-0 bg-[#1A1A1A] z-10 border-r border-white/5", row.isMetric ? "text-gray-500" : "")}>{row.name}</td>
                                            {SCHEDULE_WEEKS.map(week => (
                                                <td key={week} className="p-3 text-sm text-gray-400 border-r border-white/5 relative">
                                                    {/* Cell Logic to recreate the visual bars roughly */}
                                                    {row.weeks[week] && !row.isMetric && (
                                                        <div className={clsx(
                                                            "absolute inset-1 rounded flex items-center px-2 text-xs font-bold truncate",
                                                            // Determine color based on name usually, but simplistic here:
                                                            row.name === 'Mina' ? "bg-emerald-500/20 text-emerald-300" :
                                                                row.name === 'Tamina' ? "bg-green-500/20 text-green-300" :
                                                                    row.name === 'Marta' ? "bg-red-500/20 text-red-300" :
                                                                        row.name === 'Marco' ? "bg-blue-500/20 text-blue-300" :
                                                                            row.name === 'Agathe' ? "bg-yellow-500/20 text-yellow-300" :
                                                                                row.name === 'Vicky' ? "bg-pink-500/20 text-pink-300" :
                                                                                    "bg-orange-500/20 text-orange-300"
                                                        )}>
                                                            {row.weeks[week]}
                                                        </div>
                                                    )}
                                                    {row.isMetric && (
                                                        <div className="text-center font-bold text-gray-500">{row.weeks[week]}</div>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Breakfast / Bar Schedule */}
                    <div className="bg-surface backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl overflow-hidden ring-1 ring-white/5">
                        <div className="p-4 bg-yellow-400/10 border-b border-yellow-400/20 flex items-center gap-3">
                            <div className="p-2 bg-yellow-400/20 rounded-lg text-yellow-400">
                                <Clock size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-yellow-100">BREAKFAST / BAR</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/5">
                                        <th className="p-3 text-xs font-bold text-muted uppercase tracking-wider sticky left-0 bg-[#1A1A1A] z-10 border-r border-white/5">Name</th>
                                        {SCHEDULE_WEEKS.map(week => (
                                            <th key={week} className="p-3 text-xs font-bold text-muted uppercase tracking-wider whitespace-nowrap min-w-[100px] border-r border-white/5">{week}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {BREAKFAST_BAR_SCHEDULE.map((row, idx) => (
                                        <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="p-3 font-medium text-main sticky left-0 bg-[#1A1A1A] z-10 border-r border-white/5">{row.name}</td>
                                            {SCHEDULE_WEEKS.map(week => (
                                                <td key={week} className="p-3 text-sm text-gray-400 border-r border-white/5 relative">
                                                    {row.weeks[week] && (
                                                        <div className={clsx(
                                                            "absolute inset-1 rounded flex items-center px-2 text-xs font-bold truncate",
                                                            row.name === 'Jorge' ? "bg-red-600/20 text-red-400" : "bg-purple-500/20 text-purple-300"
                                                        )}>
                                                            {row.weeks[week]}
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
                </div>
            )}
        </div>
    );
};

export default VolunteerCalendar;
