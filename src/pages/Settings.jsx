import { useState, useEffect } from 'react';
import { Bell, Moon, User, LogOut, Users, Plus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AddUserForm from '../components/AddUserForm';
import EditUserForm from '../components/EditUserForm';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

const Settings = () => {
    const { theme, toggleTheme } = useTheme();
    const { currentUser } = useAuth();
    const [showAddUser, setShowAddUser] = useState(false);

    // Edit User State
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Initial check to avoid errors if currentUser is null (though should be handled by ProtectedRoute)
    const isAdmin = currentUser?.role === 'admin';

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

                            {/* Users List */}
                            <div className="bg-surface rounded-xl overflow-hidden border border-white/5 divide-y divide-white/5">
                                {loadingUsers ? (
                                    <div className="p-4 text-center text-muted text-sm">Loading users...</div>
                                ) : users.length === 0 ? (
                                    <div className="p-4 text-center text-muted text-sm">No other users found.</div>
                                ) : (
                                    users.map(user => (
                                        <div key={user.uid || user.id} className="p-4 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-main font-medium text-sm">{user.name || user.email}</span>
                                                <span className="text-xs text-muted capitalize">{user.role}</span>
                                            </div>
                                            <button
                                                onClick={() => setEditingUser({ ...user, uid: user.id })}
                                                className="text-xs font-semibold text-primary hover:text-white px-3 py-1 bg-primary/10 rounded-lg transition-colors"
                                            >
                                                Edit
                                            </button>
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



