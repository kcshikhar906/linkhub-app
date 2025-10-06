
import type { Shop } from './malls';

// Using Omit to avoid having to provide an 'id' for each shop, as it will be generated dynamically.
type ShopData = Omit<Shop, 'id'>;

export const SHOPS_DATA: { [mallId: string]: ShopData[] } = {
    'civil-mall': [
        { 
            name: 'KFC', 
            category: 'Food & Beverage', 
            floor: 'Ground Floor', 
            logoUrl: 'https://picsum.photos/seed/kfc/100/100', 
            description: 'Iconic American fast food chain known for its fried chicken.',
            phone: '01-4242888',
            openingHours: '10:00 AM - 10:00 PM',
            website: 'https://www.kfc.com.np'
        },
        { 
            name: 'Levi\'s Store', 
            category: 'Fashion', 
            floor: 'First Floor', 
            logoUrl: 'https://picsum.photos/seed/levis/100/100', 
            description: 'Original and authentic jeanswear, offering a wide range of denim and casual wear.',
            openingHours: '10:00 AM - 8:00 PM'
        },
        { 
            name: 'Samsung Plaza', 
            category: 'Electronics', 
            floor: 'Second Floor', 
            logoUrl: 'https://picsum.photos/seed/samsung/100/100', 
            description: 'Official retailer for Samsung smartphones, TVs, and home appliances.',
            website: 'https://samsung.com/np'
        },
        { 
            name: 'QFX Cinemas', 
            category: 'Entertainment', 
            floor: 'Top Floor', 
            logoUrl: 'https://picsum.photos/seed/qfx/100/100', 
            description: 'The best movie watching experience with multiple screens and comfortable seating.',
            website: 'https://www.qfxcinemas.com'
        },
    ],
    'city-centre': [
        { 
            name: 'Pizza Hut', 
            category: 'Food & Beverage', 
            floor: 'Third Floor (Food Court)', 
            logoUrl: 'https://picsum.photos/seed/pizzahut/100/100', 
            description: 'World-famous for its Pan Pizza, pastas, and a variety of other Italian-American dishes.',
            phone: '01-4011567',
            openingHours: '11:00 AM - 9:00 PM',
        },
        { 
            name: 'Adidas', 
            category: 'Fashion', 
            floor: 'First Floor', 
            logoUrl: 'https://picsum.photos/seed/adidas/100/100', 
            description: 'A global leader in the sporting goods industry, offering a broad portfolio of footwear, apparel and hardware for sport and lifestyle.',
            website: 'https://www.adidas.com'
        },
        { 
            name: 'OLED Store (LG)', 
            category: 'Electronics', 
            floor: 'Second Floor', 
            logoUrl: 'https://picsum.photos/seed/lg/100/100', 
            description: 'Authorized reseller for LG electronics, specializing in OLED TVs and home entertainment systems.',
        },
        { 
            name: 'Funland', 
            category: 'Entertainment', 
            floor: 'Third Floor', 
            logoUrl: 'https://picsum.photos/seed/funland/100/100', 
            description: 'A family entertainment center with a variety of arcade games, VR experiences, and activities for all ages.' 
        },
    ],
    'kl-tower': [
        { 
            name: 'Baskin Robbins', 
            category: 'Food & Beverage', 
            floor: 'Ground Floor', 
            logoUrl: 'https://picsum.photos/seed/baskin/100/100', 
            description: 'The world\'s largest chain of ice cream specialty shops, offering 31 flavors.',
            openingHours: '10:00 AM - 9:00 PM',
        },
        { 
            name: 'Miniso', 
            category: 'Department Store', 
            floor: 'First Floor', 
            logoUrl: 'https://picsum.photos/seed/miniso/100/100', 
            description: 'Japanese-inspired lifestyle product retailer, offering high quality household goods, cosmetics and food at affordable prices.',
        },
        { 
            name: 'Dell Exclusive Store', 
            category: 'Electronics', 
            floor: 'Second Floor', 
            logoUrl: 'https://picsum.photos/seed/dell/100/100', 
            description: 'Laptops, desktops, and accessories from Dell with official warranty and support.',
        },
        { 
            name: 'Big Movies', 
            category: 'Entertainment', 
            floor: 'Top Floor', 
            logoUrl: 'https://picsum.photos/seed/bigmovies/100/100', 
            description: 'Luxury cinema experience with comfortable seating and premium sound.',
            website: 'https://bigmovies.com.np'
        },
    ],
    'pokhara-trade-mall': [
        { 
            name: 'Himalayan Java', 
            category: 'Food & Beverage', 
            floor: 'Ground Floor', 
            logoUrl: 'https://picsum.photos/seed/java/100/100', 
            description: 'Specialty coffee from the Himalayas, promoting Nepali coffee culture.',
            openingHours: '8:00 AM - 8:00 PM',
        },
        { 
            name: 'Bata Shoes', 
            category: 'Fashion', 
            floor: 'First Floor', 
            logoUrl: 'https://picsum.photos/seed/bata/100/100', 
            description: 'One of the world\'s leading shoemakers, designing stylish and comfortable footwear for the entire family.',
        },
        { 
            name: 'The Face Shop', 
            category: 'Health & Beauty', 
            floor: 'Ground Floor', 
            logoUrl: 'https://picsum.photos/seed/faceshop/100/100', 
            description: 'A popular Korean beauty brand that offers a wide range of skincare and makeup products made with natural ingredients.'
        },
        { 
            name: 'Stationery World', 
            category: 'Books & Stationery', 
            floor: 'Second Floor', 
            logoUrl: 'https://picsum.photos/seed/stationery/100/100', 
            description: 'A one-stop-shop for all your office and school stationery needs.'
        },
    ]
};

    