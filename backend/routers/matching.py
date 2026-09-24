import json
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

from backend.database import get_db
from backend.models import (
    Donation, FoodRequest, User, UserRole, DonationStatus,
    RequestStatus, Match, MatchStatus
)
from backend.security import get_current_user
from ml.matching_service import matching_service, compute_donation_urgency_priority

router = APIRouter(prefix="/matching", tags=["Smart Matching Engine"])

class RecommendRequest(BaseModel):
    donation_id: Optional[int] = None
    food_name: Optional[str] = "Fresh Surplus Meals"
    food_category: Optional[str] = "COOKED_MEALS"
    is_veg: Optional[bool] = True
    servings: Optional[int] = 30
    pickup_address: Optional[str] = "Delhi Central"
    latitude: Optional[float] = 28.6139
    longitude: Optional[float] = 77.2090
    max_distance_km: Optional[float] = 25.0

@router.post("/recommend")
def recommend_matches_for_donation(
    req: RecommendRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    FEATURE 1: Recommends the most suitable NGOs and Beneficiaries for a donation.
    Evaluates: Distance, Servings compatibility, Food type, Veg preference, Urgency, Expiry, Availability.
    """
    # 1. Fetch available NGOs
    ngos = db.query(User).filter(User.role == UserRole.NGO, User.is_active == True).all()
    ngos_list = []
    for n in ngos:
        # Count active pickups
        active_pickups = len([p for p in n.pickup_assignments if p.status in ["ASSIGNED", "EN_ROUTE"]])
        ngos_list.append({
            "id": n.id,
            "full_name": n.full_name,
            "organization_name": n.organization_name,
            "phone": n.phone,
            "latitude": n.latitude or 28.6139,
            "longitude": n.longitude or 77.2090,
            "active_pickups": active_pickups
        })

    # 2. Fetch pending beneficiary food requests
    pending_requests = db.query(FoodRequest).options(joinedload(FoodRequest.beneficiary)).filter(
        FoodRequest.status == RequestStatus.PENDING
    ).all()

    donation_dict = {
        "id": req.donation_id or 0,
        "food_name": req.food_name,
        "food_category": req.food_category,
        "is_veg": req.is_veg,
        "servings": req.servings,
        "latitude": req.latitude,
        "longitude": req.longitude,
        "pickup_address": req.pickup_address,
        "expiry_time": None # Uses default medium/high urgency if not given
    }

    # If donation_id is provided, pull real DB data
    if req.donation_id:
        real_don = db.query(Donation).filter(Donation.id == req.donation_id).first()
        if real_don:
            donation_dict = {
                "id": real_don.id,
                "food_name": real_don.food_name,
                "food_category": real_don.food_category.value if hasattr(real_don.food_category, "value") else str(real_don.food_category),
                "is_veg": real_don.is_veg,
                "servings": real_don.servings,
                "latitude": real_don.latitude,
                "longitude": real_don.longitude,
                "pickup_address": real_don.pickup_address,
                "expiry_time": real_don.expiry_time
            }

    # Rank NGOs
    recommended_ngos = matching_service.rank_ngos_for_donation(donation_dict, ngos_list)

    # Rank Beneficiary Requests
    matched_requests = []
    for r in pending_requests:
        r_dict = {
            "id": r.id,
            "title": r.title,
            "beneficiary_id": r.beneficiary_id,
            "beneficiary_name": r.beneficiary.organization_name or r.beneficiary.full_name,
            "required_servings": r.required_servings,
            "food_preference": r.food_preference.value if hasattr(r.food_preference, "value") else str(r.food_preference),
            "urgency": r.urgency.value if hasattr(r.urgency, "value") else str(r.urgency),
            "delivery_address": r.delivery_address,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "contact_phone": r.contact_phone
        }
        res = matching_service.match_donation_with_request(donation_dict, r_dict)
        if res.get("match_score", 0) > 0:
            res["request_details"] = r_dict
            matched_requests.append(res)

    matched_requests.sort(key=lambda x: x["match_score"], reverse=True)

    # Persist top recommendation to matches history if donation_id exists
    if req.donation_id and recommended_ngos:
        top_ngo = recommended_ngos[0]
        try:
            existing = db.query(Match).filter(
                Match.donation_id == req.donation_id,
                Match.ngo_id == top_ngo["ngo_id"]
            ).first()
            if not existing:
                match_record = Match(
                    donation_id=req.donation_id,
                    ngo_id=top_ngo["ngo_id"],
                    match_score=top_ngo["match_score"],
                    distance_km=top_ngo["distance_km"],
                    factors_json=json.dumps(top_ngo["breakdown"]),
                    status=MatchStatus.SUGGESTED
                )
                db.add(match_record)
                db.commit()
        except Exception:
            db.rollback()

    return {
        "donation": donation_dict,
        "recommended_ngos": recommended_ngos[:5], # Top 5 NGOs
        "matched_beneficiary_requests": matched_requests[:5], # Top 5 requests
        "total_ngos_evaluated": len(ngos_list),
        "total_requests_evaluated": len(pending_requests)
    }

@router.get("/ngo/recommended")
def get_recommended_donations_for_ngo(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    FEATURE 1 & 4: Returns active food donations ranked specifically for the authenticated NGO.
    """
    if current_user.role != UserRole.NGO:
        raise HTTPException(status_code=403, detail="Only NGOs can access this endpoint")

    # Fetch available donations
    available_donations = db.query(Donation).options(joinedload(Donation.donor)).filter(
        Donation.status == DonationStatus.AVAILABLE
    ).all()

    donations_list = []
    for d in available_donations:
        donations_list.append({
            "id": d.id,
            "food_name": d.food_name,
            "food_category": d.food_category.value if hasattr(d.food_category, "value") else str(d.food_category),
            "is_veg": d.is_veg,
            "servings": d.servings,
            "quantity_kg": d.quantity_kg,
            "latitude": d.latitude,
            "longitude": d.longitude,
            "pickup_address": d.pickup_address,
            "expiry_time": d.expiry_time,
            "image_url": d.image_url,
            "donor_name": d.donor.organization_name or d.donor.full_name,
            "contact_phone": d.contact_phone
        })

    ngo_dict = {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "organization_name": current_user.organization_name,
        "latitude": current_user.latitude or 28.6139,
        "longitude": current_user.longitude or 77.2090,
        "active_pickups": len([p for p in current_user.pickup_assignments if p.status in ["ASSIGNED", "EN_ROUTE"]])
    }

    ranked = matching_service.rank_donations_for_ngo(ngo_dict, donations_list)
    return ranked

@router.get("/{donation_id}")
def get_matches_for_donation_id(
    donation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    FEATURE 1: Returns smart recommendation rankings for a specific donation ID.
    Protected with JWT authentication.
    """
    donation = db.query(Donation).options(joinedload(Donation.donor)).filter(Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    ngos = db.query(User).filter(User.role == UserRole.NGO, User.is_active == True).all()
    ngos_list = []
    for n in ngos:
        active_pickups = len([p for p in n.pickup_assignments if p.status in ["ASSIGNED", "EN_ROUTE"]])
        ngos_list.append({
            "id": n.id,
            "full_name": n.full_name,
            "organization_name": n.organization_name,
            "phone": n.phone,
            "latitude": n.latitude or 28.6139,
            "longitude": n.longitude or 77.2090,
            "active_pickups": active_pickups
        })

    don_dict = {
        "id": donation.id,
        "food_name": donation.food_name,
        "food_category": donation.food_category.value if hasattr(donation.food_category, "value") else str(donation.food_category),
        "is_veg": donation.is_veg,
        "servings": donation.servings,
        "latitude": donation.latitude,
        "longitude": donation.longitude,
        "pickup_address": donation.pickup_address,
        "expiry_time": donation.expiry_time
    }

    urgency_details = compute_donation_urgency_priority(donation.expiry_time)
    recommended_ngos = matching_service.rank_ngos_for_donation(don_dict, ngos_list)

    # Persist top recommendation to matches history if present
    if recommended_ngos:
        top_ngo = recommended_ngos[0]
        try:
            existing = db.query(Match).filter(
                Match.donation_id == donation.id,
                Match.ngo_id == top_ngo["ngo_id"]
            ).first()
            if not existing:
                match_record = Match(
                    donation_id=donation.id,
                    ngo_id=top_ngo["ngo_id"],
                    match_score=top_ngo["match_score"],
                    distance_km=top_ngo["distance_km"],
                    factors_json=json.dumps(top_ngo["breakdown"]),
                    status=MatchStatus.SUGGESTED
                )
                db.add(match_record)
                db.commit()
        except Exception:
            db.rollback()

    return {
        "donation_id": donation.id,
        "food_name": donation.food_name,
        "urgency_priority": urgency_details,
        "recommended_ngos": recommended_ngos,
        "best_match": recommended_ngos[0] if recommended_ngos else None
    }
