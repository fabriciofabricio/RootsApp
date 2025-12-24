import { useState } from 'react';
import { Search, Clock, Users, Leaf, ChefHat } from 'lucide-react';
import clsx from 'clsx';

const RecipeBook = () => {
    const [filter, setFilter] = useState('All');

    const RECIPES = [
        { id: 1, title: 'Vegan Curry', time: '30m', serves: '10+', type: 'Vegan', cost: 'Cheap' },
        { id: 2, title: 'Pasta Bolognese', time: '45m', serves: '12', type: 'Meat', cost: 'Medium' },
        { id: 3, title: 'Lentil Soup', time: '40m', serves: '15', type: 'Vegan', cost: 'Cheap' },
        { id: 4, title: 'Tacos Night', time: '60m', serves: '20', type: 'Meat', cost: 'Medium' },
    ];

    return (
        <div className="space-y-4">
            {/* Search & Filters */}
            <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
                {['All', 'Vegan', 'Cheap', 'Fast', '+10 Ppl'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={clsx(
                            "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors",
                            filter === f ? "bg-primary text-background" : "bg-surface text-muted hover:text-main"
                        )}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-3">
                {RECIPES.map(recipe => (
                    <div key={recipe.id} className="bg-surface p-4 rounded-xl border border-white/5 flex items-center justify-between group hover:border-primary/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-muted group-hover:bg-primary group-hover:text-black dark:group-hover:text-background transition-colors">
                                <ChefHat size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-main mb-1">{recipe.title}</h3>
                                <div className="flex gap-3 text-xs text-muted">
                                    <span className="flex items-center gap-1"><Clock size={12} /> {recipe.time}</span>
                                    <span className="flex items-center gap-1"><Users size={12} /> {recipe.serves}</span>
                                    {recipe.type === 'Vegan' && <span className="flex items-center gap-1 text-green-400"><Leaf size={12} /> Vegan</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full py-4 mt-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-muted hover:text-main hover:border-primary transition-colors flex flex-col items-center justify-center gap-2">
                <ChefHat size={24} />
                <span className="font-medium text-sm">Add New Recipe</span>
            </button>
        </div>
    );
};

export default RecipeBook;


