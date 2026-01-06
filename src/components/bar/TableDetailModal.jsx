import React from 'react';
import { X, Trash2, CreditCard } from 'lucide-react';
import ProductList from './ProductList';

const TableDetailModal = ({ table, onClose, onAddProduct, onRemoveItem, onPay }) => {
    const calculateTotal = () => {
        return table.orders.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-surface rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex overflow-hidden border border-border">

                {/* Left Side: Order Summary */}
                <div className="w-1/3 border-r border-border flex flex-col bg-background/50">
                    <div className="p-4 border-b border-border flex justify-between items-center bg-surface">
                        <h2 className="text-xl font-bold text-main">Table {table.label}</h2>
                        <div className={`text-xs px-2 py-1 rounded-full uppercase tracking-wide font-semibold ${table.status === 'occupied' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'}`}>
                            {table.status}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {table.orders.length === 0 ? (
                            <div className="text-center text-muted mt-10 italic">No items yet</div>
                        ) : (
                            table.orders.map((item, index) => (
                                <div key={`${item.id}-${index}`} className="flex justify-between items-center bg-surface p-2 rounded shadow-sm border border-border">
                                    <div>
                                        <div className="font-medium text-sm text-main">{item.quantity}x {item.name}</div>
                                        <div className="text-xs text-muted">${item.price.toFixed(2)} / ea</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-sm text-main">${(item.price * item.quantity).toFixed(2)}</span>
                                        <button
                                            onClick={() => onRemoveItem(index)}
                                            className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 bg-surface border-t border-border shadow-up">
                        <div className="flex justify-between items-center mb-4 text-lg">
                            <span className="font-bold text-muted">Total:</span>
                            <span className="font-bold text-2xl text-primary">${calculateTotal().toFixed(2)}</span>
                        </div>
                        <button
                            onClick={onPay}
                            disabled={table.orders.length === 0}
                            className="w-full py-3 bg-primary hover:bg-yellow-400 text-black font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <CreditCard size={20} />
                            Pay Bill
                        </button>
                    </div>
                </div>

                {/* Right Side: Product Catalog */}
                <div className="w-2/3 flex flex-col bg-surface">
                    <div className="p-4 border-b border-border flex justify-between items-center">
                        <h3 className="font-bold text-main">Add Items</h3>
                        <button onClick={onClose} className="p-2 hover:bg-background rounded-full transition-colors text-main">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="flex-1 p-4 bg-background overflow-hidden px-4">
                        <ProductList onAddProduct={onAddProduct} />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TableDetailModal;
