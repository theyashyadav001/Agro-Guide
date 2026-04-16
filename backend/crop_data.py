"""
Crop Database Module
====================
Contains detailed information about 22 Indian crops including
market prices, water needs, risk factors, growing duration, and more.
"""

CROP_DATABASE = {
    "rice": {
        "name": "Rice",
        "hindi": "चावल",
        "description": "Staple food crop of India, grown primarily in kharif season with high water requirements.",
        "season": "Kharif (June - November)",
        "growing_duration_days": 120,
        "water_requirement": "high",
        "water_liters_per_acre": 5000,
        "market_price_min": 1940,
        "market_price_max": 2200,
        "cost_per_acre": 25000,
        "yield_per_acre_kg": 2500,
        "risk_factors": ["flood", "pest_attack", "drought"],
        "best_states": ["Punjab", "Haryana", "West Bengal", "Andhra Pradesh", "Tamil Nadu"],
        "soil_type": "Clay or loamy soil",
        "timeline": [
            {"week": "1-2", "activity": "Land preparation & nursery sowing"},
            {"week": "3-4", "activity": "Transplanting seedlings"},
            {"week": "5-8", "activity": "Vegetative growth & fertilizer application"},
            {"week": "9-12", "activity": "Flowering & grain filling"},
            {"week": "13-16", "activity": "Maturation & harvesting"},
        ],
    },
    "maize": {
        "name": "Maize",
        "hindi": "मक्का",
        "description": "Versatile cereal crop used for food, feed, and industrial purposes.",
        "season": "Kharif (June - October)",
        "growing_duration_days": 100,
        "water_requirement": "medium",
        "water_liters_per_acre": 3000,
        "market_price_min": 1870,
        "market_price_max": 2100,
        "cost_per_acre": 18000,
        "yield_per_acre_kg": 3000,
        "risk_factors": ["drought", "stem_borer"],
        "best_states": ["Karnataka", "Madhya Pradesh", "Bihar", "Rajasthan"],
        "soil_type": "Well-drained loamy soil",
        "timeline": [
            {"week": "1-2", "activity": "Land preparation & seed sowing"},
            {"week": "3-5", "activity": "Germination & early growth"},
            {"week": "6-9", "activity": "Vegetative growth & tasseling"},
            {"week": "10-12", "activity": "Grain filling & maturation"},
            {"week": "13-14", "activity": "Harvesting & drying"},
        ],
    },
    "chickpea": {
        "name": "Chickpea",
        "hindi": "चना",
        "description": "Important pulse crop rich in protein, grown in rabi season.",
        "season": "Rabi (October - March)",
        "growing_duration_days": 100,
        "water_requirement": "low",
        "water_liters_per_acre": 1500,
        "market_price_min": 5100,
        "market_price_max": 5800,
        "cost_per_acre": 15000,
        "yield_per_acre_kg": 800,
        "risk_factors": ["wilt", "frost"],
        "best_states": ["Madhya Pradesh", "Rajasthan", "Maharashtra", "Uttar Pradesh"],
        "soil_type": "Sandy loam to clay loam",
        "timeline": [
            {"week": "1-2", "activity": "Field preparation & sowing"},
            {"week": "3-5", "activity": "Germination & establishment"},
            {"week": "6-9", "activity": "Branching & flowering"},
            {"week": "10-12", "activity": "Pod formation & filling"},
            {"week": "13-14", "activity": "Maturation & harvesting"},
        ],
    },
    "kidneybeans": {
        "name": "Kidney Beans",
        "hindi": "राजमा",
        "description": "High-value pulse crop grown in cooler regions of India.",
        "season": "Kharif (June - October)",
        "growing_duration_days": 90,
        "water_requirement": "medium",
        "water_liters_per_acre": 2500,
        "market_price_min": 6000,
        "market_price_max": 8000,
        "cost_per_acre": 20000,
        "yield_per_acre_kg": 600,
        "risk_factors": ["frost", "fungal_disease"],
        "best_states": ["Jammu & Kashmir", "Himachal Pradesh", "Uttarakhand"],
        "soil_type": "Well-drained loamy soil",
        "timeline": [
            {"week": "1-2", "activity": "Land preparation & sowing"},
            {"week": "3-4", "activity": "Germination & thinning"},
            {"week": "5-8", "activity": "Vegetative growth & flowering"},
            {"week": "9-11", "activity": "Pod development"},
            {"week": "12-13", "activity": "Harvesting & drying"},
        ],
    },
    "pigeonpeas": {
        "name": "Pigeon Peas",
        "hindi": "अरहर / तूर दाल",
        "description": "Major pulse crop of India, also known as Tur Dal.",
        "season": "Kharif (June - December)",
        "growing_duration_days": 180,
        "water_requirement": "low",
        "water_liters_per_acre": 1800,
        "market_price_min": 6300,
        "market_price_max": 7200,
        "cost_per_acre": 16000,
        "yield_per_acre_kg": 700,
        "risk_factors": ["pod_borer", "wilt"],
        "best_states": ["Maharashtra", "Karnataka", "Madhya Pradesh", "Uttar Pradesh"],
        "soil_type": "Light to medium black soil",
        "timeline": [
            {"week": "1-3", "activity": "Sowing & germination"},
            {"week": "4-10", "activity": "Vegetative growth"},
            {"week": "11-18", "activity": "Flowering & pod formation"},
            {"week": "19-24", "activity": "Maturation & harvesting"},
        ],
    },
    "mothbeans": {
        "name": "Moth Beans",
        "hindi": "मोठ",
        "description": "Drought-resistant pulse crop ideal for arid regions.",
        "season": "Kharif (July - October)",
        "growing_duration_days": 75,
        "water_requirement": "low",
        "water_liters_per_acre": 1000,
        "market_price_min": 5500,
        "market_price_max": 6500,
        "cost_per_acre": 10000,
        "yield_per_acre_kg": 400,
        "risk_factors": ["insect_pests"],
        "best_states": ["Rajasthan", "Gujarat", "Maharashtra"],
        "soil_type": "Sandy to sandy loam",
        "timeline": [
            {"week": "1-2", "activity": "Sowing"},
            {"week": "3-5", "activity": "Growth & branching"},
            {"week": "6-8", "activity": "Flowering & pod setting"},
            {"week": "9-10", "activity": "Harvesting"},
        ],
    },
    "mungbean": {
        "name": "Mung Bean",
        "hindi": "मूंग",
        "description": "Short-duration pulse crop with high nutritional value.",
        "season": "Kharif / Zaid (March - June)",
        "growing_duration_days": 65,
        "water_requirement": "low",
        "water_liters_per_acre": 1200,
        "market_price_min": 7275,
        "market_price_max": 8200,
        "cost_per_acre": 12000,
        "yield_per_acre_kg": 500,
        "risk_factors": ["yellow_mosaic_virus"],
        "best_states": ["Rajasthan", "Maharashtra", "Andhra Pradesh"],
        "soil_type": "Sandy loam to loam",
        "timeline": [
            {"week": "1-2", "activity": "Sowing & germination"},
            {"week": "3-5", "activity": "Vegetative growth"},
            {"week": "6-7", "activity": "Flowering & pod formation"},
            {"week": "8-9", "activity": "Harvesting"},
        ],
    },
    "blackgram": {
        "name": "Black Gram",
        "hindi": "उड़द",
        "description": "Important pulse crop used in making dal and papad.",
        "season": "Kharif (June - September)",
        "growing_duration_days": 80,
        "water_requirement": "low",
        "water_liters_per_acre": 1500,
        "market_price_min": 6300,
        "market_price_max": 7400,
        "cost_per_acre": 13000,
        "yield_per_acre_kg": 500,
        "risk_factors": ["yellow_mosaic", "powdery_mildew"],
        "best_states": ["Madhya Pradesh", "Uttar Pradesh", "Tamil Nadu"],
        "soil_type": "Loamy to clay soil",
        "timeline": [
            {"week": "1-2", "activity": "Sowing"},
            {"week": "3-5", "activity": "Vegetative growth"},
            {"week": "6-8", "activity": "Flowering & pod setting"},
            {"week": "9-11", "activity": "Harvesting"},
        ],
    },
    "lentil": {
        "name": "Lentil",
        "hindi": "मसूर",
        "description": "Major rabi pulse crop, highly nutritious.",
        "season": "Rabi (October - March)",
        "growing_duration_days": 110,
        "water_requirement": "low",
        "water_liters_per_acre": 1200,
        "market_price_min": 5500,
        "market_price_max": 6200,
        "cost_per_acre": 14000,
        "yield_per_acre_kg": 600,
        "risk_factors": ["rust", "wilt"],
        "best_states": ["Madhya Pradesh", "Uttar Pradesh", "Bihar"],
        "soil_type": "Sandy loam to clay loam",
        "timeline": [
            {"week": "1-2", "activity": "Field preparation & sowing"},
            {"week": "3-6", "activity": "Vegetative growth"},
            {"week": "7-10", "activity": "Flowering & pod formation"},
            {"week": "11-14", "activity": "Maturation & harvesting"},
        ],
    },
    "pomegranate": {
        "name": "Pomegranate",
        "hindi": "अनार",
        "description": "High-value fruit crop with excellent export potential.",
        "season": "Year-round (fruiting in Mrig Bahar: June-July)",
        "growing_duration_days": 180,
        "water_requirement": "medium",
        "water_liters_per_acre": 2800,
        "market_price_min": 40,
        "market_price_max": 120,
        "cost_per_acre": 60000,
        "yield_per_acre_kg": 8000,
        "risk_factors": ["bacterial_blight", "fruit_borer"],
        "best_states": ["Maharashtra", "Karnataka", "Gujarat", "Rajasthan"],
        "soil_type": "Well-drained sandy loam",
        "timeline": [
            {"week": "1-4", "activity": "Stress treatment & flowering induction"},
            {"week": "5-8", "activity": "Flowering period"},
            {"week": "9-16", "activity": "Fruit development"},
            {"week": "17-24", "activity": "Fruit maturation & harvesting"},
        ],
    },
    "banana": {
        "name": "Banana",
        "hindi": "केला",
        "description": "Major fruit crop of tropical India with year-round demand.",
        "season": "Year-round planting",
        "growing_duration_days": 300,
        "water_requirement": "high",
        "water_liters_per_acre": 6000,
        "market_price_min": 15,
        "market_price_max": 40,
        "cost_per_acre": 70000,
        "yield_per_acre_kg": 30000,
        "risk_factors": ["panama_wilt", "bunchy_top_virus", "cyclone"],
        "best_states": ["Tamil Nadu", "Maharashtra", "Gujarat", "Andhra Pradesh"],
        "soil_type": "Rich loamy soil with good drainage",
        "timeline": [
            {"week": "1-4", "activity": "Pit preparation & planting"},
            {"week": "5-16", "activity": "Vegetative growth"},
            {"week": "17-28", "activity": "Pseudostem development"},
            {"week": "29-36", "activity": "Flowering & bunch emergence"},
            {"week": "37-44", "activity": "Fruit development & harvesting"},
        ],
    },
    "mango": {
        "name": "Mango",
        "hindi": "आम",
        "description": "King of fruits, India's most valued horticultural crop.",
        "season": "Summer (March - June)",
        "growing_duration_days": 150,
        "water_requirement": "medium",
        "water_liters_per_acre": 3000,
        "market_price_min": 30,
        "market_price_max": 100,
        "cost_per_acre": 40000,
        "yield_per_acre_kg": 10000,
        "risk_factors": ["mango_hopper", "powdery_mildew", "anthracnose"],
        "best_states": ["Uttar Pradesh", "Andhra Pradesh", "Karnataka", "Bihar"],
        "soil_type": "Deep well-drained alluvial soil",
        "timeline": [
            {"week": "1-4", "activity": "Flowering initiation"},
            {"week": "5-8", "activity": "Full bloom & fruit set"},
            {"week": "9-14", "activity": "Fruit development"},
            {"week": "15-20", "activity": "Fruit maturation & harvesting"},
        ],
    },
    "grapes": {
        "name": "Grapes",
        "hindi": "अंगूर",
        "description": "Premium fruit crop with high export value, grown in western India.",
        "season": "Year-round (fruiting: Feb - May)",
        "growing_duration_days": 150,
        "water_requirement": "medium",
        "water_liters_per_acre": 2500,
        "market_price_min": 40,
        "market_price_max": 150,
        "cost_per_acre": 100000,
        "yield_per_acre_kg": 12000,
        "risk_factors": ["downy_mildew", "powdery_mildew", "rain_damage"],
        "best_states": ["Maharashtra", "Karnataka", "Tamil Nadu"],
        "soil_type": "Well-drained sandy loam",
        "timeline": [
            {"week": "1-4", "activity": "Pruning & growth hormone application"},
            {"week": "5-8", "activity": "New shoot growth & flowering"},
            {"week": "9-14", "activity": "Berry development"},
            {"week": "15-20", "activity": "Ripening & harvesting"},
        ],
    },
    "watermelon": {
        "name": "Watermelon",
        "hindi": "तरबूज",
        "description": "Popular summer fruit with high water content.",
        "season": "Summer (February - May)",
        "growing_duration_days": 85,
        "water_requirement": "high",
        "water_liters_per_acre": 4000,
        "market_price_min": 8,
        "market_price_max": 20,
        "cost_per_acre": 25000,
        "yield_per_acre_kg": 20000,
        "risk_factors": ["fruit_fly", "powdery_mildew"],
        "best_states": ["Rajasthan", "Karnataka", "Tamil Nadu", "Uttar Pradesh"],
        "soil_type": "Sandy loam with good drainage",
        "timeline": [
            {"week": "1-2", "activity": "Seed sowing & germination"},
            {"week": "3-5", "activity": "Vine growth"},
            {"week": "6-8", "activity": "Flowering & fruit set"},
            {"week": "9-12", "activity": "Fruit development & harvesting"},
        ],
    },
    "muskmelon": {
        "name": "Muskmelon",
        "hindi": "खरबूजा",
        "description": "Sweet summer fruit, popular in North India.",
        "season": "Summer (February - May)",
        "growing_duration_days": 80,
        "water_requirement": "medium",
        "water_liters_per_acre": 3000,
        "market_price_min": 15,
        "market_price_max": 35,
        "cost_per_acre": 22000,
        "yield_per_acre_kg": 12000,
        "risk_factors": ["powdery_mildew", "aphids"],
        "best_states": ["Rajasthan", "Punjab", "Uttar Pradesh"],
        "soil_type": "Sandy loam",
        "timeline": [
            {"week": "1-2", "activity": "Sowing"},
            {"week": "3-5", "activity": "Vine development"},
            {"week": "6-8", "activity": "Flowering & fruit set"},
            {"week": "9-11", "activity": "Fruit maturation & harvesting"},
        ],
    },
    "apple": {
        "name": "Apple",
        "hindi": "सेब",
        "description": "Premium temperate fruit grown in hilly regions.",
        "season": "Year-round (harvest: July - October)",
        "growing_duration_days": 180,
        "water_requirement": "medium",
        "water_liters_per_acre": 3500,
        "market_price_min": 60,
        "market_price_max": 200,
        "cost_per_acre": 80000,
        "yield_per_acre_kg": 8000,
        "risk_factors": ["scab", "codling_moth", "hailstorm"],
        "best_states": ["Jammu & Kashmir", "Himachal Pradesh", "Uttarakhand"],
        "soil_type": "Well-drained loamy soil",
        "timeline": [
            {"week": "1-4", "activity": "Dormancy break & bud burst"},
            {"week": "5-8", "activity": "Flowering & pollination"},
            {"week": "9-16", "activity": "Fruit development"},
            {"week": "17-24", "activity": "Fruit maturation & harvesting"},
        ],
    },
    "orange": {
        "name": "Orange",
        "hindi": "संतरा",
        "description": "Popular citrus fruit, Nagpur orange is world famous.",
        "season": "Winter (November - February)",
        "growing_duration_days": 240,
        "water_requirement": "medium",
        "water_liters_per_acre": 3000,
        "market_price_min": 25,
        "market_price_max": 60,
        "cost_per_acre": 45000,
        "yield_per_acre_kg": 12000,
        "risk_factors": ["citrus_canker", "greening_disease"],
        "best_states": ["Maharashtra", "Madhya Pradesh", "Rajasthan"],
        "soil_type": "Deep loamy soil",
        "timeline": [
            {"week": "1-6", "activity": "Flowering"},
            {"week": "7-16", "activity": "Fruit development"},
            {"week": "17-28", "activity": "Fruit growth & coloring"},
            {"week": "29-34", "activity": "Maturation & harvesting"},
        ],
    },
    "papaya": {
        "name": "Papaya",
        "hindi": "पपीता",
        "description": "Fast-growing tropical fruit with year-round production.",
        "season": "Year-round",
        "growing_duration_days": 270,
        "water_requirement": "medium",
        "water_liters_per_acre": 3000,
        "market_price_min": 10,
        "market_price_max": 30,
        "cost_per_acre": 35000,
        "yield_per_acre_kg": 25000,
        "risk_factors": ["papaya_ring_spot_virus", "root_rot"],
        "best_states": ["Gujarat", "Andhra Pradesh", "Karnataka", "Maharashtra"],
        "soil_type": "Well-drained sandy loam",
        "timeline": [
            {"week": "1-4", "activity": "Transplanting & establishment"},
            {"week": "5-16", "activity": "Vegetative growth"},
            {"week": "17-24", "activity": "Flowering"},
            {"week": "25-38", "activity": "Fruit development & continuous harvesting"},
        ],
    },
    "coconut": {
        "name": "Coconut",
        "hindi": "नारियल",
        "description": "Multipurpose plantation crop of coastal India.",
        "season": "Year-round",
        "growing_duration_days": 365,
        "water_requirement": "high",
        "water_liters_per_acre": 5000,
        "market_price_min": 15,
        "market_price_max": 30,
        "cost_per_acre": 30000,
        "yield_per_acre_kg": 15000,
        "risk_factors": ["rhinoceros_beetle", "root_wilt"],
        "best_states": ["Kerala", "Karnataka", "Tamil Nadu", "Andhra Pradesh"],
        "soil_type": "Sandy loam coastal soil",
        "timeline": [
            {"week": "1-4", "activity": "Planting"},
            {"week": "5-52", "activity": "Continuous growth & nut production"},
        ],
    },
    "cotton": {
        "name": "Cotton",
        "hindi": "कपास",
        "description": "Major cash crop and fiber source, called white gold.",
        "season": "Kharif (April - November)",
        "growing_duration_days": 170,
        "water_requirement": "medium",
        "water_liters_per_acre": 3500,
        "market_price_min": 5726,
        "market_price_max": 6800,
        "cost_per_acre": 30000,
        "yield_per_acre_kg": 1200,
        "risk_factors": ["bollworm", "whitefly", "pink_bollworm"],
        "best_states": ["Gujarat", "Maharashtra", "Telangana", "Madhya Pradesh"],
        "soil_type": "Black cotton soil",
        "timeline": [
            {"week": "1-3", "activity": "Sowing & germination"},
            {"week": "4-8", "activity": "Vegetative growth"},
            {"week": "9-14", "activity": "Squaring & flowering"},
            {"week": "15-20", "activity": "Boll development"},
            {"week": "21-24", "activity": "Boll opening & picking"},
        ],
    },
    "jute": {
        "name": "Jute",
        "hindi": "जूट",
        "description": "Natural fiber crop, called golden fiber of India.",
        "season": "Kharif (March - July)",
        "growing_duration_days": 120,
        "water_requirement": "high",
        "water_liters_per_acre": 5000,
        "market_price_min": 4500,
        "market_price_max": 5500,
        "cost_per_acre": 20000,
        "yield_per_acre_kg": 2500,
        "risk_factors": ["stem_rot", "flood"],
        "best_states": ["West Bengal", "Bihar", "Assam"],
        "soil_type": "Alluvial soil in flood plains",
        "timeline": [
            {"week": "1-2", "activity": "Sowing"},
            {"week": "3-8", "activity": "Vegetative growth"},
            {"week": "9-14", "activity": "Stem elongation"},
            {"week": "15-17", "activity": "Harvesting & retting"},
        ],
    },
    "coffee": {
        "name": "Coffee",
        "hindi": "कॉफ़ी",
        "description": "Premium beverage crop grown in shade, mainly in South India.",
        "season": "Year-round (harvest: Nov - Feb)",
        "growing_duration_days": 270,
        "water_requirement": "medium",
        "water_liters_per_acre": 3000,
        "market_price_min": 200,
        "market_price_max": 400,
        "cost_per_acre": 50000,
        "yield_per_acre_kg": 1500,
        "risk_factors": ["coffee_berry_borer", "leaf_rust", "white_stem_borer"],
        "best_states": ["Karnataka", "Kerala", "Tamil Nadu"],
        "soil_type": "Rich forest loam",
        "timeline": [
            {"week": "1-8", "activity": "Blossom showers & flowering"},
            {"week": "9-24", "activity": "Berry development"},
            {"week": "25-36", "activity": "Berry maturation & selective picking"},
        ],
    },
}


