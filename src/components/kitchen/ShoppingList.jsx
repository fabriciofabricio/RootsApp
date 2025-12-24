import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import clsx from 'clsx';

const ShoppingList = () => {
    const [items, setItems] = useState([
        { id: 1, label: 'Milk', checked: false },
        { id: 2, label: 'Coffee Beans', checked: true },
        { id: 3, label: 'Dish Soap', checked: false },
        { id: 4, label: 'Toilet Paper', checked: false },
    ]);
    const [newItem, setNewItem] = useState('');

    const toggleItem = (id) => {
        setItems(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
    };

    const addItem = (e) => {
        e.preventDefault();
        if (!newItem.trim()) return;
        setItems([...items, { id: Date.now(), label: newItem, checked: false }]);
        setNewItem('');
    };

    const clearChecked = () => {
        setItems(items.filter(i => !i.checked));
    };

    return (
        <div className="bg-surface rounded-2xl p-6 border border-white/5 min-h-[400px] flex flex-col">
            <h2 className="text-xl font-bold text-main mb-4">Shopping List</h2>

            <form onSubmit={addItem} className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Add item..."
                    className="flex-1 bg-background border border-gray-700 rounded-xl px-4 py-2 text-main focus:outline-none focus:border-primary"
                />
                <button type="submit" className="bg-primary text-background p-2 rounded-xl hover:bg-yellow-400 transition-colors">
                    <Plus size={24} />
                </button>
            </form>

            <div className="flex-1 space-y-2">
                {items.length === 0 && (
                    <p className="text-center text-gray-500 mt-10">List is empty!</p>
                )}
                {items.map(item => (
                    <div
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:bg-white/5 cursor-pointer group transition-colors"
                    >
                        <div className={clsx(
                            "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                            item.checked ? "bg-status-green border-status-green" : "border-gray-500 group-hover:border-white"
                        )}>
                            {item.checked && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <span className={clsx("flex-1 text-sm font-medium", item.checked ? "text-gray-500 line-through" : "text-main")}>
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>

            {items.some(i => i.checked) && (
                <button
                    onClick={clearChecked}
                    className="mt-4 w-full py-2 text-red-400 text-xs font-bold uppercase tracking-widest hover:bg-red-400/10 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <Trash2 size={14} /> Clear Completed
                </button>
            )}
        </div>
    );
};

export default ShoppingList;



