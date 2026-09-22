export const laptops = [
    {
        dbID: 1,
        name: 'HP EliteBook 840 G6',
        category: 'business',
        price: 420000,
        oldPrice: 485000,
        images: [
            'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&h=600&fit=crop&q=80'
        ],
        specs: 'Intel Core i5 8th Gen, 16GB RAM, 256GB SSD',
        rating: 4.5,
        reviews: 126,
        inStock: true,
        tag: 'Popular',
        description:
            'A reliable business laptop with strong everyday performance, a premium build, and enough power for programming, office work, browsing, and multitasking.',
        features: [
            'Intel Core i5 8th Gen',
            '16GB DDR4 RAM',
            '256GB SSD Storage',
            '14-inch Full HD Display',
            'Backlit Keyboard',
            'Fingerprint Reader',
            'Wi-Fi 5 Connectivity'
        ],
        warranty: '6-month seller warranty',
        isDeal: true,
        dealBadge: 'Popular Choice',
        discount: 13
    },

    {
        dbID: 2,
        name: 'Dell Latitude 5410',
        category: 'business',
        price: 350000,
        oldPrice: 410000,
        images: [
            'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop&q=80'
        ],
        specs: 'Intel Core i5 10th Gen, 8GB RAM, 256GB SSD',
        rating: 4.4,
        reviews: 112,
        inStock: true,
        tag: 'Best Seller',
        description:
            'The Dell Latitude 5410 is a dependable business laptop designed for students, professionals, developers, and remote workers who need reliable everyday performance.',
        features: [
            'Intel Core i5 10th Gen',
            '8GB DDR4 RAM',
            '256GB SSD Storage',
            '14-inch Full HD Display',
            'USB-C Connectivity',
            'HD Webcam',
            'Wi-Fi 6 Connectivity'
        ],
        warranty: '6-month seller warranty',
        isDeal: true,
        dealBadge: 'Best Seller',
        discount: 15
    },

    {
        dbID: 3,
        name: 'Lenovo ThinkPad T480',
        category: 'business',
        price: 290000,
        oldPrice: 345000,
        images: [
            'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop&q=80'
        ],
        specs: 'Intel Core i5 8th Gen, 16GB RAM, 256GB SSD',
        rating: 4.6,
        reviews: 184,
        inStock: true,
        tag: 'Top Rated',
        description:
            'A durable ThinkPad built for productivity, programming, school work, and business use. The T480 is well known for its comfortable keyboard and practical design.',
        features: [
            'Intel Core i5 8th Gen',
            '16GB DDR4 RAM',
            '256GB SSD Storage',
            '14-inch Full HD Display',
            'Backlit Keyboard',
            'Fingerprint Reader',
            'USB-C Thunderbolt Support'
        ],
        warranty: '6-month seller warranty',
        isDeal: true,
        dealBadge: 'Top Rated',
        discount: 16
    },

    {
        dbID: 4,
        name: 'HP 15s',
        category: 'budget',
        price: 465000,
        oldPrice: 520000,
        images: [
            'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&h=600&fit=crop&q=80'
        ],
        specs: 'Intel Core i5 12th Gen, 8GB RAM, 512GB SSD',
        rating: 4.3,
        reviews: 96,
        inStock: true,
        tag: 'Value',
        description:
            'A practical everyday laptop for students, office workers, freelancers, and home users. It offers modern Intel performance and fast SSD storage at a reasonable price.',
        features: [
            'Intel Core i5 12th Gen',
            '8GB DDR4 RAM',
            '512GB SSD Storage',
            '15.6-inch Full HD Display',
            'HD Webcam',
            'Numeric Keyboard',
            'Wi-Fi 5 Connectivity'
        ],
        warranty: '1-year standard warranty',
        isDeal: true,
        dealBadge: 'Best Value',
        discount: 11
    },

    {
        dbID: 5,
        name: 'Lenovo IdeaPad 3',
        category: 'budget',
        price: 430000,
        oldPrice: 495000,
        images: [
            'https://images.unsplash.com/photo-1593642634367-d91a135587b5?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800&h=600&fit=crop&q=80'
        ],
        specs: 'AMD Ryzen 5, 8GB RAM, 512GB SSD',
        rating: 4.4,
        reviews: 87,
        inStock: true,
        tag: 'Student Pick',
        description:
            'An affordable Lenovo laptop designed for students and everyday users. The Ryzen processor and SSD provide responsive performance for browsing, school work, programming, and entertainment.',
        features: [
            'AMD Ryzen 5 Processor',
            '8GB DDR4 RAM',
            '512GB SSD Storage',
            '15.6-inch Full HD Display',
            'Numeric Keyboard',
            'HD Webcam',
            'Wi-Fi 6 Connectivity'
        ],
        warranty: '1-year standard warranty',
        isDeal: true,
        dealBadge: 'Student Pick',
        discount: 13
    },

    {
        dbID: 6,
        name: 'Dell Latitude 7400',
        category: 'premium',
        price: 390000,
        oldPrice: 450000,
        images: [
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&h=600&fit=crop&q=80'
        ],
        specs: 'Intel Core i5 8th Gen, 16GB RAM, 512GB SSD',
        rating: 4.5,
        reviews: 73,
        inStock: true,
        tag: 'Premium',
        description:
            'A slim and professional Dell business laptop offering excellent portability, solid performance, and a premium build for professionals and developers.',
        features: [
            'Intel Core i5 8th Gen',
            '16GB DDR4 RAM',
            '512GB SSD Storage',
            '14-inch Full HD Display',
            'Backlit Keyboard',
            'Fingerprint Reader',
            'USB-C Charging'
        ],
        warranty: '6-month seller warranty',
        isDeal: true,
        dealBadge: 'Premium Pick',
        discount: 13
    },

    {
        dbID: 7,
        name: 'HP ProBook 450 G9',
        category: 'business',
        price: 620000,
        oldPrice: 700000,
        images: [
            'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?w=800&h=600&fit=crop&q=80'
        ],
        specs: 'Intel Core i5 12th Gen, 16GB RAM, 512GB SSD',
        rating: 4.6,
        reviews: 61,
        inStock: true,
        tag: 'Professional',
        description:
            'A modern business laptop built for professionals who need dependable performance for development, productivity, business applications, and multitasking.',
        features: [
            'Intel Core i5 12th Gen',
            '16GB DDR4 RAM',
            '512GB NVMe SSD',
            '15.6-inch Full HD Display',
            'Fingerprint Reader',
            'Backlit Keyboard',
            'Wi-Fi 6 Connectivity'
        ],
        warranty: '1-year standard warranty',
        isDeal: false,
        dealBadge: 'Professional Choice',
        discount: 11
    },

    {
        dbID: 8,
        name: 'ASUS VivoBook 15',
        category: 'budget',
        price: 580000,
        oldPrice: 650000,
        images: [
            'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=600&fit=crop&q=80'
        ],
        specs: 'Intel Core i5 13th Gen, 16GB RAM, 512GB SSD',
        rating: 4.4,
        reviews: 54,
        inStock: true,
        tag: 'Modern',
        description:
            'A stylish everyday laptop with modern hardware, fast storage, and enough memory for multitasking, development, office work, and entertainment.',
        features: [
            'Intel Core i5 13th Gen',
            '16GB RAM',
            '512GB SSD Storage',
            '15.6-inch Full HD Display',
            'Backlit Keyboard',
            'USB-C Connectivity',
            'Wi-Fi 6E Connectivity'
        ],
        warranty: '1-year ASUS warranty',
        isDeal: true,
        dealBadge: 'Modern Choice',
        discount: 11
    },

    {
        dbID: 9,
        name: 'Acer Aspire 5',
        category: 'budget',
        price: 550000,
        oldPrice: 630000,
        images: [
            'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1593642634367-d91a135587b5?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop&q=80'
        ],
        specs: 'Intel Core i5 12th Gen, 8GB RAM, 512GB SSD',
        rating: 4.3,
        reviews: 98,
        inStock: true,
        tag: 'Value',
        description:
            'The Acer Aspire 5 is an affordable, no-nonsense laptop for daily use. It provides solid performance for browsing, office work, programming, and media consumption.',
        features: [
            'Intel Core i5 12th Gen',
            '8GB DDR4 RAM',
            '512GB SSD Storage',
            '15.6-inch Full HD Display',
            'Lightweight Design',
            'Wi-Fi 6 Connectivity',
            'USB-C Port'
        ],
        warranty: '1-year standard warranty with local Acer service support',
        isDeal: true,
        dealBadge: 'Best Value',
        discount: 13
    },

    {
        dbID: 10,
        name: 'HP Victus 15',
        category: 'gaming',
        price: 1520000,
        oldPrice: 1680000,
        images: [
            'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?w=800&h=600&fit=crop&q=80'
        ],
        specs: 'Intel Core i5 13th Gen, 16GB RAM, 512GB SSD, RTX 4050',
        rating: 4.7,
        reviews: 42,
        inStock: true,
        tag: 'Gaming',
        description:
            'A powerful gaming laptop designed for demanding games, software development, creative applications, and other workloads that require dedicated graphics performance.',
        features: [
            'Intel Core i5 13th Gen',
            '16GB DDR4 RAM',
            '512GB NVMe SSD',
            'NVIDIA GeForce RTX 4050 6GB',
            '15.6-inch Full HD 144Hz Display',
            'Backlit Keyboard',
            'Wi-Fi 6 Connectivity'
        ],
        warranty: '1-year HP warranty',
        isDeal: true,
        dealBadge: 'Gaming Deal',
        discount: 10
    }
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