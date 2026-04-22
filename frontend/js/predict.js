/**
 * AgroGuide — Frontend Crop Prediction Engine
 * Replaces the Railway backend entirely. Works offline.
 *
 * Scoring: each crop has known optimal N/P/K/temp/humidity/pH/rainfall ranges.
 * We compute a match score (0–100) for each crop and return the top 3.
 */

// ── Crop Database (ported from backend/crop_data.py) ───────────────────────

const CROP_DB = {
    rice:        { name:"Rice",         hindi:"चावल",        season:"Kharif (Jun–Nov)",    duration:120, water:"high",   waterL:5000,  costAcre:25000, yieldKg:2500,  priceMin:1940, priceMax:2200, risks:["flood","pest_attack","drought"],        states:["Punjab","West Bengal","Andhra Pradesh","Tamil Nadu"], soil:"Clay or loamy", description:"Staple food crop of India, grown primarily in kharif season with high water requirements.", timeline:[{w:"1-2",a:"Land prep & nursery sowing"},{w:"3-4",a:"Transplanting seedlings"},{w:"5-8",a:"Vegetative growth & fertilizer"},{w:"9-12",a:"Flowering & grain filling"},{w:"13-16",a:"Maturation & harvesting"}] },
    maize:       { name:"Maize",        hindi:"मक्का",       season:"Kharif (Jun–Oct)",    duration:100, water:"medium", waterL:3000,  costAcre:18000, yieldKg:3000,  priceMin:1870, priceMax:2100, risks:["drought","stem_borer"],                 states:["Karnataka","Madhya Pradesh","Bihar","Rajasthan"],  soil:"Well-drained loamy", description:"Versatile cereal crop used for food, feed, and industrial purposes.", timeline:[{w:"1-2",a:"Land prep & seed sowing"},{w:"3-5",a:"Germination & early growth"},{w:"6-9",a:"Vegetative growth & tasseling"},{w:"10-12",a:"Grain filling & maturation"},{w:"13-14",a:"Harvesting & drying"}] },
    chickpea:    { name:"Chickpea",     hindi:"चना",         season:"Rabi (Oct–Mar)",      duration:100, water:"low",    waterL:1500,  costAcre:15000, yieldKg:800,   priceMin:5100, priceMax:5800, risks:["wilt","frost"],                         states:["Madhya Pradesh","Rajasthan","Maharashtra","UP"],   soil:"Sandy loam to clay loam", description:"Important pulse crop rich in protein, grown in rabi season.", timeline:[{w:"1-2",a:"Field prep & sowing"},{w:"3-5",a:"Germination & establishment"},{w:"6-9",a:"Branching & flowering"},{w:"10-12",a:"Pod formation & filling"},{w:"13-14",a:"Maturation & harvesting"}] },
    kidneybeans: { name:"Kidney Beans", hindi:"राजमा",       season:"Kharif (Jun–Oct)",    duration:90,  water:"medium", waterL:2500,  costAcre:20000, yieldKg:600,   priceMin:6000, priceMax:8000, risks:["frost","fungal_disease"],               states:["Jammu & Kashmir","Himachal Pradesh","Uttarakhand"], soil:"Well-drained loamy", description:"High-value pulse crop grown in cooler regions of India.", timeline:[{w:"1-2",a:"Land prep & sowing"},{w:"3-4",a:"Germination & thinning"},{w:"5-8",a:"Vegetative growth & flowering"},{w:"9-11",a:"Pod development"},{w:"12-13",a:"Harvesting & drying"}] },
    pigeonpeas:  { name:"Pigeon Peas",  hindi:"अरहर / तूर",  season:"Kharif (Jun–Dec)",    duration:180, water:"low",    waterL:1800,  costAcre:16000, yieldKg:700,   priceMin:6300, priceMax:7200, risks:["pod_borer","wilt"],                     states:["Maharashtra","Karnataka","Madhya Pradesh","UP"],  soil:"Light to medium black soil", description:"Major pulse crop of India, also known as Tur Dal.", timeline:[{w:"1-3",a:"Sowing & germination"},{w:"4-10",a:"Vegetative growth"},{w:"11-18",a:"Flowering & pod formation"},{w:"19-24",a:"Maturation & harvesting"}] },
    mothbeans:   { name:"Moth Beans",   hindi:"मोठ",         season:"Kharif (Jul–Oct)",    duration:75,  water:"low",    waterL:1000,  costAcre:10000, yieldKg:400,   priceMin:5500, priceMax:6500, risks:["insect_pests"],                         states:["Rajasthan","Gujarat","Maharashtra"],               soil:"Sandy to sandy loam", description:"Drought-resistant pulse crop ideal for arid regions.", timeline:[{w:"1-2",a:"Sowing"},{w:"3-5",a:"Growth & branching"},{w:"6-8",a:"Flowering & pod setting"},{w:"9-10",a:"Harvesting"}] },
    mungbean:    { name:"Mung Bean",    hindi:"मूंग",        season:"Kharif/Zaid (Mar–Jun)",duration:65, water:"low",    waterL:1200,  costAcre:12000, yieldKg:500,   priceMin:7275, priceMax:8200, risks:["yellow_mosaic_virus"],                  states:["Rajasthan","Maharashtra","Andhra Pradesh"],       soil:"Sandy loam to loam", description:"Short-duration pulse crop with high nutritional value.", timeline:[{w:"1-2",a:"Sowing & germination"},{w:"3-5",a:"Vegetative growth"},{w:"6-7",a:"Flowering & pod formation"},{w:"8-9",a:"Harvesting"}] },
    blackgram:   { name:"Black Gram",   hindi:"उड़द",        season:"Kharif (Jun–Sep)",    duration:80,  water:"low",    waterL:1500,  costAcre:13000, yieldKg:500,   priceMin:6300, priceMax:7400, risks:["yellow_mosaic","powdery_mildew"],        states:["Madhya Pradesh","UP","Tamil Nadu"],                soil:"Loamy to clay", description:"Important pulse crop used in making dal and papad.", timeline:[{w:"1-2",a:"Sowing"},{w:"3-5",a:"Vegetative growth"},{w:"6-8",a:"Flowering & pod setting"},{w:"9-11",a:"Harvesting"}] },
    lentil:      { name:"Lentil",       hindi:"मसूर",        season:"Rabi (Oct–Mar)",      duration:110, water:"low",    waterL:1200,  costAcre:14000, yieldKg:600,   priceMin:5500, priceMax:6200, risks:["rust","wilt"],                          states:["Madhya Pradesh","UP","Bihar"],                    soil:"Sandy loam to clay loam", description:"Major rabi pulse crop, highly nutritious.", timeline:[{w:"1-2",a:"Field prep & sowing"},{w:"3-6",a:"Vegetative growth"},{w:"7-10",a:"Flowering & pod formation"},{w:"11-14",a:"Maturation & harvesting"}] },
    pomegranate: { name:"Pomegranate",  hindi:"अनार",        season:"Year-round",          duration:180, water:"medium", waterL:2800,  costAcre:60000, yieldKg:8000,  priceMin:40,   priceMax:120,  risks:["bacterial_blight","fruit_borer"],        states:["Maharashtra","Karnataka","Gujarat","Rajasthan"],   soil:"Well-drained sandy loam", description:"High-value fruit crop with excellent export potential.", timeline:[{w:"1-4",a:"Stress treatment & flowering"},{w:"5-8",a:"Flowering period"},{w:"9-16",a:"Fruit development"},{w:"17-24",a:"Maturation & harvesting"}] },
    banana:      { name:"Banana",       hindi:"केला",        season:"Year-round",          duration:300, water:"high",   waterL:6000,  costAcre:70000, yieldKg:30000, priceMin:15,   priceMax:40,   risks:["panama_wilt","bunchy_top_virus"],        states:["Tamil Nadu","Maharashtra","Gujarat","AP"],         soil:"Rich loamy with good drainage", description:"Major fruit crop of tropical India with year-round demand.", timeline:[{w:"1-4",a:"Pit prep & planting"},{w:"5-16",a:"Vegetative growth"},{w:"17-28",a:"Pseudostem development"},{w:"29-36",a:"Flowering & bunch emergence"},{w:"37-44",a:"Fruit development & harvesting"}] },
    mango:       { name:"Mango",        hindi:"आम",          season:"Summer (Mar–Jun)",    duration:150, water:"medium", waterL:3000,  costAcre:40000, yieldKg:10000, priceMin:30,   priceMax:100,  risks:["mango_hopper","powdery_mildew"],         states:["UP","Andhra Pradesh","Karnataka","Bihar"],         soil:"Deep well-drained alluvial", description:"King of fruits, India's most valued horticultural crop.", timeline:[{w:"1-4",a:"Flowering initiation"},{w:"5-8",a:"Full bloom & fruit set"},{w:"9-14",a:"Fruit development"},{w:"15-20",a:"Maturation & harvesting"}] },
    grapes:      { name:"Grapes",       hindi:"अंगूर",       season:"Year-round (Feb–May)",duration:150, water:"medium", waterL:2500,  costAcre:100000,yieldKg:12000, priceMin:40,   priceMax:150,  risks:["downy_mildew","powdery_mildew"],         states:["Maharashtra","Karnataka","Tamil Nadu"],            soil:"Well-drained sandy loam", description:"Premium fruit crop with high export value, grown in western India.", timeline:[{w:"1-4",a:"Pruning & growth hormone"},{w:"5-8",a:"New shoot growth & flowering"},{w:"9-14",a:"Berry development"},{w:"15-20",a:"Ripening & harvesting"}] },
    watermelon:  { name:"Watermelon",   hindi:"तरबूज",       season:"Summer (Feb–May)",    duration:85,  water:"high",   waterL:4000,  costAcre:25000, yieldKg:20000, priceMin:8,    priceMax:20,   risks:["fruit_fly","powdery_mildew"],            states:["Rajasthan","Karnataka","Tamil Nadu","UP"],         soil:"Sandy loam with good drainage", description:"Popular summer fruit with high water content.", timeline:[{w:"1-2",a:"Seed sowing & germination"},{w:"3-5",a:"Vine growth"},{w:"6-8",a:"Flowering & fruit set"},{w:"9-12",a:"Fruit development & harvesting"}] },
    muskmelon:   { name:"Muskmelon",    hindi:"खरबूजा",      season:"Summer (Feb–May)",    duration:80,  water:"medium", waterL:3000,  costAcre:22000, yieldKg:12000, priceMin:15,   priceMax:35,   risks:["powdery_mildew","aphids"],              states:["Rajasthan","Punjab","UP"],                         soil:"Sandy loam", description:"Sweet summer fruit, popular in North India.", timeline:[{w:"1-2",a:"Sowing"},{w:"3-5",a:"Vine development"},{w:"6-8",a:"Flowering & fruit set"},{w:"9-11",a:"Maturation & harvesting"}] },
    apple:       { name:"Apple",        hindi:"सेब",         season:"Harvest: Jul–Oct",    duration:180, water:"medium", waterL:3500,  costAcre:80000, yieldKg:8000,  priceMin:60,   priceMax:200,  risks:["scab","codling_moth","hailstorm"],       states:["Jammu & Kashmir","Himachal Pradesh","Uttarakhand"],soil:"Well-drained loamy", description:"Premium temperate fruit grown in hilly regions.", timeline:[{w:"1-4",a:"Dormancy break & bud burst"},{w:"5-8",a:"Flowering & pollination"},{w:"9-16",a:"Fruit development"},{w:"17-24",a:"Maturation & harvesting"}] },
    orange:      { name:"Orange",       hindi:"संतरा",       season:"Winter (Nov–Feb)",    duration:240, water:"medium", waterL:3000,  costAcre:45000, yieldKg:12000, priceMin:25,   priceMax:60,   risks:["citrus_canker","greening_disease"],      states:["Maharashtra","Madhya Pradesh","Rajasthan"],        soil:"Deep loamy", description:"Popular citrus fruit. Nagpur orange is world famous.", timeline:[{w:"1-6",a:"Flowering"},{w:"7-16",a:"Fruit development"},{w:"17-28",a:"Growth & coloring"},{w:"29-34",a:"Maturation & harvesting"}] },
    papaya:      { name:"Papaya",       hindi:"पपीता",       season:"Year-round",          duration:270, water:"medium", waterL:3000,  costAcre:35000, yieldKg:25000, priceMin:10,   priceMax:30,   risks:["ring_spot_virus","root_rot"],            states:["Gujarat","Andhra Pradesh","Karnataka","Maharashtra"],soil:"Well-drained sandy loam", description:"Fast-growing tropical fruit with year-round production.", timeline:[{w:"1-4",a:"Transplanting & establishment"},{w:"5-16",a:"Vegetative growth"},{w:"17-24",a:"Flowering"},{w:"25-38",a:"Continuous harvesting"}] },
    coconut:     { name:"Coconut",      hindi:"नारियल",      season:"Year-round",          duration:365, water:"high",   waterL:5000,  costAcre:30000, yieldKg:15000, priceMin:15,   priceMax:30,   risks:["rhinoceros_beetle","root_wilt"],         states:["Kerala","Karnataka","Tamil Nadu","AP"],            soil:"Sandy loam coastal", description:"Multipurpose plantation crop of coastal India.", timeline:[{w:"1-4",a:"Planting"},{w:"5-52",a:"Continuous growth & nut production"}] },
    cotton:      { name:"Cotton",       hindi:"कपास",        season:"Kharif (Apr–Nov)",    duration:170, water:"medium", waterL:3500,  costAcre:30000, yieldKg:1200,  priceMin:5726, priceMax:6800, risks:["bollworm","whitefly","pink_bollworm"],   states:["Gujarat","Maharashtra","Telangana","MP"],          soil:"Black cotton soil", description:"Major cash crop and fiber source, called white gold.", timeline:[{w:"1-3",a:"Sowing & germination"},{w:"4-8",a:"Vegetative growth"},{w:"9-14",a:"Squaring & flowering"},{w:"15-20",a:"Boll development"},{w:"21-24",a:"Boll opening & picking"}] },
    jute:        { name:"Jute",         hindi:"जूट",         season:"Kharif (Mar–Jul)",    duration:120, water:"high",   waterL:5000,  costAcre:20000, yieldKg:2500,  priceMin:4500, priceMax:5500, risks:["stem_rot","flood"],                     states:["West Bengal","Bihar","Assam"],                     soil:"Alluvial in flood plains", description:"Natural fiber crop, called golden fiber of India.", timeline:[{w:"1-2",a:"Sowing"},{w:"3-8",a:"Vegetative growth"},{w:"9-14",a:"Stem elongation"},{w:"15-17",a:"Harvesting & retting"}] },
    coffee:      { name:"Coffee",       hindi:"कॉफ़ी",       season:"Harvest: Nov–Feb",    duration:270, water:"medium", waterL:3000,  costAcre:50000, yieldKg:1500,  priceMin:200,  priceMax:400,  risks:["berry_borer","leaf_rust"],              states:["Karnataka","Kerala","Tamil Nadu"],                 soil:"Rich forest loam", description:"Premium beverage crop grown in shade, mainly in South India.", timeline:[{w:"1-8",a:"Blossom showers & flowering"},{w:"9-24",a:"Berry development"},{w:"25-36",a:"Berry maturation & picking"}] },
};