def get_crop_info(crop_name: str) -> dict:
    """Get detailed info for a crop by name (case-insensitive)."""
    key = crop_name.lower().strip()
    return CROP_DATABASE.get(key, None)


def calculate_profit(crop_name: str, land_size_acres: float) -> dict:
    """Calculate estimated profit for a crop given land size."""
    crop = get_crop_info(crop_name)
    if not crop:
        return {"error": f"Crop '{crop_name}' not found"}
    
    total_cost = crop["cost_per_acre"] * land_size_acres
    yield_kg = crop["yield_per_acre_kg"] * land_size_acres
    revenue_min = yield_kg * crop["market_price_min"]
    revenue_max = yield_kg * crop["market_price_max"]
    
    # For per-kg pricing (grains/pulses/cash crops have per-quintal MSP)
    # For fruits, prices are per-kg at market
    profit_min = revenue_min - total_cost
    profit_max = revenue_max - total_cost
    
    return {
        "total_cost": round(total_cost),
        "expected_yield_kg": round(yield_kg),
        "revenue_range": [round(revenue_min), round(revenue_max)],
        "profit_range": [round(profit_min), round(profit_max)],
        "profit_per_acre": [
            round(profit_min / land_size_acres),
            round(profit_max / land_size_acres),
        ],
    }


