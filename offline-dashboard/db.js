/**
 * FarmDirect DB - IndexedDB Data Storage Layer
 * Manages persistent offline storage for Products, Orders, Inventory Logs, and Settings.
 */

const DB_NAME = 'FarmDirectDB';
const DB_VERSION = 1;

let dbInstance = null;

/**
 * Open and initialize the IndexedDB instance
 */
function openDB() {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      return resolve(dbInstance);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 1. Products Store
      if (!db.objectStoreNames.contains('products')) {
        const productStore = db.createObjectStore('products', { keyPath: 'id' });
        productStore.createIndex('category', 'category', { unique: false });
        productStore.createIndex('name', 'name', { unique: false });
        productStore.createIndex('isAvailable', 'isAvailable', { unique: false });
        productStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        productStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      // 2. Orders Store
      if (!db.objectStoreNames.contains('orders')) {
        const orderStore = db.createObjectStore('orders', { keyPath: 'id' });
        orderStore.createIndex('status', 'status', { unique: false });
        orderStore.createIndex('createdAt', 'createdAt', { unique: false });
        orderStore.createIndex('isDemo', 'isDemo', { unique: false });
        orderStore.createIndex('syncStatus', 'syncStatus', { unique: false });
      }

      // 3. Inventory Logs Store
      if (!db.objectStoreNames.contains('inventory_logs')) {
        const invStore = db.createObjectStore('inventory_logs', { keyPath: 'id' });
        invStore.createIndex('productId', 'productId', { unique: false });
        invStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // 4. Settings Store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = async (event) => {
      dbInstance = event.target.result;

      // Handle connection close or errors
      dbInstance.onversionchange = () => {
        dbInstance.close();
        dbInstance = null;
      };

      // Check if initial seeding is needed
      try {
        await checkAndSeedData(dbInstance);
      } catch (err) {
        console.warn('Initial seeding error:', err);
      }

      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event.target.error);
      reject(new Error(`Failed to open IndexedDB: ${event.target.error?.message || 'Unknown error'}`));
    };

    request.onblocked = () => {
      console.warn('IndexedDB database open blocked by another tab');
    };
  });
}

/**
 * Check if the database is newly created and populate default sample data
 */
async function checkAndSeedData(db) {
  const products = await getAllRecords('products', db);
  if (products.length === 0) {
    console.log('Seeding initial FarmDirect sample data...');
    await loadInitialSampleData(db);
  } else {
    // Automatically backfill fresh matching images for existing products that had placeholder icons
    try {
      const tx = db.transaction(['products'], 'readwrite');
      const store = tx.objectStore('products');
      const imageMap = {};
      INITIAL_PRODUCTS.forEach(p => {
        imageMap[p.id] = p.image;
        imageMap[p.name] = p.image;
      });

      for (const prod of products) {
        if (!prod.image || prod.image.length < 10) {
          const matchingImg = imageMap[prod.id] || imageMap[prod.name];
          if (matchingImg) {
            prod.image = matchingImg;
            store.put(prod);
          }
        }
      }

      // Add any additional products from the expanded 20-product harvest catalog
      const existingIds = new Set(products.map(p => p.id));
      for (const p of INITIAL_PRODUCTS) {
        if (!existingIds.has(p.id)) {
          store.put(p);
        }
      }
    } catch (e) {
      console.warn('Product upgrade backfill error:', e);
    }
  }
}

/**
 * Initial Sample Data - Pollachi & Coimbatore agricultural context with verified fresh images
 */
