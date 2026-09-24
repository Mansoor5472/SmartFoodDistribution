import os
import csv
import random
import datetime

# Output CSV path
DATASET_DIR = os.path.dirname(__file__)
CSV_PATH = os.path.join(DATASET_DIR, "food_demand_dataset.csv")

def generate_synthetic_dataset(num_records=1200):
    """
    Generates a realistic synthetic historical food request and distribution dataset.
    
    ACADEMIC PROJECT DISCLAIMER:
    This dataset is synthetically generated for academic demonstration and model
    evaluation purposes. It does not claim to represent real-world ground truth census
    or municipal hunger surveys, but models realistic temporal and demographic patterns.
    """
    random.seed(42)
    categories = ["COOKED_MEALS", "BAKERY", "PRODUCE_FRUITS", "DAIRY", "PACKAGED_FOOD", "BEVERAGES", "OTHER"]
    locations = ["South Extension", "Lajpat Nagar", "Connaught Place", "Lodhi Colony", "Karol Bagh", "Dwarka", "Rohini"]
    
    start_date = datetime.date(2025, 1, 1)
    
    records = []
    
    # Baseline demand per area
    area_density_map = {
        "South Extension": 6,
        "Lajpat Nagar": 8,
        "Connaught Place": 4,
        "Lodhi Colony": 7,
        "Karol Bagh": 9,
        "Dwarka": 5,
        "Rohini": 7
    }
    
    for i in range(num_records):
        curr_date = start_date + datetime.timedelta(days=i % 365)
        day_of_week = curr_date.weekday() # 0 = Monday, 6 = Sunday
        is_weekend = 1 if day_of_week in [5, 6] else 0
        month = curr_date.month
        
        location = random.choice(locations)
        shelter_density = area_density_map[location]
        donor_index = round(random.uniform(1.5, 4.8), 2)
        category = random.choice(categories)
        
        # Temperature varies by month in Northern Indian climate (approx 14C in Jan to 42C in June)
        if month in [12, 1, 2]:
            temp = round(random.uniform(12.0, 22.0), 1)
        elif month in [5, 6, 7]:
            temp = round(random.uniform(32.0, 44.0), 1)
        else:
            temp = round(random.uniform(24.0, 34.0), 1)
            
        # Beneficiaries headcount
        beneficiaries_count = random.randint(15, 120)
        
        # Historical demand lags
        historical_demand_lag1 = int(beneficiaries_count * random.uniform(0.85, 1.15))
        historical_demand_lag7 = int(beneficiaries_count * random.uniform(0.80, 1.20))
        
        # Compute ground truth meals demanded with realistic interaction formula + stochastic variance
        base_demand = (
            beneficiaries_count * 1.05 +
            (is_weekend * 28.0) +
            (shelter_density * 4.5) +
            (donor_index * 3.2) +
            (15.0 if category == "COOKED_MEALS" else 5.0) +
            (temp * 0.25) +
            random.gauss(0, 8.0)
        )
        
        meals_demanded = max(10, int(round(base_demand)))
        
        records.append({
            "date": curr_date.isoformat(),
            "day_of_week": day_of_week,
            "month": month,
            "is_weekend": is_weekend,
            "location": location,
            "shelter_density": shelter_density,
            "donor_activity_index": donor_index,
            "food_category": category,
            "temperature_celsius": temp,
            "beneficiaries_count": beneficiaries_count,
            "historical_demand_lag1": historical_demand_lag1,
            "historical_demand_lag7": historical_demand_lag7,
            "meals_demanded": meals_demanded
        })
        
    # Write to CSV
    fieldnames = list(records[0].keys())
    with open(CSV_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)
        
    print(f"[SUCCESS] Synthetic dataset generated with {len(records)} records at: {CSV_PATH}")
    return CSV_PATH

if __name__ == "__main__":
    generate_synthetic_dataset()
