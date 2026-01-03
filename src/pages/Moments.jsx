import { useState, useEffect } from 'react';
import { Plus, Heart, Camera, Coffee, Briefcase, PartyPopper, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import NewMomentModal from '../components/moments/NewMomentModal';
import { useAuth } from '../context/AuthContext';
import { useDemo } from '../context/DemoContext';

import moment1 from '../assets/moments/moment-1.jpeg';
import moment2 from '../assets/moments/moment-2.jpeg';
import moment3 from '../assets/moments/moment-3.jpeg';

const CATEGORIES = [
    { id: 'all', label: 'All', icon: null },
    { id: 'team', label: 'Team', icon: Briefcase },
    { id: 'fun', label: 'Event', icon: PartyPopper },
    { id: 'kitchen', label: 'Cozinha', icon: Coffee },
];

const MOCK_PHOTOS = [
    {
        id: '1',
        imageUrl: moment1,
        tag: 'fun',
        likes: 24,
        authorName: 'Sarah J.',
        authorPhoto: 'https://i.pravatar.cc/150?u=sarah',
        createdAt: { seconds: Date.now() / 1000 }
    },
    {
        id: '2',
        imageUrl: moment3,
        tag: 'team',
        likes: 18,
        authorName: 'Mike T.',
        authorPhoto: 'https://i.pravatar.cc/150?u=mike',
        createdAt: { seconds: Date.now() / 1000 }
    },
    {
        id: '3',
        imageUrl: moment2,
        tag: 'kitchen',
        likes: 12,
        authorName: 'Chef Luigi',
        authorPhoto: 'https://i.pravatar.cc/150?u=luigi',
        createdAt: { seconds: Date.now() / 1000 }
    },
];

const Moments = () => {
    const { currentUser } = useAuth();
    const { isDemoMode } = useDemo();
    const [activeCategory, setActiveCategory] = useState('all');
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // Data State
    const [moments, setMoments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isDemoMode) {
            setMoments(MOCK_PHOTOS);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'moments'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const momentsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMoments(momentsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching moments:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [isDemoMode]);

    const filteredPhotos = activeCategory === 'all'
        ? moments
        : moments.filter(m => m.tag === activeCategory);

    const handleNext = (e) => {
        e.stopPropagation();
        const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto.id);
        const nextIndex = (currentIndex + 1) % filteredPhotos.length;
        setSelectedPhoto(filteredPhotos[nextIndex]);
    };

    const handlePrev = (e) => {
        e.stopPropagation();
        const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto.id);
        const prevIndex = (currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
        setSelectedPhoto(filteredPhotos[prevIndex]);
    };

    return (
        <div className="pb-20 md:pb-0">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-main tracking-tight">Moments</h1>
                    <p className="text-muted text-sm">Capturing the hostel vibes ✨</p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-gradient-to-r from-primary to-yellow-400 text-background p-3 rounded-full shadow-lg hover:shadow-[0_0_20px_-5px_#FFD700] hover:scale-110 transition-all font-bold"
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-4 -mx-4 px-4 md:px-0 md:overflow-visible">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border",
                            activeCategory === cat.id
                                ? "bg-white text-background border-white"
                                : "bg-surface text-muted border-white/5 hover:bg-gray-200 dark:bg-white/10"
                        )}
                    >
                        {cat.icon && <cat.icon size={14} />}
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Gallery Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 size={40} className="animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredPhotos.map((photo) => (
                        <div
                            key={photo.id}
                            onClick={() => setSelectedPhoto(photo)}
                            className="relative aspect-square group overflow-hidden rounded-xl bg-gray-800 cursor-pointer"
                        >
                            <img
                                src={photo.imageUrl}
                                alt="Moment"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                loading="lazy"
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        {photo.authorPhoto && (
                                            <img src={photo.authorPhoto} className="w-5 h-5 rounded-full border border-white/20" alt="" />
                                        )}
                                        <span className="text-xs text-white/90 font-medium truncate">{photo.authorName}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-main">
                                        <Heart size={16} className="fill-white" />
                                        <span className="text-xs font-bold">{photo.likes}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredPhotos.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <Camera size={48} className="mb-4 opacity-50" />
                    <p>No moments in this category yet.</p>
                </div>
            )}

            {/* Lightbox Modal */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <button
                        onClick={() => setSelectedPhoto(null)}
                        className="absolute top-4 right-4 text-main hover:text-muted transition-colors bg-gray-200 dark:bg-white/10 p-2 rounded-full backdrop-blur-md z-50"
                    >
                        <X size={24} />
                    </button>

                    {filteredPhotos.length > 1 && (
                        <>
                            <button
                                onClick={handlePrev}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-main hover:text-muted transition-colors bg-gray-200 dark:bg-white/10 p-3 rounded-full backdrop-blur-md z-50"
                            >
                                <ChevronLeft size={32} />
                            </button>
                            <button
                                onClick={handleNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-main hover:text-muted transition-colors bg-gray-200 dark:bg-white/10 p-3 rounded-full backdrop-blur-md z-50"
                            >
                                <ChevronRight size={32} />
                            </button>
                        </>
                    )}

                    <div className="flex flex-col items-center gap-4 max-w-full">
                        <img
                            src={selectedPhoto.imageUrl}
                            alt="Full view"
                            className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex items-center gap-3 text-white bg-black/50 px-4 py-2 rounded-full backdrop-blur-md" onClick={(e) => e.stopPropagation()}>
                            {selectedPhoto.authorPhoto && (
                                <img src={selectedPhoto.authorPhoto} className="w-8 h-8 rounded-full border border-white/20" alt="" />
                            )}
                            <div>
                                <p className="text-sm font-bold">{selectedPhoto.authorName}</p>
                                <p className="text-xs text-white/70 capitalize">{selectedPhoto.tag}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <NewMomentModal onClose={() => setIsUploadModalOpen(false)} />
            )}
        </div>
    );
};

export default Moments;