// ── Optimal ranges per crop: [min, ideal, max] ─────────────────────────────
// Based on standard agricultural datasets for Indian conditions

const OPTIMAL = {
    //              N               P               K               temp             humidity         pH              rainfall
    rice:        [[60,80,120],  [35,47,62],   [28,40,57],   [20,24,28],   [78,82,88],   [5.5,6.4,7.5], [150,220,300]],
    maize:       [[60,80,120],  [35,48,62],   [15,22,35],   [16,22,28],   [55,65,75],   [5.5,6.2,7.5], [55,85,120]],
    chickpea:    [[30,42,58],   [55,68,82],   [68,79,92],   [14,20,27],   [12,17,24],   [6.0,7.2,8.2], [55,82,115]],
    kidneybeans: [[12,20,35],   [55,68,80],   [12,20,28],   [14,21,28],   [16,22,30],   [5.5,6.5,7.5], [80,140,200]],
    pigeonpeas:  [[12,20,35],   [55,68,80],   [12,20,28],   [24,29,36],   [38,48,65],   [5.5,5.8,7.5], [140,155,200]],
    mothbeans:   [[18,22,38],   [38,48,58],   [18,24,35],   [24,29,36],   [42,53,65],   [3.5,6.5,7.5], [40,52,70]],
    mungbean:    [[14,20,35],   [38,47,58],   [12,20,28],   [24,29,36],   [80,86,92],   [6.2,6.7,7.2], [38,48,65]],
    blackgram:   [[32,40,52],   [55,68,80],   [12,20,28],   [26,30,36],   [58,66,75],   [6.0,7.1,8.0], [58,68,90]],
    lentil:      [[14,18,28],   [62,70,82],   [12,19,28],   [14,19,26],   [58,65,75],   [6.0,6.9,7.5], [28,45,70]],
    pomegranate: [[12,18,28],   [12,18,28],   [35,44,55],   [18,22,36],   [82,90,96],   [5.5,6.4,7.5], [100,107,122]],
    banana:      [[85,100,122], [72,82,100],  [42,50,62],   [24,27,36],   [74,80,90],   [5.5,6.0,7.0], [96,105,122]],
    mango:       [[12,18,28],   [18,27,40],   [24,30,45],   [24,31,40],   [45,50,62],   [4.5,5.8,7.0], [90,108,200]],
    grapes:      [[18,24,35],   [120,133,150],[195,200,210],[18,24,38],   [78,82,90],   [5.5,6.0,7.0], [58,68,80]],
    watermelon:  [[80,100,122], [8,15,22],    [38,50,62],   [24,27,40],   [80,85,92],   [5.5,6.0,7.5], [42,50,70]],
    muskmelon:   [[80,100,122], [8,15,22],    [38,50,62],   [24,28,38],   [88,92,96],   [5.5,6.5,7.5], [18,25,38]],
    apple:       [[0,21,40],    [10,18,30],   [38,44,58],   [0,22,25],    [80,92,96],   [5.5,6.0,7.0], [108,115,122]],
    orange:      [[0,20,32],    [8,10,20],    [8,10,20],    [10,22,36],   [88,92,96],   [6.0,7.0,8.0], [108,112,122]],
    papaya:      [[38,50,62],   [10,18,30],   [38,50,62],   [24,33,38],   [88,92,96],   [6.0,6.5,7.5], [95,140,200]],
    coconut:     [[5,22,32],    [8,12,22],    [24,30,42],   [24,27,36],   [85,94,98],   [5.0,6.0,7.5], [105,175,250]],
    cotton:      [[80,121,145], [28,40,52],   [14,22,32],   [20,24,40],   [68,80,86],   [6.0,6.5,7.5], [58,80,115]],
    jute:        [[58,78,92],   [32,46,62],   [28,40,52],   [22,27,36],   [68,80,90],   [6.0,7.0,8.0], [148,175,205]],
    coffee:      [[80,101,122], [22,28,42],   [22,29,42],   [14,26,28],   [52,58,66],   [6.0,6.5,7.0], [148,175,205]],
};

