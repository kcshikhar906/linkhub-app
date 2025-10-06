
import type { Shop } from './malls';

// Demo data for shops in different malls
export const SHOPS: { [mallId: string]: Shop[] } = {
    'civil-mall': [
        { id: 'cm-1', name: 'KFC', category: 'Food & Beverage', floor: 'Ground Floor', logoUrl: 'https://picsum.photos/seed/kfc/100/100', description: 'Finger Lickin\' Good chicken.' },
        { id: 'cm-2', name: 'Levi\'s Store', category: 'Fashion', floor: 'First Floor', logoUrl: 'https://picsum.photos/seed/levis/100/100', description: 'Original and authentic jeanswear.' },
        { id: 'cm-3', name: 'Samsung Plaza', category: 'Electronics', floor: 'Second Floor', logoUrl: 'https://picsum.photos/seed/samsung/100/100', description: 'Latest Samsung smartphones and electronics.' },
        { id: 'cm-4', name: 'QFX Cinemas', category: 'Entertainment', floor: 'Top Floor', logoUrl: 'https://picsum.photos/seed/qfx/100/100', description: 'The best movie watching experience.' },
    ],
    'city-centre': [
        { id: 'cc-1', name: 'Pizza Hut', category: 'Food & Beverage', floor: 'Third Floor', logoUrl: 'https://picsum.photos/seed/pizzahut/100/100', description: 'Pizzas, pastas, and more.' },
        { id: 'cc-2', name: 'Adidas', category: 'Fashion', floor: 'First Floor', logoUrl: 'https://picsum.photos/seed/adidas/100/100', description: 'Sportswear, shoes, and accessories.' },
        { id: 'cc-3', name: 'Apple Store (Authorized Reseller)', category: 'Electronics', floor: 'Second Floor', logoUrl: 'https://picsum.photos/seed/apple/100/100', description: 'Get your latest Apple products here.' },
        { id: 'cc-4', name: 'Funland', category: 'Entertainment', floor: 'Third Floor', logoUrl: 'https://picsum.photos/seed/funland/100/100', description: 'Gaming zone for all ages.' },
    ],
    'kl-tower': [
        { id: 'kl-1', name: 'Baskin Robbins', category: 'Food & Beverage', floor: 'Ground Floor', logoUrl: 'https://picsum.photos/seed/baskin/100/100', description: '31 flavors of ice cream.' },
        { id: 'kl-2', name: 'Miniso', category: 'Services', floor: 'First Floor', logoUrl: 'https://picsum.photos/seed/miniso/100/100', description: 'Affordable and quality lifestyle products.' },
        { id: 'kl-3', name: 'Dell Exclusive Store', category: 'Electronics', floor: 'Second Floor', logoUrl: 'https://picsum.photos/seed/dell/100/100', description: 'Laptops, desktops, and accessories from Dell.' },
        { id: 'kl-4', name: 'Big Movies', category: 'Entertainment', floor: 'Top Floor', logoUrl: 'https://picsum.photos/seed/bigmovies/100/100', description: 'Luxury cinema experience.' },
    ],
    'pokhara-trade-mall': [
        { id: 'ptm-1', name: 'Himalayan Java', category: 'Food & Beverage', floor: 'Ground Floor', logoUrl: 'https://picsum.photos/seed/java/100/100', description: 'Specialty coffee from the Himalayas.' },
        { id: 'ptm-2', name: 'Bata Shoes', category: 'Fashion', floor: 'First Floor', logoUrl: 'https://picsum.photos/seed/bata/100/100', description: 'Footwear for the entire family.' },
        { id: 'ptm-3', name: 'The Face Shop', category: 'Health & Beauty', floor: 'Ground Floor', logoUrl: 'https://picsum.photos/seed/faceshop/100/100', description: 'Korean beauty products.' },
        { id: 'ptm-4', name: 'Customer Service Desk', category: 'Services', floor: 'Ground Floor', logoUrl: 'https://picsum.photos/seed/service/100/100', description: 'Mall information and support.' },
    ]
};
