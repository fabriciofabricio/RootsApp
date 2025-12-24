import { Bell, Moon, User, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <div className="pb-20 md:pb-0 max-w-lg mx-auto">
            <h1 className="text-3xl font-bold text-main mb-6">Settings</h1>

            <div className="space-y-6">
                <section>
                    <h2 className="text-muted text-xs font-bold uppercase tracking-widest mb-3">General</h2>
                    <div className="bg-surface rounded-xl overflow-hidden border border-white/5 divide-y divide-white/5">
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Bell size={20} className="text-muted" />
                                <span className="text-main font-medium">Notifications</span>
                            </div>
                            <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-background rounded-full"></div>
                            </div>
                        </div>
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Moon size={20} className="text-muted" />
                                <span className="text-main font-medium">Dark Mode</span>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`w-10 h-6 rounded-full relative transition-colors duration-300 ${theme === 'dark' ? 'bg-primary' : 'bg-gray-600'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${theme === 'dark' ? 'left-[calc(100%-1.25rem)]' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-muted text-xs font-bold uppercase tracking-widest mb-3">Account</h2>
                    <div className="bg-surface rounded-xl overflow-hidden border border-white/5 divide-y divide-white/5">
                        <div className="p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:bg-white/5">
                            <User size={20} className="text-muted" />
                            <span className="text-main font-medium">Edit Profile</span>
                        </div>
                        <div className="p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:bg-white/5 text-red-400">
                            <LogOut size={20} />
                            <span className="font-medium">Sign Out</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Settings;



