
export interface Shop {
    id: string;
    name: string;
    category: 'Fashion' | 'Electronics' | 'Food & Beverage' | 'Entertainment' | 'Services' | 'Health & Beauty';
    floor: string;
    logoUrl: string;
    description: string;
}

export interface MallEvent {
    id: string;
    name: string;
    description: string;
    date: string;
    imageUrl: string;
}

export interface Mall {
    id: string;
    name: string;
    province: 'KOSHI' | 'MADHESH' | 'BAGMATI' | 'GANDAKI' | 'LUMBINI' | 'KARNALI' | 'SUDURPASHCHIM';
    address: string;
    imageUrl: string;
}

export const MALLS: Mall[] = [
    {
        id: 'civil-mall',
        name: 'Civil Mall',
        province: 'BAGMATI',
        address: 'Sundhara, Kathmandu, Nepal',
        imageUrl: 'https://picsum.photos/seed/mall1/800/400',
    },
    {
        id: 'city-centre',
        name: 'City Centre',
        province: 'BAGMATI',
        address: 'Kamal Pokhari, Kathmandu, Nepal',
        imageUrl: 'https://picsum.photos/seed/mall2/800/400',
    },
    {
        id: 'kl-tower',
        name: 'KL Tower & Mall',
        province: 'BAGMATI',
        address: 'Chuchchepati, Kathmandu, Nepal',
        imageUrl: 'https://picsum.photos/seed/mall3/800/400',
    },
    {
        id: 'pokhara-trade-mall',
        name: 'Pokhara Trade Mall',
        province: 'GANDAKI',
        address: 'Chipledhunga, Pokhara, Nepal',
        imageUrl: 'https://picsum.photos/seed/mall4/800/400',
    },
];
