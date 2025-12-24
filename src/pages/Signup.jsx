import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, KeyRound, Building2, UserPlus } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';
import clsx from 'clsx';

const Signup = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [hostelName, setHostelName] = useState('');

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password should be at least 6 characters");
            return;
        }

        setIsLoading(true);

        try {
            // 1. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Create Firestore Document for Admin
            // Admin gets 'admin' role and workspaceId = uid (or a specific UUID if preferred, but UID is fine for 1:1)
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                role: 'admin',
                workspaceId: user.uid,
                hostelName: hostelName,
                createdAt: new Date().toISOString()
            });

            navigate('/onboarding');
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('Email already in use.');
            } else {
                setError('Failed to create account. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold tracking-tighter mb-2 text-primary">ROOTS</h1>
                    <p className="text-muted uppercase tracking-widest text-xs">Hostel Registration</p>
                </div>

                <div className="bg-surface p-8 rounded-2xl shadow-2xl border border-white/5">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-4 text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 ml-1">Hostel Name</label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-3.5 text-gray-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="Your Hostel Name"
                                    className="w-full bg-background border border-gray-700 text-main rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-gray-600"
                                    required
                                    value={hostelName}
                                    onChange={(e) => setHostelName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 text-gray-500" size={18} />
                                <input
                                    type="email"
                                    placeholder="admin@hostel.com"
                                    className="w-full bg-background border border-gray-700 text-main rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-gray-600"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 ml-1">Password</label>
                            <div className="relative">
                                <KeyRound className="absolute left-4 top-3.5 text-gray-500" size={18} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-background border border-gray-700 text-main rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-gray-600"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 ml-1">Confirm Password</label>
                            <div className="relative">
                                <KeyRound className="absolute left-4 top-3.5 text-gray-500" size={18} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-background border border-gray-700 text-main rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-gray-600"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-primary to-yellow-400 text-black font-bold rounded-xl py-3.5 mt-2 flex items-center justify-center gap-2 hover:shadow-[0_0_20px_-5px_#FFD700] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="animate-pulse">Creating Account...</span>
                            ) : (
                                <>Create Admin Account <UserPlus size={18} /></>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-gray-600 text-sm mt-8">
                    Already have an account? <Link to="/login" className="text-primary hover:text-yellow-400 font-semibold">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
