import { Camera, TrendingUp } from 'lucide-react';

const BudgetTracker = () => {
    // Mock Data
    const budget = 300;
    const spent = 185;
    const percentage = (spent / budget) * 100;

    return (
        <div className="space-y-6">
            <div className="bg-surface rounded-2xl p-6 border border-white/5 flex flex-col items-center">
                <div className="relative w-40 h-40 mb-4 flex items-center justify-center">
                    {/* SVG Circle Progress */}
                    <svg className="w-full h-full transform -rotate-90">
                        <circle className="text-gray-700" strokeWidth="8" stroke="currentColor" fill="transparent" r="70" cx="80" cy="80" />
                        <circle
                            className="text-primary transition-all duration-1000"
                            strokeWidth="8"
                            strokeDasharray={440}
                            strokeDashoffset={440 - (440 * percentage) / 100}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="70"
                            cx="80"
                            cy="80"
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-bold text-main">€{spent}</span>
                        <span className="text-xs text-muted">of €{budget}</span>
                    </div>
                </div>

                <h3 className="text-lg font-medium text-main mb-1">Weekly Budget</h3>
                <p className="text-sm text-gray-500 mb-6">{Math.round(100 - percentage)}% remaining</p>

                <button className="w-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10 text-main py-3 rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-all group">
                    <Camera size={20} className="group-hover:scale-110 transition-transform" />
                    <span>Upload Receipt</span>
                </button>
            </div>

            <div className="bg-surface rounded-2xl p-6 border border-white/5">
                <h3 className="text-sm font-bold text-muted uppercase tracking-widest mb-4">Recent Expenses</h3>
                <div className="space-y-3">
                    {[
                        { label: 'Supermarket (Albert Heijn)', amount: '45.20', date: 'Today' },
                        { label: 'Bakery', amount: '12.50', date: 'Yesterday' },
                        { label: 'Cleaning Supplies', amount: '28.00', date: 'Mon' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                            <div>
                                <p className="text-main text-sm font-medium">{item.label}</p>
                                <p className="text-xs text-gray-500">{item.date}</p>
                            </div>
                            <span className="text-main font-mono">-€{item.amount}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BudgetTracker;



