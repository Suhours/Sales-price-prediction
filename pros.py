import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import joblib, os, json


CSV_PATH = 'Datasets/sales_Dataset_cleaned.csv'
df = pd.read_csv(CSV_PATH)

# print(df.head())

# print(df.isnull().sum())

# 2) Clean target formatting
df["Total Profit"] = df["Total Profit"].replace(r"[\$,]", "", regex=True).astype(float)

# fill missing values


# remove duplicates
before = df.shape
df = df.drop_duplicates()
after = df.shape
# print(f"Dropped duplicates: {before} → {after}")
# Remove $ and , from numeric columns
for col in ["Total Profit", "Unit Price", "Unit Cost"]:
    df[col] = df[col].replace(r"[\$,]", "", regex=True).astype(float)

# Make sure other numeric columns are numeric
numeric_check = ["Units Sold", "Order_Ship_Days"]
for col in numeric_check:
    df[col] = pd.to_numeric(df[col], errors='coerce')
# IQR capping
def iqr_fun(series, k=1.5):
    q1, q3 = series.quantile([0.25, 0.75])
    iqr = q3 - q1
    lower = q1 - k * iqr
    upper = q3 + k * iqr
    return lower, upper

iqr_cols = ["Total Profit", "Unit Price", "Unit Cost", "Units Sold", "Order_Ship_Days"]
for col in iqr_cols:
    low, high = iqr_fun(df[col])
    df[col] = df[col].clip(lower=low, upper=high)
# print(df["Total Profit"].describe())
# print(df.info())

# hot encode
# hot encode categorical columns
categorical_cols = ['Region', 'Country', 'Item Type', 'Sales Channel', 'Order Priority', 'Order Weekday']

df = pd.get_dummies(df, columns=categorical_cols)



# print(df.head(5))

#  Feature engineering (no leakage)
df["Profit_per_Unit"] = df["Total Profit"] / df["Units Sold"].replace(0, np.nan) # fixed denominator
df["Total_Revenue"] = df["Unit Price"] * df["Units Sold"]
df["Log_Profit"] = np.log1p(df["Total Profit"])


#  Feature scaling (X only; keep targets & dummies unscaled
# numeric_cols = ["Units Sold", "Unit Price", "Unit Cost", "Profit_per_Unit", "Total_Revenue", "Order_Ship_Days"]
# for col in numeric_cols:
#     df[col] = df[col].fillna(0) # fill NaN values with 0 before scaling

# scaler = StandardScaler()
# df[numeric_cols] = scaler.fit_transform(df[numeric_cols])
# # print(df.head(5))
# # save the scaler and training features
# os.makedirs("models", exist_ok=True)
# joblib.dump(scaler, "models/Sales_scaler.pkl")
# TRAIN_COLUMNS = df.drop(columns=["Total Profit", "Sales Channel_Offline", "Sales Channel_Online", "Log_Profit"]).columns.tolist()
# json.dump(TRAIN_COLUMNS, open("models/train_columns.json", "w"))




dont_scale = ["Total Profit", "Log_Profit"]
# Dummies/categorical columns
exclude = [c for c in df.columns if c.startswith("Sales Channel_") or c.startswith("Order Priority_") or c == "Is_Online"]
# fill NaN values with 0 before scaling
df = df.fillna(0)

numeric_cols = df.select_dtypes(include=["int64", "float64"]).columns.tolist()
num_features_to_scale = [c for c in numeric_cols if c not in dont_scale + exclude]

# Scale
scaler = StandardScaler()
df[num_features_to_scale] = scaler.fit_transform(df[num_features_to_scale])
# print(df.head(5))
# save the scaler and training features
os.makedirs("models", exist_ok=True)
joblib.dump(scaler, "models/Sales_scaler.pkl")
TRAIN_COLUMNS = df.drop(columns=["Total Profit", "Log_Profit"]).columns.tolist()
json.dump(TRAIN_COLUMNS, open("models/train_columns.json", "w"))

# === FINAL SNAPSHOT ===
print("\n=== FINAL HEAD ===")
print(df.head())

print("\n=== FINAL INFO ===")
print(df.info())

print("\n=== FINAL MISSING VALUES ===")
print(df.isnull().sum())

# # 10) Save
OUT_PATH = "Datasets/clean_Sales.csv"
df.to_csv(OUT_PATH, index=False)
