import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
from utils import prepare_features_from_raw

# --- 1) Load dataset ---
CSV_PATH = 'Datasets/clean_sales.csv'
df = pd.read_csv(CSV_PATH)

# --- 2) Split features and target ---
X = df.drop(columns=["Total Profit", "Log_Profit"])
y = df["Total Profit"]

# --- 3) Train/test split ---
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# --- 4) Train Linear Regression ---
lr = LinearRegression()
lr.fit(X_train, y_train)
lr_pred = lr.predict(X_test)

# --- 5) Train Random Forest ---
rf = RandomForestRegressor(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)
rf_pred = rf.predict(X_test)

# --- 6) Print metrics ---
def print_metrics(y_true, y_pred):
    mae = mean_absolute_error(y_true, y_pred)
    mse = mean_squared_error(y_true, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_true, y_pred)
    print(f"  R²   : {r2:.3f}")
    print(f"  MAE  : {mae:,.0f}")
    print(f"  MSE  : {mse:,.0f}")
    print(f"  RMSE : {rmse:,.0f}")

print("\nLinear Regression Performance:")
print_metrics(y_test, lr_pred)
print("\nRandom Forest Performance:")
print_metrics(y_test, rf_pred)

# --- 7) Clipping ranges for safe prediction ---
# clip_ranges = {
#     "Units Sold": (df["Units Sold"].min(), df["Units Sold"].max()),
#     "Unit Price": (df["Unit Price"].min(), df["Unit Price"].max()),
#     "Unit Cost": (df["Unit Cost"].min(), df["Unit Cost"].max()),
#     "Profit_per_Unit": ((df["Unit Price"] - df["Unit Cost"]).min(),
#                         (df["Unit Price"] - df["Unit Cost"]).max()),
#     "Total_Revenue": ((df["Unit Price"] * df["Units Sold"]).min(),
#                       (df["Unit Price"] * df["Units Sold"]).max()),
#     "Order_Ship_Days": (df["Order_Ship_Days"].min(), df["Order_Ship_Days"].max())
# }


# --------------------------------
# # Single-row prediction (sanity check)
# --------------------------------
# Pick one unseen row from X_test and predict both models.
# Use iloc[[i]] (double brackets) to keep it as a DataFrame with column names
i = 3
x_one_df = X_test.iloc[[i]]   # 1-row DataFrame (keeps feature names)
y_true   = y_test.iloc[i]     # scalar

p_lr_one = float(lr.predict(x_one_df)[0])
p_rf_one = float(rf.predict(x_one_df)[0])

print("\nSingle-row sanity check:")
print(f"  Actual Price: ${y_true:,.0f}")
print(f"  LR Pred     : ${p_lr_one:,.0f}")
print(f"  RF Pred     : ${p_rf_one:,.0f}")


# --- 8) Example new record with extreme values ---
# new_record = {
#     "Units Sold": 500000,
#     "Unit Price": -50,
#     "Unit Cost": 999999,
#     "Order_Ship_Days": -10,
#     "Order Priority": "H",
#     "Sales Channel": "Online",
#     "Region": "North America",
#     "Country": "United States of America",
#     "Item Type": "Clothes",
#     "Order Weekday": "mon"
# }

# # --- 9) Prepare features safely ---
# X_new_df = prepare_features_from_raw(new_record, clip_ranges=clip_ranges)
# print("\n=== Clipped & Scaled Features ===")
# print(X_new_df)

# --- 10) Predictions ---
# lr_new = float(lr.predict(X_new_df)[0])
# rf_new = float(rf.predict(X_new_df)[0])
# print("\n=== Predictions after Clipping ===")
# print("Linear Regression:", lr_new)
# print("Random Forest    :", rf_new)
# print("\n=== Custom Input Prediction ===")
# print("Linear Regression:", float(lr.predict(X_new_df)[0]))
# print("Random Forest    :", float(rf.predict(X_new_df)[0]))



# --- 11) Save models (optional) ---

# joblib.dump(lr, "models/lr_model.joblib")
# joblib.dump(rf, "models/rf_model.joblib")
# print("\nModels saved to models")
# new_record = {
#     "Units Sold": 500000,        # aad u weyn, ka baxsan dataset
#     "Unit Price": -50,           # negative, qalad
#     "Unit Cost": 999999,         # aad u weyn, ka baxsan dataset
#     "Order_Ship_Days": -10,      # negative, qalad
#     "Order Priority": "H",
#     "Sales Channel": "Online",
#     "Region": "North America",
#     "Country": "United States of America",
#     "Item Type": "Clothes",
#     "Order Weekday": "mon"
# }

# # --- Clip ranges (automatic laga soo qaatay dataset-ka tababarka) ---
# clip_ranges = {
#     "Units Sold": (df["Units Sold"].min(), df["Units Sold"].max()),
#     "Unit Price": (df["Unit Price"].min(), df["Unit Price"].max()),
#     "Unit Cost": (df["Unit Cost"].min(), df["Unit Cost"].max()),
#     "Profit_per_Unit": ((df["Unit Price"] - df["Unit Cost"]).min(),
#                         (df["Unit Price"] - df["Unit Cost"]).max()),
#     "Total_Revenue": ((df["Unit Price"] * df["Units Sold"]).min(),
#                       (df["Unit Price"] * df["Units Sold"]).max()),
#     "Order_Ship_Days": (df["Order_Ship_Days"].min(), df["Order_Ship_Days"].max())
# }

# # --- Prepare features safely ---
# X_new_df = prepare_features_from_raw(new_record, clip_ranges=clip_ranges)

# # --- Predictions ---
# lr_pred_new = float(lr.predict(X_new_df)[0])
# rf_pred_new = float(rf.predict(X_new_df)[0])

# print("Linear Regression Prediction:", lr_pred_new)
# print("Random Forest Prediction    :", rf_pred_new)
# print("Linear Regression:", float(lr.predict(X_new_df)[0]))
# print("Random Forest    :", float(rf.predict(X_new_df)[0]))

