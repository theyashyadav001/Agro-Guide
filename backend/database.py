"""
SQLite Database Module
======================
Stores prediction history for the Crop Recommendation System.
"""

import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "crop_advisor.db")


def get_connection():
    """Get SQLite database connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize database tables."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            nitrogen REAL,
            phosphorus REAL,
            potassium REAL,
            temperature REAL,
            humidity REAL,
            ph REAL,
            rainfall REAL,
            land_size REAL,
            budget REAL,
            water_availability TEXT,
            city TEXT,
            recommended_crops TEXT,
            top_crop TEXT
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS market_prices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            crop_name TEXT NOT NULL,
            price_per_kg REAL,
            market TEXT,
            state TEXT,
            updated_at TEXT
        )
    """)
    
    conn.commit()
    conn.close()
    print("✅ Database initialized:", DB_PATH)


def save_prediction(inputs: dict, results: list):
    """Save a prediction to the database."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO predictions 
        (timestamp, nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall,
         land_size, budget, water_availability, city, recommended_crops, top_crop)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        datetime.now().isoformat(),
        inputs.get("N"),
        inputs.get("P"),
        inputs.get("K"),
        inputs.get("temperature"),
        inputs.get("humidity"),
        inputs.get("ph"),
        inputs.get("rainfall"),
        inputs.get("land_size"),
        inputs.get("budget"),
        inputs.get("water_availability"),
        inputs.get("city", ""),
        json.dumps([r["crop"] for r in results]),
        results[0]["crop"] if results else "",
    ))
    
    conn.commit()
    conn.close()


def get_recent_predictions(limit: int = 10):
    """Get recent predictions."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM predictions ORDER BY timestamp DESC LIMIT ?", (limit,)
    )
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows


# Initialize on import
init_db()
