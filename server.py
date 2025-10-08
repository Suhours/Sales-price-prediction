from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os
from utils import prepare_features_from_raw

# Initialize Flask app
server = Flask(__name__)
CORS(server)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
DATASETS_DIR = os.path.join(BASE_DIR, "Datasets")

# Load trained models using absolute paths
MODELS = {
    "lr": joblib.load(os.path.join(MODELS_DIR, "lr_model.joblib")),
    "rf": joblib.load(os.path.join(MODELS_DIR, "rf_model.joblib")),
}

# Load dataset once (for dropdowns) using absolute path (case-insensitive filename support)
def _find_dataset_path() -> str:
    candidate_names = [
        "clean_sales.csv",
        "clean_Sales.csv",
        "Clean_Sales.csv",
        "Clean_sales.csv",
    ]
    for name in candidate_names:
        p = os.path.join(DATASETS_DIR, name)
        if os.path.exists(p):
            return p
    # fallback: first csv in datasets dir
    for fname in os.listdir(DATASETS_DIR) if os.path.isdir(DATASETS_DIR) else []:
        if fname.lower().endswith(".csv"):
            return os.path.join(DATASETS_DIR, fname)
    return os.path.join(DATASETS_DIR, "clean_sales.csv")

try:
    dataset_path = _find_dataset_path()
    DATASET = pd.read_csv(dataset_path)
except Exception as e:
    print(f"⚠️ Warning: Failed to load dataset for options from {dataset_path} - {e}")
    DATASET = pd.DataFrame()

@server.route("/", methods=["GET"])
def home():
    """API Home Endpoint"""
    return jsonify({
        "message": "📊 Sales Price Prediction API is running!",
        "endpoints": {
            "GET /options": "Fetch available dropdown options (regions, countries, etc.)",
            "POST /predict?model=lr|rf": {
                "expects_json": {
                    "Units Sold": "float, required",
                    "Unit Price": "float, required",
                    "Unit Cost": "float, required",
                    "Order_Ship_Days": "int, optional, default 0",
                    "Order Priority": "string, optional, default 'Medium'",
                    "Sales Channel": "string, optional, default 'Offline'",
                    "Region": "string, optional, default 'Other'",
                    "Country": "string, optional, default 'Other'",
                    "Item Type": "string, optional, default 'Other'",
                    "Order Weekday": "string, optional, default 'Other'"
                }
            }
        }
    })


@server.route("/options", methods=["GET"])
def get_options():
    """Return unique dropdown options from dataset"""
    if DATASET.empty:
        return jsonify({"error": "Dataset not found or failed to load"}), 500

    try:
        # If raw categorical columns exist, use them
        if all(col in DATASET.columns for col in [
            "Region", "Country", "Item Type", "Sales Channel", "Order Priority", "Order Weekday"
        ]):
            regions = sorted(DATASET["Region"].dropna().unique().tolist())
            countries = sorted(DATASET["Country"].dropna().unique().tolist())
            items = sorted(DATASET["Item Type"].dropna().unique().tolist())
            channels = sorted(DATASET["Sales Channel"].dropna().unique().tolist())
            priorities = sorted(DATASET["Order Priority"].dropna().unique().tolist())
            weekdays = sorted(DATASET["Order Weekday"].dropna().unique().tolist())
        else:
            # Derive categories from one-hot encoded columns (e.g., Region_*, Country_*, ...)
            def derive(prefix: str):
                values = [c[len(prefix):].strip() for c in DATASET.columns if c.startswith(prefix)]
                return sorted(list(dict.fromkeys(values)))  # preserve order, unique

            regions = derive("Region_")
            countries = derive("Country_")
            items = derive("Item Type_")
            channels = derive("Sales Channel_")

            # Map priority letters to words if present
            raw_priorities = derive("Order Priority_")
            if raw_priorities and set(raw_priorities).issubset({"C","H","L","M"}):
                map_priority = {"C": "Critical", "H": "High", "L": "Low", "M": "Medium"}
                priorities = [map_priority.get(p, p) for p in raw_priorities]
            else:
                priorities = raw_priorities

            # Map weekday short to full names
            raw_weekdays = derive("Order Weekday_")
            map_weekday = {
                "mon": "Monday", "tue": "Tuesday", "wed": "Wednesday",
                "thur": "Thursday", "thu": "Thursday", "fri": "Friday",
                "sat": "Saturday", "sun": "Sunday",
            }
            weekdays = [map_weekday.get(w.lower(), w) for w in raw_weekdays]

        return jsonify({
            "regions": regions,
            "countries": countries,
            "items": items,
            "channels": channels,
            "priorities": priorities,
            "weekdays": weekdays
        })
    except Exception as e:
        return jsonify({"error": f"Failed to extract options: {e}"}), 500


@server.route("/predict", methods=["POST"])
def predict():
    """Predict Total Profit using trained models"""
    choice = (request.args.get("model") or "").lower()
    if choice not in MODELS:
        return jsonify({"error": "Unknown model. Use model=lr or model=rf"}), 400

    model = MODELS[choice]

    # Parse input data
    data = request.get_json(silent=True) or {}
    required = ["Units Sold", "Unit Price", "Unit Cost"]
    missing = [k for k in required if k not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {missing}"}), 400

    try:
        x_new = prepare_features_from_raw(data)
        pred = float(model.predict(x_new)[0])
    except Exception as e:
        return jsonify({"error": f"Failed to prepare/predict: {e}"}), 500

    return jsonify({
        "model": "linear_regression" if choice == "lr" else "random_forest",
        "input": {
            "Units Sold": float(data["Units Sold"]),
            "Unit Price": float(data["Unit Price"]),
            "Unit Cost": float(data["Unit Cost"]),
            "Order_Ship_Days": int(data.get("Order_Ship_Days", 0)),
            "Order Priority": str(data.get("Order Priority", "Medium")),
            "Sales Channel": str(data.get("Sales Channel", "Offline")),
            "Region": str(data.get("Region", "Other")),
            "Country": str(data.get("Country", "Other")),
            "Item Type": str(data.get("Item Type", "Other")),
            "Order Weekday": str(data.get("Order Weekday", "Other"))
        },
        "prediction": round(pred, 2)
    })


if __name__ == "__main__":
    server.run(host="0.0.0.0", port=8000, debug=False)
