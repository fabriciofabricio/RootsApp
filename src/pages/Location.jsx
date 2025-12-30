import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, User, MessageCircle } from 'lucide-react';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { AlertTriangle } from 'lucide-react';

// Create a custom helper to generate marker icons
const createAvatarIcon = (url) => {
    return L.divIcon({
        className: 'custom-avatar-marker',
        html: `<div style="
      width: 48px; 
      height: 48px; 
      border-radius: 50%; 
      border: 2px solid white; 
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); 
      overflow: hidden; 
      position: relative;
    ">
            <img src="${url}" style="width: 100%; height: 100%; object-fit: cover;" />
            <div style="
              position: absolute; 
              bottom: 0; 
              right: 0; 
              width: 12px; 
              height: 12px; 
              background-color: #22c55e; 
              border: 2px solid white; 
              border-radius: 50%;
            "></div>
           </div>`,
        iconSize: [48, 48],
        iconAnchor: [24, 24], // Center of the marker
        popupAnchor: [0, -28], // Popup above the marker
    });
};

const MOCK_VOLUNTEERS = [
    { id: 1, name: 'Fabricio', position: [52.3676, 4.9041], status: 'Exploring Vondelpark', avatar: 'https://ui-avatars.com/api/?name=Fabricio&background=0D8ABC&color=fff' },
    { id: 2, name: 'Sarah', position: [52.3702, 4.8952], status: 'At the Hostel', avatar: 'https://ui-avatars.com/api/?name=Sarah&background=random' },
    { id: 3, name: 'Mike', position: [52.3731, 4.8926], status: 'Getting Coffee', avatar: 'https://ui-avatars.com/api/?name=Mike&background=random' },
    { id: 4, name: 'Anna', position: [52.3590, 4.8840], status: 'Museum District', avatar: 'https://ui-avatars.com/api/?name=Anna&background=random' },
];