// ── Scoring ────────────────────────────────────────────────────────────────

function scoreParam(val, range) {
    const [mn, ideal, mx] = range;
    if (val < mn) return Math.max(0, 1 - (mn - val) / (mn + 1)) * 0.4;
    if (val > mx) return Math.max(0, 1 - (val - mx) / (mx + 1)) * 0.4;
    // Within range — Gaussian-style score peaking at ideal
    const span = Math.max(mx - mn, 1);
    return 1 - 0.5 * Math.abs(val - ideal) / span;
}

function scoreCrop(inputs, key) {
    const r = OPTIMAL[key];
    if (!r) return 0;
    // Weights: N,P,K,temp,humidity,pH,rainfall
    const W = [0.15, 0.12, 0.12, 0.18, 0.15, 0.13, 0.15];
    const vals = [inputs.N, inputs.P, inputs.K, inputs.temperature, inputs.humidity, inputs.ph, inputs.rainfall];
    let score = 0;
    for (let i = 0; i < 7; i++) score += W[i] * scoreParam(vals[i], r[i]);
    return score;
}

// ── Risk Calculation (ported from backend) ────────────────────────────────

function calcRisk(crop, inputs, water) {
    let score = 20;
    const factors = [];
    const wMap = { low:1, medium:2, high:3 };
    const wNeed = wMap[crop.water] || 2;
    const wAvail = wMap[water] || 2;
    if (wAvail < wNeed) {
        score += (wNeed - wAvail) * 15;
        factors.push(`Water shortage: crop needs ${crop.water}, you have ${water}`);
    }
    if (inputs.temperature > 40) { score += 20; factors.push("Extreme heat (>40°C) may damage crop"); }
    else if (inputs.temperature > 35) { score += 10; factors.push("High temperature may stress crop"); }
    else if (inputs.temperature < 10) { score += 15; factors.push("Low temperature risk for tropical crop"); }
    if (inputs.humidity > 90) { score += 10; factors.push("Very high humidity increases disease risk"); }
    score += crop.risks.length * 3;
    score = Math.min(100, Math.max(0, score));
    return { score, level: score <= 30 ? "low" : score <= 60 ? "medium" : "high", factors, crop_risks: crop.risks };
}

