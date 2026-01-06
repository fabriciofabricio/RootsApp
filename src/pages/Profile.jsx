import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Award, Medal, Trophy, MapPin, Mail, Edit2 } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import { uploadProfilePhoto } from '../services/storageService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import EditProfileNameModal from '../components/EditProfileNameModal';

const StatsCard = ({ label, value, sublabel, icon: Icon, color }) => (
    <div className="bg-surface p-4 rounded-xl border border-white/5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-background font-bold`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-muted text-xs uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold text-main">{value}</p>
            {sublabel && <p className="text-xs text-gray-500">{sublabel}</p>}
        </div>
    </div>
);

const Badge = ({ icon: Icon, label, locked }) => (
    <div className={clsx(
        "flex flex-col items-center justify-center p-4 rounded-xl border transition-all text-center gap-2",
        locked
            ? "bg-surface/50 border-white/5 opacity-50 grayscale"
            : "bg-surface border-primary/30 shadow-[0_0_15px_-5px_#FFD700]"
    )}>
        <div className={clsx("p-3 rounded-full", locked ? "bg-gray-700 text-muted" : "bg-primary text-background")}>
            <Icon size={24} />
        </div>
        <span className={clsx("text-xs font-bold", locked ? "text-gray-500" : "text-main")}>{label}</span>
    </div>
);

const Profile = () => {
    const { currentUser } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);

    // Use local state for immediate feedback, fallback to currentUser data
    const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || "https://ui-avatars.com/api/?name=User&background=random");
    const [displayName, setDisplayName] = useState(currentUser?.name || currentUser?.email || 'Volunteer User');

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            // 1. Upload to Storage
            const url = await uploadProfilePhoto(file, currentUser.uid);

            // 2. Update Firestore User Doc
            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, { photoURL: url });

            // 3. Update Local State
            setPhotoURL(url);

            // Note: AuthContext might need a refresh logic or we just rely on page reload/user metadata update
            // ideally we'd update the context state too, but this shows immediate result.
        } catch (error) {
            console.error("Failed to upload photo", error);
            alert("Failed to upload photo. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="pb-20 md:pb-0 max-w-2xl mx-auto space-y-8">
            {/* Header / User Info */}
            <div className="bg-surface rounded-2xl p-6 border border-white/5 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <div className="relative group cursor-pointer">
                    <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={handlePhotoUpload}
                        disabled={uploading}
                    />
                    <div className={clsx("w-24 h-24 rounded-full p-1 border-2 border-primary transition-opacity", uploading && "opacity-50")}>
                        <img
                            src={currentUser?.photoURL || photoURL}
                            alt="User"
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>
                    {!uploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <span className="text-xs text-white font-bold">Change</span>
                        </div>
                    )}
                    {uploading && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    <div className="absolute bottom-0 right-0 bg-surface rounded-full p-1 border border-white/10">
                        <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
                    </div>
                </div>

                <div className="flex-1 space-y-2">
                    <div className="flex flex-col md:flex-row gap-2 items-center md:items-start">
                        <h1 className="text-2xl font-bold text-main">{displayName}</h1>
                        <button
                            onClick={() => setIsEditingName(true)}
                            className="p-1 text-gray-400 hover:text-primary transition-colors"
                        >
                            <Edit2 size={16} />
                        </button>
                    </div>
                    <p className="text-primary font-medium capitalize">{currentUser?.role || 'Volunteer'}</p>

                    <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm text-muted">
                        <span className="flex items-center gap-1">
                            <MapPin size={14} /> {currentUser?.hostelName || 'Roots Hostel'}
                        </span>
                        <span className="flex items-center gap-1">
                            <Mail size={14} /> {currentUser?.email}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div>
                <h2 className="text-lg font-bold text-main mb-4">Your Performance</h2>
                <div className="grid grid-cols-2 gap-3">
                    <StatsCard icon={Clock} label="Hours / Week" value="24h" sublabel="Target: 25h" color="bg-blue-400" />
                    <StatsCard icon={Trophy} label="Total Shifts" value="12" sublabel="This Month" color="bg-primary" />
                </div>
            </div>

            {/* Badges / Gamification */}
            <div>
                <h2 className="text-lg font-bold text-main mb-4">Your Badges</h2>
                <div className="grid grid-cols-3 gap-3">
                    <Badge icon={Trophy} label="Top Chef" locked={false} />
                    <Badge icon={Medal} label="Social Butterfly" locked={false} />
                    <Badge icon={Award} label="Clean Master" locked={true} />
                    <Badge icon={Clock} label="Punctual" locked={true} />
                    <Badge icon={CalendarIcon} label="Reliable" locked={false} />
                    <Badge icon={Trophy} label="Legend" locked={true} />
                </div>
            </div>

            {/* Edit Name Modal */}
            {isEditingName && (
                <EditProfileNameModal
                    user={{ ...currentUser, name: displayName }}
                    onClose={() => setIsEditingName(false)}
                    onUpdate={setDisplayName}
                />
            )}
        </div>
    );
};

export default Profile;