const Location = () => {
    const [position, setPosition] = useState([52.3676, 4.9041]); // Default to Amsterdam
    const [volunteers, setVolunteers] = useState(MOCK_VOLUNTEERS);
    const [isSharing, setIsSharing] = useState(false);
    const [showEmergencyModal, setShowEmergencyModal] = useState(false);
    const { theme } = useTheme();

    const { currentUser } = useAuth();
    const navigate = useNavigate();


    useEffect(() => {
        // In a real app, we would get the user's current location here
    }, []);

    const toggleSharing = () => {
        setIsSharing(!isSharing);
    };

    const handleViewProfile = (id) => {
        navigate('/profile');
    };

    const handleMessage = (id) => {
        console.log(`Open chat with user ${id}`);
    };

    const handleEmergencyClick = () => {
        setShowEmergencyModal(true);
    };

    const confirmEmergency = async () => {
        if (!currentUser) return;
        setShowEmergencyModal(false);

        // Visual only for now
        // try {
        //     await addDoc(collection(db, "posts"), {
        //         content: `🚨 **EMERGENCY ALERT** 🚨\n\nI need help! My current location is:\nLatitude: ${position[0]}\nLongitude: ${position[1]}\n\nPlease send help immediately.`,
        //         authorId: currentUser.uid,
        //         authorName: currentUser.name || currentUser.displayName || "Unknown User",
        //         authorPhoto: currentUser.photoURL || null,
        //         createdAt: serverTimestamp(),
        //         workspaceId: currentUser.workspaceId,
        //         type: 'emergency',
        //         taggedRoles: ['volunteer', 'staff', 'manager', 'admin'],
        //         location: { lat: position[0], lng: position[1] }
        //     });
        //     alert("Emergency Alert Sent! Help is on the way.");
        // } catch (error) {
        //     console.error("Error sending emergency alert:", error);
        //     alert("Failed to send alert. Please call emergency services directly.");
        // }
    };



    return (
        <div className="h-[calc(100vh-80px)] md:h-screen w-full relative bg-gray-100 dark:bg-gray-900">
            <MapContainer center={position} zoom={14} scrollWheelZoom={true} className="h-full w-full z-0">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url={theme === 'dark'
                        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    }
                />

                {volunteers.map((vol) => (
                    <Marker
                        key={vol.id}
                        position={vol.position}
                        icon={createAvatarIcon(vol.avatar)}
                    >
                        <Popup className="custom-popup-styled bg-transparent border-none shadow-none p-0">
                            {/* We use inline styles or standard tailwind classes that work within Leaflet's popup container limitations */}
                            <div className="w-64 font-sans bg-surface rounded-xl overflow-hidden shadow-2xl border border-white/10 dark:border-gray-700">
                                <div className="relative h-16 bg-gradient-to-r from-blue-600 to-purple-600">
                                    <div className="absolute -bottom-6 left-4">
                                        <img src={vol.avatar} alt={vol.name} className="w-16 h-16 rounded-full border-4 border-surface" />
                                    </div>
                                </div>
                                <div className="pt-8 px-4 pb-4">
                                    <h3 className="font-bold text-lg text-main leading-none mb-1">{vol.name}</h3>
                                    <p className="text-xs text-muted flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                                        {vol.status}
                                    </p>

                                    <div className="grid grid-cols-2 gap-2 mt-4">
                                        <button
                                            onClick={() => handleViewProfile(vol.id)}
                                            className="bg-gray-700 hover:bg-gray-600 text-main text-xs font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <User size={14} />
                                            Profile
                                        </button>
                                        <button
                                            onClick={() => handleMessage(vol.id)}
                                            className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <MessageCircle size={14} />
                                            Message
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Floating Controls */}
            <div className="absolute bottom-24 md:bottom-8 right-4 flex flex-col gap-3 z-[1000]">
                <button
                    onClick={handleEmergencyClick}
                    className="p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center border-4 border-yellow-500 bg-yellow-400 text-black hover:bg-yellow-500 hover:scale-110 mb-4"
                    title="EMERGENCY ALERT"
                >
                    <AlertTriangle size={32} strokeWidth={3} />
                </button>


                <button
                    onClick={toggleSharing}
                    className={`p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center border border-white/10 ${isSharing
                        ? 'bg-green-500 text-main animate-pulse shadow-green-500/20'
                        : 'bg-surface/90 backdrop-blur-md text-main hover:bg-gray-200 dark:bg-white/10'
                        }`}
                    title={isSharing ? "Stop Sharing" : "Share Location"}
                >
                    <Navigation size={24} className={isSharing ? "animate-spin-slow" : ""} />
                </button>

                <button
                    className="p-4 rounded-full bg-surface/90 backdrop-blur-md text-main shadow-2xl hover:bg-gray-200 dark:bg-white/10 transition-colors z-[1000] border border-white/10"
                    onClick={() => {
                        const map = document.querySelector('.leaflet-container')?._leaflet_map;
                        if (map) map.flyTo(position, 15);
                    }}
                >
                    <MapPin size={24} />
                </button>
            </div>

            {/* Status Panel */}
            <div className="absolute top-4 left-4 z-[1000]">
                <div className="bg-surface/80 backdrop-blur-md pl-4 pr-6 py-3 rounded-2xl border border-white/10 text-main shadow-2xl flex items-center gap-4">
                    <div className="flex -space-x-3">
                        {volunteers.slice(0, 3).map(v => (
                            <img key={v.id} src={v.avatar} className="w-8 h-8 rounded-full border-2 border-[#1a1a1a]" />
                        ))}
                        {volunteers.length > 3 && (
                            <div className="w-8 h-8 rounded-full border-2 border-[#1a1a1a] bg-gray-700 flex items-center justify-center text-[10px] font-bold">
                                +{volunteers.length - 3}
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="font-bold text-sm">Friends Nearby</p>
                        <p className="text-xs text-muted">{volunteers.length} Active now</p>
                    </div>
                </div>
            </div>

            {/* Emergency Confirmation Modal */}
            {showEmergencyModal && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
                        <div className="bg-yellow-500/10 p-6 flex flex-col items-center text-center border-b border-white/5">
                            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4 text-yellow-500">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-main mb-2">Emergency Alert</h3>
                            <p className="text-muted text-sm">
                                This will share your live location with <strong>ALL users</strong> and notify them that you need help immediately.
                            </p>
                        </div>
                        <div className="p-4 flex gap-3">
                            <button
                                onClick={() => setShowEmergencyModal(false)}
                                className="flex-1 py-3 rounded-xl font-medium text-main hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmEmergency}
                                className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl font-bold transition-colors shadow-lg shadow-yellow-500/20"
                            >
                                SEND ALERT
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>
                {`
                .leaflet-popup-content-wrapper {
                    background: transparent;
                    box-shadow: none;
                    padding: 0;
                    border: none;
                }
                .leaflet-popup-tip {
                    background: ${theme === 'dark' ? '#1E1E1E' : '#FFFFFF'};
                }
                `}
            </style>
        </div>
    );
};


export default Location;



