from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Donation, FoodRequest, DonationStatus, RequestStatus
from backend.schemas import DonationResponse
from ml.matcher import matcher, haversine_distance
from ml.demand_predictor import demand_predictor

router = APIRouter(prefix="/ml", tags=["AI & Machine Learning"])

@router.get("/match/request/{request_id}")
def match_donations_for_request(request_id: int, db: Session = Depends(get_db)):
    req = db.query(FoodRequest).filter(FoodRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Food request not found")

    available_donations = db.query(Donation).filter(
        Donation.status == DonationStatus.AVAILABLE
    ).all()

    req_dict = {
        "id": req.id,
        "latitude": req.latitude,
        "longitude": req.longitude,
        "required_servings": req.required_servings,
        "food_preference": req.food_preference.value if hasattr(req.food_preference, "value") else str(req.food_preference)
    }

    donations_data = []
    for d in available_donations:
        donations_data.append({
            "id": d.id,
            "food_name": d.food_name,
            "food_category": d.food_category.value if hasattr(d.food_category, "value") else str(d.food_category),
            "is_veg": d.is_veg,
            "quantity_kg": d.quantity_kg,
            "servings": d.servings,
            "expiry_time": d.expiry_time,
            "latitude": d.latitude,
            "longitude": d.longitude,
            "pickup_address": d.pickup_address,
            "image_url": d.image_url,
            "contact_phone": d.contact_phone
        })

    ranked_results = matcher.rank_donations_for_request(req_dict, donations_data)
    return {
        "request_id": req.id,
        "request_title": req.title,
        "required_servings": req.required_servings,
        "total_candidates": len(ranked_results),
        "matches": ranked_results
    }

@router.get("/nearby-donations")
def get_nearby_donations(
    lat: float = 28.6139,
    lon: float = 77.2090,
    max_distance_km: float = 25.0,
    db: Session = Depends(get_db)
):
    donations = db.query(Donation).filter(Donation.status == DonationStatus.AVAILABLE).all()
    results = []
    for d in donations:
        dist = haversine_distance(lat, lon, d.latitude, d.longitude)
        if dist <= max_distance_km:
            results.append({
                "donation_id": d.id,
                "food_name": d.food_name,
                "food_category": d.food_category.value if hasattr(d.food_category, "value") else str(d.food_category),
                "is_veg": d.is_veg,
                "servings": d.servings,
                "quantity_kg": d.quantity_kg,
                "pickup_address": d.pickup_address,
                "distance_km": dist,
                "expiry_time": d.expiry_time.isoformat() if d.expiry_time else None,
                "image_url": d.image_url
            })
    
    results.sort(key=lambda x: x["distance_km"])
    return results

@router.get("/forecast/weekly")
def get_ai_weekly_forecast():
    """Returns scikit-learn based demand forecast for the upcoming week"""
    return demand_predictor.get_weekly_forecast()

@router.get("/forecast/predict")
def predict_custom_demand(
    day_of_week: int = 4,
    temperature: float = 30.0,
    shelter_density: int = 6
):
    return demand_predictor.predict_demand(
        day_of_week=day_of_week,
        temperature=temperature,
        shelter_density=shelter_density
    )
