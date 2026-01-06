import { Home, Users, Camera, Utensils, ClipboardCheck, Calendar, MapPin, Settings, User, Book, X, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import clsx from 'clsx';

const ScheduleIcon = ({ size = 24, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <rect x="3" y="6" width="18" height="16" rx="2" />
        <path d="M8 4v4" />
        <path d="M16 4v4" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="8" y1="16" x2="16" y2="16" />
        <line x1="8" y1="19" x2="16" y2="19" />
        <line x1="8" y1="22" x2="12" y2="22" />
    </svg>
);

const navItems = [
    { icon: Home, label: 'The Pulse', path: '/' },
    { icon: Camera, label: 'Moments', path: '/moments' },
    { icon: Utensils, label: 'Kitchen', path: '/kitchen' },
    { icon: ShoppingCart, label: 'Shopping', path: '/shopping' },
    { icon: ClipboardCheck, label: 'Operations', path: '/operations' },
    { icon: ScheduleIcon, label: 'Schedules', path: '/schedules' },
    { icon: MapPin, label: 'City Explorer', path: '/city' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: MapPin, label: 'Location', path: '/location' },
    { icon: Users, label: 'Volunteers', path: '/volunteers' },
    { icon: Book, label: 'Wiki', path: '/wiki' },
];

import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar, isCollapsed, toggleCollapse }) => {
    const { currentUser } = useAuth();

    const filteredNavItems = navItems.filter(item => {
        if (currentUser?.role === 'volunteer') {
            return !['Calendar', 'Shopping', 'Volunteers'].includes(item.label);
        }
        return true;
    });

    const handleLinkClick = () => {
        if (window.innerWidth < 768) {
            toggleSidebar();
        }
    };

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={toggleSidebar}
                />
            )}

            <aside
                className={clsx(
                    "fixed md:static inset-y-0 left-0 z-50 bg-surface border-r border-gray-800 flex flex-col transition-all duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                    isCollapsed ? "w-20" : "w-64"
                )}
            >
                <div className="flex flex-col h-full w-full overflow-hidden">
                    <div className={clsx("p-6 flex items-center justify-between", isCollapsed && "px-4")}>
                        <div className={clsx("overflow-hidden transition-all duration-300", isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
                            <h1 className="text-2xl font-bold text-primary tracking-tighter whitespace-nowrap">ROOTS</h1>
                            <p className="text-xs text-muted uppercase tracking-widest mt-1 whitespace-nowrap">Volunteer App</p>
                        </div>

                        {/* Mobile Close Button */}
                        <button onClick={toggleSidebar} className="md:hidden text-muted hover:text-main">
                            <X size={24} />
                        </button>
                    </div>

                    <nav className="flex-1 px-3 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
                        {filteredNavItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={handleLinkClick}
                                className={({ isActive }) =>
                                    clsx(
                                        "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                                        isActive
                                            ? "bg-primary/10 text-primary font-semibold"
                                            : "text-muted hover:bg-gray-100 dark:bg-white/5 hover:text-main",
                                        isCollapsed && "justify-center"
                                    )
                                }
                                title={isCollapsed ? item.label : undefined}
                            >
                                <item.icon size={20} className="shrink-0" />
                                <span className={clsx(
                                    "transition-all duration-300 overflow-hidden whitespace-nowrap",
                                    isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"
                                )}>
                                    {item.label}
                                </span>

                                {/* Tooltip for collapsed state */}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-surface border border-gray-700 rounded text-xs text-main opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                                        {item.label}
                                    </div>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-gray-800 space-y-4">


                        <NavLink
                            to="/settings"
                            onClick={handleLinkClick}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-2 rounded-xl text-muted hover:text-main transition-colors group relative",
                                isCollapsed && "justify-center"
                            )}
                            title={isCollapsed ? "Settings" : undefined}
                        >
                            <Settings size={20} className="shrink-0" />
                            <span className={clsx(
                                "transition-all duration-300 overflow-hidden whitespace-nowrap",
                                isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"
                            )}>
                                Settings
                            </span>
                            {isCollapsed && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-surface border border-gray-700 rounded text-xs text-main opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                                    Settings
                                </div>
                            )}
                        </NavLink>

                        <div className={clsx("flex items-center gap-3 px-3", isCollapsed && "justify-center")}>
                            <NavLink to="/profile" onClick={handleLinkClick} className="flex items-center gap-3 w-full p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:bg-white/5 transition-colors group">
                                <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden shrink-0 border border-transparent group-hover:border-primary/50 transition-colors">
                                    <img src="https://ui-avatars.com/api/?name=User&background=random" alt="User" />
                                </div>
                                <div className={clsx(
                                    "transition-all duration-300 overflow-hidden whitespace-nowrap text-left",
                                    isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"
                                )}>
                                    <p className="text-sm font-medium text-main group-hover:text-primary transition-colors">Volunteer</p>
                                    <p className="text-xs text-green-400">On Duty</p>
                                </div>
                            </NavLink>
                        </div>
                    </div>

                </div>


                {/* Desktop Collapse Toggle */}
                <button
                    onClick={toggleCollapse}
                    className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-surface border border-gray-700 rounded-full items-center justify-center text-muted hover:text-main hover:border-gray-500 transition-colors z-50"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </aside >
        </>
    );
};

export default Sidebar;



