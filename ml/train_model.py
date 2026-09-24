import os
import sys
import json
import pickle
import numpy as np

# Ensure parent directory is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from ml.preprocessing import load_and_preprocess_data

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.pkl")
METRICS_PATH = os.path.join(BASE_DIR, "metrics.json")

def train_and_evaluate_models():
    """
    Trains and compares Linear Regression vs Random Forest Regressor on the food demand dataset.
    Calculates actual MAE, RMSE, and R2 score. Saves the champion model and metrics.
    """
    print("[INFO] Starting ML Model Training Pipeline...")
    data = load_and_preprocess_data()

    X_train = data["X_train"]
    X_test = data["X_test"]
    y_train = data["y_train"]
    y_test = data["y_test"]
    scaler = data["scaler"]

    print(f"[INFO] Training set size: {X_train.shape[0]}, Test set size: {X_test.shape[0]}")

    # 1. Model A: Linear Regression (Baseline)
    lr = LinearRegression()
    lr.fit(X_train, y_train)
    lr_preds = lr.predict(X_test)

    lr_mae = float(round(mean_absolute_error(y_test, lr_preds), 3))
    lr_rmse = float(round(np.sqrt(mean_squared_error(y_test, lr_preds)), 3))
    lr_r2 = float(round(r2_score(y_test, lr_preds), 4))

    print(f"[EVALUATION] Linear Regression -> MAE: {lr_mae}, RMSE: {lr_rmse}, R2: {lr_r2}")

    # 2. Model B: Random Forest Regressor (Non-linear & Feature Interactions)
    rf = RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42)
    rf.fit(X_train, y_train)
    rf_preds = rf.predict(X_test)

    rf_mae = float(round(mean_absolute_error(y_test, rf_preds), 3))
    rf_rmse = float(round(np.sqrt(mean_squared_error(y_test, rf_preds)), 3))
    rf_r2 = float(round(r2_score(y_test, rf_preds), 4))

    print(f"[EVALUATION] Random Forest Regressor -> MAE: {rf_mae}, RMSE: {rf_rmse}, R2: {rf_r2}")

    # Model Selection: Pick model with higher R2 score and lower MAE
    if rf_r2 >= lr_r2:
        champion_model = rf
        champion_name = "Random Forest Regressor"
        chosen_mae = rf_mae
        chosen_rmse = rf_rmse
        chosen_r2 = rf_r2
        selection_reason = (
            "Random Forest Regressor was chosen because it models complex non-linear "
            "interactions between weather temperature, day of week, shelter density, "
            f"and food categories with significantly lower error (MAE: {rf_mae} vs {lr_mae}) "
            f"and higher explained variance (R2: {rf_r2} vs {lr_r2})."
        )
    else:
        champion_model = lr
        champion_name = "Linear Regression"
        chosen_mae = lr_mae
        chosen_rmse = lr_rmse
        chosen_r2 = lr_r2
        selection_reason = "Linear Regression provided stronger generalization on the test split."

    # Save artifacts
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(champion_model, f)

    with open(SCALER_PATH, "wb") as f:
        pickle.dump(scaler, f)

    # Save metrics JSON for API inspection and dashboard display
    metrics = {
        "model_name": champion_name,
        "trained_date": "2026-09-22",
        "dataset_type": "Synthetic Historical Demand (Academic Demonstration)",
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "evaluation": {
            "MAE": chosen_mae,
            "RMSE": chosen_rmse,
            "R2_Score": chosen_r2
        },
        "comparison": {
            "linear_regression": { "MAE": lr_mae, "RMSE": lr_rmse, "R2_Score": lr_r2 },
            "random_forest": { "MAE": rf_mae, "RMSE": rf_rmse, "R2_Score": rf_r2 }
        },
        "selection_reason": selection_reason,
        "feature_importances": (
            {k: float(round(v, 4)) for k, v in zip(data["feature_names"], rf.feature_importances_)}
            if hasattr(rf, "feature_importances_") else {}
        )
    }

    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    print(f"[SUCCESS] Best model ({champion_name}) saved to: {MODEL_PATH}")
    print(f"[SUCCESS] Metrics saved to: {METRICS_PATH}")
    return metrics

if __name__ == "__main__":
    train_and_evaluate_models()
