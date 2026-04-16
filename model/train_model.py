"""
Crop Recommendation Model Training Script
==========================================
Generates synthetic crop data based on realistic Indian agricultural parameters,
trains a Random Forest Classifier, evaluates accuracy, and saves the model.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder
import joblib
import os

# ─── Crop Parameter Ranges (based on real Indian agricultural data) ───────────
# Format: (N_min, N_max, P_min, P_max, K_min, K_max,
#          temp_min, temp_max, hum_min, hum_max, ph_min, ph_max, rain_min, rain_max)

CROP_PARAMS = {
    "rice":        (60, 100, 35, 65, 35, 55, 20, 27, 80, 95, 5.0, 7.0, 200, 300),
    "maize":       (60, 100, 35, 65, 15, 35, 18, 27, 55, 75, 5.5, 7.5, 60, 110),
    "chickpea":    (15, 45,  55, 80, 75, 95, 17, 22, 14, 20, 7.0, 8.0, 65, 95),
    "kidneybeans": (15, 35,  55, 80, 15, 35, 15, 25, 18, 25, 5.5, 7.0, 60, 200),
    "pigeonpeas":  (15, 35,  55, 75, 15, 35, 18, 36, 30, 70, 4.5, 8.0, 100, 200),
    "mothbeans":   (15, 35,  40, 65, 15, 30, 24, 32, 40, 65, 3.5, 9.0, 30, 70),
    "mungbean":    (15, 35,  40, 65, 15, 30, 27, 32, 80, 90, 6.0, 7.5, 30, 60),
    "blackgram":   (25, 55,  55, 80, 15, 30, 25, 35, 60, 75, 6.0, 8.0, 60, 100),
    "lentil":      (15, 35,  55, 80, 15, 30, 18, 30, 14, 65, 6.0, 8.0, 40, 55),
    "pomegranate": (15, 35,   5, 20, 35, 55, 18, 36, 85, 95, 5.5, 7.5, 100, 120),
    "banana":      (80,120,  70,100, 45, 55, 25, 35, 75, 85, 5.5, 7.0, 90, 120),
    "mango":       ( 5, 35,  20, 50, 25, 55, 27, 37, 45, 65, 5.5, 7.5, 90, 110),
    "grapes":      (15, 35,  120,145, 190,210, 8, 42, 78, 85, 5.5, 7.0, 60, 75),
    "watermelon":  (80,100,   5, 20, 45, 55, 24, 28, 80, 92, 6.0, 7.0, 45, 55),
    "muskmelon":   (80,100,   5, 20, 45, 55, 27, 30, 90, 95, 6.0, 7.0, 20, 40),
    "apple":       (15, 35,  120,145, 190,210, 21, 25, 90, 95, 5.5, 7.0, 100, 130),
    "orange":      (15, 35,   5, 15, 5,  15,  10, 35, 90, 95, 6.5, 8.0, 100, 120),
    "papaya":      (35, 65,  55, 80, 45, 55, 33, 42, 90, 95, 6.5, 7.0, 140, 170),
    "coconut":     (15, 35,   5, 15, 25, 40, 25, 30, 90, 95, 5.5, 7.0, 150, 200),
    "cotton":      (100,140, 40, 60, 15, 25, 23, 28, 75, 85, 6.0, 8.0, 60, 110),
    "jute":        (60, 100, 35, 55, 35, 45, 24, 37, 75, 90, 6.0, 8.0, 150, 200),
    "coffee":      (80, 120, 15, 30, 25, 40, 23, 28, 55, 70, 6.0, 7.0, 150, 200),
}

SAMPLES_PER_CROP = 120  # 120 samples per crop → 2640 total samples


def generate_dataset():
    """Generate synthetic crop recommendation dataset."""
    print("📊 Generating synthetic crop dataset...")
    
    data = []
    for crop, params in CROP_PARAMS.items():
        n_min, n_max, p_min, p_max, k_min, k_max = params[:6]
        t_min, t_max, h_min, h_max, ph_min, ph_max, r_min, r_max = params[6:]
        
        for _ in range(SAMPLES_PER_CROP):
            # Add some noise for realistic variation
            row = {
                "N": np.random.uniform(n_min, n_max),
                "P": np.random.uniform(p_min, p_max),
                "K": np.random.uniform(k_min, k_max),
                "temperature": np.random.uniform(t_min, t_max),
                "humidity": np.random.uniform(h_min, h_max),
                "ph": np.random.uniform(ph_min, ph_max),
                "rainfall": np.random.uniform(r_min, r_max),
                "label": crop
            }
            data.append(row)
    
    df = pd.DataFrame(data)
    
    # Save dataset
    data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(data_dir, exist_ok=True)
    csv_path = os.path.join(data_dir, "crop_recommendation.csv")
    df.to_csv(csv_path, index=False)
    print(f"   ✅ Dataset saved: {csv_path} ({len(df)} samples, {df['label'].nunique()} crops)")
    
    return df


def train_model(df):
    """Train Random Forest Classifier on crop data."""
    print("\n🧠 Training Random Forest Classifier...")
    
    # ── Feature / Target split ──
    features = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
    X = df[features]
    y = df["label"]
    
    # ── Encode labels ──
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    # ── Train/Test split ──
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    print(f"   Training samples: {len(X_train)}")
    print(f"   Testing samples:  {len(X_test)}")
    
    # ── Train model ──
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    
    # ── Evaluate ──
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n📈 Model Accuracy: {accuracy * 100:.2f}%")
    print("\n📋 Classification Report:")
    print(classification_report(y_test, y_pred, target_names=le.classes_))
    
    # ── Feature Importance ──
    importances = dict(zip(features, model.feature_importances_))
    print("🔍 Feature Importances:")
    for feat, imp in sorted(importances.items(), key=lambda x: -x[1]):
        bar = "█" * int(imp * 50)
        print(f"   {feat:>12}: {imp:.4f}  {bar}")
    
    return model, le, accuracy


def save_model(model, label_encoder):
    """Save trained model and label encoder."""
    model_dir = os.path.dirname(__file__)
    
    model_path = os.path.join(model_dir, "crop_model.joblib")
    encoder_path = os.path.join(model_dir, "label_encoder.joblib")
    
    joblib.dump(model, model_path)
    joblib.dump(label_encoder, encoder_path)
    
    print(f"\n💾 Model saved:   {model_path}")
    print(f"💾 Encoder saved: {encoder_path}")


if __name__ == "__main__":
    print("=" * 60)
    print("  🌾 Crop Recommendation Model Training")
    print("=" * 60)
    
    # Step 1: Generate dataset
    df = generate_dataset()
    
    # Step 2: Train model
    model, le, accuracy = train_model(df)
    
    # Step 3: Save model
    save_model(model, le)
    
    print("\n" + "=" * 60)
    print(f"  ✅ Training complete! Accuracy: {accuracy * 100:.2f}%")
    print("=" * 60)
