import React from 'react';

const TableMap = ({ tables, onTableClick }) => {
    const getTableStatusColor = (status) => {
        switch (status) {
            case 'occupied': return 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900/50 dark:border-red-400 dark:text-red-100';
            case 'paid': return 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900/50 dark:border-green-400 dark:text-green-100';
            case 'free': default: return 'bg-white border-gray-800 text-gray-900 hover:border-primary hover:shadow-md dark:bg-surface dark:border-gray-400 dark:text-white dark:hover:border-primary';
        }
    };

    const Table = ({ id, label, className, style }) => {
        const table = tables.find(t => t.id === id) || { status: 'free' };
        return (
            <button
                onClick={() => onTableClick(id)}
                style={style}
                className={`absolute border-2 flex items-center justify-center font-bold text-sm transition-all cursor-pointer shadow-sm ${getTableStatusColor(table.status)} ${className || ''}`}
            >
                {label}
            </button>
        );
    };

    return (
        <div className="relative w-full max-w-5xl mx-auto h-[600px] bg-gray-50 dark:bg-[#1a1a1a] border-4 border-gray-900 dark:border-gray-500 shadow-2xl rounded-none select-none overflow-hidden text-sm">

            {/* --- TOP ROW (Squares) --- */}
            {/* Increased size to w-24 h-24 (6rem), adjusted gap and position */}
            <div className="absolute top-8 left-[30%] flex gap-8">
                <Table id="4" label="4" className="w-24 h-24 relative" />
                <Table id="3" label="3" className="w-24 h-24 relative" />
                <Table id="7" label="7" className="w-24 h-24 relative" />
                {/* RES placeholder removed */}
            </div>

            {/* --- RIGHT SIDE (Counters) --- */}
            <div className="absolute top-12 right-6 w-64 h-64 pointer-events-none">
                {/* Vertical Counter (Visual) */}
                <div className="absolute left-10 top-0 w-12 h-48 border-2 border-gray-900 dark:border-gray-400 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                    <span className="font-bold tracking-widest text-gray-600 dark:text-gray-400 text-[10px] -rotate-90 whitespace-nowrap">COUNTER</span>
                </div>

                {/* Horizontal Counter (Table 16) */}
                <Table
                    id="16"
                    label="COUNTER"
                    className="!absolute top-36 left-28 w-32 h-12 bg-gray-100 !border-gray-900 dark:!border-gray-400 dark:bg-gray-800 pointer-events-auto text-[10px] tracking-widest"
                />
            </div>

            {/* --- LEFT SIDE (Stairs) --- */}
            <div className="absolute top-48 left-8">
                <div className="w-32 h-24 border-2 border-gray-900 dark:border-gray-500 bg-white dark:bg-gray-800 flex items-center justify-center">
                    <span className="font-bold text-sm text-gray-800 dark:text-gray-300">stairs</span>
                </div>
            </div>

            {/* --- BOTTOM ROW ELEMENTS --- */}

            {/* Circle (Table 5) - Bottom Left */}
            <Table id="5" label="5" className="bottom-24 left-8 w-24 h-24 rounded-full" />

            {/* VAULT - Below Circle/Stairs area */}
            <div className="absolute bottom-8 left-40 w-24 h-16 border-2 border-gray-900 dark:border-gray-500 bg-white dark:bg-gray-800 flex items-center justify-center">
                <span className="font-bold text-gray-800 dark:text-gray-300 text-xs">VAULT</span>
            </div>

            {/* Vertical Tables 2 and 1 - Middle Bottom */}
            <Table id="2" label="2" className="bottom-8 left-[35%] w-16 h-40" />
            <Table id="1" label="1" className="bottom-8 left-[50%] w-16 h-40" />

            {/* Small Stairs - Bottom Right of center */}
            <div className="absolute bottom-8 left-[65%] w-16 h-12 border-2 border-gray-900 dark:border-gray-500 bg-white dark:bg-gray-800 flex items-end justify-center pb-1">
                <span className="font-bold text-[10px] text-gray-800 dark:text-gray-300 uppercase">Stairs</span>
            </div>

            {/* Long Table Group - Bottom Right Corner */}
            <div className="absolute bottom-8 right-8 w-48 h-20 border-2 border-gray-900 dark:border-gray-500 bg-white dark:bg-surface flex">
                <Table id="24" label="24" className="!static flex-1 h-full !border-0 border-r border-gray-300" />
                <Table id="13" label="13" className="!static flex-1 h-full !border-0 border-r border-gray-300" />
                <Table id="12" label="12" className="!static flex-1 h-full !border-0" />
            </div>

        </div>
    );
};

export default TableMap;
