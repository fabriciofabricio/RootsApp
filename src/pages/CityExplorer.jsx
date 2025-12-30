import { MapPin, Calendar, Users, Bike, ExternalLink, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { useDemo } from '../context/DemoContext';
import { MOCK_EVENTS } from '../services/mockData';

const EVENTS = [
    {
        id: 1,
        title: 'King\'s Day Festival',
        date: 'Apr 27 • 14:00',
        location: 'Vondelpark',
        dist: '2.5 km',
        image: 'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?auto=format&fit=crop&w=600&q=80',
        attendees: [
            { id: 1, avatar: 'https://ui-avatars.com/api/?name=John+D&background=random' },
            { id: 2, avatar: 'https://ui-avatars.com/api/?name=Jane+S&background=random' },
            { id: 3, avatar: 'https://ui-avatars.com/api/?name=Bob+M&background=random' },
            { id: 4, avatar: 'https://ui-avatars.com/api/?name=Alice+Wonder&background=random' }
        ],
        ride: { available: true, driver: 'Mike', seats: 2 }
    },
    {
        id: 2,
        title: 'Techno bunker Rave',
        date: 'Tonight • 23:00',
        location: 'Shelter Club',
        dist: '4.1 km',
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
        attendees: [
            { id: 1, avatar: 'https://ui-avatars.com/api/?name=Rave+King&background=random' },
            { id: 2, avatar: 'https://ui-avatars.com/api/?name=Techno+Queen&background=random' }
        ],
        ride: null
    },
    {
        id: 3,
        title: 'Street Food Market',
        date: 'Sun, Nov 12 • 11:00',
        location: 'De Hallen',
        dist: '1.2 km',
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
        attendees: [
            { id: 1, avatar: 'https://ui-avatars.com/api/?name=Foodie+One&background=random' },
            { id: 2, avatar: 'https://ui-avatars.com/api/?name=Chef+Boy&background=random' },
            { id: 3, avatar: 'https://ui-avatars.com/api/?name=Hungry+Gal&background=random' }
        ],
        ride: { available: true, driver: 'Anna', seats: 1 }
    }
];

const EventCard = ({ event }) => (
    <div className="bg-surface rounded-2xl overflow-hidden border border-white/5 mb-4 group">
        <div className="h-32 overflow-hidden relative">
            <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
            <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-main flex items-center gap-1">
                <MapPin size={12} className="text-primary" />
                {event.dist}
            </div>
            {event.ride && (
                <div className="absolute bottom-2 left-2 bg-green-500 text-background px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg">
                    <Bike size={14} />
                    {event.ride.bikeTime ? `${event.ride.bikeTime} min bike ride` : `${event.ride.seats} seats left`}
                </div>
            )}
        </div>
        <div className="p-4">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-bold text-main text-lg leading-tight mb-1">{event.title}</h3>
                    <p className="text-muted text-xs flex items-center gap-1">
                        <Calendar size={12} /> {event.date} • {event.location}
                    </p>
                </div>
                <button className="text-gray-500 hover:text-main transition-colors">
                    <ExternalLink size={18} />
                </button>
            </div>

            <div className="flex items-center justify-between mt-4">
                <div className="flex -space-x-2">
                    {event.attendees.map((attendee, index) => (
                        <div key={index} className="w-6 h-6 rounded-full border border-surface overflow-hidden">
                            <img
                                src={attendee.avatar}
                                alt="Attendee"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                    ))}
                    <div className="w-6 h-6 rounded-full bg-gray-800 border border-surface flex items-center justify-center text-[8px] text-muted">+2</div>
                </div>

                <button className="bg-gray-100 dark:bg-white/5 hover:bg-primary hover:text-background text-main px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2">
                    I'm Going <ArrowRight size={14} />
                </button>
            </div>
        </div>
    </div>
);

const CityExplorer = () => {
    const { isDemoMode } = useDemo();
    const eventsList = isDemoMode ? MOCK_EVENTS : EVENTS;

    return (
        <div className="pb-20 md:pb-0 max-w-lg mx-auto">
            <h1 className="text-3xl font-bold text-main mb-2">City Explorer</h1>
            <p className="text-muted mb-6">Discover what's happening in Amsterdam.</p>

            {/* Map Placeholder */}
            <div className="w-full h-40 bg-gray-800 rounded-2xl mb-6 relative overflow-hidden group cursor-pointer border border-white/10">
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                    <div className="bg-surface/80 backdrop-blur px-4 py-2 rounded-xl flex items-center gap-2 text-main font-bold">
                        <MapPin size={18} className="text-primary" />
                        Open Map View
                    </div>
                </div>
                {/* Abstract Map Pattern */}
                <div className="w-full h-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/Map_of_Amsterdam_Centrum.png')] bg-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-500"></div>
            </div>

            <h2 className="text-lg font-bold text-main mb-4">Upcoming Events</h2>
            <div>
                {eventsList.map(event => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>
        </div>
    );
};

export default CityExplorer;



