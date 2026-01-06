import { useEffect, useState } from 'react';
import { X, Clock, User, ShoppingBag, Trash2, CheckCircle, RotateCcw, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { subscribeToShoppingLogs } from '../../services/shoppingService';
import { format } from 'date-fns';
import clsx from 'clsx';

const ShoppingLogModal = ({ isOpen, onClose }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterAction, setFilterAction] = useState('all');
    const [expandedLogId, setExpandedLogId] = useState(null);

    useEffect(() => {
        if (!isOpen) return;

        const unsubscribe = subscribeToShoppingLogs((data) => {
            setLogs(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [isOpen]);

    if (!isOpen) return null;

    const getActionIcon = (action) => {
        switch (action) {
            case 'add': return <ShoppingBag size={16} className="text-blue-400" />;
            case 'complete': return <CheckCircle size={16} className="text-green-400" />;
            case 'uncomplete': return <RotateCcw size={16} className="text-yellow-400" />;
            case 'delete': return <Trash2 size={16} className="text-red-400" />;
            default: return <Clock size={16} className="text-gray-400" />;
        }
    };

    const getActionText = (action) => {
        switch (action) {
            case 'add': return 'Added';
            case 'complete': return 'Marked as done';
            case 'uncomplete': return 'Marked as Todo';
            case 'delete': return 'Removed';
            default: return 'Updated';
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return format(date, 'MMM d, HH:mm');
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            (log.itemLabel?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (log.performedBy?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase());

        const matchesAction = filterAction === 'all' || log.action === filterAction;

        return matchesSearch && matchesAction;
    });

    const toggleExpand = (id) => {
        setExpandedLogId(expandedLogId === id ? null : id);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <h3 className="text-lg font-bold text-main">Activity Log</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-3 border-b border-white/5 bg-surface/50">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by user or item..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-background border border-gray-700 rounded-xl pl-9 pr-4 py-2 text-sm text-main focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {['all', 'add', 'complete', 'delete'].map(action => (
                            <button
                                key={action}
                                onClick={() => setFilterAction(action)}
                                className={clsx(
                                    "px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors",
                                    filterAction === action ? "bg-primary text-background" : "bg-white/5 text-gray-400 hover:text-white"
                                )}
                            >
                                {action === 'all' ? 'All Actions' : action}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <div className="text-center text-gray-500 py-8">Loading history...</div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">No matching records found.</div>
                    ) : (
                        filteredLogs.map((log) => (
                            <div
                                key={log.id}
                                onClick={() => toggleExpand(log.id)}
                                className={clsx(
                                    "p-3 rounded-xl border transition-all cursor-pointer group",
                                    expandedLogId === log.id
                                        ? "bg-white/5 border-primary/30"
                                        : "bg-background/50 border-white/5 hover:bg-white/5"
                                )}
                            >
                                <div className="flex gap-3">
                                    <div className="mt-1">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                            {getActionIcon(log.action)}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline justify-between gap-2 mb-1">
                                            <p className="font-medium text-main truncate">
                                                <span className="text-primary">{log.performedBy?.name}</span>
                                                <span className="text-gray-400 mx-1">{getActionText(log.action)}</span>
                                                <span className="text-white">{log.itemLabel}</span>
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-500 flex items-center justify-between">
                                            <span className="flex items-center gap-1">
                                                <Clock size={10} />
                                                {formatTimestamp(log.timestamp)}
                                            </span>
                                            {expandedLogId === log.id ? <ChevronUp size={14} /> : <ChevronDown size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                                        </p>
                                    </div>
                                </div>

                                {expandedLogId === log.id && (
                                    <div className="mt-3 pt-3 border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
                                        <div className="space-y-2 text-sm text-gray-400">

                                            {/* Performed By Email */}
                                            <div className="flex items-center gap-2">
                                                <User size={14} />
                                                <span>
                                                    Action by: <span className="text-white select-all">
                                                        {log.performedBy?.email ||
                                                            (log.performedBy?.name && log.performedBy.name.includes('@') ? log.performedBy.name : 'Unknown')}
                                                    </span>
                                                </span>
                                            </div>

                                            {/* Metadata for Complete Action */}
                                            {log.action === 'complete' && log.metadata?.createdBy && (
                                                <div className="flex items-center gap-2">
                                                    <ShoppingBag size={14} />
                                                    <span>
                                                        Originally added by: <span className="text-white">{log.metadata.createdBy.name}</span>
                                                        <span className="text-xs ml-1">({formatTimestamp(log.metadata.createdAt)})</span>
                                                    </span>
                                                </div>
                                            )}

                                            {/* Metadata for Delete Action */}
                                            {log.action === 'delete' && log.metadata && (
                                                <>
                                                    {log.metadata.createdBy && (
                                                        <div className="flex items-center gap-2">
                                                            <ShoppingBag size={14} />
                                                            <span>
                                                                Added by: <span className="text-white">{log.metadata.createdBy.name}</span>
                                                                <span className="text-xs ml-1">({formatTimestamp(log.metadata.createdAt)})</span>
                                                            </span>
                                                        </div>
                                                    )}
                                                    {log.metadata.completedBy && (
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle size={14} />
                                                            <span>
                                                                Completed by: <span className="text-white">{log.metadata.completedBy.name}</span>
                                                                <span className="text-xs ml-1">({formatTimestamp(log.metadata.completedAt)})</span>
                                                            </span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShoppingLogModal;
