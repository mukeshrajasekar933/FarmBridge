import uuid
import math
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional, Any

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates true geographic Haversine distance in kilometers between two GPS coordinates."""
    R = 6371.0 # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2.0)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)

class DataStore:
    def __init__(self):
        self.reset()

    def reset(self):
        # 0. OTP STORAGE: mobile -> {otp, role, expires_at}
        self.otps: Dict[str, Dict[str, Any]] = {}

        # 1. PROFILES
        self.profiles: Dict[str, Dict[str, Any]] = {
            "f1000000-0000-0000-0000-000000000001": {
                "id": "f1000000-0000-0000-0000-000000000001",
                "role": "farmer",
                "display_name": "Murugan Palanisamy (முருகன்)",
                "phone": "+91 94432 10842",
                "email": "murugan.pollachi@demo.farmbridge.in",
                "preferred_language": "ta",
                "avatar_path": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop",
                "verification_status": "verified",
                "default_latitude": 10.5982,
                "default_longitude": 76.9721,
                "default_address": "Aliyar Main Road, Near Cooperative Milk Society, Pollachi",
                "created_at": datetime.now() - timedelta(days=60)
            },
            "f2000000-0000-0000-0000-000000000002": {
                "id": "f2000000-0000-0000-0000-000000000002",
                "role": "farmer",
                "display_name": "Lakshmi Ramasamy (லட்சுமி)",
                "phone": "+91 98421 95421",
                "email": "lakshmi.anaimalai@demo.farmbridge.in",
                "preferred_language": "en",
                "avatar_path": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop",
                "verification_status": "verified",
                "default_latitude": 10.5810,
                "default_longitude": 76.9320,
                "default_address": "Vettaikaranpudur bypass junction, Anaimalai Foothills",
                "created_at": datetime.now() - timedelta(days=45)
            },
            "b1000000-0000-0000-0000-000000000001": {
                "id": "b1000000-0000-0000-0000-000000000001",
                "role": "consumer",
                "display_name": "Kavitha Sundaram (கவிதா)",
                "phone": "+91 97890 41235",
                "email": "kavitha.consumer@demo.farmbridge.in",
                "preferred_language": "en",
                "avatar_path": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop",
                "verification_status": "verified",
                "default_latitude": 10.6580,
                "default_longitude": 77.0080,
                "default_address": "Door 14, 2nd Cross, Mahalingapuram, Pollachi",
                "created_at": datetime.now() - timedelta(days=30)
            },
            "b2000000-0000-0000-0000-000000000002": {
                "id": "b2000000-0000-0000-0000-000000000002",
                "role": "business",
                "display_name": "Anand Kumar (Annapoorna Kitchen)",
                "phone": "+91 98940 33441",
                "email": "procurement@annapoornademo.in",
                "preferred_language": "en",
                "avatar_path": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop",
                "verification_status": "verified",
                "default_latitude": 10.6650,
                "default_longitude": 77.0120,
                "default_address": "Main Bazaar Road, Pollachi Central",
                "created_at": datetime.now() - timedelta(days=20)
            },
            "d1000000-0000-0000-0000-000000000001": {
                "id": "d1000000-0000-0000-0000-000000000001",
                "role": "delivery",
                "display_name": "Senthil Velan (செந்தில்)",
                "phone": "+91 96550 78219",
                "email": "senthil.delivery@demo.farmbridge.in",
                "preferred_language": "ta",
                "avatar_path": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop",
                "verification_status": "verified",
                "created_at": datetime.now() - timedelta(days=25)
            },
            "a1000000-0000-0000-0000-000000000001": {
                "id": "a1000000-0000-0000-0000-000000000001",
                "role": "admin",
                "display_name": "Selvam Arumugam (System Ops)",
                "phone": "+91 94860 11223",
                "email": "admin@farmbridge.in",
                "preferred_language": "en",
                "avatar_path": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop",
                "verification_status": "verified",
                "created_at": datetime.now() - timedelta(days=90)
            }
        }

        # 2. FARMS WITH PRECISE GEOGRAPHIC COORDINATES
        self.farms: Dict[str, Dict[str, Any]] = {
            "fa111111-1111-1111-1111-111111111111": {
                "id": "fa111111-1111-1111-1111-111111111111",
                "owner_id": "f1000000-0000-0000-0000-000000000001",
                "owner_name": "Murugan Palanisamy",
                "farm_name": "Thennam Thoppu Natural Farm",
                "description": "4th generation regenerative coconut & native vegetable grove near Aliyar foot-hills with pure river water irrigation.",
                "region": "Aliyar Road, Pollachi",
                "village": "Aliyar",
                "district": "Coimbatore",
                "state": "Tamil Nadu",
                "pincode": "642101",
                "farm_address": "Gate 2, opposite primary dairy co-operative society, Aliyar Main Road",
                "latitude": 10.5982,
                "longitude": 76.9721,
                "gps_accuracy": 12.5,
                "is_approximate": False,
                "pickup_instructions": "Gate 2, opposite primary dairy co-operative society on Aliyar main highway.",
                "is_active": True,
                "created_at": datetime.now() - timedelta(days=60)
            },
            "fa222222-2222-2222-2222-222222222222": {
                "id": "fa222222-2222-2222-2222-222222222222",
                "owner_id": "f2000000-0000-0000-0000-000000000002",
                "owner_name": "Lakshmi Ramasamy",
                "farm_name": "Anaimalai Organic Valley",
                "description": "Chemical-free highland vegetable and native fruit farm located in the pristine foothills of Western Ghats.",
                "region": "Anaimalai Hills, Pollachi",
                "village": "Vettaikaranpudur",
                "district": "Coimbatore",
                "state": "Tamil Nadu",
                "pincode": "642104",
                "farm_address": "Vettaikaranpudur bypass junction, Foothills",
                "latitude": 10.5810,
                "longitude": 76.9320,
                "gps_accuracy": 18.0,
                "is_approximate": False,
                "pickup_instructions": "Vettaikaranpudur bypass junction, look for green bamboo gate.",
                "is_active": True,
                "created_at": datetime.now() - timedelta(days=45)
            }
        }

        # 3. CATEGORIES
        self.categories: Dict[str, Dict[str, Any]] = {
            "c1": {"id": "c1", "name": "Fresh Vegetables", "name_ta": "காய்கறிகள்", "description": "Farm-fresh native & highland vegetables", "icon": "Carrot", "is_active": True},
            "c2": {"id": "c2", "name": "Fresh Fruits", "name_ta": "பழங்கள்", "description": "Locally harvested tropical and hill fruits", "icon": "Apple", "is_active": True},
            "c3": {"id": "c3", "name": "Coconut & Plantation", "name_ta": "தென்னை & தோட்டம்", "description": "World-famous Pollachi tender coconuts & fresh copra", "icon": "Palmtree", "is_active": True},
            "c4": {"id": "c4", "name": "Herbs & Greens", "name_ta": "கீரைகள்", "description": "Fresh daily greens harvested at dawn", "icon": "Leaf", "is_active": True},
            "c5": {"id": "c5", "name": "Cold-Pressed Oils & Spices", "name_ta": "மரச்செக்கு எண்ணெய்கள்", "description": "Traditional wood-pressed virgin oils & spices", "icon": "Droplets", "is_active": True},
            "c6": {"id": "c6", "name": "Farm Eggs & Poultry", "name_ta": "நாட்டு முட்டை", "description": "Free-range country eggs from pasture-raised hens", "icon": "Egg", "is_active": True}
        }

        # 4. PRODUCTS (Associated with Farm Coordinates & Exact Produce Photography)
        self.products: Dict[str, Dict[str, Any]] = {
            "p1": {
                "id": "p1",
                "farmer_id": "f1000000-0000-0000-0000-000000000001",
                "farm_id": "fa111111-1111-1111-1111-111111111111",
                "farm_name": "Thennam Thoppu Natural Farm",
                "farmer_name": "Murugan Palanisamy",
                "category_id": "c1",
                "name": "Country Tomatoes (நாட்டு தக்காளி)",
                "name_ta": "நாட்டு தக்காளி",
                "description": "Naturally sun-ripened country tomatoes with characteristic tanginess. Harvested early morning today.",
                "image_paths": ["https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop"],
                "price": 32.0,
                "unit": "kg",
                "available_quantity": 75.0,
                "minimum_order_quantity": 1.0,
                "maximum_order_quantity": 25.0,
                "availability_date": date.today(),
                "harvest_date": date.today(),
                "latitude": 10.5982,
                "longitude": 76.9721,
                "fulfilment_options": ["pickup", "delivery"],
                "status": "active",
                "created_at": datetime.now() - timedelta(days=2),
                "updated_at": datetime.now() - timedelta(hours=3)
            },
            "p2": {
                "id": "p2",
                "farmer_id": "f1000000-0000-0000-0000-000000000001",
                "farm_id": "fa111111-1111-1111-1111-111111111111",
                "farm_name": "Thennam Thoppu Natural Farm",
                "farmer_name": "Murugan Palanisamy",
                "category_id": "c3",
                "name": "Pollachi Sweet Tender Coconut (இளநீர்)",
                "name_ta": "பொள்ளாச்சி இளநீர்",
                "description": "Authentic Pollachi tall variety tender coconut, full of natural electrolytes and over 450ml sweet water.",
                "image_paths": ["/products/tender_coconuts_fresh.jpg"],
                "price": 45.0,
                "unit": "piece",
                "available_quantity": 110.0,
                "minimum_order_quantity": 2.0,
                "maximum_order_quantity": 50.0,
                "availability_date": date.today(),
                "harvest_date": date.today(),
                "latitude": 10.5982,
                "longitude": 76.9721,
                "fulfilment_options": ["pickup", "delivery"],
                "status": "active",
                "created_at": datetime.now() - timedelta(days=3),
                "updated_at": datetime.now() - timedelta(hours=4)
            },
            "p3": {
                "id": "p3",
                "farmer_id": "f2000000-0000-0000-0000-000000000002",
                "farm_id": "fa222222-2222-2222-2222-222222222222",
                "farm_name": "Anaimalai Organic Valley",
                "farmer_name": "Lakshmi Ramasamy",
                "category_id": "c1",
                "name": "Small Red Shallots (சின்ன வெங்காயம்)",
                "name_ta": "சாம்பார் சின்ன வெங்காயம்",
                "description": "High-flavor small onions grown in red loam soil. Hand-sorted and naturally cured for lasting freshness.",
                "image_paths": ["https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop"],
                "price": 55.0,
                "unit": "kg",
                "available_quantity": 50.0,
                "minimum_order_quantity": 0.5,
                "maximum_order_quantity": 15.0,
                "availability_date": date.today(),
                "harvest_date": date.today() - timedelta(days=1),
                "latitude": 10.5810,
                "longitude": 76.9320,
                "fulfilment_options": ["pickup", "delivery"],
                "status": "active",
                "created_at": datetime.now() - timedelta(days=4),
                "updated_at": datetime.now() - timedelta(hours=6)
            },
            "p4": {
                "id": "p4",
                "farmer_id": "f2000000-0000-0000-0000-000000000002",
                "farm_id": "fa222222-2222-2222-2222-222222222222",
                "farm_name": "Anaimalai Organic Valley",
                "farmer_name": "Lakshmi Ramasamy",
                "category_id": "c2",
                "name": "Anaimalai Red Bananas (செவ்வாழை)",
                "name_ta": "ஆனைமலை செவ்வாழை",
                "description": "Nutrient dense native red bananas ripened naturally without calcium carbide or artificial chemicals.",
                "image_paths": ["/products/red_bananas.jpg"],
                "price": 68.0,
                "unit": "kg",
                "available_quantity": 35.0,
                "minimum_order_quantity": 1.0,
                "maximum_order_quantity": 10.0,
                "availability_date": date.today(),
                "harvest_date": date.today(),
                "latitude": 10.5810,
                "longitude": 76.9320,
                "fulfilment_options": ["pickup", "delivery"],
                "status": "active",
                "created_at": datetime.now() - timedelta(days=1),
                "updated_at": datetime.now() - timedelta(hours=2)
            },
            "p5": {
                "id": "p5",
                "farmer_id": "f1000000-0000-0000-0000-000000000001",
                "farm_id": "fa111111-1111-1111-1111-111111111111",
                "farm_name": "Thennam Thoppu Natural Farm",
                "farmer_name": "Murugan Palanisamy",
                "category_id": "c5",
                "name": "Wood-Pressed Virgin Coconut Oil (மரச்செக்கு எண்ணெய்)",
                "name_ta": "மரச்செக்கு தேங்காய் எண்ணெய்",
                "description": "Pressed in traditional Vaagai wood rotaries using sun-dried premium copra. Zero chemicals, zero adulteration.",
                "image_paths": ["/products/coconut_oil.jpg"],
                "price": 310.0,
                "unit": "litre",
                "available_quantity": 22.0,
                "minimum_order_quantity": 0.5,
                "maximum_order_quantity": 5.0,
                "availability_date": date.today(),
                "harvest_date": date.today() - timedelta(days=4),
                "latitude": 10.5982,
                "longitude": 76.9721,
                "fulfilment_options": ["pickup", "delivery"],
                "status": "active",
                "created_at": datetime.now() - timedelta(days=7),
                "updated_at": datetime.now() - timedelta(days=1)
            },
            "p6": {
                "id": "p6",
                "farmer_id": "f2000000-0000-0000-0000-000000000002",
                "farm_id": "fa222222-2222-2222-2222-222222222222",
                "farm_name": "Anaimalai Organic Valley",
                "farmer_name": "Lakshmi Ramasamy",
                "category_id": "c1",
                "name": "Fresh Moringa Drumsticks (முருங்கைக்காய்)",
                "name_ta": "நாட்டு முருங்கைக்காய்",
                "description": "Crisp, fleshy country drumsticks harvested directly from foothill trees. High fiber and rich culinary aroma.",
                "image_paths": ["/products/drumstick.jpg"],
                "price": 40.0,
                "unit": "kg",
                "available_quantity": 45.0,
                "minimum_order_quantity": 0.5,
                "maximum_order_quantity": 10.0,
                "availability_date": date.today(),
                "harvest_date": date.today(),
                "latitude": 10.5810,
                "longitude": 76.9320,
                "fulfilment_options": ["pickup", "delivery"],
                "status": "active",
                "created_at": datetime.now() - timedelta(days=1),
                "updated_at": datetime.now() - timedelta(hours=1)
            },
            "p7": {
                "id": "p7",
                "farmer_id": "f1000000-0000-0000-0000-000000000001",
                "farm_id": "fa111111-1111-1111-1111-111111111111",
                "farm_name": "Thennam Thoppu Natural Farm",
                "farmer_name": "Murugan Palanisamy",
                "category_id": "c1",
                "name": "Native Purple Brinjal (நாட்டு கத்திரிக்காய்)",
                "name_ta": "நாட்டு கத்திரிக்காய்",
                "description": "Glossy native purple eggplants with tender flesh and minimal seeds. Perfect for traditional sambar and ennai kathirikai.",
                "image_paths": ["/products/brinjal.jpg"],
                "price": 38.0,
                "unit": "kg",
                "available_quantity": 60.0,
                "minimum_order_quantity": 0.5,
                "maximum_order_quantity": 15.0,
                "availability_date": date.today(),
                "harvest_date": date.today(),
                "latitude": 10.5982,
                "longitude": 76.9721,
                "fulfilment_options": ["pickup", "delivery"],
                "status": "active",
                "created_at": datetime.now() - timedelta(days=2),
                "updated_at": datetime.now() - timedelta(hours=2)
            },
            "p8": {
                "id": "p8",
                "farmer_id": "f2000000-0000-0000-0000-000000000002",
                "farm_id": "fa222222-2222-2222-2222-222222222222",
                "farm_name": "Anaimalai Organic Valley",
                "farmer_name": "Lakshmi Ramasamy",
                "category_id": "c2",
                "name": "Salem Alphonso Mangoes (சேலம் மாம்பழம்)",
                "name_ta": "சேலம் மாம்பழம்",
                "description": "Naturally hay-ripened sweet Alphonso mangoes. Tree-ripened without any artificial carbide chemical exposure.",
                "image_paths": ["/products/mango.jpg"],
                "price": 120.0,
                "unit": "kg",
                "available_quantity": 30.0,
                "minimum_order_quantity": 1.0,
                "maximum_order_quantity": 10.0,
                "availability_date": date.today(),
                "harvest_date": date.today() - timedelta(days=1),
                "latitude": 10.5810,
                "longitude": 76.9320,
                "fulfilment_options": ["pickup", "delivery"],
                "status": "active",
                "created_at": datetime.now() - timedelta(days=2),
                "updated_at": datetime.now() - timedelta(hours=5)
            },
            "p9": {
                "id": "p9",
                "farmer_id": "f1000000-0000-0000-0000-000000000001",
                "farm_id": "fa111111-1111-1111-1111-111111111111",
                "farm_name": "Thennam Thoppu Natural Farm",
                "farmer_name": "Murugan Palanisamy",
                "category_id": "c1",
                "name": "Tender Lady's Finger / Okra (வெண்டைக்காய்)",
                "name_ta": "நாட்டு வெண்டைக்காய்",
                "description": "Crunchy, tender green okra pods plucked fresh at dawn. Snaps crisp with no fibrous hardness.",
                "image_paths": ["/products/okra.jpg"],
                "price": 35.0,
                "unit": "kg",
                "available_quantity": 40.0,
                "minimum_order_quantity": 0.5,
                "maximum_order_quantity": 10.0,
                "availability_date": date.today(),
                "harvest_date": date.today(),
                "latitude": 10.5982,
                "longitude": 76.9721,
                "fulfilment_options": ["pickup", "delivery"],
                "status": "active",
                "created_at": datetime.now() - timedelta(days=1),
                "updated_at": datetime.now() - timedelta(hours=3)
            },
            "p10": {
                "id": "p10",
                "farmer_id": "f2000000-0000-0000-0000-000000000002",
                "farm_id": "fa222222-2222-2222-2222-222222222222",
                "farm_name": "Anaimalai Organic Valley",
                "farmer_name": "Lakshmi Ramasamy",
                "category_id": "c1",
                "name": "Organic Ridge Gourd (நாட்டு பீர்க்கங்காய்)",
                "name_ta": "நாட்டு பீர்க்கங்காய்",
                "description": "Tender heirloom ridge gourd rich in dietary water and minerals. Plucked right from the trellis vines.",
                "image_paths": ["/products/ridge_gourd.jpg"],
                "price": 42.0,
                "unit": "kg",
                "available_quantity": 25.0,
                "minimum_order_quantity": 0.5,
                "maximum_order_quantity": 8.0,
                "availability_date": date.today(),
                "harvest_date": date.today(),
                "latitude": 10.5810,
                "longitude": 76.9320,
                "fulfilment_options": ["pickup", "delivery"],
                "status": "active",
                "created_at": datetime.now() - timedelta(days=2),
                "updated_at": datetime.now() - timedelta(hours=4)
            },
            "p11": {
                "id": "p11",
                "farmer_id": "f1000000-0000-0000-0000-000000000001",
                "farm_id": "fa111111-1111-1111-1111-111111111111",
                "farm_name": "Thennam Thoppu Natural Farm",
                "farmer_name": "Murugan Palanisamy",
                "category_id": "c1",
                "name": "Farm Fresh Bitter Gourd (பாகற்காய்)",
                "name_ta": "நாட்டு பாகற்காய்",
                "description": "Small dark green native bitter gourds known for immense health benefits, roasted crispness and medicinal value.",
                "image_paths": ["/products/bitter_gourd.jpg"],
                "price": 45.0,
                "unit": "kg",
                "available_quantity": 30.0,
                "minimum_order_quantity": 0.5,
                "maximum_order_quantity": 6.0,
                "availability_date": date.today(),
                "harvest_date": date.today(),
                "latitude": 10.5982,
                "longitude": 76.9721,
                "fulfilment_options": ["pickup", "delivery"],
                "status": "active",
                "created_at": datetime.now() - timedelta(days=1),
                "updated_at": datetime.now() - timedelta(hours=1)
            },
            "p12": {
                "id": "p12",
                "farmer_id": "f2000000-0000-0000-0000-000000000002",
                "farm_id": "fa222222-2222-2222-2222-222222222222",
                "farm_name": "Anaimalai Organic Valley",
                "farmer_name": "Lakshmi Ramasamy",
                "category_id": "c5",
                "name": "Fresh Raw Farm Turmeric (விரலி மஞ்சள்)",
                "name_ta": "பச்சை விரலி மஞ்சள்",
                "description": "Soil-dusted fresh native raw turmeric rhizomes straight after harvesting. High curcumin content and radiant aroma.",
                "image_paths": ["/products/turmeric.jpg"],
                "price": 95.0,
                "unit": "kg",
                "available_quantity": 35.0,
                "minimum_order_quantity": 0.25,
                "maximum_order_quantity": 5.0,
                "availability_date": date.today(),
                "harvest_date": date.today() - timedelta(days=2),
                "latitude": 10.5810,
                "longitude": 76.9320,
                "fulfilment_options": ["pickup", "delivery"],
                "status": "active",
                "created_at": datetime.now() - timedelta(days=3),
                "updated_at": datetime.now() - timedelta(hours=3)
            },
            "p13": {
                "id": "p13",
                "farmer_id": "f1000000-0000-0000-0000-000000000001",
                "farm_id": "fa111111-1111-1111-1111-111111111111",
                "farm_name": "Thennam Thoppu Natural Farm",
                "farmer_name": "Murugan Palanisamy",
                "category_id": "c4",
                "name": "Aromatic Fresh Curry Leaves (நாட்டு கருவேப்பிலை)",
                "name_ta": "நாட்டு கருவேப்பிலை",
                "description": "Dark green fragrant curry leaf sprigs harvested with the morning dew. Intense essential oil aroma.",
                "image_paths": ["/products/curry_leaves.jpg"],
                "price": 15.0,
                "unit": "bunch",
                "available_quantity": 50.0,
                "minimum_order_quantity": 1.0,
                "maximum_order_quantity": 10.0,
                "availability_date": date.today(),
                "harvest_date": date.today(),
                "latitude": 10.5982,
                "longitude": 76.9721,
                "fulfilment_options": ["pickup", "delivery"],
                "status": "active",
                "created_at": datetime.now() - timedelta(days=1),
                "updated_at": datetime.now() - timedelta(hours=1)
            },
            "p14": {
                "id": "p14",
                "farmer_id": "f1000000-0000-0000-0000-000000000001",
                "farm_id": "fa111111-1111-1111-1111-111111111111",
                "farm_name": "Thennam Thoppu Natural Farm",
                "farmer_name": "Murugan Palanisamy",
                "category_id": "c2",
                "name": "Sweet Pollachi Guava (பொள்ளாச்சி கொய்யா)",
                "name_ta": "பொள்ளாச்சி கொய்யாப்பழம்",
                "description": "Crisp white flesh country guavas with mild sweetness and vitamin C boost. Grown without synthetic sprays.",
                "image_paths": ["/products/guava.jpg"],
                "price": 50.0,
                "unit": "kg",
                "available_quantity": 40.0,
                "minimum_order_quantity": 1.0,
                "maximum_order_quantity": 10.0,
                "availability_date": date.today(),
                "harvest_date": date.today(),
                "latitude": 10.5982,
                "longitude": 76.9721,
                "fulfilment_options": ["pickup", "delivery"],
                "status": "active",
                "created_at": datetime.now() - timedelta(days=2),
                "updated_at": datetime.now() - timedelta(hours=3)
            },
            "p15": {
                "id": "p15",
                "farmer_id": "f2000000-0000-0000-0000-000000000002",
                "farm_id": "fa222222-2222-2222-2222-222222222222",
                "farm_name": "Anaimalai Organic Valley",
                "farmer_name": "Lakshmi Ramasamy",
                "category_id": "c1",
                "name": "Hot Green Chillies (பச்சை மிளகாய்)",
                "name_ta": "பச்சை மிளகாய்",
                "description": "Spicy and crisp farm fresh green chillies. Plucked fresh from outdoor rows, perfect heat for Kongu cooking.",
                "image_paths": ["/products/green_chillies.jpg"],
                "price": 60.0,
                "unit": "kg",
                "available_quantity": 30.0,
                "minimum_order_quantity": 0.25,
                "maximum_order_quantity": 5.0,
                "availability_date": date.today(),
                "harvest_date": date.today(),
                "latitude": 10.5810,
                "longitude": 76.9320,
                "fulfilment_options": ["pickup", "delivery"],
                "status": "active",
                "created_at": datetime.now() - timedelta(days=1),
                "updated_at": datetime.now() - timedelta(hours=2)
            },
            "p16": {
                "id": "p16",
                "farmer_id": "f1000000-0000-0000-0000-000000000001",
                "farm_id": "fa111111-1111-1111-1111-111111111111",
                "farm_name": "Thennam Thoppu Natural Farm",
                "farmer_name": "Murugan Palanisamy",
                "category_id": "c6",
                "name": "Free-Range Country Eggs (நாட்டு கோழி முட்டை)",
                "name_ta": "நாட்டு கோழி முட்டை",
                "description": "Pasture-raised authentic Naatu Kozhi eggs with rich golden yolk. Collected daily morning from free-range flock.",
                "image_paths": ["/products/country_eggs.jpg"],
                "price": 12.0,
                "unit": "piece",
                "available_quantity": 60.0,
                "minimum_order_quantity": 6.0,
                "maximum_order_quantity": 30.0,
                "availability_date": date.today(),
                "harvest_date": date.today(),
                "latitude": 10.5982,
                "longitude": 76.9721,
                "fulfilment_options": ["pickup", "delivery"],
                "status": "active",
                "created_at": datetime.now() - timedelta(days=1),
                "updated_at": datetime.now() - timedelta(hours=1)
            }
        }

        # 5. CARTS: buyer_id -> list of items
        self.carts: Dict[str, List[Dict[str, Any]]] = {
            "b1000000-0000-0000-0000-000000000001": []
        }

        # 6. ORDERS
        self.orders: Dict[str, Dict[str, Any]] = {
            "o1": {
                "id": "o1",
                "order_number": "FB-2026-001",
                "buyer_id": "b1000000-0000-0000-0000-000000000001",
                "buyer_name": "Kavitha Sundaram",
                "farmer_id": "f1000000-0000-0000-0000-000000000001",
                "farmer_name": "Murugan Palanisamy",
                "farm_id": "fa111111-1111-1111-1111-111111111111",
                "farm_name": "Thennam Thoppu Natural Farm",
                "status": "completed",
                "fulfilment_type": "delivery",
                "delivery_area": "Mahalingapuram, Pollachi",
                "delivery_address": "Door 14, 2nd Cross, Mahalingapuram, Pollachi",
                "delivery_contact_phone": "+91 97890 41235",
                "delivery_slot": "Morning (7:00 AM - 10:00 AM)",
                "subtotal": 154.0,
                "delivery_fee": 25.0,
                "platform_fee": 5.0,
                "total_amount": 184.0,
                "currency": "INR",
                "payment_status": "simulated_paid",
                "items": [
                    {
                        "id": "oi1",
                        "product_id": "p1",
                        "product_name_snapshot": "Country Tomatoes (நாட்டு தக்காளி)",
                        "unit_snapshot": "kg",
                        "unit_price_snapshot": 32.0,
                        "quantity": 2.0,
                        "line_total": 64.0
                    },
                    {
                        "id": "oi2",
                        "product_id": "p2",
                        "product_name_snapshot": "Pollachi Sweet Tender Coconut (இளநீர்)",
                        "unit_snapshot": "piece",
                        "unit_price_snapshot": 45.0,
                        "quantity": 2.0,
                        "line_total": 90.0
                    }
                ],
                "events": [
                    {"id": "ev1", "event_type": "created", "from_status": None, "to_status": "pending_farmer_confirmation", "note": "Order placed by buyer via Simulated UPI", "created_at": datetime.now() - timedelta(days=1, hours=4), "actor_role": "consumer"},
                    {"id": "ev2", "event_type": "accepted", "from_status": "pending_farmer_confirmation", "to_status": "accepted", "note": "Farmer confirmed stock availability", "created_at": datetime.now() - timedelta(days=1, hours=3, minutes=30), "actor_role": "farmer"},
                    {"id": "ev3", "event_type": "prepared", "from_status": "accepted", "to_status": "ready_for_pickup", "note": "Harvested fresh and packed", "created_at": datetime.now() - timedelta(days=1, hours=2), "actor_role": "farmer"},
                    {"id": "ev4", "event_type": "delivery", "from_status": "ready_for_pickup", "to_status": "delivered", "note": "Delivered to buyer doorstep", "created_at": datetime.now() - timedelta(days=1, hours=1), "actor_role": "delivery"},
                    {"id": "ev5", "event_type": "completed", "from_status": "delivered", "to_status": "completed", "note": "Buyer confirmed produce quality", "created_at": datetime.now() - timedelta(days=1), "actor_role": "consumer"}
                ],
                "created_at": datetime.now() - timedelta(days=1, hours=4),
                "updated_at": datetime.now() - timedelta(days=1)
            },
            "o2": {
                "id": "o2",
                "order_number": "FB-2026-002",
                "buyer_id": "b1000000-0000-0000-0000-000000000001",
                "buyer_name": "Kavitha Sundaram",
                "farmer_id": "f1000000-0000-0000-0000-000000000001",
                "farmer_name": "Murugan Palanisamy",
                "farm_id": "fa111111-1111-1111-1111-111111111111",
                "farm_name": "Thennam Thoppu Natural Farm",
                "status": "pending_farmer_confirmation",
                "fulfilment_type": "delivery",
                "delivery_area": "Venkatesa Colony, Pollachi",
                "delivery_address": "Flat 3B, Sri Krishna Apartments, Pollachi",
                "delivery_contact_phone": "+91 97890 41235",
                "delivery_slot": "Evening (4:00 PM - 7:00 PM)",
                "subtotal": 96.0,
                "delivery_fee": 25.0,
                "platform_fee": 5.0,
                "total_amount": 126.0,
                "currency": "INR",
                "payment_status": "simulated_paid",
                "items": [
                    {
                        "id": "oi3",
                        "product_id": "p1",
                        "product_name_snapshot": "Country Tomatoes (நாட்டு தக்காளி)",
                        "unit_snapshot": "kg",
                        "unit_price_snapshot": 32.0,
                        "quantity": 3.0,
                        "line_total": 96.0
                    }
                ],
                "events": [
                    {"id": "ev21", "event_type": "created", "from_status": None, "to_status": "pending_farmer_confirmation", "note": "Order placed by buyer", "created_at": datetime.now() - timedelta(minutes=45), "actor_role": "consumer"}
                ],
                "created_at": datetime.now() - timedelta(minutes=45),
                "updated_at": datetime.now() - timedelta(minutes=45)
            }
        }

        # 7. DELIVERY TASKS
        self.delivery_tasks: Dict[str, Dict[str, Any]] = {
            "dt1": {
                "id": "dt1",
                "order_id": "o2",
                "order_number": "FB-2026-002",
                "delivery_partner_id": "d1000000-0000-0000-0000-000000000001",
                "delivery_partner_name": "Senthil Velan",
                "status": "assigned",
                "pickup_address": "Thennam Thoppu Natural Farm, Aliyar Road, Pollachi",
                "dropoff_address": "Flat 3B, Sri Krishna Apartments, Venkatesa Colony, Pollachi",
                "route_estimate_km": 6.8,
                "estimated_duration_mins": 18,
                "created_at": datetime.now() - timedelta(minutes=40),
                "delivered_time": None
            }
        }

        # 8. PRICE BENCHMARKS
        self.price_references: List[Dict[str, Any]] = [
            {
                "id": "pr1",
                "crop_name": "Country Tomatoes (தக்காளி)",
                "crop_name_ta": "நாட்டு தக்காளி",
                "market_name": "Pollachi Uzhavar Sandhai",
                "region": "Coimbatore / Pollachi",
                "unit": "kg",
                "min_price": 28.0,
                "modal_price": 34.0,
                "max_price": 38.0,
                "source_name": "Govt Uzhavar Sandhai Daily Price Bulletin",
                "observed_date": date.today().isoformat()
            },
            {
                "id": "pr2",
                "crop_name": "Pollachi Sweet Tender Coconut (இளநீர்)",
                "crop_name_ta": "இளநீர்",
                "market_name": "Pollachi Regulated Co-operative Market",
                "region": "Pollachi Region",
                "unit": "piece",
                "min_price": 38.0,
                "modal_price": 44.0,
                "max_price": 50.0,
                "source_name": "Pollachi Coconut Producers Association",
                "observed_date": date.today().isoformat()
            },
            {
                "id": "pr3",
                "crop_name": "Small Red Shallots (சின்ன வெங்காயம்)",
                "crop_name_ta": "சின்ன வெங்காயம்",
                "market_name": "Coimbatore APMC Mandi",
                "region": "Western Tamil Nadu",
                "unit": "kg",
                "min_price": 48.0,
                "modal_price": 56.0,
                "max_price": 65.0,
                "source_name": "Tamil Nadu Agricultural Marketing Board",
                "observed_date": date.today().isoformat()
            },
            {
                "id": "pr4",
                "crop_name": "Anaimalai Red Bananas (செவ்வாழை)",
                "crop_name_ta": "செவ்வாழை",
                "market_name": "Gandhi Market Pollachi",
                "region": "Anaimalai Hills",
                "unit": "kg",
                "min_price": 60.0,
                "modal_price": 70.0,
                "max_price": 78.0,
                "source_name": "Local Farmers Market Observations",
                "observed_date": date.today().isoformat()
            },
            {
                "id": "pr5",
                "crop_name": "Wood-Pressed Coconut Oil (தேங்காய் எண்ணெய்)",
                "crop_name_ta": "மரச்செக்கு தேங்காய் எண்ணெய்",
                "market_name": "Kangeyam Oil Exchange",
                "region": "Kongu Belt",
                "unit": "litre",
                "min_price": 290.0,
                "modal_price": 315.0,
                "max_price": 340.0,
                "source_name": "State Federation of Traditional Oil Mills",
                "observed_date": date.today().isoformat()
            }
        ]

        # 9. REVIEWS
        self.reviews: List[Dict[str, Any]] = [
            {
                "id": "r1",
                "order_id": "o1",
                "buyer_id": "b1000000-0000-0000-0000-000000000001",
                "buyer_name": "Kavitha Sundaram",
                "farmer_id": "f1000000-0000-0000-0000-000000000001",
                "rating": 5,
                "review_text": "Extremely fresh country tomatoes, picked the same morning. Very juicy and perfect natural tanginess. Coconut water was wonderfully sweet!",
                "created_at": datetime.now() - timedelta(days=1)
            }
        ]

        # 10. DISPUTES & AUDITS
        self.disputes: List[Dict[str, Any]] = []
        self.audit_logs: List[Dict[str, Any]] = [
            {
                "id": "al1",
                "actor_id": "a1000000-0000-0000-0000-000000000001",
                "action": "farmer_verification_approved",
                "entity_type": "profile",
                "entity_id": "f1000000-0000-0000-0000-000000000001",
                "metadata": {"note": "Land passbook and photo ID verified for Pollachi pilot"},
                "created_at": datetime.now() - timedelta(days=58)
            }
        ]

    # --- GEOSPATIAL HELPER METHODS ---
    def get_nearby_farms(self, user_lat: float, user_lon: float, radius_km: Optional[float] = None) -> List[Dict[str, Any]]:
        farms_with_dist = []
        for farm in self.farms.values():
            if not farm.get("is_active", True):
                continue
            f_lat = farm.get("latitude") or 10.59
            f_lon = farm.get("longitude") or 76.97
            dist = calculate_distance(user_lat, user_lon, f_lat, f_lon)
            if radius_km is not None and dist > radius_km:
                continue
            
            # Count active products
            p_count = sum(1 for p in self.products.values() if p["farm_id"] == farm["id"] and p["status"] == "active")
            
            f_copy = dict(farm)
            f_copy["distance_km"] = dist
            f_copy["products_count"] = p_count
            farms_with_dist.append(f_copy)

        farms_with_dist.sort(key=lambda x: x["distance_km"])
        return farms_with_dist

    def get_nearby_products(
        self,
        user_lat: float,
        user_lon: float,
        radius_km: Optional[float] = None,
        category_id: Optional[str] = None,
        q: Optional[str] = None,
        max_price: Optional[float] = None,
        fulfilment: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        results = []
        for p in self.products.values():
            if p["status"] != "active":
                continue
            p_lat = p.get("latitude")
            p_lon = p.get("longitude")
            if p_lat is None or p_lon is None:
                farm = self.farms.get(p["farm_id"])
                p_lat = farm.get("latitude", 10.59) if farm else 10.59
                p_lon = farm.get("longitude", 76.97) if farm else 76.97

            dist = calculate_distance(user_lat, user_lon, p_lat, p_lon)
            if radius_km is not None and dist > radius_km:
                continue

            if category_id and p.get("category_id") != category_id:
                continue

            if max_price is not None and p["price"] > max_price:
                continue

            if fulfilment and fulfilment not in p.get("fulfilment_options", []):
                continue

            if q:
                query = q.lower()
                matches = (
                    query in p["name"].lower()
                    or (p.get("name_ta") and query in p["name_ta"].lower())
                    or query in p.get("description", "").lower()
                    or query in p.get("farm_name", "").lower()
                )
                if not matches:
                    continue

            p_copy = dict(p)
            p_copy["distance_km"] = dist
            results.append(p_copy)

        results.sort(key=lambda x: x["distance_km"])
        return results

    def delete_product(self, product_id: str) -> bool:
        if product_id in self.products:
            del self.products[product_id]
            return True
        return False

store = DataStore()

