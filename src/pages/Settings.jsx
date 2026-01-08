import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Moon, User, LogOut, Users, Plus } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useDemo } from '../context/DemoContext';
import AddUserForm from '../components/AddUserForm';
import EditUserForm from '../components/EditUserForm';
import { archiveUser, unarchiveUser } from '../services/userService';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebaseConfig';
import clsx from 'clsx';

const Settings = () => {
    const { theme, toggleTheme } = useTheme();
    const { isDemoMode, toggleDemoMode } = useDemo(); // Not used? Keeping if used elsewhere or removing if unused warning.
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [showAddUser, setShowAddUser] = useState(false);
    const [showArchived, setShowArchived] = useState(false);

    // Edit User State
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Initial check to avoid errors if currentUser is null (though should be handled by ProtectedRoute)
    const isAdmin = currentUser?.role === 'admin';

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    // Fetch Users (only if admin)
    useEffect(() => {
        if (isAdmin && currentUser?.workspaceId) {
            const fetchUsers = async () => {
                setLoadingUsers(true);
                try {
                    const q = query(collection(db, "users"), where("workspaceId", "==", currentUser.workspaceId));
                    const querySnapshot = await getDocs(q);
                    const usersList = [];
                    querySnapshot.forEach((doc) => {
                        usersList.push({ id: doc.id, ...doc.data() });
                    });
                    setUsers(usersList);
                } catch (error) {
                    console.error("Error fetching users:", error);
                } finally {
                    setLoadingUsers(false);
                }
            };
            fetchUsers();
        }
    }, [isAdmin, currentUser]);

    const handleUserUpdated = () => {
        // Refresh the list logic (duplicate fetch for simplicity)
        if (isAdmin && currentUser?.workspaceId) {
            const fetchUsers = async () => {
                const q = query(collection(db, "users"), where("workspaceId", "==", currentUser.workspaceId));
                const querySnapshot = await getDocs(q);
                const usersList = [];
                querySnapshot.forEach((doc) => {
                    usersList.push({ id: doc.id, ...doc.data() });
                });
                setUsers(usersList);
            };
            fetchUsers();
        }
    };

    const handleArchiveUser = async (userId) => {
        if (window.confirm("Are you sure you want to archive this user? They will disappear from schedules.")) {
            await archiveUser(userId);
            handleUserUpdated();
        }
    };

    const handleUnarchiveUser = async (userId) => {
        await unarchiveUser(userId);
        handleUserUpdated();
    };

    const handleToggleScheduleVisibility = async (userId, currentStatus) => {
        // currentStatus is user.showInSchedule. If undefined, it treats as true, so toggle makes it false.
        const newStatus = currentStatus === false ? true : false;

        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
                showInSchedule: newStatus
            });

            // Optimistic update locally
            setUsers(users.map(u =>
                u.id === userId ? { ...u, showInSchedule: newStatus } : u
            ));
        } catch (error) {
            console.error("Error updating visibility:", error);
        }
    };

    const filteredUsers = users.filter(user => showArchived ? user.archived : !user.archived);

    return (
        <div className="pb-20 md:pb-0 max-w-lg mx-auto relative">
            <h1 className="text-3xl font-bold text-main mb-6">Settings</h1>

            {/* Add User Modal */}
            {showAddUser && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <AddUserForm onClose={() => setShowAddUser(false)} />
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <EditUserForm
                            user={editingUser}
                            onClose={() => setEditingUser(null)}
                            onSave={handleUserUpdated}
                        />
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {isAdmin && (
                    <section>
                        <h2 className="text-muted text-xs font-bold uppercase tracking-widest mb-3">Team Management</h2>
                        <div className="space-y-3">
                            {/* Add User Button */}
                            <div className="bg-surface rounded-xl overflow-hidden border border-white/5">
                                <button
                                    onClick={() => setShowAddUser(true)}
                                    className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Users size={20} className="text-primary" />
                                        <span className="text-main font-medium">Add Team Member</span>
                                    </div>
                                    <div className="bg-primary/20 p-1.5 rounded-full">
                                        <Plus size={16} className="text-primary" />
                                    </div>
                                </button>
                            </div>

                            {/* Users List Header & Toggle */}
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-sm font-medium text-main">Team Members</h3>
                                <button
                                    onClick={() => setShowArchived(!showArchived)}
                                    className="text-xs text-primary hover:underline"
                                >
                                    {showArchived ? 'Hide Archived' : 'Show Archived'}
                                </button>
                            </div>

                            <div className="bg-surface rounded-xl overflow-hidden border border-white/5 divide-y divide-white/5">
                                {loadingUsers ? (
                                    <div className="p-4 text-center text-muted text-sm">Loading users...</div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="p-4 text-center text-muted text-sm">No {showArchived ? 'archived ' : ''}users found.</div>
                                ) : (
                                    filteredUsers.map(user => (
                                        <div key={user.uid || user.id} className="p-4 flex items-center justify-between bg-surface hover:bg-white/5 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className={clsx("w-2 h-2 rounded-full", user.archived ? "bg-red-500" : "bg-green-500")} />
                                                <div className="flex flex-col">
                                                    <span className={clsx("text-main font-medium text-sm", user.archived && "line-through opacity-50")}>
                                                        {user.name || user.email}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-muted capitalize">{user.role}</span>
                                                        {user.mainShift && (
                                                            <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-muted">
                                                                {user.mainShift}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {/* Show in Schedule Toggle */}
                                                {!user.archived && (
                                                    <div className="flex items-center gap-2">
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                className="sr-only peer"
                                                                checked={user.showInSchedule !== false} // Default true
                                                                onChange={() => handleToggleScheduleVisibility(user.id, user.showInSchedule)}
                                                            />
                                                            <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                                            <span className="ml-2 text-[10px] font-medium text-muted uppercase tracking-wide">
                                                                {user.showInSchedule !== false ? 'Shown' : 'Hidden'}
                                                            </span>
                                                        </label>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!user.archived ? (
                                                        <>
                                                            <button
                                                                onClick={() => setEditingUser({ ...user, uid: user.id })}
                                                                className="text-xs font-semibold text-primary hover:text-white px-3 py-1 bg-primary/10 rounded-lg transition-colors"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleArchiveUser(user.id)}
                                                                className="p-1.5 text-muted hover:text-red-400 transition-colors"
                                                                title="Archive User"
                                                            >
                                                                <LogOut size={16} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleUnarchiveUser(user.id)}
                                                            className="text-xs font-semibold text-green-400 hover:text-green-300 px-3 py-1 bg-green-500/10 rounded-lg transition-colors"
                                                        >
                                                            Unarchive
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </section>
                )}

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
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Users size={20} className="text-muted" />
                                <span className="text-main font-medium">Template Mode</span>
                            </div>
                            <button
                                onClick={toggleDemoMode}
                                className={`w-10 h-6 rounded-full relative transition-colors duration-300 ${isDemoMode ? 'bg-primary' : 'bg-gray-600'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isDemoMode ? 'left-[calc(100%-1.25rem)]' : 'left-1'}`}></div>
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
                        <button
                            onClick={handleSignOut}
                            className="w-full p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 text-red-400 transition-colors"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Settings;



