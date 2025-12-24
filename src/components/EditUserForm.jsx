import { useState } from 'react';
import { UserCog, X, Loader2, Save } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

const EditUserForm = ({ user, onClose, onSave }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: user.name || '',
        role: user.role || 'volunteer'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Update Firestore Document
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                name: formData.name,
                role: formData.role
            });

            // Notify parent to refresh list or update UI
            if (onSave) onSave();
            onClose();

        } catch (err) {
            console.error(err);
            setError('Failed to update user.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-main flex items-center gap-2">
                    <UserCog size={20} className="text-primary" />
                    Edit User: {user.email}
                </h2>
                <button onClick={onClose} className="text-muted hover:text-main">
                    <X size={20} />
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 ml-1">Full Name</label>
                    <input
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-background border border-gray-700 text-main rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-gray-600"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 ml-1">Role</label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full bg-background border border-gray-700 text-main rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-main"
                    >
                        <option value="volunteer">Volunteer</option>
                        <option value="staff">Staff</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <div className="flex gap-4 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 bg-surface border border-gray-700 text-main font-bold rounded-xl py-3 hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-primary text-black font-bold rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Save Changes</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditUserForm;
