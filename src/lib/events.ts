
import type { Mall } from './malls';

export interface MallEvent {
    id: string;
    name: string;
    description: string;
    longDescription: string;
    date: string; // User-friendly date range string
    startDate: Date;
    endDate: Date;
    time: string;
    imageUrl: string;
    mallId: string;
    mallName: string;
    province: Mall['province'];
    type: 'Free' | 'Paid';
    organizer: string;
    contact?: string;
}

// Demo data for events in different malls
// Using Omit to simplify data entry
type EventData = Omit<MallEvent, 'id' | 'mallId' | 'mallName' | 'province'>;

const EVENTS_DATA: { [mallId: string]: EventData[] } = {
    'civil-mall': [
        { 
            name: 'Dashain Shopping Festival', 
            description: 'Get up to 50% off on major brands this Dashain!',
            longDescription: 'Celebrate the festive season with our grand Dashain Shopping Festival. Discover unbeatable discounts across all stores, enjoy live music every evening, and stand a chance to win exciting prizes in our daily lucky draw. A perfect outing for the whole family.',
            date: 'Oct 1 - Oct 15', 
            startDate: new Date('2024-10-01'),
            endDate: new Date('2024-10-15'),
            time: '11:00 AM - 8:00 PM',
            imageUrl: 'https://picsum.photos/seed/event1/600/300',
            type: 'Free',
            organizer: 'Civil Mall Management',
            contact: 'info@civilmall.com.np'
        },
        { 
            name: 'Live Music with The Edge Band', 
            description: 'Enjoy a live performance by The Edge Band this Friday night.', 
            longDescription: 'Rock your Friday nights! The legendary Nepali rock band, The Edge, will be performing live at the Civil Mall food court. Grab a bite, enjoy the music, and kickstart your weekend with some amazing tunes. No entry fee required.',
            date: 'Every Friday',
            startDate: new Date(), // Recurring, so we can set a recent start for filtering
            endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Ends in a year
            time: '7:00 PM onwards',
            imageUrl: 'https://picsum.photos/seed/event2/600/300',
            type: 'Free',
            organizer: 'QFX Cinemas & Civil Mall',
        },
    ],
    'city-centre': [
        { 
            name: 'Winter Wonderland', 
            description: 'Experience a magical winter setup with artificial snow and decorations.', 
            longDescription: 'Step into a winter dream at City Centre. We\'ve transformed our central atrium into a magical Winter Wonderland, complete with artificial snow, festive lights, and a giant Christmas tree. Perfect for photos and getting into the holiday spirit.',
            date: 'Dec 15 - Jan 15', 
            startDate: new Date('2024-12-15'),
            endDate: new Date('2025-01-15'),
            time: 'All Day',
            imageUrl: 'https://picsum.photos/seed/event3/600/300',
            type: 'Free',
            organizer: 'City Centre Management',
        },
        { 
            name: 'Kids Fun Fair', 
            description: 'Fun activities, games, and magic shows for children.',
            longDescription: 'Bring your little ones for a day of fun and excitement! Our Kids Fun Fair features bouncy castles, face painting, a magic show at 3 PM, and various interactive games. A paid ticket is required for access to the activity zone.',
            date: 'Every Saturday', 
            startDate: new Date(),
            endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            time: '12:00 PM - 5:00 PM',
            imageUrl: 'https://picsum.photos/seed/event5/600/300',
            type: 'Paid',
            organizer: 'Funland Events',
            contact: '01-4011567'
        },
    ],
    'kl-tower': [
        { 
            name: 'Food Festival', 
            description: 'Taste delicacies from over 20 different food stalls.', 
            longDescription: 'A paradise for food lovers! The KL Tower Food Festival brings together over 20 of the city\'s best street food vendors and restaurants. Explore diverse cuisines, from local momos to international flavors. Entry is free, pay for what you eat.',
            date: 'Nov 5 - Nov 12', 
            startDate: new Date('2024-11-05'),
            endDate: new Date('2024-11-12'),
            time: '1:00 PM - 9:00 PM',
            imageUrl: 'https://picsum.photos/seed/event4/600/300',
            type: 'Free',
            organizer: 'Kathmandu Foodies Group',
        },
    ],
    'pokhara-trade-mall': [
         { 
            name: 'Local Handicrafts Exhibition', 
            description: 'Explore and buy authentic local handicrafts from Gandaki province.', 
            longDescription: 'Support local artisans and discover the rich cultural heritage of the Gandaki province. This exhibition showcases a wide variety of handmade products, including pashmina, thangka paintings, and traditional jewelry. A great opportunity to buy unique souvenirs.',
            date: 'Sep 20 - Sep 27', 
            startDate: new Date('2024-09-20'),
            endDate: new Date('2024-09-27'),
            time: '10:00 AM - 6:00 PM',
            imageUrl: 'https://picsum.photos/seed/event6/600/300',
            type: 'Free',
            organizer: 'Pokhara Chamber of Commerce',
        },
    ],
};


// Process the raw data to include mall details in each event
import { MALLS } from './malls';

export const EVENTS: MallEvent[] = MALLS.flatMap(mall => {
    const mallEvents = EVENTS_DATA[mall.id] || [];
    return mallEvents.map((event, index) => ({
        ...event,
        id: `${mall.id}-event-${index + 1}`,
        mallId: mall.id,
        mallName: mall.name,
        province: mall.province,
    }));
});
