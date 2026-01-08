import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2, Plus } from 'lucide-react';
import { DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors, pointerWithin } from '@dnd-kit/core';

import clsx from 'clsx';
import { startOfWeek, endOfWeek, format, addWeeks, subWeeks } from 'date-fns';
import { schedulerService } from '../services/schedulerService';
import { getUsers } from '../services/userService';
import ShiftEditModal from '../components/schedules/ShiftEditModal';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const ROLE_THEME = {
    'Front Office': {
        badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        text: 'text-blue-400',
        borderLeft: 'border-l-blue-500',
        rowBg: 'bg-blue-500/[0.02]'
    },
    'Intern': {
        badge: 'bg-green-500/10 text-green-400 border-green-500/20',
        text: 'text-green-400',
        borderLeft: 'border-l-green-500',
        rowBg: 'bg-green-500/[0.02]'
    },
    'Breakfast': {
        badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        text: 'text-orange-400',
        borderLeft: 'border-l-orange-500',
        rowBg: 'bg-orange-500/[0.02]'
    },
    'Cleaning': {
        badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        text: 'text-cyan-400',
        borderLeft: 'border-l-cyan-500',
        rowBg: 'bg-cyan-500/[0.02]'
    },
    'Bar': {
        badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        text: 'text-purple-400',
        borderLeft: 'border-l-purple-500',
        rowBg: 'bg-purple-500/[0.02]'
    },
};

const RoleBadge = ({ role, time, minimal = false, onClick }) => {
    const theme = ROLE_THEME[role] || { badge: "bg-gray-800 text-muted", text: "text-muted" };

    if (minimal) {
        return (
            <div className={clsx("h-full w-full rounded p-1 flex items-center justify-center border text-[10px]", theme.badge)}>
                {role[0]}
            </div>
        );
    }

    return (
        <button
            onClick={onClick}
            className={clsx(
                "w-full h-full p-2 rounded-lg border text-xs flex flex-col items-center gap-1 text-center justify-center transition-all hover:brightness-110",
                theme.badge
            )}
        >
            <span className="font-bold uppercase tracking-wider text-[10px]">{role}</span>
            <span className="flex items-center gap-1 opacity-80 font-mono">
                {time}
            </span>
        </button>
    );
};

const DraggableShift = ({ shift, children, disabled }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: shift.id,
        data: { shift },
        disabled
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
        position: 'relative',
        opacity: isDragging ? 0.8 : 1,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={clsx(
                "touch-none",
                !disabled && "cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-transform"
            )}
        >
            {children}
        </div>
    );
};

const DroppableCell = ({ role, day, children, theme }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: `${role}:${day}`,
        data: { role, day }
    });

    return (
        <td
            ref={setNodeRef}
            className={clsx(
                "p-2 border-r border-white/5 last:border-0 relative h-24 align-top transition-colors",
                theme.rowBg,
                isOver && "bg-white/10 ring-2 ring-inset ring-primary/50"
            )}
        >
            {children}
        </td>
    );
};

const DraggableStaff = ({ user, children, disabled }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `staff-pool-${user.id}`,
        data: {
            type: 'create',
            user: user
        },
        disabled
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
        position: 'relative',
        opacity: isDragging ? 0.8 : 1,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={clsx(
                "flex items-center gap-3 p-2 rounded-lg bg-surface border border-white/5 shadow-sm hover:border-white/20 transition-all cursor-grab active:cursor-grabbing",
                isDragging && "opacity-50"
            )}
        >
            {user.photoURL || user.avatar ? (
                <img src={user.photoURL || user.avatar} alt={user.name} className="w-8 h-8 rounded-full shrink-0" />
            ) : (
                <img src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} className="w-8 h-8 rounded-full shrink-0" />
            )}
            <div className="min-w-0">
                <p className="font-medium text-main text-sm truncate">{user.name}</p>
                <p className="text-xs text-muted truncate">{user.role}</p>
            </div>
        </div>
    );
};

const DroppableStaffPool = ({ children }) => {
    const { isOver, setNodeRef } = useDroppable({
        id: 'staff-pool-delete',
    });

    return (
        <div
            ref={setNodeRef}
            className={clsx(
                "flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar transition-colors",
                isOver && "bg-red-500/10"
            )}
        >
            {children}
        </div>
    );
};

