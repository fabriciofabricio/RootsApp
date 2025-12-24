import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    return (
        <div className="flex h-screen bg-background text-main">
            <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                isCollapsed={isCollapsed}
                toggleCollapse={toggleCollapse}
            />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center p-4 border-b border-gray-800 bg-surface">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 -ml-2 text-muted hover:text-main rounded-lg hover:bg-gray-100 dark:bg-white/5"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="ml-3 font-bold text-lg text-primary">ROOTS</span>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-background">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;



