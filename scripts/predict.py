#!/usr/bin/env python
# filepath: c:\Users\HP\Desktop\ecom-service\scripts\predict.py
import argparse
import json
import joblib
import os
import sys
import numpy as np

def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Predict clothing size based on physical attributes')
    parser.add_argument('--weight', type=float, required=True, help='Weight in kg')
    parser.add_argument('--age', type=float, required=True, help='Age in years')
    parser.add_argument('--height', type=float, required=True, help='Height in cm')
    args = parser.parse_args()
    
    try:
        # Get the base directory of the application
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        model_dir = os.path.join(base_dir, "AI-model")
        
        # Load the model and size map (not label encoder)
        model = joblib.load(os.path.join(model_dir, "model.pkl"))
        size_map = joblib.load(os.path.join(model_dir, "size_map.pkl"))
        
        # Create inverse mapping from numeric values to size labels
        inv_map = {v: k for k, v in size_map.items()}
          # Make prediction
        features = np.array([[args.weight, args.age, args.height]])
        pred = model.predict(features)[0]
        closest_numeric = min(inv_map.keys(), key=lambda x: abs(x - round(pred)))
        pred_label = inv_map[closest_numeric]
        
        # Return prediction as JSON
        result = {
            "predicted_numeric": round(float(pred), 2),
            "predicted_size": pred_label
        }
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
