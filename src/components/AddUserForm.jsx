import { useState } from 'react';
import { UserPlus, X, Loader2, Check } from 'lucide-react';
import { createSecondaryUser } from '../services/userService';
import { useAuth } from '../context/AuthContext';

const AddUserForm = ({ onClose }) => {
    const { currentUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'volunteer'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await createSecondaryUser(
                formData.email,
                formData.password,
                formData.role,
                formData.name,
                formData.role === 'volunteer' ? (formData.mainShift || 'Breakfast') : null,
                currentUser
            );
            setSuccess(true);
            // Close after 1.5 seconds on success
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to create user');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="p-8 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <Check size={32} className="text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-main">User Created!</h3>
                <p className="text-muted text-sm mt-2">The new account is ready.</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-main flex items-center gap-2">
                    <UserPlus size={20} className="text-primary" />
                    Add Team Member
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
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 ml-1">Email</label>
                    <input
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-background border border-gray-700 text-main rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-gray-600"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 ml-1">Password</label>
                    <input
                        name="password"
                        type="password"
                        placeholder="Minimum 6 characters"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full bg-background border border-gray-700 text-main rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-gray-600"
                        required
                        minLength={6}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 ml-1">Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full bg-background border border-gray-700 text-main rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-main"
                        >
                            <option value="volunteer">Volunteer</option>
                            <option value="intern">Intern</option>
                            <option value="staff">Staff</option>
                            <option value="manager">Manager</option>
                        </select>
                    </div>

                    {formData.role === 'volunteer' && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 ml-1">Main Activity</label>
                            <select
                                name="mainShift"
                                value={formData.mainShift || 'Breakfast'}
                                onChange={handleChange}
                                className="w-full bg-background border border-gray-700 text-main rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-main"
                            >
                                <option value="Breakfast">Breakfast</option>
                                <option value="Cleaning">Cleaning</option>
                                <option value="Bar">Bar</option>
                            </select>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary text-black font-bold rounded-xl py-3 mt-4 flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Create User'}
                </button>
            </form>
        </div>
    );
};

export default AddUserForm;
