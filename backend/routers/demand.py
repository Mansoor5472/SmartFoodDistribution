from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.database import get_db
from backend.models import DemandPredictionRecord, FoodRequest, DistributionRecord, User
from backend.security import get_current_user
from ml.predict import demand_service

router = APIRouter(prefix="/demand", tags=["AI Demand Prediction"])

@router.get("/prediction")
def get_food_demand_prediction(
    location: str = Query("South Extension", description="Target neighborhood/district"),
    beneficiaries_count: int = Query(60, ge=5, le=500, description="Estimated community headcount"),
    day_of_week: int = Query(4, ge=0, le=6, description="Day of week (0=Mon, 6=Sun)"),
    temperature_celsius: float = Query(28.5, description="Average temperature"),
    food_category: str = Query("COOKED_MEALS", description="Food category required"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    FEATURE 2: Predicts meal requirements using the trained Random Forest / Regression ML model.
    Also records prediction into the database for tracking.
    """
    prediction = demand_service.predict(
        day_of_week=day_of_week,
        month=datetime.utcnow().month,
        location=location,
        shelter_density=7,
        donor_activity_index=3.8,
        food_category=food_category,
        temperature_celsius=temperature_celsius,
        beneficiaries_count=beneficiaries_count,
        historical_demand_lag1=int(beneficiaries_count * 0.95),
        historical_demand_lag7=int(beneficiaries_count * 1.05)
    )

    # Save prediction record to DB
    try:
        record = DemandPredictionRecord(
            target_date=datetime.utcnow(),
            location=location,
            food_category=food_category,
            predicted_meals=prediction["predicted_meals"],
            predicted_food_kg=prediction["predicted_food_kg"],
            confidence_score=prediction["confidence_score"],
            model_name=prediction["model_metadata"]["model_name"],
            features_json=str(prediction["features_summary"])
        )
        db.add(record)
        db.commit()
    except Exception as e:
        db.rollback()

    return prediction

@router.get("/prediction/weekly")
def get_weekly_demand_forecast(
    location: str = Query("South Extension", description="Location name")
):
    """Returns 7-day predictive demand curve for visualization"""
    return demand_service.get_weekly_forecast(location=location)

@router.get("/metrics")
def get_model_evaluation_metrics():
    """
    FEATURE 2: Returns transparent model evaluation metrics: MAE, RMSE, and R² Score.
    """
    return demand_service.get_metrics()
