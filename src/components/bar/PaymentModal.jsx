import React, { useState } from 'react';
import { X, CheckCircle, Hotel, Banknote, CreditCard } from 'lucide-react';

const GUESTS = [
    { id: 'g1', name: 'John Doe', room: '101' },
    { id: 'g2', name: 'Jane Smith', room: '102' },
    { id: 'g3', name: 'Bob Johnson', room: '205' },
    { id: 'g4', name: 'Alice Williams', room: '304' },
];

const PaymentModal = ({ table, onClose, onCompletePayment }) => {
    const [method, setMethod] = useState(null); // 'cash', 'card', 'guest'
    const [selectedGuest, setSelectedGuest] = useState(null);

    const calculateTotal = () => {
        return table.orders.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handlePayment = () => {
        if (method === 'guest' && !selectedGuest) return;
        onCompletePayment(method, selectedGuest);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-surface rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-border">
                <div className="bg-primary/10 p-4 border-b border-primary/20 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-main">Payment - Table {table.label}</h2>
                    <button onClick={onClose} className="text-muted hover:text-main transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="text-center mb-8">
                        <span className="text-muted text-sm uppercase tracking-wide">Total Amount</span>
                        <div className="text-4xl font-bold text-primary mt-1">${calculateTotal().toFixed(2)}</div>
                    </div>

                    <h3 className="text-sm font-semibold text-muted mb-3 uppercase tracking-wide">Select Payment Method</h3>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <button
                            onClick={() => setMethod('cash')}
                            className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${method === 'cash' ? 'border-primary bg-yellow-50 dark:bg-yellow-900/20 text-main' : 'border-border text-muted hover:border-gray-400 dark:hover:border-gray-500 hover:text-main'}`}
                        >
                            <Banknote size={24} className="mb-2" />
                            <span className="font-medium text-sm">Cash</span>
                        </button>
                        <button
                            onClick={() => setMethod('card')}
                            className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${method === 'card' ? 'border-primary bg-yellow-50 dark:bg-yellow-900/20 text-main' : 'border-border text-muted hover:border-gray-400 dark:hover:border-gray-500 hover:text-main'}`}
                        >
                            <CreditCard size={24} className="mb-2" />
                            <span className="font-medium text-sm">Card</span>
                        </button>
                        <button
                            onClick={() => setMethod('guest')}
                            className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${method === 'guest' ? 'border-primary bg-yellow-50 dark:bg-yellow-900/20 text-main' : 'border-border text-muted hover:border-gray-400 dark:hover:border-gray-500 hover:text-main'}`}
                        >
                            <Hotel size={24} className="mb-2" />
                            <span className="font-bold text-sm text-center leading-tight">Guest Room</span>
                        </button>
                    </div>

                    {method === 'guest' && (
                        <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="block text-sm font-medium text-main mb-1">Select Guest Room</label>
                            <select
                                className="w-full p-3 border border-border bg-background text-main rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                onChange={(e) => setSelectedGuest(GUESTS.find(g => g.id === e.target.value))}
                                defaultValue=""
                            >
                                <option value="" disabled>Search or select room...</option>
                                {GUESTS.map(guest => (
                                    <option key={guest.id} value={guest.id}>Room {guest.room} - {guest.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button
                        onClick={handlePayment}
                        disabled={!method || (method === 'guest' && !selectedGuest)}
                        className="w-full py-4 bg-main hover:bg-gray-800 dark:bg-primary dark:text-black dark:hover:bg-yellow-400 text-surface rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                        <CheckCircle size={20} />
                        Confirm Payment
                    </button>

                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
