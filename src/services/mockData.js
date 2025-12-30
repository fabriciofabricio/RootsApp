// Mock Data for Demo/Template Mode

export const MOCK_USERS = {
    'gabriel': { name: 'Gabriel', photoURL: null, role: 'volunteer' },
    'mina': { name: 'Mina', photoURL: null, role: 'volunteer' },
    'fabricio': { name: 'Fabricio', photoURL: null, role: 'volunteer' },
    'jorge': { name: 'Jorge', photoURL: null, role: 'volunteer' },

    'sofie': { name: 'Sofie', photoURL: null, role: 'staff' },
    'sammy': { name: 'Sammy', photoURL: null, role: 'staff' },
    'sam': { name: 'Sam', photoURL: null, role: 'staff' },

    'marion': { name: 'Marion', photoURL: null, role: 'owner' },
    'koen': { name: 'Koen', photoURL: null, role: 'owner' }
};

export const MOCK_POSTS = [
    {
        id: 'demo1',
        authorId: 'gabriel',
        content: "Just checked into the hostel! The vibe here is absolutely amazing. Anyone up for a coffee in the common area? ☕️",
        imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
        likes: ['mina', 'marion', 'sam'],
        comments: 2,
        createdAt: { seconds: Date.now() / 1000 - 3600 } // 1 hour ago
    },
    {
        id: 'demo2',
        authorId: 'sofie',
        content: "Exploring the city by bike today! Found this incredible canal spot. 🚲🇳🇱 #Amsterdam #Travel",
        imageUrl: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a2?auto=format&fit=crop&w=800&q=80',
        likes: ['gabriel', 'jorge'],
        comments: 0,
        createdAt: { seconds: Date.now() / 1000 - 7200 } // 2 hours ago
    },
    {
        id: 'demo3',
        authorId: 'marion',
        content: "Tonight's communal dinner is going to be pasta night! 🍝 Don't forget to sign up at the front desk.",
        imageUrl: null,
        likes: ['fabricio', 'mina', 'koen', 'sammy'],
        comments: 5,
        createdAt: { seconds: Date.now() / 1000 - 18000 } // 5 hours ago
    },
    {
        id: 'demo4',
        authorId: 'mina',
        content: "Anyone want to join for the Vondelpark picnic tomorrow? Weather looks great! ☀️",
        imageUrl: 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=800&q=80',
        likes: ['sofie'],
        comments: 1,
        createdAt: { seconds: Date.now() / 1000 - 86400 } // 1 day ago
    },
    {
        id: 'demo5',
        authorId: 'koen',
        content: "Welcome to all our new volunteers! Let's make this a great season. 🚀",
        imageUrl: null,
        likes: ['gabriel', 'mina', 'fabricio', 'jorge', 'sofie', 'sammy', 'sam', 'marion'],
        comments: 3,
        createdAt: { seconds: Date.now() / 1000 - 172800 } // 2 days ago
    }
];

export const MOCK_EVENTS = [
    {
        id: 'demo_event_1',
        title: 'Canal Boat Party',
        date: 'Tonight • 20:00',
        location: 'Central Station Dock',
        dist: '1.2 km',
        image: 'https://images.unsplash.com/photo-1605101100278-5d1deb2b6498?auto=format&fit=crop&w=600&q=80', // Amsterdam Canal Boat
        attendees: [
            { id: 1, avatar: 'https://ui-avatars.com/api/?name=Alex+M&background=random' },
            { id: 2, avatar: 'https://ui-avatars.com/api/?name=Sarah+J&background=random' },
            { id: 3, avatar: 'https://ui-avatars.com/api/?name=Mike+T&background=random' },
            { id: 4, avatar: 'https://ui-avatars.com/api/?name=Lisa+R&background=random' },
            { id: 5, avatar: 'https://ui-avatars.com/api/?name=Tom+H&background=random' },
            { id: 6, avatar: 'https://ui-avatars.com/api/?name=Emma+W&background=random' }
        ],
        ride: { available: true, driver: 'Jorge', seats: 4, bikeTime: 4 }
    },
    {
        id: 'demo_event_3',
        title: 'Techno bunker Rave',
        date: 'Fri, Oct 12 • 23:00',
        location: 'Shelter Club',
        dist: '4.1 km',
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
        attendees: [
            { id: 1, avatar: 'https://ui-avatars.com/api/?name=David+K&background=random' },
            { id: 2, avatar: 'https://ui-avatars.com/api/?name=Sophie+L&background=random' }
        ],
        ride: null
    },
    {
        id: 'demo_event_4',
        title: 'Street Food Market',
        date: 'Sat, Oct 13 • 11:00',
        location: 'De Hallen',
        dist: '1.2 km',
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
        attendees: [
            { id: 1, avatar: 'https://ui-avatars.com/api/?name=Chris+P&background=random' },
            { id: 2, avatar: 'https://ui-avatars.com/api/?name=Anna+M&background=random' },
            { id: 3, avatar: 'https://ui-avatars.com/api/?name=James+B&background=random' }
        ],
        ride: { available: true, driver: 'Sammy', seats: 1, bikeTime: 6 }
    }
];

export const MOCK_STAFF = [
    { id: 'staff_1', name: 'Sofie', role: 'front office', avatar: 'https://ui-avatars.com/api/?name=Sofie&background=3B82F6&color=fff' },
    { id: 'staff_2', name: 'Margot', role: 'intern', avatar: 'https://ui-avatars.com/api/?name=Margot&background=10B981&color=fff' },
    { id: 'staff_3', name: 'Lola', role: 'intern', avatar: 'https://ui-avatars.com/api/?name=Lola&background=10B981&color=fff' },
    { id: 'staff_4', name: 'Gabriel', role: 'volunteer', avatar: 'https://ui-avatars.com/api/?name=Gabriel&background=F59E0B&color=fff' },
    { id: 'staff_5', name: 'Fabricio', role: 'volunteer', avatar: 'https://ui-avatars.com/api/?name=Fabricio&background=F59E0B&color=fff' },
    { id: 'staff_6', name: 'Jorge', role: 'volunteer', avatar: 'https://ui-avatars.com/api/?name=Jorge&background=F59E0B&color=fff' }
];

// Helper to generate schedule for MOCK_STAFF (similar to Schedules.jsx logic)
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const generateMockSchedule = () => {
    return MOCK_STAFF.map(staff => {
        const schedule = DAYS.map(day => {
            if (Math.random() > 0.3) {
                let assignedRole = staff.role;
                // Map generic roles to display roles if needed, or keep as is.
                // For volunteers, we assign specific shifts like Breakfast, Cleaning, Bar
                if (staff.role === 'volunteer') {
                    assignedRole = ['Breakfast', 'Cleaning', 'Bar'][Math.floor(Math.random() * 3)];
                } else if (staff.role === 'front office') {
                    assignedRole = 'Front Office';
                } else if (staff.role === 'intern') {
                    assignedRole = 'Intern';
                }

                const startHour = Math.floor(Math.random() * 14) + 6;
                return {
                    day,
                    role: assignedRole,
                    time: `${startHour}:00 - ${startHour + 5}:00`,
                    isActive: true
                };
            }
            return { day, isActive: false };
        });
        return { ...staff, schedule, role: staff.role === 'front office' ? 'Front Office' : (staff.role === 'intern' ? 'Intern' : 'Volunteer') };
        // Normalizing roles for the component's strict checks if necessary
    });
};

export const MOCK_SCHEDULE_DATA = generateMockSchedule();

