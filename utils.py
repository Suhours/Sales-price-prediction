import json
import joblib
import pandas as pd
import numpy as np

# Load train columns & scaler
TRAIN_COLUMNS = json.load(open("models/train_columns.json"))
SCALER = joblib.load("models/Sales_scaler.pkl")

def apply_clip(val, name, clip_ranges):
    """Clip value if range provided"""
    if clip_ranges and name in clip_ranges:
        min_val, max_val = clip_ranges[name]
        return max(min(val, max_val), min_val)
    return val

def prepare_features_from_raw(record: dict, clip_ranges: dict = None) -> pd.DataFrame:
    """
    Prepare a single new record for prediction safely.
    Handles numeric features, engineered features, one-hot encoding,
    clipping to training ranges, and scaling.
    """
    
    # --- Extract numeric values with defaults ---
    units_sold = float(record.get("Units Sold", 0))
    unit_price = float(record.get("Unit Price", 0))
    unit_cost = float(record.get("Unit Cost", 0))
    order_ship_days = int(record.get("Order_Ship_Days", 0))
    order_year = int(record.get("Order year", 2023))
    order_month = int(record.get("Order Month", 1))
    
    # --- Feature engineering ---
    profit_per_unit = max(0.0, unit_price - unit_cost) if units_sold > 0 else 0.0
    total_revenue = unit_price * units_sold
    is_online = 1 if str(record.get("Sales Channel", "Offline")).lower() == "online" else 0

    # --- Initialize row with zeros for all train columns ---
    row = {col: 0.0 for col in TRAIN_COLUMNS}

    # --- Fill numeric / engineered features with clipping ---
    numeric_map = {
        "Units Sold": units_sold,
        "Unit Price": unit_price,
        "Unit Cost": unit_cost,
        "Profit_per_Unit": profit_per_unit,
        "Total_Revenue": total_revenue,
        "Order_Ship_Days": order_ship_days,
        "Order year": order_year,
        "Order Month": order_month,
        "Is_Online": is_online
    }
    for name, val in numeric_map.items():
        if name in row:
            row[name] = float(apply_clip(val, name, clip_ranges))

    # --- Handle categorical features ---
    categorical_features = {
        "Order Priority": record.get("Order Priority", "Medium"),
        "Sales Channel": record.get("Sales Channel", "Offline"),
        "Region": record.get("Region", "Other"),
        "Country": record.get("Country", "Other"),
        "Item Type": record.get("Item Type", "Other"),
        "Order Weekday": record.get("Order Weekday", "Other")
    }

    for cat_name, cat_val in categorical_features.items():
        col_name = f"{cat_name}_{cat_val}"
        if col_name in row:
            row[col_name] = 1.0

    # --- Create DataFrame ---
    df_one = pd.DataFrame([row], columns=TRAIN_COLUMNS)

    # --- Apply scaler if available ---
    if hasattr(SCALER, "feature_names_in_"):
        cols_to_scale = list(SCALER.feature_names_in_)
        df_one[cols_to_scale] = SCALER.transform(df_one[cols_to_scale])

    return df_one
