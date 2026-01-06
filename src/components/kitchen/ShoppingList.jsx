import { useState, useEffect } from 'react';
import { Plus, Trash2, History } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { subscribeToShoppingList, addItem, toggleItemStatus, deleteItem, clearCompletedItems } from '../../services/shoppingService';
import ShoppingLogModal from './ShoppingLogModal';
import DeliveryStatus from './DeliveryStatus';

const ShoppingList = () => {
    const { currentUser } = useAuth();
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState('');
    const [isLogOpen, setIsLogOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToShoppingList((data) => {
            setItems(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItem.trim() || !currentUser) return;

        try {
            await addItem(newItem, currentUser);
            setNewItem('');
        } catch (error) {
            console.error("Failed to add item", error);
        }
    };

    const handleToggle = async (item) => {
        if (!currentUser) return;
        try {
            await toggleItemStatus(item, currentUser);
        } catch (error) {
            console.error("Failed to toggle item", error);
        }
    };

    const handleDelete = async (e, item) => {
        e.stopPropagation(); // Prevent toggling when clicking delete
        if (!currentUser) return;
        if (window.confirm(`Remove "${item.label}" from the list?`)) {
            try {
                await deleteItem(item, currentUser);
            } catch (error) {
                console.error("Failed to delete item", error);
            }
        }
    };

    const handleClearChecked = async () => {
        if (!currentUser) return;
        if (window.confirm("Remove all completed items?")) {
            try {
                await clearCompletedItems(items, currentUser);
            } catch (error) {
                console.error("Failed to clear items", error);
            }
        }
    };

    return (
        <>
            <DeliveryStatus />
            <div className="bg-surface rounded-2xl p-6 border border-white/5 min-h-[400px] flex flex-col relative">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-main">Shopping List</h2>
                    <button
                        onClick={() => setIsLogOpen(true)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-white/5 rounded-xl transition-colors"
                        title="View History"
                    >
                        <History size={20} />
                    </button>
                </div>

                <form onSubmit={handleAddItem} className="flex gap-2 mb-6">
                    <input
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder="Add item..."
                        className="flex-1 bg-background border border-gray-700 rounded-xl px-4 py-2 text-main focus:outline-none focus:border-primary disabled:opacity-50"
                        disabled={!currentUser}
                    />
                    <button
                        type="submit"
                        disabled={!currentUser || !newItem.trim()}
                        className="bg-primary text-background p-2 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus size={24} />
                    </button>
                </form>

                <div className="flex-1 space-y-2">
                    {loading ? (
                        <p className="text-center text-gray-500 mt-10">Loading list...</p>
                    ) : items.length === 0 ? (
                        <p className="text-center text-gray-500 mt-10">List is empty!</p>
                    ) : (
                        items.map(item => (
                            <div
                                key={item.id}
                                onClick={() => handleToggle(item)}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:bg-white/5 cursor-pointer group transition-colors relative"
                            >
                                <div className={clsx(
                                    "w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0",
                                    item.checked ? "bg-status-green border-status-green" : "border-gray-500 group-hover:border-white"
                                )}>
                                    {item.checked && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <span className={clsx("block text-sm font-medium truncate", item.checked ? "text-gray-500 line-through" : "text-main")}>
                                        {item.label}
                                    </span>
                                    <div className="flex gap-2 text-[10px] text-gray-500 mt-0.5">
                                        <span>Added by {item.createdBy?.name || 'Unknown'}</span>
                                        {item.checked && item.completedBy && (
                                            <>
                                                <span>•</span>
                                                <span className="text-status-green">Done by {item.completedBy.name}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => handleDelete(e, item)}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-400 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {items.some(i => i.checked) && (
                    <button
                        onClick={handleClearChecked}
                        className="mt-4 w-full py-2 text-red-400 text-xs font-bold uppercase tracking-widest hover:bg-red-400/10 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Trash2 size={14} /> Clear Completed
                    </button>
                )}

                <ShoppingLogModal
                    isOpen={isLogOpen}
                    onClose={() => setIsLogOpen(false)}
                />
            </div>
        </>
    );
};

export default ShoppingList;



