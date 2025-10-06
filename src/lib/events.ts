
import type { MallEvent } from './malls';

// Demo data for events in different malls
export const EVENTS: { [mallId: string]: MallEvent[] } = {
    'civil-mall': [
        { id: 'cme-1', name: 'Dashain Shopping Festival', description: 'Get up to 50% off on major brands this Dashain!', date: 'Oct 1 - Oct 15', imageUrl: 'https://picsum.photos/seed/event1/600/300' },
        { id: 'cme-2', name: 'Live Music with The Edge Band', description: 'Enjoy a live performance by The Edge Band this Friday night.', date: 'Every Friday, 7 PM', imageUrl: 'https://picsum.photos/seed/event2/600/300' },
    ],
    'city-centre': [
        { id: 'cce-1', name: 'Winter Wonderland', description: 'Experience a magical winter setup with artificial snow and decorations.', date: 'Dec 15 - Jan 15', imageUrl: 'https://picsum.photos/seed/event3/600/300' },
    ],
    'kl-tower': [
        { id: 'kle-1', name: 'Food Festival', description: 'Taste delicacies from over 20 different food stalls.', date: 'Nov 5 - Nov 12', imageUrl: 'https://picsum.photos/seed/event4/600/300' },
    ],
    'pokhara-trade-mall': [
        // No events for this mall in the demo data
    ],
};
