import joblib
import os
import numpy as np

def test_prediction():
    print("Testing model prediction...")
    
    # Load the model and size map
    try:
        model = joblib.load("model.pkl")
        size_map = joblib.load("size_map.pkl")
        print("✓ Model and size map loaded successfully")
    except Exception as e:
        print(f"✗ Failed to load model or size map: {e}")
        return False
    
    # Test predict with sample data
    try:
        # Sample data: weight, age, height
        test_data = np.array([[70, 30, 175]])  # 70kg, 30 years, 175cm
        
        # Make prediction
        prediction = model.predict(test_data)[0]
        
        # Create inverse mapping from numeric values to size labels
        inv_map = {v: k for k, v in size_map.items()}
        closest_numeric = min(inv_map.keys(), key=lambda x: abs(x - round(prediction)))
        prediction_label = inv_map[closest_numeric]
        
        print(f"✓ Prediction successful: {prediction_label}")
        print(f"  For a person weighing 70kg, age 30, height 175cm, predicted size is {prediction_label}")
        print(f"  Raw numeric prediction: {prediction:.2f}")
        return True
    except Exception as e:
        print(f"✗ Prediction failed: {e}")
        return False

if __name__ == "__main__":
    test_prediction()
