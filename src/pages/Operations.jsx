import { useState } from 'react';
import { BedDouble, CheckSquare, ClipboardList, ArrowRight, MessageSquare, ArrowLeft, User, LogIn } from 'lucide-react';
import clsx from 'clsx';

const CleaningList = () => {
    // Data derived from the user's spreadsheet image
    const [selectedRoom, setSelectedRoom] = useState(null);

    const ROOMS = [
        { id: 5, type: 'P', status: 'clean', co: 1, so: 0, checkIn: 'Rodney', tasks: ['clean room', 'vacuum', 'trash'] },
        { id: 6, type: 'P', status: 'check', co: 0, so: 0, checkIn: null, justCheck: true, tasks: ['vacuum', 'trash'] },
        { id: 7, type: 'FD', status: 'clean', co: 0, so: 1, checkIn: 'Silvia', tasks: ['vacuum'] },
        { id: 11, type: 'P', status: 'check', co: 0, so: 0, checkIn: 'Ana', justCheck: true, tasks: ['vacuum', "don't enter"] },
        { id: 12, type: 'P', status: 'clean', co: 1, so: 0, checkIn: null, tasks: ['vacuum', "don't enter"] },
        { id: 8, type: 'D', status: 'check', co: 0, so: 0, checkIn: null, justCheck: true, tasks: ['vacuum', 'trash'] },
        { id: 3, type: 'D', status: 'cleaning', co: 3, so: 0, checkIn: null, tasks: ['vacuum', 'trash'] },
        { id: 4, type: 'D', status: 'check', co: 0, so: 0, checkIn: null, justCheck: true, tasks: ['vacuum', "don't enter"] },
        { id: 9, type: 'P', status: 'cleaning', co: 1, so: 0, checkIn: null, tasks: ['trash'] },
        { id: 10, type: 'LD', status: 'check', co: 0, so: 0, checkIn: null, justCheck: true, tasks: [] },
        { id: 1, type: 'D', status: 'cleaning', co: 1, so: 1, checkIn: null, tasks: ['trash'] },
        { id: 2, type: 'D', status: 'cleaning', co: 0, so: 1, checkIn: null, tasks: ['trash'] },
        { id: 13, type: 'P', status: 'check', co: 0, so: 0, checkIn: 'Wiemer', justCheck: true, tasks: ['vacuum'] },
        { id: 14, type: 'P', status: 'cleaning', co: 1, so: 0, checkIn: null, tasks: ["don't enter"] },
        { id: 15, type: 'P', status: 'check', co: 0, so: 0, checkIn: null, justCheck: true, tasks: [] },
        { id: 16, type: 'LD', status: 'check', co: 0, so: 0, checkIn: null, justCheck: true, tasks: [] },
    ];

    // Filter out rooms that don't have active tasks or guests
    // "Just Check" column is ignored, so we rely on co, so, checkIn, or tasks
    const activeRooms = ROOMS.filter(r => r.co > 0 || r.so > 0 || r.checkIn || r.tasks.length > 0);


    const RoomChecklist = ({ room, onBack }) => {
        const [checklist, setChecklist] = useState([
            { id: 'sweep', label: 'Sweep Floor', done: false },
            { id: 'dust', label: 'Dust Surfaces', done: false },
            { id: 'bed', label: 'Make Bed', done: false },
            { id: 'bathroom', label: 'Clean Bathroom', done: false },
            { id: 'trash', label: 'Empty Trash', done: false },
            { id: 'windows', label: 'Open Windows', done: false },
            { id: 'mop', label: 'Mop Floor', done: false },
            { id: 'towels', label: 'Change Towels', done: false },
        ]);

        const toggleTask = (id) => {
            setChecklist(checklist.map(item =>
                item.id === id ? { ...item, done: !item.done } : item
            ));
        };

        const progress = Math.round((checklist.filter(t => t.done).length / checklist.length) * 100);

        return (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-full bg-surface border border-white/10 hover:bg-white/10 transition-colors text-main"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-main">Room #{room.id}</h2>
                        <div className="flex gap-4 text-sm mt-1">
                            <span className="flex items-center gap-1.5 text-blue-400 font-medium bg-blue-400/10 px-2 py-0.5 rounded">
                                <User size={14} />
                                {room.so} Stay Overs
                            </span>
                            <span className="flex items-center gap-1.5 text-green-400 font-medium bg-green-400/10 px-2 py-0.5 rounded">
                                <LogIn size={14} />
                                {room.checkIn ? 1 : 0} Check-ins
                            </span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-surface p-4 rounded-xl border border-white/5 mb-6">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted">Progress</span>

                        <span className="text-primary font-bold">{progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    {checklist.map(task => (
                        <div
                            key={task.id}
                            onClick={() => toggleTask(task.id)}
                            className={clsx(
                                "flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer",
                                task.done
                                    ? "bg-green-500/10 border-green-500/20"
                                    : "bg-surface border-white/5 hover:bg-white/5"
                            )}
                        >
                            <div className={clsx(
                                "w-6 h-6 rounded border flex items-center justify-center transition-colors shrink-0",
                                task.done ? "bg-green-500 border-green-500 text-background" : "border-gray-500"
                            )}>
                                {task.done && <CheckSquare size={16} />}
                            </div>
                            <span className={clsx(
                                "font-medium select-none",
                                task.done ? "text-muted line-through" : "text-main"
                            )}>
                                {task.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };


    if (selectedRoom) {
        return <RoomChecklist room={selectedRoom} onBack={() => setSelectedRoom(null)} />;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-main mb-4 ml-1">Daily Housekeeping</h2>
                <div className="grid gap-3">
                    {activeRooms.map(room => (
                        <div
                            key={room.id}
                            onClick={() => setSelectedRoom(room)}
                            className="bg-surface p-4 rounded-xl border border-white/5 relative overflow-hidden cursor-pointer hover:border-white/20 transition-all"
                        >
                            {/* Status Indicator Bar */}

                            <div className={clsx(
                                "absolute left-0 top-0 bottom-0 w-1.5",
                                room.tasks.includes("don't enter") ? "bg-orange-500" :
                                    room.checkIn ? "bg-green-500" :
                                        room.co > 0 ? "bg-red-400" : "bg-blue-400"
                            )} />

                            <div className="pl-3">
                                {/* Header: Room & Check-in Info */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold text-main">#{room.id}</span>
                                        <span className="text-xs font-mono text-muted bg-gray-200 dark:bg-white/10 px-1.5 py-0.5 rounded">
                                            {room.type}
                                        </span>
                                    </div>
                                    {room.checkIn && (
                                        <div className="text-right">
                                            <p className="text-[10px] text-green-400 uppercase font-bold tracking-wider">Incoming</p>
                                            <p className="text-main font-medium">{room.checkIn}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Stats Grid - Removed "Check" Column */}
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <div className="bg-background/50 rounded-lg p-2 text-center border border-white/5">
                                        <span className="block text-xs text-gray-500 uppercase">Out</span>
                                        <span className={clsx("font-bold", room.co > 0 ? "text-red-400" : "text-gray-600")}>
                                            {room.co}
                                        </span>
                                    </div>
                                    <div className="bg-background/50 rounded-lg p-2 text-center border border-white/5">
                                        <span className="block text-xs text-gray-500 uppercase">Stay</span>
                                        <span className={clsx("font-bold", room.so > 0 ? "text-blue-400" : "text-gray-600")}>
                                            {room.so}
                                        </span>
                                    </div>
                                </div>

                                {/* Tasks / Notes */}
                                {room.tasks.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {room.tasks.map((task, i) => (
                                            <span key={i} className={clsx(
                                                "text-xs px-2 py-1 rounded-full border",
                                                task.includes("don't") ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                                    task.includes("clean") ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                                        "bg-gray-100 dark:bg-white/5 text-muted border-white/10"
                                            )}>
                                                {task}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Extras Section */}
                <div className="bg-surface rounded-2xl p-5 border border-white/5">
                    <h3 className="text-lg font-bold text-main mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-yellow-400 rounded-full"></span>
                        Extra's to do
                    </h3>

                    <div className="space-y-4">
                        <div className="p-4 bg-background/50 rounded-xl border border-white/5">
                            <p className="text-muted text-sm mb-1">Try to vacuum in RM:</p>
                            <p className="text-main text-lg font-mono">7, 3, 1, 2</p>
                        </div>

                        <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                            <p className="text-red-400 font-bold text-lg mb-1">Big cleaning Rooms!</p>
                            <p className="text-red-300/80 text-sm">(move the beds for vacuuming)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ShiftChecklist = () => {
    const [tasks, setTasks] = useState([
        { id: 1, label: 'Close Bar Register', done: false },
        { id: 2, label: 'Wipe Tables', done: true },
        { id: 3, label: 'Restock Fridge', done: false },
        { id: 4, label: 'Turn off Lights', done: false },
    ]);

    const progress = Math.round((tasks.filter(t => t.done).length / tasks.length) * 100);

    const toggle = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-main">Bar Closing Shift</h2>
                <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">{progress}% Done</span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="space-y-2">
                {tasks.map(task => (
                    <div
                        key={task.id}
                        onClick={() => toggle(task.id)}
                        className={clsx(
                            "flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer",
                            task.done ? "bg-green-500/10 border-green-500/20" : "bg-surface border-white/5 hover:bg-gray-100 dark:bg-white/5"
                        )}
                    >
                        <div className={clsx(
                            "w-6 h-6 rounded border flex items-center justify-center transition-colors",
                            task.done ? "bg-green-500 border-green-500 text-background" : "border-gray-500"
                        )}>
                            {task.done && <CheckSquare size={16} />}
                        </div>
                        <span className={clsx("font-medium", task.done ? "text-muted line-through" : "text-main")}>{task.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Handover = () => {
    return (
        <div className="bg-surface rounded-2xl p-6 border border-white/5">
            <div className="flex items-center gap-3 mb-4 text-primary">
                <MessageSquare size={24} />
                <h2 className="text-xl font-bold text-main">Handover Notes</h2>
            </div>
            <textarea
                className="w-full h-40 bg-background border border-gray-700 rounded-xl p-4 text-main focus:outline-none focus:border-primary placeholder:text-gray-600 mb-4"
                placeholder="Mention anything important for the next shift (e.g., Key missing for Room 201, Guest arriving late...)"
            ></textarea>
            <button className="w-full bg-primary text-background font-bold py-3 rounded-xl hover:bg-yellow-400 transition-colors">
                Submit Report
            </button>
        </div>
    );
};

const Operations = () => {
    const [activeTab, setActiveTab] = useState('cleaning');

    return (
        <div className="pb-20 md:pb-0 max-w-lg mx-auto">
            {/* Sub-header Tabs */}
            <div className="flex gap-4 mb-6 overflow-x-auto pb-2 no-scrollbar">
                {[
                    { id: 'cleaning', label: 'Housekeeping', icon: BedDouble },
                    { id: 'shifts', label: 'My Shift', icon: ClipboardList },
                    { id: 'handover', label: 'Handover', icon: MessageSquare },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap",
                            activeTab === tab.id
                                ? "bg-white text-background border-white font-medium"
                                : "bg-surface text-muted border-white/10 hover:border-white/30"
                        )}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="animate-in fade-in zoom-in-95 duration-200">
                {activeTab === 'cleaning' && <CleaningList />}
                {activeTab === 'shifts' && <ShiftChecklist />}
                {activeTab === 'handover' && <Handover />}
            </div>
        </div>
    );
};

export default Operations;



