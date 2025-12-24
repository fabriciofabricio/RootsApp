import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, KeyRound, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

const Login = () => {
    const navigate = useNavigate();
    const [method, setMethod] = useState('email'); // 'email' | 'code'
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate login delay
        setTimeout(() => {
            setIsLoading(false);
            navigate('/onboarding');
        }, 1500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold tracking-tighter mb-2 text-primary">ROOTS</h1>
                    <p className="text-muted uppercase tracking-widest text-xs">Volunteer Access</p>
                </div>

                <div className="bg-surface p-8 rounded-2xl shadow-2xl border border-white/5">
                    <div className="flex bg-background rounded-lg p-1 mb-6">
                        <button
                            onClick={() => setMethod('email')}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all",
                                method === 'email' ? "bg-primary text-black shadow-md" : "text-muted hover:text-main"
                            )}
                        >
                            <Mail size={16} /> Email
                        </button>
                        <button
                            onClick={() => setMethod('code')}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all",
                                method === 'code' ? "bg-primary text-black shadow-md" : "text-muted hover:text-main"
                            )}
                        >
                            <KeyRound size={16} /> Code
                        </button>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        {method === 'email' ? (
                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="volunteer@roots.com"
                                    className="w-full bg-background border border-gray-700 text-main rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-gray-600"
                                    required
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5 ml-1">Hostel Code</label>
                                <input
                                    type="text"
                                    placeholder="XXXX-XXXX"
                                    className="w-full bg-background border border-gray-700 text-main rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-gray-600 font-mono text-center tracking-widest text-lg"
                                    required
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-primary to-yellow-400 text-black font-bold rounded-xl py-3.5 mt-2 flex items-center justify-center gap-2 hover:shadow-[0_0_20px_-5px_#FFD700] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="animate-pulse">Accessing...</span>
                            ) : (
                                <>Enter Hostel <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-gray-600 text-xs mt-8">
                    By entering, you agree to the <a href="#" className="underline hover:text-muted">House Rules</a>.
                </p>
            </div>
        </div>
    );
};

export default Login;

