"""
Crop Recommendation System — FastAPI Backend
=============================================
Provides /predict, /weather, and /location endpoints.
"""

import os
import sys
import numpy as np
import joblib
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import Optional

# ── Add parent to path so we can load model ──
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "model")
sys.path.insert(0, os.path.dirname(__file__))

from crop_data import (
    CROP_DATABASE,
    get_crop_info,
    calculate_profit,
    calculate_risk_score,
)
from database import save_prediction

# ── Load ML model & encoder ──
MODEL_PATH = os.path.join(MODEL_DIR, "crop_model.joblib")
ENCODER_PATH = os.path.join(MODEL_DIR, "label_encoder.joblib")

try:
    model = joblib.load(MODEL_PATH)
    label_encoder = joblib.load(ENCODER_PATH)
    print(f"✅ Model loaded from {MODEL_PATH}")
    print(f"✅ Encoder loaded: {list(label_encoder.classes_)}")
except Exception as e:
    print(f"❌ Failed to load model: {e}")
    model = None
    label_encoder = None

# ── OpenWeather API Key ──
OPENWEATHER_API_KEY = os.environ.get("OPENWEATHER_API_KEY", "YOUR_API_KEY_HERE")

# ── FastAPI App ──
app = FastAPI(
    title="🌾 Crop Recommendation System",
    description="AI-powered crop recommendation for Indian farmers",
    version="1.0.0",
)

# CORS — allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Serve frontend static files ──
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend")
if os.path.exists(FRONTEND_DIR):
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="frontend")


# ═══════════════════════════════════════════════════════════
# Pydantic Models
# ═══════════════════════════════════════════════════════════

class PredictRequest(BaseModel):
    N: float = Field(..., ge=0, le=200, description="Nitrogen content in soil")
    P: float = Field(..., ge=0, le=200, description="Phosphorus content in soil")
    K: float = Field(..., ge=0, le=300, description="Potassium content in soil")
    temperature: float = Field(..., ge=-10, le=55, description="Temperature in °C")
    humidity: float = Field(..., ge=0, le=100, description="Humidity in %")
    ph: float = Field(..., ge=0, le=14, description="Soil pH value")
    rainfall: float = Field(..., ge=0, le=500, description="Rainfall in mm")
    land_size: Optional[float] = Field(2.0, ge=0.1, description="Land size in acres")
    budget: Optional[float] = Field(50000, ge=1000, description="Budget in INR")
    water_availability: Optional[str] = Field("medium", description="Water: low/medium/high")
    city: Optional[str] = Field("", description="City name")


class LocationRequest(BaseModel):
    latitude: float
    longitude: float


# ═══════════════════════════════════════════════════════════
# API Endpoints
# ═══════════════════════════════════════════════════════════

@app.get("/")
async def root():
    return {
        "message": "🌾 Crop Recommendation System API",
        "version": "1.0.0",
        "endpoints": ["/predict", "/weather", "/location", "/crops", "/docs"],
    }


@app.post("/predict")
async def predict_crop(data: PredictRequest):
    """
    Predict top 3 crop recommendations based on soil and weather inputs.
    Returns crop name, profit estimate, risk level, water requirement, and duration.
    """
    if model is None or label_encoder is None:
        raise HTTPException(status_code=500, detail="ML model not loaded")

    # ── Prepare features ──
    features = np.array([[
        data.N, data.P, data.K,
        data.temperature, data.humidity,
        data.ph, data.rainfall
    ]])

    # ── Get probability predictions for all crops ──
    probabilities = model.predict_proba(features)[0]
    
    # ── Get top 5 predictions (we'll filter to 3 within budget) ──
    top_indices = np.argsort(probabilities)[::-1][:5]
    
    recommendations = []
    weather_data = {
        "temperature": data.temperature,
        "humidity": data.humidity,
        "rainfall": data.rainfall,
    }
    
    for idx in top_indices:
        if len(recommendations) >= 3:
            break
            
        crop_name = label_encoder.inverse_transform([idx])[0]
        confidence = float(probabilities[idx])
        crop_info = get_crop_info(crop_name)
        
        if not crop_info:
            continue
        
        # Calculate profit
        profit_data = calculate_profit(crop_name, data.land_size or 2.0)
        
        # Check if within budget
        if data.budget and profit_data["total_cost"] > data.budget * 1.5:
            continue  # Skip if way over budget
        
        # Calculate risk
        risk_data = calculate_risk_score(
            crop_name, weather_data, data.water_availability or "medium"
        )
        
        rec = {
            "rank": len(recommendations) + 1,
            "crop": crop_name,
            "crop_display": crop_info["name"],
            "hindi_name": crop_info["hindi"],
            "confidence": round(confidence * 100, 1),
            "description": crop_info["description"],
            "season": crop_info["season"],
            "growing_duration_days": crop_info["growing_duration_days"],
            "water_requirement": crop_info["water_requirement"],
            "water_liters_per_acre": crop_info["water_liters_per_acre"],
            "soil_type": crop_info["soil_type"],
            "best_states": crop_info["best_states"],
            "profit": profit_data,
            "risk": risk_data,
            "timeline": crop_info["timeline"],
        }
        recommendations.append(rec)
    
    # ── Save to database ──
    try:
        save_prediction(data.dict(), recommendations)
    except Exception as e:
        print(f"Warning: Could not save prediction: {e}")
    
    return {
        "success": True,
        "input_summary": {
            "soil": f"N={data.N}, P={data.P}, K={data.K}, pH={data.ph}",
            "weather": f"Temp={data.temperature}°C, Humidity={data.humidity}%, Rain={data.rainfall}mm",
            "farm": f"Land={data.land_size} acres, Budget=₹{data.budget}, Water={data.water_availability}",
        },
        "recommendations": recommendations,
    }


