import { Truck, CalendarClock, Package } from 'lucide-react';
import clsx from 'clsx';

const DeliveryStatus = () => {
    const today = new Date().getDay();
    // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat

    // Calculate days until next Thursday (Target Order Day)
    // Formula: (Target - Current + 7) % 7
    // If today is Thursday (4), result is 0
    // If today is Friday (5), result is 6
    const daysUntilOrder = (4 - today + 7) % 7;

    let title, message, subtext, icon, colorClass, highlightClass;

    if (daysUntilOrder === 0) {
        // Thursday
        title = "Order Day!";
        message = "Make sure the list is complete.";
        subtext = "Delivery arrives tomorrow (Friday).";
        icon = CalendarClock;
        colorClass = "bg-primary/20 text-primary";
        highlightClass = "text-primary";
    } else if (today === 5) { // Friday
        // Friday (daysUntilOrder would be 6)
        title = "Delivery Day!";
        message = "The order should arrive today.";
        subtext = "Next order cycle starts in 6 days.";
        icon = Truck;
        colorClass = "bg-green-500/20 text-green-500";
        highlightClass = "text-green-500";
    } else {
        // Any other day
        title = "Upcoming Order";
        const dayWord = daysUntilOrder === 1 ? "tomorrow" : `in ${daysUntilOrder} days`;
        message = `Delivery order is ${dayWord}.`;
        subtext = "Thursday is order day. Friday is delivery.";
        icon = Package;
        colorClass = "bg-blue-500/20 text-blue-400";
        highlightClass = "text-blue-400";
    }

    const Icon = icon;

    return (
        <div className="bg-surface rounded-2xl p-4 border border-white/5 mb-6 relative overflow-hidden group">
            {/* Background decoration */}
            <div className={clsx("absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-xl transition-all group-hover:opacity-20", highlightClass.replace('text-', 'bg-'))}></div>

            <div className="flex items-start gap-4 relative z-10">
                <div className={clsx("p-3 rounded-xl flex items-center justify-center shrink-0", colorClass)}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>

                <div className="flex-1">
                    <h3 className={clsx("font-bold text-lg mb-1", highlightClass)}>{title}</h3>
                    <p className="text-main font-medium leading-tight mb-1">{message}</p>
                    <p className="text-xs text-muted font-medium uppercase tracking-wide opacity-80">{subtext}</p>
                </div>
            </div>

            {/* Progress bar visual for days until Thursday (only for non-event days) */}
            {daysUntilOrder > 0 && today !== 5 && (
                <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                        className={clsx("h-full rounded-full transition-all duration-1000", highlightClass.replace('text-', 'bg-'))}
                        style={{ width: `${((7 - daysUntilOrder) / 7) * 100}%` }}
                    ></div>
                </div>
            )}
        </div>
    );
};

export default DeliveryStatus;
