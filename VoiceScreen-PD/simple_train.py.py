import numpy as np
import os

# Try to import sklearn, if not available, we'll create a dummy model
try:
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.preprocessing import StandardScaler
    from sklearn.model_selection import train_test_split
    import joblib
    sklearn_available = True
    print("✅ scikit-learn available")
except ImportError:
    sklearn_available = False
    print("⚠️ scikit-learn not available. Creating dummy model for demonstration.")

def create_dummy_model():
    """Create a dummy model for demonstration"""
    print("🤖 Creating model for VoiceScreen PD...")
    
    # Create model directory if it doesn't exist
    if not os.path.exists('model'):
        os.makedirs('model')
    
    if sklearn_available:
        # Create realistic dataset
        np.random.seed(42)
        n_samples = 200
        
        # Create features (26 features as in our app)
        X = np.random.randn(n_samples, 26)
        y = np.random.choice([0, 1], n_samples, p=[0.7, 0.3])
        
        # Make it more realistic - Parkinson's patients have different feature patterns
        for i in range(n_samples):
            if y[i] == 1:  # Parkinson's cases
                # Higher jitter and shimmer
                X[i, 4:8] += np.random.normal(0.5, 0.1, 4)
                # Lower HNR
                X[i, 8] -= np.random.normal(0.3, 0.1)
                # Different MFCC patterns
                X[i, 9:22] += np.random.normal(0.2, 0.1, 13)
        
        # Simple model
        model = RandomForestClassifier(n_estimators=50, random_state=42, max_depth=10)
        scaler = StandardScaler()
        
        X_scaled = scaler.fit_transform(X)
        model.fit(X_scaled, y)
        
        # Evaluate
        train_score = model.score(X_scaled, y)
        print(f"📊 Model training accuracy: {train_score:.3f}")
        
        # Save model
        joblib.dump(model, 'model/parkinson_model.pkl')
        joblib.dump(scaler, 'model/feature_scaler.pkl')
        print("✅ Model trained and saved successfully!")
        print("📁 Model files created in 'model/' directory")
        
    else:
        # Create placeholder files so the app doesn't crash
        with open('model/parkinson_model.pkl', 'w') as f:
            f.write('dummy_model_for_demonstration')
        with open('model/feature_scaler.pkl', 'w') as f:
            f.write('dummy_scaler_for_demonstration')
        print("⚠️ Created placeholder model files (scikit-learn not available)")
        print("⚠️ The app will run but predictions will be simulated")

if __name__ == '__main__':
    create_dummy_model()