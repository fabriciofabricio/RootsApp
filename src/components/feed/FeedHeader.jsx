import { Bell } from 'lucide-react';
import clsx from 'clsx';

const staffMembers = [
    { id: 1, name: 'Ana Silva', role: 'front office', avatar: 'https://ui-avatars.com/api/?name=Ana+Silva&background=3B82F6&color=fff' },
    { id: 2, name: 'João Santos', role: 'bar', avatar: 'https://ui-avatars.com/api/?name=Joao+Santos&background=A855F7&color=fff' },
    { id: 3, name: 'Maria Costa', role: 'cleaning', avatar: 'https://ui-avatars.com/api/?name=Maria+Costa&background=06B6D4&color=fff' },
    { id: 4, name: 'Pedro Oliver', role: 'breakfast', avatar: 'https://ui-avatars.com/api/?name=Pedro+Oliver&background=F97316&color=fff' },
    { id: 5, name: 'Lucas Fern', role: 'intern', avatar: 'https://ui-avatars.com/api/?name=Lucas+Fern&background=10B981&color=fff' },
];

const roleColors = {
    'front office': 'border-blue-500 text-blue-400',
    'bar': 'border-purple-500 text-purple-400',
    'cleaning': 'border-cyan-500 text-cyan-400',
    'breakfast': 'border-orange-500 text-orange-400',
    'intern': 'border-green-500 text-green-400',
};

const FeedHeader = () => {
    return (
        <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-main leading-none">Roots Hostel</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-medium text-green-400 uppercase tracking-widest">On Duty</span>
                    </div>
                </div>
                <button className="relative p-2 rounded-full hover:bg-gray-200 dark:bg-white/10 transition-colors">
                    <Bell size={20} className="text-muted" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
                </button>
            </div>

            {/* Staff List */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar md:custom-scrollbar md:gap-4 pb-2">
                {staffMembers.map((staff) => (
                    <div key={staff.id} className="flex-shrink-0 group relative">
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-full border border-gray-800 hover:bg-gray-200 dark:bg-white/10 transition-colors cursor-pointer">
                            <div className={clsx(
                                "w-8 h-8 rounded-full border-2 p-0.5",
                                roleColors[staff.role] || "border-gray-500"
                            )}>
                                <img src={staff.avatar} alt={staff.name} className="w-full h-full rounded-full" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-main leading-none whitespace-nowrap">{staff.name}</span>
                                <span className={clsx("text-[10px] uppercase font-bold tracking-wider", roleColors[staff.role])}>
                                    {staff.role}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeedHeader;