@app.get("/weather")
async def get_weather(city: str):
    """Fetch real-time weather data from OpenWeatherMap API."""
    if OPENWEATHER_API_KEY == "YOUR_API_KEY_HERE":
        # Return mock weather data if no API key
        import random
        return {
            "success": True,
            "source": "mock",
            "city": city,
            "temperature": round(random.uniform(20, 35), 1),
            "humidity": round(random.uniform(40, 85), 1),
            "rainfall": round(random.uniform(50, 200), 1),
            "description": "Partly cloudy",
            "wind_speed": round(random.uniform(5, 20), 1),
            "note": "Using mock data. Set OPENWEATHER_API_KEY for real data.",
        }
    
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather"
        params = {
            "q": f"{city},IN",
            "appid": OPENWEATHER_API_KEY,
            "units": "metric",
        }
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=data.get("message", "Weather API error")
            )
        
        # Extract rainfall (from rain.1h or rain.3h if available)
        rain = 0
        if "rain" in data:
            rain = data["rain"].get("1h", data["rain"].get("3h", 0))
        
        return {
            "success": True,
            "source": "openweathermap",
            "city": data["name"],
            "temperature": data["main"]["temp"],
            "humidity": data["main"]["humidity"],
            "rainfall": rain * 30,  # Estimate monthly from hourly
            "description": data["weather"][0]["description"],
            "wind_speed": data["wind"]["speed"],
        }
    except requests.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Weather service unavailable: {str(e)}")


@app.post("/location")
async def handle_location(data: LocationRequest):
    """
    Handle location data — returns region-based soil/climate suggestions.
    Uses reverse geocoding to identify the region.
    """
    lat, lng = data.latitude, data.longitude
    
    # ── Simple region detection based on lat/lng for India ──
    region = "Central India"
    soil_suggestion = "Alluvial soil (general)"
    climate = "Tropical"
    
    if lat > 28:
        region = "North India"
        soil_suggestion = "Alluvial / Indo-Gangetic plains"
        climate = "Subtropical"
    elif lat > 23:
        if lng < 78:
            region = "West India"
            soil_suggestion = "Black cotton soil / Laterite"
            climate = "Semi-arid to Tropical"
        else:
            region = "East India"
            soil_suggestion = "Alluvial / Deltaic soil"
            climate = "Humid subtropical"
    elif lat > 15:
        region = "South-Central India (Deccan)"
        soil_suggestion = "Red soil / Black soil"
        climate = "Tropical semi-arid"
    else:
        region = "South India"
        soil_suggestion = "Red / Laterite / Coastal alluvial"
        climate = "Tropical humid"
    
    return {
        "success": True,
        "latitude": lat,
        "longitude": lng,
        "region": region,
        "soil_suggestion": soil_suggestion,
        "climate": climate,
        "suggested_params": {
            "temperature_range": "20-35°C" if lat < 25 else "15-30°C",
            "humidity_range": "60-85%",
            "ph_range": "6.0-7.5",
        },
    }


@app.get("/crops")
async def list_crops():
    """List all crops in the database with basic info."""
    crops = []
    for key, info in CROP_DATABASE.items():
        crops.append({
            "id": key,
            "name": info["name"],
            "hindi": info["hindi"],
            "season": info["season"],
            "water": info["water_requirement"],
            "duration_days": info["growing_duration_days"],
        })
    return {"crops": crops, "total": len(crops)}


@app.get("/crop/{crop_name}")
async def get_crop_detail(crop_name: str):
    """Get detailed info for a specific crop."""
    info = get_crop_info(crop_name)
    if not info:
        raise HTTPException(status_code=404, detail=f"Crop '{crop_name}' not found")
    
    profit = calculate_profit(crop_name, 1.0)  # Per acre
    return {
        "success": True,
        "crop": info,
        "profit_per_acre": profit,
    }


# ═══════════════════════════════════════════════════════════
# Run with: uvicorn main:app --reload --port 8000
# ═══════════════════════════════════════════════════════════
