import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import os

def create_sample_dataset():
    """Create a realistic sample dataset for demonstration"""
    np.random.seed(42)
    n_samples = 200
    
    # Feature names based on UCI Parkinson's dataset
    features = [
        'mean_f0', 'std_f0', 'min_f0', 'max_f0', 
        'jitter_absolute', 'jitter_relative',
        'shimmer_absolute', 'shimmer_relative', 'hnr'
    ] + [f'mfcc_{i+1}_mean' for i in range(13)] + [f'mfcc_{i+1}_std' for i in range(13)]
    
    # Create realistic data
    data = []
    targets = []
    
    for i in range(n_samples):
        # Healthy individuals (class 0)
        if i < 140:
            row = [
                np.random.normal(120, 20),    # mean_f0 - normal pitch
                np.random.normal(15, 5),      # std_f0
                np.random.normal(80, 10),     # min_f0
                np.random.normal(180, 20),    # max_f0
                np.random.normal(0.00004, 0.00001),  # jitter_absolute
                np.random.normal(0.003, 0.001),      # jitter_relative
                np.random.normal(0.02, 0.005),       # shimmer_absolute
                np.random.normal(0.03, 0.01),        # shimmer_relative
                np.random.normal(20, 3),             # hnr - higher for healthy
            ]
            # Add MFCC features
            for j in range(26):  # 13 means + 13 stds
                row.append(np.random.normal(0, 1))
            
            data.append(row)
            targets.append(0)
        
        # Parkinson's individuals (class 1)
        else:
            row = [
                np.random.normal(110, 25),    # mean_f0 - slightly lower
                np.random.normal(25, 8),      # std_f0 - higher variation
                np.random.normal(70, 15),     # min_f0
                np.random.normal(160, 25),    # max_f0
                np.random.normal(0.00008, 0.00002),  # jitter_absolute - higher
                np.random.normal(0.006, 0.002),      # jitter_relative - higher
                np.random.normal(0.035, 0.008),      # shimmer_absolute - higher
                np.random.normal(0.05, 0.015),       # shimmer_relative - higher
                np.random.normal(15, 4),             # hnr - lower for Parkinson's
            ]
            # Add MFCC features with different distribution
            for j in range(26):
                row.append(np.random.normal(0.5, 1.2))
            
            data.append(row)
            targets.append(1)
    
    return np.array(data), np.array(targets), features

def train_simple_model():
    """Train a simple model with sample data"""
    print("Creating sample dataset...")
    X, y, feature_names = create_sample_dataset()
    
    print(f"Dataset shape: {X.shape}")
    print(f"Healthy samples: {np.sum(y == 0)}")
    print(f"Parkinson's samples: {np.sum(y == 1)}")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train model
    print("Training model...")
    model = RandomForestClassifier(
        n_estimators=100,
        random_state=42,
        max_depth=10
    )
    
    model.fit(X_train_scaled, y_train)
    
    # Evaluate
    train_score = model.score(X_train_scaled, y_train)
    test_score = model.score(X_test_scaled, y_test)
    
    print(f"Training accuracy: {train_score:.3f}")
    print(f"Testing accuracy: {test_score:.3f}")
    
    # Save model and scaler
    if not os.path.exists('model'):
        os.makedirs('model')
    
    joblib.dump(model, 'model/parkinson_model.pkl')
    joblib.dump(scaler, 'model/feature_scaler.pkl')
    
    print("✅ Model trained and saved successfully!")
    print("📁 Model files created in 'model/' directory:")
    print("   - parkinson_model.pkl")
    print("   - feature_scaler.pkl")
    
    return model, scaler

if __name__ == '__main__':
    train_simple_model()