// ── Profit Calculation (ported from backend) ──────────────────────────────

function calcProfit(crop, landSize) {
    const cost      = crop.costAcre * landSize;
    const yield_kg  = crop.yieldKg  * landSize;
    const rev_min   = yield_kg * crop.priceMin;
    const rev_max   = yield_kg * crop.priceMax;
    return {
        total_cost:       Math.round(cost),
        expected_yield_kg: Math.round(yield_kg),
        revenue_range:    [Math.round(rev_min), Math.round(rev_max)],
        profit_range:     [Math.round(rev_min - cost), Math.round(rev_max - cost)],
        profit_per_acre:  [Math.round((rev_min - cost) / landSize), Math.round((rev_max - cost) / landSize)],
    };
}

// ── Main Prediction Function ───────────────────────────────────────────────

function predictCrops(inputs) {
    const landSize = inputs.land_size || 2;
    const water    = inputs.water_availability || "medium";
    const budget   = inputs.budget || 50000;

    // Score every crop
    const scored = Object.entries(OPTIMAL).map(([key]) => ({
        key,
        score: scoreCrop(inputs, key),
    })).sort((a, b) => b.score - a.score);

    const recommendations = [];
    let rank = 1;

    for (const { key, score } of scored) {
        if (recommendations.length >= 3) break;
        const crop   = CROP_DB[key];
        if (!crop) continue;
        const profit = calcProfit(crop, landSize);
        if (profit.total_cost > budget * 1.5) continue; // over budget
        const risk   = calcRisk(crop, inputs, water);
        recommendations.push({
            rank: rank++,
            crop: key,
            crop_display:          crop.name,
            hindi_name:            crop.hindi,
            confidence:            Math.round(score * 100 * 10) / 10,
            description:           crop.description,
            season:                crop.season,
            growing_duration_days: crop.duration,
            water_requirement:     crop.water,
            water_liters_per_acre: crop.waterL,
            soil_type:             crop.soil,
            best_states:           crop.states,
            profit,
            risk,
            timeline:              crop.timeline,
        });
    }

    return { success: true, recommendations };
}
