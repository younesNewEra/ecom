from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

# Load the model and size map
model = joblib.load("model.pkl")
size_map = joblib.load("size_map.pkl")
inv_map = {v: k for k, v in size_map.items()}

@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.get_json()
    if not all(k in data for k in ("weight", "age", "height")):
        return jsonify({"error": "Missing weight, age, or height"}), 400

    try:
        # Get input features
        weight = float(data["weight"])
        age = float(data["age"])
        height = float(data["height"])

        # Prepare input for model
        features = np.array([[weight, age, height]])

        # Predict numeric size
        pred = model.predict(features)[0]
        closest_numeric = min(inv_map.keys(), key=lambda x: abs(x - round(pred)))
        predicted_size = inv_map[closest_numeric]

        return jsonify({
            "predicted_numeric": round(pred, 2),
            "predicted_size": predicted_size
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