const Schedules = () => {

    const [isEditing, setIsEditing] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [weekSchedule, setWeekSchedule] = useState({ shifts: [] });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ staff: null, day: null, shift: null });

    // Computed properties for the week
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    const weekId = format(start, "yyyy-'w'ww"); // e.g., 2023-w42
    const weekLabel = `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`;

    const loadData = async () => {
        setLoading(true);
        try {
            const [scheduleData, usersData] = await Promise.all([
                schedulerService.getWeekSchedule(weekId),
                getUsers()
            ]);
            setWeekSchedule(scheduleData);
            setUsers(usersData.filter(u => !u.archived && u.showInSchedule !== false));
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [weekId]);

    const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));

    const openEditModal = (staff, day, shift) => {
        setModalData({ staff, day, shift });
        setIsModalOpen(true);
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleSaveShift = async (shiftData) => {
        // Optimistic Update
        const newShifts = [...(weekSchedule.shifts || [])];

        const existingIndex = newShifts.findIndex(s => s.id === shiftData.id);

        if (existingIndex !== -1) {
            // Update existing
            newShifts[existingIndex] = shiftData;
        } else {
            // Add new
            newShifts.push(shiftData);
        }

        const updatedSchedule = {
            ...weekSchedule,
            shifts: newShifts,
            id: weekId, // Ensure ID is set
            startDate: format(start, 'yyyy-MM-dd'),
            endDate: format(end, 'yyyy-MM-dd')
        };

        setWeekSchedule(updatedSchedule); // Update UI immediately
        setIsModalOpen(false);

        try {
            await schedulerService.saveWeekSchedule(weekId, updatedSchedule);
        } catch (error) {
            console.error("Failed to save", error);
            // Revert on error? For now just log
        }
    };

    const handleDeleteShift = async (shiftToDelete) => {
        const newShifts = weekSchedule.shifts.filter(s => s.id !== shiftToDelete.id);
        const updatedSchedule = { ...weekSchedule, shifts: newShifts };

        setWeekSchedule(updatedSchedule);
        setIsModalOpen(false);

        try {
            await schedulerService.saveWeekSchedule(weekId, updatedSchedule);
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (!over) return;

        // CASE 0: Deleting shift (dropping on Staff Pool)
        if (over.id === 'staff-pool-delete') {
            if (active.data.current?.shift) {
                handleDeleteShift(active.data.current.shift);
            }
            return;
        }

        if (!over.data.current) return;

        // CASE 1: Creating new shift from Staff Pool
        if (active.data.current?.type === 'create') {
            const user = active.data.current.user;
            const { role, day } = over.data.current;

            const shiftType = SHIFT_TYPES[role] || SHIFT_TYPES['Breakfast'];

            // RULE 1: Volunteer Shift Limit
            if (user.role === 'volunteer') {
                const currentShiftCount = weekSchedule.shifts?.filter(s => s.userId === user.id).length || 0;
                if (currentShiftCount >= 5) {
                    const confirmAdd = window.confirm(`${user.name} already has ${currentShiftCount} shifts this week. Are you sure you want to add another?`);
                    if (!confirmAdd) return;
                }
            }

            // RULE 2: Force Modal for Flexible Roles
            if (shiftType.type === 'Flexible') {
                openEditModal(user, day, { role }); // Open modal instead of auto-save
                return;
            }

            const defaultTime = shiftType.type === 'Fixed' ? shiftType.time : shiftType.defaults[0];

            const newShift = {
                id: crypto.randomUUID(),
                userId: user.id,
                name: user.name,
                role: role,
                day: day,
                time: defaultTime
            };

            handleSaveShift(newShift);
            return;
        }

        // CASE 2: Moving existing shift
        if (!active.data.current?.shift) return;

        const shift = active.data.current.shift;
        const { role: newRole, day: newDay } = over.data.current;

        // If dropped in same place, do nothing
        if (shift.role === newRole && shift.day === newDay) return;

        // Create updated shift object
        const updatedShift = { ...shift, role: newRole, day: newDay };

        // Call existing handleSaveShift
        handleSaveShift(updatedShift);
    };

    // Define SHIFT_TYPES locally for now as they are needed for default time calculation in drag
    // Ideally this should be shared constant
    const SHIFT_TYPES = {
        'Breakfast': { type: 'Fixed', time: '06:55 - 12:00', roles: ['Breakfast', 'Cleaning', 'Bar'] },
        'Cleaning': { type: 'Fixed', time: '10:30 - 16:00', roles: ['Breakfast', 'Cleaning', 'Bar'] },
        'Bar': {
            type: 'Flexible',
            defaults: ['15:30 - 21:00', '17:00 - 22:30'],
            roles: ['Breakfast', 'Cleaning', 'Bar']
        },
        'Front Office': {
            type: 'Flexible',
            defaults: [
                '08:30 - 17:00', '14:00 - 21:00', '12:30 - 16:00', '12:30 - 21:00',
                '15:00 - 21:00', '15:00 - 23:30', '14:00 - 22:30', '16:30 - 21:00'
            ],
            roles: ['Front Office', 'Staff']
        },
        'Intern': {
            type: 'Flexible',
            defaults: ['14:00 - 21:00', '08:30 - 14:30', '10:00 - 18:30', '08:30 - 17:00'],
            roles: ['Intern', 'Staff']
        }
    };

    // Helper to find shift for a cell
    // Helper to find shifts for a cell
    const getShifts = (staffId, day) => {
        return weekSchedule.shifts?.filter(s => s.userId === staffId && s.day === day) || [];
    };

    // Sorting Logic
    const getSortWeight = (user) => {
        const role = user.role?.toLowerCase();
        if (role === 'staff' || role === 'manager' || role === 'admin') return 1;
        if (role === 'intern') return 2;
        if (role === 'volunteer') {
            const main = user.mainShift?.toLowerCase();
            if (main === 'breakfast') return 3;
            if (main === 'cleaning') return 4;
            if (main === 'bar') return 5;
            return 6; // Other volunteer
        }
        return 7; // Unknown role
    };

    const sortedUsers = [...users].sort((a, b) => {
        return getSortWeight(a) - getSortWeight(b);
    });

    // Filter users for display
    const visibleUsers = isEditing
        ? sortedUsers
        : sortedUsers.filter(user => weekSchedule.shifts?.some(s => s.userId === user.id));

    const ROLES = ['Front Office', 'Intern', 'Breakfast', 'Cleaning', 'Bar'];
    const [viewMode, setViewMode] = useState('staff'); // 'staff' | 'shift'

    // Helper to find shifts by role for a day
    const getShiftsByRole = (role, day) => {
        return weekSchedule.shifts?.filter(s => s.role === role && s.day === day) || [];
    };

    const getUser = (userId) => users.find(u => u.id === userId);

    return (
        <div className="pb-20 md:pb-0 mx-auto space-y-6 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-main">Weekly Schedule</h1>
                    <p className="text-muted text-sm">Manage roster and shifts for {weekLabel}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* View Mode Toggle */}
                    <div className="flex bg-surface p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => setViewMode('staff')}
                            className={clsx(
                                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                                viewMode === 'staff' ? "bg-primary/20 text-primary" : "text-muted hover:text-main"
                            )}
                        >
                            Staff View
                        </button>
                        <button
                            onClick={() => setViewMode('shift')}
                            className={clsx(
                                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                                viewMode === 'shift' ? "bg-primary/20 text-primary" : "text-muted hover:text-main"
                            )}
                        >
                            Shift View
                        </button>
                    </div>

                    {/* Date Navigation */}
                    <div className="flex items-center gap-4 bg-surface p-2 rounded-xl border border-white/5">
                        <button
                            onClick={handlePrevWeek}
                            className="p-2 hover:bg-gray-200 dark:bg-white/10 rounded-lg text-muted hover:text-main transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex items-center gap-2 text-sm font-medium text-main px-2 min-w-[140px] justify-center">
                            <CalendarIcon size={16} className="text-primary" />
                            <span>{weekLabel}</span>
                        </div>
                        <button
                            onClick={handleNextWeek}
                            className="p-2 hover:bg-gray-200 dark:bg-white/10 rounded-lg text-muted hover:text-main transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Roster Table View - Desktop */}
            <div className="hidden md:flex bg-surface rounded-2xl border border-white/5 overflow-hidden flex-col relative w-full shadow-xl">
                {loading && (
                    <div className="absolute inset-0 z-50 bg-surface/50 backdrop-blur-sm flex items-center justify-center">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                )}

                {viewMode === 'staff' ? (
                    // STAFF VIEW
                    <div className="overflow-auto max-h-[calc(100vh-14rem)] custom-scrollbar">
                        <table className="w-full border-collapse min-w-[1000px]">
                            <thead>
                                <tr>
                                    <th className="p-4 text-left text-xs font-bold text-muted uppercase tracking-wider border-b border-white/10 bg-surface/95 backdrop-blur sticky left-0 top-0 z-30 w-48 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                                        <div className="flex items-center justify-between">
                                            <span>Staff Member</span>
                                            <button
                                                onClick={() => setIsEditing(!isEditing)}
                                                className={clsx(
                                                    "p-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all",
                                                    isEditing
                                                        ? "bg-primary/20 text-primary border-primary/50"
                                                        : "bg-white/5 text-muted border-white/10 hover:bg-white/10"
                                                )}
                                            >
                                                {isEditing ? 'Done' : 'Edit'}
                                            </button>
                                        </div>
                                    </th>
                                    {DAYS.map(day => (
                                        <th key={day} className="p-4 text-center text-xs font-bold text-muted uppercase tracking-wider border-b border-white/10 min-w-[140px] bg-surface/95 backdrop-blur sticky top-0 z-20">
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {visibleUsers.map((staff) => (
                                    <tr key={staff.id} className="group transition-colors odd:bg-transparent even:bg-white/[0.02] hover:bg-gray-100 dark:bg-white/5">
                                        {/* Sticky Staff Column */}
                                        <td className="p-4 bg-surface group-hover:bg-gray-50 dark:group-hover:bg-[#1a1c23] transition-colors sticky left-0 z-20 border-r border-gray-200 dark:border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] w-48 max-w-48">
                                            <div className="flex items-center gap-3">
                                                {staff.photoURL || staff.avatar ? (
                                                    <img src={staff.photoURL || staff.avatar} alt={staff.name} className="w-10 h-10 rounded-full shrink-0" />
                                                ) : (
                                                    <img src={`https://ui-avatars.com/api/?name=${staff.name}&background=random`} alt={staff.name} className="w-10 h-10 rounded-full shrink-0" />
                                                )}
                                                <div className="min-w-0 overflow-hidden">
                                                    <p className="font-bold text-main text-sm truncate" title={staff.name}>{staff.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{staff.role}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Schedule Grid */}
                                        {DAYS.map((day) => {
                                            const shifts = getShifts(staff.id, day);
                                            return (
                                                <td key={day} className="p-2 border-r border-white/5 last:border-0 relative h-24 align-top">
                                                    <div className="flex flex-col gap-1 h-full w-full">
                                                        {shifts.map((shift) => (
                                                            <div key={shift.id} className="flex-1 min-h-[40px]">
                                                                <RoleBadge
                                                                    role={shift.role}
                                                                    time={shift.time}
                                                                    onClick={() => isEditing && openEditModal(staff, day, shift)}
                                                                />
                                                            </div>
                                                        ))}

                                                        {isEditing && (
                                                            <button
                                                                onClick={() => openEditModal(staff, day, null)}
                                                                className={clsx(
                                                                    "flex items-center justify-center rounded-lg transition-all border border-dashed border-muted/30 hover:bg-white/5 hover:border-muted",
                                                                    shifts.length > 0 ? "h-8 opacity-50 hover:opacity-100" : "h-full w-full opacity-50 hover:opacity-100"
                                                                )}
                                                                title="Add Shift"
                                                            >
                                                                <span className="text-muted text-xs">+</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    // SHIFT VIEW
                    <DndContext onDragEnd={handleDragEnd} sensors={sensors} collisionDetection={pointerWithin}>
                        <div className="flex flex-row overflow-hidden h-[calc(100vh-14rem)]">
                            {/* Main Schedule Table */}
                            <div className="flex-1 overflow-auto custom-scrollbar">
                                <table className="w-full border-collapse min-w-[800px]">
                                    <thead>
                                        <tr>
                                            <th className="p-4 text-left text-xs font-bold text-muted uppercase tracking-wider border-b border-white/10 bg-surface/95 backdrop-blur sticky left-0 top-0 z-30 w-48 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                                                <div className="flex items-center justify-between">
                                                    <span>Shift / Role</span>
                                                    <button
                                                        onClick={() => setIsEditing(!isEditing)}
                                                        className={clsx(
                                                            "p-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all",
                                                            isEditing
                                                                ? "bg-primary/20 text-primary border-primary/50"
                                                                : "bg-white/5 text-muted border-white/10 hover:bg-white/10"
                                                        )}
                                                    >
                                                        {isEditing ? 'Done' : 'Edit'}
                                                    </button>
                                                </div>
                                            </th>
                                            {DAYS.map(day => (
                                                <th key={day} className="p-4 text-center text-xs font-bold text-muted uppercase tracking-wider border-b border-white/10 min-w-[140px] bg-surface/95 backdrop-blur sticky top-0 z-20">
                                                    {day}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">

                                        {ROLES.map((role) => {
                                            const theme = ROLE_THEME[role] || {};
                                            return (
                                                <tr key={role} className="group transition-colors hover:bg-white/[0.02]">
                                                    {/* Sticky Role Column */}
                                                    <td className={clsx(
                                                        "p-4 bg-surface group-hover:bg-gray-50 dark:group-hover:bg-[#1a1c23] transition-colors sticky left-0 z-20 border-r border-gray-200 dark:border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] w-48 max-w-48 border-l-4",
                                                        theme.borderLeft || "border-l-transparent"
                                                    )}>
                                                        <div className="flex items-center justify-between">
                                                            <span className={clsx("font-bold text-sm", theme.text || "text-main")}>{role}</span>
                                                        </div>
                                                    </td>

                                                    {/* Schedule Grid */}
                                                    {DAYS.map((day) => {
                                                        const shifts = getShiftsByRole(role, day);
                                                        return (
                                                            <DroppableCell key={day} role={role} day={day} theme={theme}>
                                                                <div className={clsx(
                                                                    "flex flex-col gap-2 h-full w-full",
                                                                    shifts.length === 1 && "justify-center"
                                                                )}>
                                                                    {shifts.map((shift) => {
                                                                        const user = getUser(shift.userId);
                                                                        return (
                                                                            <DraggableShift key={shift.id} shift={shift} disabled={!isEditing}>
                                                                                <div
                                                                                    onClick={() => isEditing && openEditModal(user, day, shift)}
                                                                                    className="flex items-center gap-2 p-1.5 rounded-lg bg-surface border border-white/5 shadow-sm hover:border-white/20 transition-colors"
                                                                                >
                                                                                    <div className="min-w-0 overflow-hidden">
                                                                                        <p className="font-medium text-main text-xs truncate leading-tight">
                                                                                            {user?.name || 'Unknown'}
                                                                                        </p>
                                                                                        <p className="text-[10px] text-muted truncate leading-tight mt-0.5">
                                                                                            {shift.time}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            </DraggableShift>
                                                                        );
                                                                    })}

                                                                    {isEditing && (
                                                                        <button
                                                                            onClick={() => openEditModal(null, day, { role })}
                                                                            className={clsx(
                                                                                "flex items-center justify-center rounded-lg transition-all border border-dashed border-muted/30 hover:bg-white/5 hover:border-muted",
                                                                                shifts.length > 0 ? "h-6 opacity-30 hover:opacity-100" : "h-full w-full opacity-30 hover:opacity-100"
                                                                            )}
                                                                            title="Add Shift"
                                                                        >
                                                                            <span className="text-muted text-xs">+</span>
                                                                        </button>
                                                                    )}

                                                                    {!isEditing && shifts.length === 0 && (
                                                                        <div className="h-full w-full flex items-center justify-center opacity-20">
                                                                            <span className="text-xs text-muted">-</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </DroppableCell>
                                                        );
                                                    })}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Staff Pool Sidebar */}
                            {isEditing && (
                                <div className="w-64 bg-surface border-l border-white/5 flex flex-col shadow-xl z-30">
                                    <div className="p-4 border-b border-white/5 bg-surface/50 backdrop-blur">
                                        <h3 className="font-bold text-main">Staff Pool</h3>
                                        <p className="text-xs text-muted">Drag to add to schedule</p>
                                    </div>
                                    <DroppableStaffPool>
                                        {users.map(user => (
                                            <DraggableStaff key={user.id} user={user} />
                                        ))}
                                    </DroppableStaffPool>
                                </div>
                            )}
                        </div>
                    </DndContext>
                )}
            </div >

            {/* Mobile List View */}
            <div className="md:hidden space-y-4">
                <div className="flex justify-end px-2">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={clsx(
                            "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all",
                            isEditing
                                ? "bg-primary/20 text-primary border-primary/50"
                                : "bg-white/5 text-muted border-white/10 hover:bg-white/10"
                        )}
                    >
                        {isEditing ? 'Done Editing' : 'Edit Schedule'}
                    </button>
                </div>
                {
                    viewMode === 'staff' ? (
                        visibleUsers.map((staff) => {
                            const staffShifts = weekSchedule.shifts?.filter(s => s.userId === staff.id) || [];
                            return (
                                <div key={staff.id} className="bg-surface rounded-xl border border-white/5 p-4 space-y-4">
                                    <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                                        {staff.photoURL || staff.avatar ? (
                                            <img src={staff.photoURL || staff.avatar} alt={staff.name} className="w-10 h-10 rounded-full shrink-0" />
                                        ) : (
                                            <img src={`https://ui-avatars.com/api/?name=${staff.name}&background=random`} alt={staff.name} className="w-10 h-10 rounded-full shrink-0" />
                                        )}
                                        <div>
                                            <p className="font-bold text-main">{staff.name}</p>
                                            <p className="text-xs text-gray-500">{staff.role}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {staffShifts.length > 0 ? (
                                            staffShifts.map((shift, idx) => (
                                                <div key={idx} className="flex items-center justify-between gap-4">
                                                    <span className="text-sm font-medium text-muted w-12 shrink-0">{shift.day}</span>
                                                    <div className="flex-1">
                                                        <RoleBadge
                                                            role={shift.role}
                                                            time={shift.time}
                                                            onClick={() => isEditing && openEditModal(staff, shift.day, shift)}
                                                        />
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-2">
                                                <p className="text-sm text-gray-500">No shifts this week</p>
                                            </div>
                                        )}

                                        {isEditing && (
                                            <button
                                                onClick={() => openEditModal(staff, DAYS[0], null)}
                                                className="w-full py-2 mt-2 flex items-center justify-center gap-2 text-xs font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                                            >
                                                <Plus size={14} />
                                                Add Shift
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        // MOBILE SHIFT VIEW
                        ROLES.map((role) => {
                            const theme = ROLE_THEME[role] || {};
                            const roleShifts = weekSchedule.shifts?.filter(s => s.role === role) || [];
                            if (roleShifts.length === 0 && !isEditing) return null;

                            return (
                                <div key={role} className={clsx("bg-surface rounded-xl border border-white/5 p-4 space-y-4 border-l-4", theme.borderLeft)}>
                                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                        <span className={clsx("font-bold text-lg", theme.text)}>{role}</span>
                                    </div>

                                    <div className="space-y-2">
                                        {DAYS.map((day) => {
                                            const dayShifts = roleShifts.filter(s => s.day === day);
                                            if (dayShifts.length === 0) return null;

                                            return (
                                                <div key={day} className="flex flex-col gap-2">
                                                    <div className="flex items-start gap-4">
                                                        <span className="text-sm font-medium text-muted w-12 shrink-0 pt-2">{day}</span>
                                                        <div className="flex-1 space-y-2">
                                                            {dayShifts.map((shift) => {
                                                                const user = getUser(shift.userId);
                                                                return (
                                                                    <div key={shift.id} className={clsx("flex items-center justify-between p-2 rounded-lg border border-white/5", theme.rowBg)}>
                                                                        <div className="min-w-0">
                                                                            <p className="font-medium text-main text-sm truncate">{user?.name || 'Unknown'}</p>
                                                                            <p className="text-xs text-muted font-mono">{shift.time}</p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {roleShifts.length === 0 && (
                                            <p className="text-sm text-center text-muted py-2">No shifts assigned</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )
                }
            </div >

            <ShiftEditModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                staff={modalData.staff}
                day={modalData.day}
                currentShift={modalData.shift}
                weekShifts={weekSchedule.shifts}
                onSave={handleSaveShift}
                onDelete={handleDeleteShift}
                users={users}
            />
        </div >
    );
};

export default Schedules;
