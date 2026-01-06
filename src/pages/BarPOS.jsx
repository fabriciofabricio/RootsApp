import React, { useState } from 'react';
import TableMap from '../components/bar/TableMap';
import TableDetailModal from '../components/bar/TableDetailModal';
import PaymentModal from '../components/bar/PaymentModal';

const BarPOS = () => {
    const [tables, setTables] = useState([
        { id: '1', label: '1', status: 'free', orders: [] },
        { id: '2', label: '2', status: 'occupied', orders: [{ id: 'b1', name: 'Draft Beer (Pint)', price: 5.00, quantity: 2 }] },
        { id: '3', label: '3', status: 'free', orders: [] },
        { id: '4', label: '4', status: 'free', orders: [] },
        { id: '5', label: '5', status: 'free', orders: [] },
        { id: '7', label: '7', status: 'free', orders: [] },
        { id: '12', label: '12', status: 'free', orders: [] },
        { id: '13', label: '13', status: 'free', orders: [] },
        { id: '16', label: '16', status: 'free', orders: [] },
        { id: '24', label: '24', status: 'free', orders: [] },
        { id: 'bar', label: 'BAR', status: 'free', orders: [] },
    ]);

    const [selectedTableId, setSelectedTableId] = useState(null);
    const [showPayment, setShowPayment] = useState(false);

    const selectedTable = tables.find(t => t.id === selectedTableId);

    const handleTableClick = (tableId) => {
        setSelectedTableId(tableId);
        setShowPayment(false);
    };

    const handleCloseModal = () => {
        setSelectedTableId(null);
        setShowPayment(false);
    };

    const handleAddProduct = (product) => {
        setTables(prevTables => prevTables.map(table => {
            if (table.id !== selectedTableId) return table;

            const existingItemIndex = table.orders.findIndex(item => item.id === product.id);
            let newOrders = [...table.orders];

            if (existingItemIndex >= 0) {
                newOrders[existingItemIndex] = {
                    ...newOrders[existingItemIndex],
                    quantity: newOrders[existingItemIndex].quantity + 1
                };
            } else {
                newOrders.push({ ...product, quantity: 1 });
            }

            return { ...table, orders: newOrders, status: 'occupied' };
        }));
    };

    const handleRemoveItem = (index) => {
        setTables(prevTables => prevTables.map(table => {
            if (table.id !== selectedTableId) return table;
            const newOrders = [...table.orders];
            newOrders.splice(index, 1);
            return {
                ...table,
                orders: newOrders,
                status: newOrders.length === 0 ? 'free' : 'occupied'
            };
        }));
    };

    const handleCompletePayment = (method, guestInfo) => {
        console.log(`Payment completed for Table ${selectedTable.label} via ${method}`, guestInfo);

        // Clear table orders
        setTables(prevTables => prevTables.map(table => {
            if (table.id !== selectedTableId) return table;
            return { ...table, orders: [], status: 'free' }; // Or 'paid' if we want a dirty table state later
        }));

        handleCloseModal();
    };

    return (
        <div className="h-screen flex flex-col bg-background text-main overflow-hidden transition-colors duration-300">
            <header className="bg-surface shadow-md px-6 py-4 z-10 flex justify-between items-center border-b border-border">
                <h1 className="text-2xl font-display font-bold text-primary">Roots Bar POS</h1>
                <div className="text-sm font-medium text-muted">
                    Shift: Morning • Server: Demo User
                </div>
            </header>

            <div className="flex-1 relative overflow-auto p-4 flex items-center justify-center">
                <TableMap tables={tables} onTableClick={handleTableClick} />
            </div>

            {selectedTable && !showPayment && (
                <TableDetailModal
                    table={selectedTable}
                    onClose={handleCloseModal}
                    onAddProduct={handleAddProduct}
                    onRemoveItem={handleRemoveItem}
                    onPay={() => setShowPayment(true)}
                />
            )}

            {selectedTable && showPayment && (
                <PaymentModal
                    table={selectedTable}
                    onClose={() => setShowPayment(false)}
                    onCompletePayment={handleCompletePayment}
                />
            )}
        </div>
    );
};

export default BarPOS;
