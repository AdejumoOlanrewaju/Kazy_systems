export const laptops = [
    {
        id: 1,
        name: 'MacBook Pro 16',
        category: 'premium',
        price: 2499,
        oldPrice: 2799,
        image:
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=400&fit=crop&q=80',
        specs: 'M3 Pro, 18GB RAM, 512GB SSD',
        rating: 4.9,
        reviews: 234,
        inStock: true,
        tag: 'Best Seller',
        description:
            'The MacBook Pro 16" delivers outstanding power and performance for professionals. With the Apple M3 Pro chip, it handles demanding tasks like video editing, programming, and design with ease. Its stunning Retina display and all-day battery make it perfect for productivity and creativity.',
        features: [
            'Apple M3 Pro Chip',
            '18GB Unified Memory',
            '512GB SSD Storage',
            '16-inch Liquid Retina XDR Display',
            'Up to 22 hours battery life',
            'macOS Sonoma',
        ],
        warranty: '1-year Apple Limited Warranty with 90 days of free technical support',
        isDeal: true,
        dealBadge: 'Flash Sale',
        discount: 11
    },
    {
        id: 2,
        name: 'Dell XPS 15',
        category: 'premium',
        price: 1899,
        oldPrice: 2099,
        image:
            'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&h=400&fit=crop&q=80',
        specs: 'Intel i7, 16GB RAM, 1TB SSD',
        rating: 4.7,
        reviews: 189,
        inStock: true,
        tag: 'Hot Deal',

        description:
            'The Dell XPS 15 combines elegance and performance in one sleek machine. Designed for creators and professionals, it features a vibrant 4K display, long battery life, and powerful processing to handle all your multitasking needs.',
        features: [
            '13th Gen Intel Core i7 Processor',
            '16GB DDR5 RAM',
            '1TB SSD Storage',
            '15.6-inch InfinityEdge Display',
            'NVIDIA GeForce RTX 4050 GPU',
            'Backlit Keyboard and Fingerprint Reader',
        ],
        warranty: 's',
        isDeal: true,
        dealBadge: 'Limited Stock',
        discount: 10
    },
    {
        id: 3,
        name: 'HP Pavilion 14',
        category: 'budget',
        price: 699,
        oldPrice: 849,
        image:
            'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=400&fit=crop&q=80',
        specs: 'Ryzen 5, 8GB RAM, 256GB SSD',
        rating: 4.4,
        reviews: 156,
        inStock: true,
        tag: 'Budget Pick',
        description:
            'The HP Pavilion 14 is a reliable and affordable laptop for students and professionals. It’s lightweight, fast, and perfect for daily computing tasks like browsing, streaming, and document editing.',
        features: [
            'AMD Ryzen 5 Processor',
            '8GB DDR4 RAM',
            '256GB SSD Storage',
            '14-inch Full HD Display',
            'Long-lasting Battery',
            'Windows 11 Home',
        ],
        warranty: '1-year limited hardware warranty with 24/7 HP support',

    },
    {
        id: 4,
        name: 'Lenovo ThinkPad X1',
        category: 'business',
        price: 1599,
        oldPrice: 1799,
        image:
            'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&h=400&fit=crop&q=80',
        specs: 'Intel i7, 16GB RAM, 512GB SSD',
        rating: 4.8,
        reviews: 203,
        inStock: true,
        tag: 'Business',
        description:
            'The Lenovo ThinkPad X1 is built for professionals who demand reliability and security. Its durable design, long battery life, and enterprise-grade security make it the ideal choice for business users.',
        features: [
            'Intel Core i7 13th Gen',
            '16GB LPDDR5 RAM',
            '512GB SSD Storage',
            '14-inch 2K Anti-glare Display',
            'Fingerprint Reader and TPM 2.0 Security',
            'Rapid Charge Battery',
        ],
        warranty: '3-year Lenovo Premier Support with accidental damage protection',
    },
    {
        id: 5,
        name: 'ASUS ROG Strix G15',
        category: 'gaming',
        price: 1799,
        oldPrice: 1999,
        image:
            'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&h=400&fit=crop&q=80',
        specs: 'RTX 4060, 16GB RAM, 1TB SSD',
        rating: 4.6,
        reviews: 178,
        inStock: true,
        tag: 'Gaming',
        description:
            'The ASUS ROG Strix G15 is designed for serious gamers. With the latest NVIDIA RTX 4060 graphics and a high-refresh display, it delivers immersive gaming performance and smooth visuals.',
        features: [
            'NVIDIA GeForce RTX 4060 GPU',
            'AMD Ryzen 7 Processor',
            '16GB DDR5 RAM',
            '1TB PCIe SSD',
            '15.6-inch 240Hz Display',
            'RGB Backlit Keyboard',
        ],
        warranty: '2-year ASUS International Warranty with free accidental damage coverage (1 year)',
        isDeal: true,
        dealBadge: 'Weekend Deal',
        discount: 10
    },
    {
        id: 6,
        name: 'Microsoft Surface Laptop 5',
        category: 'premium',
        price: 1299,
        oldPrice: 1499,
        image:
            'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=500&h=400&fit=crop&q=80',
        specs: 'Intel i5, 16GB RAM, 512GB SSD',
        rating: 4.5,
        reviews: 142,
        inStock: true,
        tag: 'New Arrival',
        description:
            'The Surface Laptop 5 offers a blend of portability and performance. Perfect for students and professionals, it features a stunning touchscreen display and all-day battery life in a slim, elegant design.',
        features: [
            'Intel Core i5 12th Gen',
            '16GB LPDDR5 RAM',
            '512GB SSD Storage',
            '13.5-inch PixelSense Touchscreen',
            'Fast Charging and Lightweight Design',
            'Windows 11 Pre-installed',
        ],
        warranty: '1-year limited hardware warranty with Microsoft Complete option available',
    },
    {
        id: 7,
        name: 'Acer Aspire 5',
        category: 'budget',
        price: 549,
        oldPrice: 699,
        image:
            'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=500&h=400&fit=crop&q=80',
        specs: 'Intel i5, 8GB RAM, 512GB SSD',
        rating: 4.3,
        reviews: 98,
        inStock: true,
        tag: 'Value',
        description:
            'The Acer Aspire 5 is an affordable, no-nonsense laptop for daily use. It provides solid performance for browsing, office work, and media consumption while maintaining great battery life.',
        features: [
            'Intel Core i5 12th Gen',
            '8GB DDR4 RAM',
            '512GB SSD Storage',
            '15.6-inch Full HD Display',
            'Lightweight Design',
            'Wi-Fi 6 Connectivity',
        ],
        warranty: '1-year standard warranty with local Acer service support',
        isDeal: true,
        dealBadge: 'Best Value',
        discount: 21

    },
    {
        id: 8,
        name: 'Razer Blade 15',
        category: 'gaming',
        price: 2299,
        oldPrice: 2599,
        image:
            'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500&h=400&fit=crop&q=80',
        specs: 'RTX 4070, 32GB RAM, 1TB SSD',
        rating: 4.8,
        reviews: 167,
        inStock: true,
        tag: 'Pro Gaming',
        description:
            'The Razer Blade 15 is a premium gaming laptop built for performance and style. With the latest RTX 4070 GPU and ultra-smooth display, it’s perfect for both gaming and creative work.',
        features: [
            'NVIDIA GeForce RTX 4070 GPU',
            'Intel Core i9 13th Gen',
            '32GB DDR5 RAM',
            '1TB NVMe SSD',
            '15.6-inch QHD 240Hz Display',
            'Per-key RGB Lighting',
        ],
        warranty: '2-year Razer limited warranty with 1-year battery coverage',
    },
];

export const categories = ["premium", "budget", "business", "gaming"];
export const tags = [
  "Best Seller",
  "Hot Deal",
  "Budget Pick",
  "Business",
  "Gaming",
  "New Arrival",
  "Value",
  "Pro Gaming",
];
export const dealBadges = ["Flash Sale", "Limited Stock", "Weekend Deal", "Best Value"];