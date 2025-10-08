# Sales Price Prediction – ML

![Login Page](/images/login.png)
*Figure 1: Secure login page for the Sales Price Prediction web application.*

---

## Introduction

Predicting sales prices accurately is critical for business profitability and operational efficiency. This project delivers a full-stack machine learning solution to forecast **total profit** for sales transactions, leveraging both classic and ensemble regression models. The system includes a robust API and an interactive web interface.

---

## Dataset

- **Source:** `Datasets/clean_sales.csv`
- **Size:** _[Add row count, e.g., “~10,000 records”]_  
- **Features:**
  - Numeric: `Units Sold`, `Unit Price`, `Unit Cost`, `Order_Ship_Days`
  - Categorical: `Region`, `Country`, `Item Type`, `Sales Channel`, `Order Priority`, `Order Weekday`
  - Engineered: `Profit_per_Unit`, `Total_Revenue`, `Log_Profit`
- **Preprocessing:**
  - Outlier removal (IQR clipping)
  - One-hot encoding for categorical variables
  - Feature scaling using StandardScaler
  - Handling missing values (filled with 0)
  - Feature engineering for domain insight

![Dataset Distribution](../images/dataset-dist.png)
*Figure 2: Distribution of total profit and unit price post-cleaning.*

---

## Models

### Linear Regression (LR)
A baseline model to establish a simple benchmark. Fits a linear function to the features.

### Random Forest Regressor (RF)
An ensemble of decision trees, capable of capturing complex, non-linear relationships and handling outliers effectively.

![Model Architecture](../images/model-architecture.png)
*Figure 3: Overview of the ML pipeline from data preprocessing to model deployment.*

---

## Results

Below are the model performances on the test set:

| Model              | R²    | MAE      | MSE      | RMSE     |
|--------------------|-------|----------|----------|----------|
| Linear Regression  | 0.XXX | X,XXX    | X,XXX,XXX| X,XXX    |
| Random Forest      | 0.XXX | X,XXX    | X,XXX,XXX| X,XXX    |

*(Replace Xs with your actual numbers)*

**Sanity Check Example:**
![Sanity Check](../images/sanity-check.png)
*Figure 4: Sanity check results for model prediction on edge cases.*

**Model Comparison:**
![Model Comparison](../images/model-comparison.png)
*Figure 5: R² and RMSE comparison between Linear Regression and Random Forest.*

---

## Deployment

### API

- **GET /**: API home and endpoint descriptions.
- **GET /options**: Retrieve dropdown options for categorical features.
- **POST /predict?model=lr|rf**: Predict total profit.

#### Example Request

```json
POST /predict?model=rf
Content-Type: application/json

{
  "Units Sold": 500,
  "Unit Price": 19.99,
  "Unit Cost": 12.50,
  "Order_Ship_Days": 2,
  "Order Priority": "High",
  "Sales Channel": "Online",
  "Region": "Europe",
  "Country": "Germany",
  "Item Type": "Clothes",
  "Order Weekday": "mon"
}
```

#### Example Response

```json
{
  "model": "rf",
  "prediction": 3775.56,
  "metrics": {
    "r2": 0.85,
    "mae": 420.2,
    "mse": 445100.3,
    "rmse": 667.4
  }
}
```

### Frontend

- Built with Next.js.
- Features secure login and easy-to-use prediction form.

![App UI Screenshot](../images/ui-screenshot.png)
*Figure 6: Main UI for entering sales details and viewing predictions.*

---

## Lessons Learned

- **Challenges:** Outlier handling, feature engineering, and model drift.
- **Improvements:** Robust scaling, engineered features, supporting both API and UI access.
- **Takeaways:** Preprocessing is vital; ensemble models excel with complex data; accessible tools democratize ML.

---

## Project Structure

```
.
├── Datasets/
│   └── clean_sales.csv
├── images/
│   ├── login.png
│   ├── dataset-dist.png
│   ├── model-architecture.png
│   ├── model-comparison.png
│   ├── sanity-check.png
│   └── ui-screenshot.png
├── client/
│   └── ...
├── model.py
├── pros.py
├── server.py
├── utils.py
└── ...
```

---

## References

- [scikit-learn](https://scikit-learn.org/)
- [pandas](https://pandas.pydata.org/)
- [Next.js](https://nextjs.org/)

---

> **Note:** Replace image files with your actual screenshots, plots, or diagrams for best results.