const INITIAL_PRODUCTS = [
  {
    id: 'prod_banana_04',
    name: 'Poovan Bananas (பூவன் வாழைப்பழம்)',
    category: 'Fruits',
    price: 50,
    quantity: 25,
    unit: 'dozen',
    minStockThreshold: 5,
    harvestDate: new Date().toISOString().split('T')[0],
    notes: 'Naturally tree-ripened, organic compost fed, sweet and tangy flavor.',
    image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&auto=format&fit=crop',
    isAvailable: true,
    syncStatus: 'local',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_onion_02',
    name: 'Shallots / Small Onions (சின்ன வெங்காயம்)',
    category: 'Vegetables',
    price: 40,
    quantity: 80,
    unit: 'kg',
    minStockThreshold: 20,
    harvestDate: new Date(Date.now() - 48 * 3600 * 1000).toISOString().split('T')[0],
    notes: 'Cured red shallots, dried in thatched shed, high pungency.',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop',
    isAvailable: true,
    syncStatus: 'local',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_potato_03',
    name: 'Ooty Mountain Potatoes (உருளைக்கிழங்கு)',
    category: 'Tubers',
    price: 25,
    quantity: 60,
    unit: 'kg',
    minStockThreshold: 15,
    harvestDate: new Date(Date.now() - 72 * 3600 * 1000).toISOString().split('T')[0],
    notes: 'Firm hill potatoes, zero chemical residue, high starch content.',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop',
    isAvailable: true,
    syncStatus: 'local',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_spinach_05',
    name: 'Palak Greens (பசலைக் கீரை)',
    category: 'Greens',
    price: 20,
    quantity: 30,
    unit: 'bunch',
    minStockThreshold: 10,
    harvestDate: new Date().toISOString().split('T')[0],
    notes: 'Crisp green leaves, fresh morning cut with moist root base.',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop',
    isAvailable: true,
    syncStatus: 'local',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_tomato_01',
    name: 'Country Tomatoes (நாட்டு தக்காளி)',
    category: 'Vegetables',
    price: 30,
    quantity: 50,
    unit: 'kg',
    minStockThreshold: 15,
    harvestDate: new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0],
    notes: 'Sun-ripened, naturally acidic, hand-picked morning harvest from block A.',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop',
    isAvailable: true,
    syncStatus: 'local',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_coconut_06',
    name: 'Pollachi Sweet Tender Coconut (இளநீர்)',
    category: 'Fruits',
    price: 45,
    quantity: 75,
    unit: 'piece',
    minStockThreshold: 15,
    harvestDate: new Date().toISOString().split('T')[0],
    notes: 'Tall variety tender coconut, full of natural electrolytes and over 450ml sweet water.',
    image: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=600&auto=format&fit=crop',
    isAvailable: true,
    syncStatus: 'local',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_redbanana_07',
    name: 'Anaimalai Red Bananas (செவ்வாழை)',
    category: 'Fruits',
    price: 68,
    quantity: 35,
    unit: 'kg',
    minStockThreshold: 10,
    harvestDate: new Date().toISOString().split('T')[0],
    notes: 'Nutrient-dense native red bananas ripened naturally without any calcium carbide.',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop',
    isAvailable: true,
    syncStatus: 'local',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_coconutoil_08',
    name: 'Wood-Pressed Virgin Coconut Oil (மரச்செக்கு எண்ணெய்)',
    category: 'Other',
    price: 310,
    quantity: 20,
    unit: 'litre',
    minStockThreshold: 5,
    harvestDate: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
    notes: 'Cold wood-pressed virgin coconut oil from sun-dried premium copra.',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop',
    isAvailable: true,
    syncStatus: 'local',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_carrot_09',
    name: 'Hill Country Carrots (நாட்டு கேரட்)',
    category: 'Vegetables',
    price: 45,
    quantity: 40,
    unit: 'kg',
    minStockThreshold: 15,
    harvestDate: new Date().toISOString().split('T')[0],
    notes: 'Sweet crunchy farm carrots pulled fresh from loose sandy red loam.',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop',
    isAvailable: true,
    syncStatus: 'local',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_guava_10',
    name: 'Fresh Pink Guava (நாட்டு கொய்யாப்பழம்)',
    category: 'Fruits',
    price: 60,
    quantity: 30,
    unit: 'kg',
    minStockThreshold: 10,
    harvestDate: new Date().toISOString().split('T')[0],
    notes: 'Crisp pink-hearted organic guavas, naturally sweet and aromatic.',
    image: 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=600&auto=format&fit=crop',
    isAvailable: true,
    syncStatus: 'local',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_okra_11',
    name: 'Native Lady\'s Finger / Okra (வெண்டைக்காய்)',
    category: 'Vegetables',
    price: 36,
    quantity: 35,
    unit: 'kg',
    minStockThreshold: 10,
    harvestDate: new Date().toISOString().split('T')[0],
    notes: 'Tender young green okras, freshly snapped this morning.',
    image: 'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=600&auto=format&fit=crop',
    isAvailable: true,
    syncStatus: 'local',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_ginger_12',
    name: 'Fresh Farm Ginger (நாட்டு இஞ்சி)',
    category: 'Vegetables',
    price: 120,
    quantity: 25,
    unit: 'kg',
    minStockThreshold: 5,
    harvestDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    notes: 'Fragrant aromatic native ginger rhizomes, naturally washed and cured.',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop',
    isAvailable: true,
    syncStatus: 'local',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_chilli_13',
    name: 'Spicy Green Chillies (நாட்டு பச்சை மிளகாய்)',
    category: 'Vegetables',
    price: 40,
    quantity: 20,
    unit: 'kg',
    minStockThreshold: 5,
    harvestDate: new Date().toISOString().split('T')[0],
    notes: 'Crisp farm-fresh green chillies with authentic sharp heat.',
    image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop',
    isAvailable: true,
    syncStatus: 'local',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_drumstick_14',
    name: 'Fresh Drumsticks (பொள்ளாச்சி முருங்கைக்காய்)',
    category: 'Vegetables',
    price: 50,
    quantity: 30,
    unit: 'kg',
    minStockThreshold: 10,
    harvestDate: new Date().toISOString().split('T')[0],
    notes: 'Long tender green drumsticks packed with sweet flavorful pulp.',
    image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=600&auto=format&fit=crop',
    isAvailable: true,
    syncStatus: 'local',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_amla_15',
    name: 'Amla / Indian Gooseberry (நாட்டு நெல்லிக்காய்)',
    category: 'Fruits',
    price: 80,
    quantity: 25,
    unit: 'kg',
    minStockThreshold: 5,
    harvestDate: new Date().toISOString().split('T')[0],
    notes: 'Vitamin C rich wild farm gooseberries, harvested at peak maturity.',
    image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600&auto=format&fit=crop',
    isAvailable: true,
    syncStatus: 'local',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_turmeric_16',
    name: 'Organic Raw Turmeric (பச்சை மஞ்சள் கிழங்கு)',
    category: 'Other',
    price: 95,
    quantity: 30,
    unit: 'kg',
    minStockThreshold: 10,
    harvestDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    notes: 'Freshly dug bright golden turmeric rhizomes with high curcumin.',
    image: 'https://images.unsplash.com/photo-1615485290176-0bf160a08e0a?w=600&auto=format&fit=crop',
    isAvailable: true,
    syncStatus: 'local',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_brinjal_17',
    name: 'Country Brinjal / Eggplant (நாட்டு கத்தரிக்காய்)',
    category: 'Vegetables',
    price: 42,
    quantity: 35,
    unit: 'kg',
    minStockThreshold: 10,
    harvestDate: new Date().toISOString().split('T')[0],
    notes: 'Tender striped green-purple country brinjals with minimal seeds.',
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&auto=format&fit=crop',
    isAvailable: true,
    syncStatus: 'local',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_garlic_18',
    name: 'Mountain Garlic Bulbs (மலைப் பூண்டு)',
    category: 'Vegetables',
    price: 180,
    quantity: 30,
    unit: 'kg',
    minStockThreshold: 5,
    harvestDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    notes: 'Pungent cured hill garlic bulbs with rich medicinal properties.',
    image: 'https://images.unsplash.com/photo-1588615419957-bf66d53c6b49?w=600&auto=format&fit=crop',
    isAvailable: true,
    syncStatus: 'local',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_beetroot_19',
    name: 'Organic Garden Beetroot (நாட்டு பீட்ரூட்)',
    category: 'Vegetables',
    price: 40,
    quantity: 35,
    unit: 'kg',
    minStockThreshold: 10,
    harvestDate: new Date().toISOString().split('T')[0],
    notes: 'Deep ruby-red sweet organic beetroots harvested with tender tops.',
    image: 'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?w=600&auto=format&fit=crop',
    isAvailable: true,
    syncStatus: 'local',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_moringa_20',
    name: 'Fresh Moringa Leaves (முருங்கைக்கீரை)',
    category: 'Greens',
    price: 25,
    quantity: 30,
    unit: 'bunch',
    minStockThreshold: 10,
    harvestDate: new Date().toISOString().split('T')[0],
    notes: 'Sun-plucked tender green moringa leaves, packed with natural iron.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop',
    isAvailable: true,
    syncStatus: 'local',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_ORDERS = [
  {
    id: 'ORD-5101',
    customerName: 'Kavitha Sundaram',
    customerPhone: '+91 98421 54321',
    customerAddress: '14, Mahalingapuram Main Road, Pollachi',
    items: [
      { productId: 'prod_tomato_01', productName: 'Country Tomatoes (நாட்டு தக்காளி)', quantity: 5, unit: 'kg', unitPrice: 30, subtotal: 150 },
      { productId: 'prod_spinach_05', productName: 'Palak Greens (பசலைக் கீரை)', quantity: 2, unit: 'bunch', unitPrice: 20, subtotal: 40 }
    ],
    totalAmount: 190,
    status: 'pending',
    isDemo: true,
    notes: 'Please pack in eco-friendly newspaper wraps.',
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    syncStatus: 'local'
  },
  {
    id: 'ORD-5102',
    customerName: 'Priya Sundaram',
    customerPhone: '+91 94432 98765',
    customerAddress: '8/2B, Aliyar Nagar Colony, Pollachi',
    items: [
      { productId: 'prod_onion_02', productName: 'Shallots / Small Onions (சின்ன வெங்காயம்)', quantity: 10, unit: 'kg', unitPrice: 40, subtotal: 400 },
      { productId: 'prod_potato_03', productName: 'Ooty Mountain Potatoes (உருளைக்கிழங்கு)', quantity: 5, unit: 'kg', unitPrice: 25, subtotal: 125 }
    ],
    totalAmount: 525,
    status: 'accepted',
    isDemo: true,
    notes: 'Call before dispatch.',
    createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    syncStatus: 'local'
  },
  {
    id: 'ORD-5103',
    customerName: 'Green Valley Kitchen',
    customerPhone: '+91 97500 11223',
    customerAddress: 'Commercial Kitchen #4, Bypass Road, Udumalpet',
    items: [
      { productId: 'prod_banana_04', productName: 'Poovan Bananas (பூவன் வாழைப்பழம்)', quantity: 6, unit: 'dozen', unitPrice: 50, subtotal: 300 },
      { productId: 'prod_tomato_01', productName: 'Country Tomatoes (நாட்டு தக்காளி)', quantity: 10, unit: 'kg', unitPrice: 30, subtotal: 300 }
    ],
    totalAmount: 600,
    status: 'packed',
    isDemo: true,
    notes: 'Crate packed and ready for afternoon pickup.',
    createdAt: new Date(Date.now() - 300 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    syncStatus: 'local'
  },
  {
    id: 'ORD-5104',
    customerName: 'Anand Bhavan Mess',
    customerPhone: '+91 98940 33445',
    customerAddress: 'Market Road Junction, Pollachi Town',
    items: [
      { productId: 'prod_potato_03', productName: 'Ooty Mountain Potatoes (உருளைக்கிழங்கு)', quantity: 20, unit: 'kg', unitPrice: 25, subtotal: 500 },
      { productId: 'prod_onion_02', productName: 'Shallots / Small Onions (சின்ன வெங்காயம்)', quantity: 20, unit: 'kg', unitPrice: 40, subtotal: 800 }
    ],
    totalAmount: 1300,
    status: 'completed',
    isDemo: true,
    notes: 'Payment settled in cash upon farm-gate delivery.',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    syncStatus: 'local'
  },
  {
    id: 'ORD-5105',
    customerName: 'Hotel Vasantham Catering',
    customerPhone: '+91 94860 77889',
    customerAddress: 'Coimbatore Road, Kinathukadavu',
    items: [
      { productId: 'prod_tomato_01', productName: 'Country Tomatoes (நாட்டு தக்காளி)', quantity: 100, unit: 'kg', unitPrice: 30, subtotal: 3000 }
    ],
    totalAmount: 3000,
    status: 'rejected',
    isDemo: true,
    notes: 'Order rejected: Requested quantity exceeds current field harvest availability.',
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 34 * 3600 * 1000).toISOString(),
    syncStatus: 'local'
  }
];

const INITIAL_INVENTORY_LOGS = [
  {
    id: 'log_seed_1',
    productId: 'prod_tomato_01',
    productName: 'Country Tomatoes (நாட்டு தக்காளி)',
    previousStock: 0,
    newStock: 50,
    delta: +50,
    unit: 'kg',
    reason: 'Initial harvest recording from Block A',
    timestamp: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'log_seed_2',
    productId: 'prod_onion_02',
    productName: 'Shallots / Small Onions (சின்ன வெங்காயம்)',
    previousStock: 0,
    newStock: 80,
    delta: +80,
    unit: 'kg',
    reason: 'Shed cured batch intake',
    timestamp: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'log_seed_3',
    productId: 'prod_potato_03',
    productName: 'Ooty Mountain Potatoes (உருளைக்கிழங்கு)',
    previousStock: 0,
    newStock: 60,
    delta: +60,
    unit: 'kg',
    reason: 'Harvest crate registration',
    timestamp: new Date(Date.now() - 6 * 86400000).toISOString()
  },
  {
    id: 'log_seed_4',
    productId: 'prod_banana_04',
    productName: 'Poovan Bananas (பூவன் வாழைப்பழம்)',
    previousStock: 0,
    newStock: 25,
    delta: +25,
    unit: 'dozen',
    reason: 'Tree-ripened bunches harvest',
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'log_seed_5',
    productId: 'prod_spinach_05',
    productName: 'Palak Greens (பசலைக் கீரை)',
    previousStock: 0,
    newStock: 30,
    delta: +30,
    unit: 'bunch',
    reason: 'Fresh morning bed clipping',
    timestamp: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'log_seed_6',
    productId: 'prod_onion_02',
    productName: 'Shallots / Small Onions (சின்ன வெங்காயம்)',
    previousStock: 90,
    newStock: 80,
    delta: -10,
    unit: 'kg',
    reason: 'Stock reserved for Order ORD-5102',
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString()
  },
  {
    id: 'log_seed_7',
    productId: 'prod_potato_03',
    productName: 'Ooty Mountain Potatoes (உருளைக்கிழங்கு)',
    previousStock: 65,
    newStock: 60,
    delta: -5,
    unit: 'kg',
    reason: 'Stock reserved for Order ORD-5102',
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString()
  }
];

const INITIAL_SETTINGS = [
  { key: 'farmName', value: 'Thennam Thoppu Natural Farm' },
  { key: 'farmerName', value: 'Murugan Palanisamy' },
  { key: 'location', value: 'Aliyar Road, Pollachi, Tamil Nadu' },
  { key: 'phone', value: '+91 94421 88990' },
  { key: 'currency', value: '₹' },
  { key: 'lowStockAlerts', value: true },
  { key: 'autoReserveStock', value: true },
  { key: 'installedDate', value: new Date().toISOString() }
];

/**
 * Load initial sample dataset into stores
 */
async function loadInitialSampleData(db) {
  const targetDb = db || (await openDB());

  // Products
  for (const prod of INITIAL_PRODUCTS) {
    await putRecord('products', prod, targetDb);
  }

  // Orders
  for (const ord of INITIAL_ORDERS) {
    await putRecord('orders', ord, targetDb);
  }

  // Logs
  for (const log of INITIAL_INVENTORY_LOGS) {
    await putRecord('inventory_logs', log, targetDb);
  }

  // Settings
  for (const set of INITIAL_SETTINGS) {
    await putRecord('settings', set, targetDb);
  }
}

/**
 * Generic IndexedDB Helpers
 */
function getAllRecords(storeName, dbRef = null) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = dbRef || (await openDB());
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = (e) => reject(e.target.error);
    } catch (err) {
      reject(err);
    }
  });
}

