import { useState } from 'react';
import BudgetTracker from '../components/kitchen/BudgetTracker';
import RecipeBook from '../components/kitchen/RecipeBook';
import clsx from 'clsx';

import CookSchedule from '../components/kitchen/CookSchedule';

const TABS = [
    { id: 'budget', label: 'Budget' },
    { id: 'recipes', label: 'Cookbook' },
];

const Kitchen = () => {
    const [activeTab, setActiveTab] = useState('budget');

    return (
        <div className="pb-20 md:pb-0 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-main mb-6">Kitchen Hub</h1>

            <CookSchedule />

            {/* Tabs */}
            <div className="flex p-1 bg-surface rounded-xl mb-8 border border-white/5">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all",
                            activeTab === tab.id
                                ? "bg-background text-main shadow-lg"
                                : "text-muted hover:text-main"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === 'budget' && <BudgetTracker />}
                {activeTab === 'recipes' && <RecipeBook />}
            </div>
        </div>
    );
};

export default Kitchen;


