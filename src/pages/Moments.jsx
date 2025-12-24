import { useState } from 'react';
import { Plus, Heart, Camera, Coffee, Briefcase, PartyPopper, X, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

const CATEGORIES = [
    { id: 'all', label: 'All', icon: null },
    { id: 'team', label: 'Team', icon: Briefcase },
    { id: 'fun', label: 'Event', icon: PartyPopper },
    { id: 'kitchen', label: 'Cozinha', icon: Coffee },
];

import moment1 from '../assets/moments/moment-1.jpeg';
import moment2 from '../assets/moments/moment-2.jpeg';
import moment3 from '../assets/moments/moment-3.jpeg';

const MOCK_PHOTOS = [
    { id: 1, url: moment1, category: 'fun', likes: 24 },
    { id: 2, url: moment3, category: 'team', likes: 18 },
    { id: 3, url: moment2, category: 'kitchen', likes: 12 },
];

const Moments = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    const filteredPhotos = activeCategory === 'all'
        ? MOCK_PHOTOS
        : MOCK_PHOTOS.filter(p => p.category === activeCategory);

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
                <button className="bg-gradient-to-r from-primary to-yellow-400 text-background p-3 rounded-full shadow-lg hover:shadow-[0_0_20px_-5px_#FFD700] hover:scale-110 transition-all font-bold">
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredPhotos.map((photo) => (
                    <div
                        key={photo.id}
                        onClick={() => setSelectedPhoto(photo)}
                        className="relative aspect-square group overflow-hidden rounded-xl bg-gray-800 cursor-pointer"
                    >
                        <img
                            src={photo.url}
                            alt="Moment"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                            <div className="flex items-center gap-1.5 text-main">
                                <Heart size={16} className="fill-white" />
                                <span className="text-xs font-bold">{photo.likes}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredPhotos.length === 0 && (
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

                    <img
                        src={selectedPhoto.url}
                        alt="Full view"
                        className="max-h-[90vh] max-w-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default Moments;



