
import type { Mall } from './malls';

export interface MallEvent {
    id: string;
    name: string;
    description: string;
    date: string;
    imageUrl: string;
    mallId: string;
    mallName: string;
    province: Mall['province'];
}

// Demo data for events in different malls
const EVENTS_DATA: { [mallId: string]: Omit<MallEvent, 'id' | 'mallId' | 'mallName' | 'province'>[] } = {
    'civil-mall': [
        { name: 'Dashain Shopping Festival', description: 'Get up to 50% off on major brands this Dashain!', date: 'Oct 1 - Oct 15', imageUrl: 'https://picsum.photos/seed/event1/600/300' },
        { name: 'Live Music with The Edge Band', description: 'Enjoy a live performance by The Edge Band this Friday night.', date: 'Every Friday, 7 PM', imageUrl: 'https://picsum.photos/seed/event2/600/300' },
    ],
    'city-centre': [
        { name: 'Winter Wonderland', description: 'Experience a magical winter setup with artificial snow and decorations.', date: 'Dec 15 - Jan 15', imageUrl: 'https://picsum.photos/seed/event3/600/300' },
        { name: 'Kids Fun Fair', description: 'Fun activities, games, and magic shows for children.', date: 'Every Saturday', imageUrl: 'https://picsum.photos/seed/event5/600/300' },
    ],
    'kl-tower': [
        { name: 'Food Festival', description: 'Taste delicacies from over 20 different food stalls.', date: 'Nov 5 - Nov 12', imageUrl: 'https://picsum.photos/seed/event4/600/300' },
    ],
    'pokhara-trade-mall': [
         { name: 'Local Handicrafts Exhibition', description: 'Explore and buy authentic local handicrafts from Gandaki province.', date: 'Sep 20 - Sep 27', imageUrl: 'https://picsum.photos/seed/event6/600/300' },
    ],
};


// Process the raw data to include mall details in each event
import { MALLS } from './malls';

export const EVENTS: MallEvent[] = MALLS.flatMap(mall => {
    const mallEvents = EVENTS_DATA[mall.id] || [];
    return mallEvents.map((event, index) => ({
        ...event,
        id: `${mall.id}-event-${index}`,
        mallId: mall.id,
        mallName: mall.name,
        province: mall.province,
    }));
});
