import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { schedulerService } from '../../services/schedulerService';

const SHIFT_TYPES = {
    'Breakfast': { type: 'Fixed', time: '06:55 - 12:00', roles: ['Breakfast', 'Cleaning', 'Bar'] },
    'Cleaning': { type: 'Fixed', time: '10:30 - 16:00', roles: ['Breakfast', 'Cleaning', 'Bar'] },
    'Bar': {
        type: 'Flexible',
        defaults: ['15:30 - 21:00', '17:00 - 22:30'],
        roles: ['Breakfast', 'Cleaning', 'Bar']
    },
    'Front Office': {
        type: 'Flexible',
        defaults: [
            '08:30 - 17:00', '14:00 - 21:00', '12:30 - 16:00', '12:30 - 21:00',
            '15:00 - 21:00', '15:00 - 23:30', '14:00 - 22:30', '16:30 - 21:00'
        ],
        roles: ['Front Office', 'Staff']
    },
    'Intern': {
        type: 'Flexible', // Labelled "Internet" in prompt, but "Intern" in code. Prompt said "Internet: (Intern)". Code uses "Intern".
        defaults: ['14:00 - 21:00', '08:30 - 14:30', '10:00 - 18:30', '08:30 - 17:00'],
        roles: ['Intern', 'Staff'] // Prompt says Volunteers cannot be "Internet"
    }
};