def calculate_risk_score(crop_name: str, weather: dict, water_availability: str) -> dict:
    """
    Calculate risk score (0-100) based on weather, water, and crop sensitivity.
    Lower is better.
    """
    crop = get_crop_info(crop_name)
    if not crop:
        return {"score": 50, "level": "medium", "factors": []}
    
    score = 20  # base risk
    factors = []
    
    # ── Water mismatch risk ──
    water_map = {"low": 1, "medium": 2, "high": 3}
    water_need = water_map.get(crop["water_requirement"], 2)
    water_avail = water_map.get(water_availability, 2)
    
    if water_avail < water_need:
        penalty = (water_need - water_avail) * 15
        score += penalty
        factors.append(f"Water shortage: crop needs {crop['water_requirement']}, you have {water_availability}")
    
    # ── Temperature risk ──
    temp = weather.get("temperature", 25)
    if temp > 40:
        score += 20
        factors.append("Extreme heat (>40°C) may damage crop")
    elif temp > 35:
        score += 10
        factors.append("High temperature may stress crop")
    elif temp < 10:
        score += 15
        factors.append("Low temperature risk for tropical crop")
    
    # ── Humidity risk ──
    humidity = weather.get("humidity", 60)
    if humidity > 90:
        score += 10
        factors.append("Very high humidity increases disease risk")
    
    # ── Number of risk factors ──
    score += len(crop["risk_factors"]) * 3
    
    # Clamp to 0-100
    score = min(100, max(0, score))
    
    if score <= 30:
        level = "low"
    elif score <= 60:
        level = "medium"
    else:
        level = "high"
    
    return {
        "score": score,
        "level": level,
        "factors": factors,
        "crop_risks": crop["risk_factors"],
    }
