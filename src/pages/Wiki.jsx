import { Book, FileText, Smartphone, ShieldAlert } from 'lucide-react';

const Wiki = () => {
    const GUIDES = [
        { title: 'Washing Machine', icon: Smartphone, desc: 'How to use the industrial washers without flooding the basement.' },
        { title: 'Code of Conduct', icon: FileText, desc: 'Rules about parties, noise, and guests.' },
        { title: 'Emergencies', icon: ShieldAlert, desc: 'Who to call when things break or go wrong.' },
        { title: 'Kitchen Rules', icon: Book, desc: 'Labeling food and cleaning roster.' },
    ];

    return (
        <div className="pb-20 md:pb-0 max-w-lg mx-auto">
            <h1 className="text-3xl font-bold text-main mb-6">Hostel Wiki</h1>
            <div className="grid gap-4">
                {GUIDES.map((guide, i) => (
                    <div key={i} className="bg-surface p-4 rounded-xl border border-white/5 flex items-center gap-4 hover:border-primary/50 transition-colors cursor-pointer group">
                        <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-muted group-hover:bg-primary group-hover:text-main dark:group-hover:text-background transition-colors">
                            <guide.icon size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-main text-lg">{guide.title}</h3>
                            <p className="text-sm text-muted">{guide.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Wiki;


