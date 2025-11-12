import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
import xgboost as xgb
import joblib
import os

def load_and_prepare_data():
    """
    Load and prepare the Parkinson's dataset for training
    Note: You'll need to download the dataset from UCI first
    """
    # For demonstration, we'll create synthetic data
    # In practice, download from: https://archive.ics.uci.edu/ml/datasets/parkinsons
    
    print("Loading and preparing data...")
    
    # This is a placeholder - replace with actual dataset loading
    # Example structure based on UCI Parkinson's dataset
    n_samples = 1000
    n_features = 26
    
    # Synthetic data for demonstration
    X = np.random.randn(n_samples, n_features)
    
    # Simulate Parkinson's patterns
    # Parkinson's patients typically have:
    # - Higher jitter and shimmer
    # - Lower HNR
    # - Different MFCC patterns
    parkinsons_mask = np.random.choice([0, 1], n_samples, p=[0.7, 0.3])
    
    for i in range(n_samples):
        if parkinsons_mask[i] == 1:
            # Simulate Parkinson's voice characteristics
            X[i, 4:8] += 0.5  # Higher jitter/shimmer
            X[i, 8] -= 0.3    # Lower HNR
            X[i, 9:22] += np.random.normal(0, 0.2, 13)  # Different MFCCs
    
    y = parkinsons_mask
    
    return X, y

def train_model():
    """Train the Parkinson's detection model"""
    
    # Load data
    X, y = load_and_prepare_data()
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train XGBoost model
    print("Training XGBoost model...")
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        random_state=42
    )
    
    model.fit(X_train_scaled, y_train)
    
    # Evaluate model
    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"Model Accuracy: {accuracy:.3f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Cross-validation
    cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5)
    print(f"Cross-validation scores: {cv_scores}")
    print(f"Mean CV accuracy: {cv_scores.mean():.3f} (+/- {cv_scores.std() * 2:.3f})")
    
    # Save model and scaler
    if not os.path.exists('model'):
        os.makedirs('model')
    
    joblib.dump(model, 'model/parkinson_model.pkl')
    joblib.dump(scaler, 'model/feature_scaler.pkl')
    
    print("Model and scaler saved successfully!")
    
    return model, scaler, accuracy

if __name__ == '__main__':
    train_model()