const ShiftEditModal = ({ isOpen, onClose, staff, day, currentShift, weekShifts, onSave, onDelete, users = [] }) => {
    const [selectedStaffId, setSelectedStaffId] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [customTime, setCustomTime] = useState(false);
    const [error, setError] = useState(null);
    const [warning, setWarning] = useState(null);

    useEffect(() => {
        if (isOpen) {
            // Determine effective staff
            let effectiveStaff = staff;
            if (!effectiveStaff && selectedStaffId) {
                effectiveStaff = users.find(u => u.id === selectedStaffId);
            }

            if (currentShift) {
                // Editing existing or pre-selected role
                setSelectedRole(currentShift.role);

                if (currentShift.time) {
                    setSelectedTime(currentShift.time);
                } else {
                    // Set default time for the pre-selected role
                    const typeConfig = SHIFT_TYPES[currentShift.role] || SHIFT_TYPES['Breakfast'];
                    if (typeConfig.type === 'Fixed') {
                        setSelectedTime(typeConfig.time);
                    } else {
                        setSelectedTime(typeConfig.defaults[0]);
                    }
                }

                if (currentShift.userId) setSelectedStaffId(currentShift.userId);
            } else {
                // New Shift
                if (staff) {
                    setSelectedStaffId(staff.id);
                }

                // Determine initial role based on effective staff if available, else default
                let initialRole = 'Breakfast';

                if (effectiveStaff) {
                    if (effectiveStaff.role === 'intern') {
                        initialRole = 'Intern';
                    } else if (effectiveStaff.role === 'staff' || effectiveStaff.role === 'manager') {
                        initialRole = 'Front Office';
                    } else if (effectiveStaff.role === 'volunteer') {
                        const mainShift = effectiveStaff.mainShift;
                        if (mainShift && SHIFT_TYPES[mainShift]) {
                            initialRole = mainShift;
                        }
                    } else if (SHIFT_TYPES[effectiveStaff.role]) {
                        initialRole = effectiveStaff.role;
                    }
                }

                setSelectedRole(initialRole);

                // Set default time
                const typeConfig = SHIFT_TYPES[initialRole] || SHIFT_TYPES['Breakfast'];
                if (typeConfig.type === 'Fixed') {
                    setSelectedTime(typeConfig.time);
                } else {
                    setSelectedTime(typeConfig.defaults[0]);
                }
            }
            setError(null);
            setWarning(null);
        }
    }, [isOpen, currentShift, staff, selectedStaffId]); // Added selectedStaffId to dependency to update defaults when user picked

    // Handle Role Change
    const handleRoleChange = (role) => {
        setSelectedRole(role);
        const config = SHIFT_TYPES[role];
        if (config.type === 'Fixed') {
            setSelectedTime(config.time);
            setCustomTime(false);
        } else {
            setSelectedTime(config.defaults[0]);
        }
        setError(null);
        setWarning(null);
    };

    const handleSave = () => {
        const effectiveStaff = staff || users.find(u => u.id === selectedStaffId);

        if (!effectiveStaff) {
            setError("Please select a staff member");
            return;
        }

        // Construct shift object
        const shiftData = {
            id: currentShift?.id || crypto.randomUUID(), // naive ID for now
            userId: effectiveStaff.id,
            name: effectiveStaff.name,
            role: selectedRole,
            day: day,
            time: selectedTime,
            // Assuming date is calculated by parent or not strict for this view
        };

        // Validate
        const validation = schedulerService.validateVolunteerConstraints(staff, shiftData, weekShifts || []);

        if (!validation.valid && validation.errors.length > 0) {
            setError(validation.errors[0]); // Show first error
            setWarning(null);
            return;
        }

        if (validation.warnings && validation.warnings.length > 0) {
            // Show warning but allow save if user confirms? 
            // The request says "give a warning ... but let them do it". 
            // We'll set the warning state. If user clicks save AGAIN, we could proceed, 
            // OR we just show the warning and proceed automatically?
            // "give a warning ... but let them do it" usually implies valid=true effectively but with a message.
            // Let's just show it as a non-blocking alert if it's new, or just save immediately?
            // A common pattern: If warning is not yet shown, show it and return. If warning IS shown, proceed.
            if (!warning) {
                setWarning(validation.warnings[0]);
                return; // Require a second click to confirm
            }
        }

        onSave(shiftData);
    };

    if (!isOpen) return null;

    const roleConfig = SHIFT_TYPES[selectedRole] || {};

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 space-y-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-main">
                                {currentShift ? 'Edit Shift' : 'Add Shift'}
                            </h2>
                            <p className="text-muted text-sm mt-1">
                                {staff ? staff.name : (selectedStaffId && users.find(u => u.id === selectedStaffId)?.name) || 'Select Staff'} • {day}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-muted hover:text-main transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 text-red-400 text-sm">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <p>{error}</p>
                        </div>
                    )}

                    {warning && (
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex items-start gap-3 text-orange-400 text-sm">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold">Notice</p>
                                <p>{warning}</p>
                                <p className="text-xs opacity-80 mt-1">Click save again to confirm.</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Staff Selection if not provided */}
                        {!staff && !currentShift && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted">Staff Member</label>
                                <select
                                    value={selectedStaffId}
                                    onChange={(e) => setSelectedStaffId(e.target.value)}
                                    className="w-full bg-[#1a1c23] border border-white/10 rounded-xl p-3 text-main focus:ring-2 focus:ring-primary focus:outline-none"
                                >
                                    <option value="">Select Staff...</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Role Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted">Role / Area</label>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.keys(SHIFT_TYPES).map(role => (
                                    <button
                                        key={role}
                                        onClick={() => handleRoleChange(role)}
                                        className={`p-3 rounded-lg text-sm font-medium border text-left transition-all ${selectedRole === role
                                            ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                            : 'bg-white/5 border-white/5 text-muted hover:bg-white/10 hover:border-white/10'
                                            }`}
                                    >
                                        {role === 'Intern' ? 'Internet' : role}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Time Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted">Time</label>
                            {roleConfig.type === 'Fixed' ? (
                                <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center">
                                    <span className="text-lg font-mono text-main">{roleConfig.time}</span>
                                    <p className="text-xs text-muted mt-1 uppercase tracking-wider">Fixed Shift</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <select
                                        value={selectedTime}
                                        onChange={(e) => setSelectedTime(e.target.value)}
                                        className="w-full bg-[#1a1c23] border border-white/10 rounded-xl p-3 text-main focus:ring-2 focus:ring-primary focus:outline-none"
                                    >
                                        {roleConfig.defaults?.map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-muted text-center">
                                        Flexible shift options
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        {currentShift && (
                            <button
                                onClick={() => onDelete(currentShift)}
                                className="flex-1 p-3 bg-red-500/10 text-red-400 font-bold rounded-xl hover:bg-red-500/20 transition-colors"
                            >
                                Delete
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            className="flex-[2] p-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                        >
                            Save Shift
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShiftEditModal;