function getRecordById(storeName, id, dbRef = null) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = dbRef || (await openDB());
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = (e) => reject(e.target.error);
    } catch (err) {
      reject(err);
    }
  });
}

function putRecord(storeName, record, dbRef = null) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = dbRef || (await openDB());
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.put(record);

      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e.target.error);
    } catch (err) {
      reject(err);
    }
  });
}

function deleteRecord(storeName, id, dbRef = null) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = dbRef || (await openDB());
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(e.target.error);
    } catch (err) {
      reject(err);
    }
  });
}

function clearStore(storeName, dbRef = null) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = dbRef || (await openDB());
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(e.target.error);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Public Data Access API
 */
const DB = {
  open: openDB,

  // Products
  async getProducts() {
    return await getAllRecords('products');
  },

  async getProduct(id) {
    return await getRecordById('products', id);
  },

  async saveProduct(product) {
    if (!product.id) {
      product.id = 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      product.createdAt = new Date().toISOString();
    }
    product.updatedAt = new Date().toISOString();
    product.syncStatus = product.syncStatus || 'local';
    await putRecord('products', product);
    return product;
  },

  async deleteProduct(id) {
    return await deleteRecord('products', id);
  },

  // Orders
  async getOrders() {
    const orders = await getAllRecords('orders');
    // Sort descending by creation date
    return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getOrder(id) {
    return await getRecordById('orders', id);
  },

  async saveOrder(order) {
    if (!order.id) {
      order.id = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
      order.createdAt = new Date().toISOString();
    }
    order.updatedAt = new Date().toISOString();
    order.syncStatus = order.syncStatus || 'local';
    await putRecord('orders', order);
    return order;
  },

  // Atomic Status Transition with Inventory Adjustments
  async updateOrderStatus(orderId, newStatus, reason = '') {
    const db = await openDB();
    const order = await getRecordById('orders', orderId, db);
    if (!order) throw new Error(`Order ${orderId} not found`);

    const oldStatus = order.status;
    if (oldStatus === newStatus) return order;

    // BUSINESS RULES & STOCK RESERVATION
    // 1. Pending -> Accepted: Check and reserve/deduct stock
    if (oldStatus === 'pending' && newStatus === 'accepted') {
      // Verify all items have enough stock first
      for (const item of order.items) {
        const prod = await getRecordById('products', item.productId, db);
        if (!prod) throw new Error(`Product "${item.productName}" no longer exists in catalogue.`);
        if (prod.quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for "${item.productName}". Available: ${prod.quantity} ${prod.unit}, Requested: ${item.quantity} ${prod.unit}.`
          );
        }
      }

      // Deduct stock and write inventory logs
      for (const item of order.items) {
        const prod = await getRecordById('products', item.productId, db);
        const prev = prod.quantity;
        prod.quantity = Math.max(0, prod.quantity - item.quantity);
        prod.updatedAt = new Date().toISOString();
        await putRecord('products', prod, db);

        await DB.logInventory({
          productId: prod.id,
          productName: prod.name,
          previousStock: prev,
          newStock: prod.quantity,
          delta: -item.quantity,
          unit: prod.unit,
          reason: `Stock reserved for Order ${order.id}`
        });
      }
    }

    // 2. Accepted / Packed -> Rejected / Cancelled: Restore previously reserved stock
    if ((oldStatus === 'accepted' || oldStatus === 'packed') && newStatus === 'rejected') {
      for (const item of order.items) {
        const prod = await getRecordById('products', item.productId, db);
        if (prod) {
          const prev = prod.quantity;
          prod.quantity = prod.quantity + item.quantity;
          prod.updatedAt = new Date().toISOString();
          await putRecord('products', prod, db);

          await DB.logInventory({
            productId: prod.id,
            productName: prod.name,
            previousStock: prev,
            newStock: prod.quantity,
            delta: +item.quantity,
            unit: prod.unit,
            reason: `Restored stock from rejected Order ${order.id}`
          });
        }
      }
    }

    // Update order status
    order.status = newStatus;
    order.syncStatus = 'pending';
    order.updatedAt = new Date().toISOString();
    if (reason) {
      order.notes = (order.notes ? order.notes + '\n' : '') + `[${new Date().toLocaleTimeString()}] ${reason}`;
    }
    await putRecord('orders', order, db);
    if (window.SyncEngine) SyncEngine.updateSyncUI();
    return order;
  },

  // Inventory Logs
  async getInventoryLogs() {
    const logs = await getAllRecords('inventory_logs');
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  async logInventory(log) {
    log.id = log.id || 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    log.timestamp = log.timestamp || new Date().toISOString();
    await putRecord('inventory_logs', log);
    return log;
  },

  // Settings
  async getSetting(key, defaultValue = null) {
    const rec = await getRecordById('settings', key);
    return rec ? rec.value : defaultValue;
  },

  async setSetting(key, value) {
    await putRecord('settings', { key, value });
    return value;
  },

  async getAllSettings() {
    const list = await getAllRecords('settings');
    const settingsObj = {};
    for (const item of list) {
      settingsObj[item.key] = item.value;
    }
    return settingsObj;
  },

  // Complete JSON Export
  async exportAllData() {
    const products = await DB.getProducts();
    const orders = await DB.getOrders();
    const inventoryLogs = await DB.getInventoryLogs();
    const settings = await DB.getAllSettings();

    return {
      version: 1,
      app: 'FarmDirect Farmer',
      exportedAt: new Date().toISOString(),
      data: {
        products,
        orders,
        inventoryLogs,
        settings
      }
    };
  },

  // Complete JSON Import
  async importData(importedPayload) {
    if (!importedPayload || !importedPayload.data) {
      throw new Error('Invalid backup file: Missing root data envelope.');
    }

    const { products, orders, inventoryLogs, settings } = importedPayload.data;
    if (!Array.isArray(products) || !Array.isArray(orders)) {
      throw new Error('Invalid backup schema: products and orders must be arrays.');
    }

    const db = await openDB();

    // Clear existing stores
    await clearStore('products', db);
    await clearStore('orders', db);
    await clearStore('inventory_logs', db);
    await clearStore('settings', db);

    // Import products
    for (const p of products) {
      if (p && p.id && p.name) {
        await putRecord('products', p, db);
      }
    }

    // Import orders
    for (const o of orders) {
      if (o && o.id) {
        await putRecord('orders', o, db);
      }
    }

    // Import logs
    if (Array.isArray(inventoryLogs)) {
      for (const l of inventoryLogs) {
        if (l && l.id) await putRecord('inventory_logs', l, db);
      }
    }

    // Import settings
    if (settings && typeof settings === 'object') {
      for (const [key, value] of Object.entries(settings)) {
        await putRecord('settings', { key, value }, db);
      }
    }

    return true;
  },

  // Reset to Sample Data
  async resetToSampleData() {
    const db = await openDB();
    await clearStore('products', db);
    await clearStore('orders', db);
    await clearStore('inventory_logs', db);
    await clearStore('settings', db);
    await loadInitialSampleData(db);
    return true;
  },

  // Clear Database Completely
  async clearAllData() {
    const db = await openDB();
    await clearStore('products', db);
    await clearStore('orders', db);
    await clearStore('inventory_logs', db);
    await clearStore('settings', db);
    return true;
  },

  // AUTO-SYNC SUPPORT HELPERS
  async getPendingSyncItems() {
    const products = await DB.getProducts();
    const orders = await DB.getOrders();
    const logs = await DB.getInventoryLogs();

    const pendingProducts = products.filter((p) => p.syncStatus !== 'synced');
    const pendingOrders = orders.filter((o) => o.syncStatus !== 'synced');
    const pendingLogs = logs.filter((l) => l.syncStatus !== 'synced');

    return {
      products: pendingProducts,
      orders: pendingOrders,
      logs: pendingLogs,
      totalPending: pendingProducts.length + pendingOrders.length + pendingLogs.length
    };
  },

  async markItemsSynced(productIds = [], orderIds = [], logIds = [], syncedAt = new Date().toISOString()) {
    const db = await openDB();

    for (const pid of productIds) {
      const p = await getRecordById('products', pid, db);
      if (p) {
        p.syncStatus = 'synced';
        p.lastSyncedAt = syncedAt;
        await putRecord('products', p, db);
      }
    }

    for (const oid of orderIds) {
      const o = await getRecordById('orders', oid, db);
      if (o) {
        o.syncStatus = 'synced';
        o.lastSyncedAt = syncedAt;
        await putRecord('orders', o, db);
      }
    }

    for (const lid of logIds) {
      const l = await getRecordById('inventory_logs', lid, db);
      if (l) {
        l.syncStatus = 'synced';
        await putRecord('inventory_logs', l, db);
      }
    }

    await DB.setSetting('lastSyncedAt', syncedAt);
    return true;
  },

  async insertRemoteOrders(newOrders = []) {
    const db = await openDB();
    let inserted = 0;

    for (const ord of newOrders) {
      const existing = await getRecordById('orders', ord.id, db);
      if (!existing) {
        ord.syncStatus = 'synced';
        await putRecord('orders', ord, db);
        inserted++;
      }
    }
    return inserted;
  },

  // Remove ONLY demo data, preserving real farmer products and orders
  async clearDemoData() {
    const db = await openDB();
    const demoProductIds = new Set(['prod_tomato_01', 'prod_onion_02', 'prod_potato_03', 'prod_banana_04', 'prod_spinach_05']);
    const products = await DB.getProducts();
    let deletedProducts = 0;
    for (const p of products) {
      if (p.isDemo === true || demoProductIds.has(p.id)) {
        await deleteRecord('products', p.id, db);
        deletedProducts++;
      }
    }

    const orders = await DB.getOrders();
    const demoOrderIds = new Set(['ORD-5101', 'ORD-5102', 'ORD-5103', 'ORD-5104']);
    let deletedOrders = 0;
    for (const o of orders) {
      if (o.isDemo === true || demoOrderIds.has(o.id)) {
        await deleteRecord('orders', o.id, db);
        deletedOrders++;
      }
    }

    const logs = await DB.getInventoryLogs();
    for (const l of logs) {
      if (l.id && l.id.startsWith('log_seed_')) {
        await deleteRecord('inventory_logs', l.id, db);
      }
    }

    return { deletedProducts, deletedOrders };
  },

  // Reset application preferences only, without affecting products, orders, or profile
  async resetPreferences() {
    await DB.setSetting('language', 'English');
    await DB.setSetting('dateFormat', 'DD/MM/YYYY');
    await DB.setSetting('currency', '₹');
    await DB.setSetting('lowStockWarning', true);
    await DB.setSetting('confirmBeforeDelete', true);
    await DB.setSetting('notifLowStock', true);
    await DB.setSetting('notifNewOrders', true);
    await DB.setSetting('notifOrderStatus', true);
    return true;
  }
};

window.FarmDirectDB = DB;
