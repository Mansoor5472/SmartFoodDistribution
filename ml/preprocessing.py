import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

BASE_DIR = os.path.dirname(__file__)
DATASET_PATH = os.path.join(BASE_DIR, "dataset", "food_demand_dataset.csv")

# Fixed mappings for production feature engineering
LOCATION_MAP = {
    "South Extension": 0,
    "Lajpat Nagar": 1,
    "Connaught Place": 2,
    "Lodhi Colony": 3,
    "Karol Bagh": 4,
    "Dwarka": 5,
    "Rohini": 6
}

CATEGORY_MAP = {
    "COOKED_MEALS": 0,
    "BAKERY": 1,
    "PRODUCE_FRUITS": 2,
    "DAIRY": 3,
    "PACKAGED_FOOD": 4,
    "BEVERAGES": 5,
    "OTHER": 6
}

FEATURE_COLUMNS = [
    "day_of_week",
    "month",
    "is_weekend",
    "location_code",
    "shelter_density",
    "donor_activity_index",
    "category_code",
    "temperature_celsius",
    "beneficiaries_count",
    "historical_demand_lag1",
    "historical_demand_lag7"
]

def load_and_preprocess_data(csv_path: str = DATASET_PATH):
    """
    Loads raw historical food demand CSV data, applies clean transformations,
    encodes categorical dimensions, and scales numerical values.
    """
    if not os.path.exists(csv_path):
        from ml.dataset.generate_dataset import generate_synthetic_dataset
        generate_synthetic_dataset()

    df = pd.read_csv(csv_path)

    # Encode categoricals with safe defaults
    df["location_code"] = df["location"].map(lambda x: LOCATION_MAP.get(x, 0))
    df["category_code"] = df["food_category"].map(lambda x: CATEGORY_MAP.get(x, 0))

    X = df[FEATURE_COLUMNS].copy()
    y = df["meals_demanded"].values

    # Train / Test Split (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    return {
        "X_train": X_train_scaled,
        "X_test": X_test_scaled,
        "y_train": y_train,
        "y_test": y_test,
        "scaler": scaler,
        "feature_names": FEATURE_COLUMNS,
        "location_map": LOCATION_MAP,
        "category_map": CATEGORY_MAP,
        "raw_df": df
    }

def transform_inference_input(
    day_of_week: int,
    month: int,
    location: str,
    shelter_density: int,
    donor_activity_index: float,
    food_category: str,
    temperature_celsius: float,
    beneficiaries_count: int,
    historical_demand_lag1: int,
    historical_demand_lag7: int,
    scaler: StandardScaler
) -> np.ndarray:
    """
    Transforms a single prediction input into the scaled feature space expected by the model.
    """
    is_weekend = 1 if day_of_week in [5, 6] else 0
    location_code = LOCATION_MAP.get(location, 0)
    category_code = CATEGORY_MAP.get(food_category, 0)

    raw_features = pd.DataFrame([{
        "day_of_week": day_of_week,
        "month": month,
        "is_weekend": is_weekend,
        "location_code": location_code,
        "shelter_density": shelter_density,
        "donor_activity_index": donor_activity_index,
        "category_code": category_code,
        "temperature_celsius": temperature_celsius,
        "beneficiaries_count": beneficiaries_count,
        "historical_demand_lag1": historical_demand_lag1,
        "historical_demand_lag7": historical_demand_lag7
    }])[FEATURE_COLUMNS]

    return scaler.transform(raw_features)
