
import type { Mall, Shop } from './malls';
import { MALLS } from './malls';

export type ShopWithMall = Shop & {
    mallId: string;
    mallName: string;
    province: Mall['province'];
}

// Demo data for shops in different malls
const SHOPS_DATA: { [mallId: string]: Omit<Shop, 'id'>[] } = {
    'civil-mall': [
        { name: 'KFC', category: 'Food & Beverage', floor: 'Ground Floor', logoUrl: 'https://picsum.photos/seed/kfc/100/100', description: 'Finger Lickin\' Good chicken.' },
        { name: 'Levi\'s Store', category: 'Fashion', floor: 'First Floor', logoUrl: 'https://picsum.photos/seed/levis/100/100', description: 'Original and authentic jeanswear.' },
        { name: 'Samsung Plaza', category: 'Electronics', floor: 'Second Floor', logoUrl: 'https://picsum.photos/seed/samsung/100/100', description: 'Latest Samsung smartphones and electronics.' },
        { name: 'QFX Cinemas', category: 'Entertainment', floor: 'Top Floor', logoUrl: 'https://picsum.photos/seed/qfx/100/100', description: 'The best movie watching experience.' },
    ],
    'city-centre': [
        { name: 'Pizza Hut', category: 'Food & Beverage', floor: 'Third Floor', logoUrl: 'https://picsum.photos/seed/pizzahut/100/100', description: 'Pizzas, pastas, and more.' },
        { name: 'Adidas', category: 'Fashion', floor: 'First Floor', logoUrl: 'https://picsum.photos/seed/adidas/100/100', description: 'Sportswear, shoes, and accessories.' },
        { name: 'Apple Store (Authorized Reseller)', category: 'Electronics', floor: 'Second Floor', logoUrl: 'https://picsum.photos/seed/apple/100/100', description: 'Get your latest Apple products here.' },
        { name: 'Funland', category: 'Entertainment', floor: 'Third Floor', logoUrl: 'https://picsum.photos/seed/funland/100/100', description: 'Gaming zone for all ages.' },
    ],
    'kl-tower': [
        { name: 'Baskin Robbins', category: 'Food & Beverage', floor: 'Ground Floor', logoUrl: 'https://picsum.photos/seed/baskin/100/100', description: '31 flavors of ice cream.' },
        { name: 'Miniso', category: 'Services', floor: 'First Floor', logoUrl: 'https://picsum.photos/seed/miniso/100/100', description: 'Affordable and quality lifestyle products.' },
        { name: 'Dell Exclusive Store', category: 'Electronics', floor: 'Second Floor', logoUrl: 'https://picsum.photos/seed/dell/100/100', description: 'Laptops, desktops, and accessories from Dell.' },
        { name: 'Big Movies', category: 'Entertainment', floor: 'Top Floor', logoUrl: 'https://picsum.photos/seed/bigmovies/100/100', description: 'Luxury cinema experience.' },
    ],
    'pokhara-trade-mall': [
        { name: 'Himalayan Java', category: 'Food & Beverage', floor: 'Ground Floor', logoUrl: 'https://picsum.photos/seed/java/100/100', description: 'Specialty coffee from the Himalayas.' },
        { name: 'Bata Shoes', category: 'Fashion', floor: 'First Floor', logoUrl: 'https://picsum.photos/seed/bata/100/100', description: 'Footwear for the entire family.' },
        { name: 'The Face Shop', category: 'Health & Beauty', floor: 'Ground Floor', logoUrl: 'https://picsum.photos/seed/faceshop/100/100', description: 'Korean beauty products.' },
        { name: 'Customer Service Desk', category: 'Services', floor: 'Ground Floor', logoUrl: 'https://picsum.photos/seed/service/100/100', description: 'Mall information and support.' },
    ]
};

// Flatten the shop data and add mall/province info
export const SHOPS: ShopWithMall[] = MALLS.flatMap(mall => {
    const mallShops = SHOPS_DATA[mall.id] || [];
    return mallShops.map((shop, index) => ({
        ...shop,
        id: `${mall.id}-${index}`,
        mallId: mall.id,
        mallName: mall.name,
        province: mall.province,
    }));
});
