
import type { Mall, Shop } from './malls';
import { MALLS } from './malls';
import { SHOPS_DATA } from './shop-data';

export type ShopWithMall = Shop & {
    mallId: string;
    mallName: string;
    province: Mall['province'];
}

// Flatten the shop data and add mall/province info
export const SHOPS: ShopWithMall[] = MALLS.flatMap(mall => {
    const mallShops = SHOPS_DATA[mall.id] || [];
    return mallShops.map((shop, index) => ({
        ...shop,
        id: `${mall.id}-${shop.name.toLowerCase().replace(/\s+/g, '-')}-${index}`,
        mallId: mall.id,
        mallName: mall.name,
        province: mall.province,
    }));
});

    