import random
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload

from backend.database import get_db
from backend.models import (
    Donation, User, UserRole, DonationStatus, FoodCategory,
    Notification, NotificationType, PickupAssignment, PickupStatus
)
from backend.schemas import (
    DonationCreate, DonationUpdate, DonationResponse, DonationStatusUpdate
)
from backend.security import get_current_user, require_roles

def to_utc_naive(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if hasattr(dt, "tzinfo") and dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt

router = APIRouter(prefix="/donations", tags=["Donations"])

@router.post("/", response_model=DonationResponse, status_code=status.HTTP_201_CREATED)
def create_donation(
    donation_in: DonationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.DONOR, UserRole.ADMIN]))
):
    expiry_time = to_utc_naive(donation_in.expiry_time)
    preparation_time = to_utc_naive(donation_in.preparation_time)

    # Validation: Expiry time must be in future
    if expiry_time <= datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Expiry time must be set to a future time."
        )

    # Pick default image if none provided
    img_url = donation_in.image_url
    if not img_url:
        category_images = {
            FoodCategory.COOKED_MEALS: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
            FoodCategory.BAKERY: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
            FoodCategory.PRODUCE_FRUITS: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80",
            FoodCategory.DAIRY: "https://images.unsplash.com/photo-1528732263440-4dd1a18a4cc2?auto=format&fit=crop&w=800&q=80",
            FoodCategory.PACKAGED_FOOD: "https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&w=800&q=80",
            FoodCategory.BEVERAGES: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
            FoodCategory.OTHER: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80"
        }
        img_url = category_images.get(donation_in.food_category, "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80")

    new_donation = Donation(
        donor_id=current_user.id,
        food_name=donation_in.food_name,
        food_category=donation_in.food_category,
        is_veg=donation_in.is_veg,
        quantity_kg=donation_in.quantity_kg,
        servings=donation_in.servings,
        preparation_time=preparation_time,
        expiry_time=expiry_time,
        pickup_address=donation_in.pickup_address,
        latitude=donation_in.latitude or current_user.latitude or 28.6139,
        longitude=donation_in.longitude or current_user.longitude or 77.2090,
        description=donation_in.description,
        image_url=img_url,
        contact_phone=donation_in.contact_phone,
        status=DonationStatus.AVAILABLE
    )
    db.add(new_donation)
    db.commit()
    db.refresh(new_donation)

    # Notify all active NGOs about newly available food
    ngos = db.query(User).filter(User.role == UserRole.NGO, User.is_active == True).all()
    for ngo in ngos:
        db.add(Notification(
            user_id=ngo.id,
            title="New Food Donation Available!",
            message=f"{donation_in.servings} servings of '{donation_in.food_name}' posted near {donation_in.pickup_address}.",
            type=NotificationType.INFO,
            link="/ngo-dashboard"
        ))
    db.commit()

    return new_donation

@router.get("/priority")
def get_donations_by_urgency_priority(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    FEATURE 3: Algorithmically calculates urgency priority for all active food donations.
    Categories: CRITICAL (<3 hrs), HIGH (3-6 hrs), MEDIUM (6-16 hrs), LOW (>16 hrs).
    """
    from ml.matching_service import compute_donation_urgency_priority

    # Query active/available donations
    donations = db.query(Donation).options(
        joinedload(Donation.donor),
        joinedload(Donation.pickup)
    ).filter(
        Donation.status.in_([DonationStatus.AVAILABLE, DonationStatus.ACCEPTED, DonationStatus.PICKUP_ASSIGNED])
    ).all()

    critical_list = []
    high_list = []
    medium_list = []
    low_list = []

    for d in donations:
        urgency_meta = compute_donation_urgency_priority(d.expiry_time)
        item = {
            "id": d.id,
            "food_name": d.food_name,
            "food_category": d.food_category.value if hasattr(d.food_category, "value") else str(d.food_category),
            "is_veg": d.is_veg,
            "servings": d.servings,
            "quantity_kg": d.quantity_kg,
            "pickup_address": d.pickup_address,
            "latitude": d.latitude,
            "longitude": d.longitude,
            "status": d.status.value if hasattr(d.status, "value") else str(d.status),
            "expiry_time": d.expiry_time.isoformat(),
            "donor_name": d.donor.organization_name or d.donor.full_name,
            "donor_phone": d.contact_phone,
            "image_url": d.image_url,
            "urgency": urgency_meta["priority"],
            "urgency_score": urgency_meta["score"],
            "hours_remaining": urgency_meta["hours_remaining"],
            "recommended_action": urgency_meta["recommended_action"],
            "badge_color": urgency_meta["badge_color"]
        }

        if urgency_meta["priority"] == "CRITICAL":
            critical_list.append(item)
        elif urgency_meta["priority"] == "HIGH":
            high_list.append(item)
        elif urgency_meta["priority"] == "MEDIUM":
            medium_list.append(item)
        else:
            low_list.append(item)

    # Sort each list by hours remaining ascending
    critical_list.sort(key=lambda x: x["hours_remaining"])
    high_list.sort(key=lambda x: x["hours_remaining"])
    medium_list.sort(key=lambda x: x["hours_remaining"])
    low_list.sort(key=lambda x: x["hours_remaining"])

    return {
        "summary": {
            "total_active": len(donations),
            "critical_count": len(critical_list),
            "high_count": len(high_list),
            "medium_count": len(medium_list),
            "low_count": len(low_list)
        },
        "critical": critical_list,
        "high": high_list,
        "medium": medium_list,
        "low": low_list,
        "all_prioritized": critical_list + high_list + medium_list + low_list
    }

@router.get("/available", response_model=List[DonationResponse])
def get_available_donations(
    category: Optional[FoodCategory] = None,
    is_veg: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    # Auto-expire donations whose expiry_time is in past
    now = datetime.utcnow()
    expired_donations = db.query(Donation).filter(
        Donation.status == DonationStatus.AVAILABLE,
        Donation.expiry_time < now
    ).all()
    for exp in expired_donations:
        exp.status = DonationStatus.EXPIRED
    if expired_donations:
        db.commit()

    query = db.query(Donation).options(
        joinedload(Donation.donor),
        joinedload(Donation.pickup)
    ).filter(Donation.status == DonationStatus.AVAILABLE)

    if category:
        query = query.filter(Donation.food_category == category)
    if is_veg is not None:
        query = query.filter(Donation.is_veg == is_veg)
    if search:
        query = query.filter(
            (Donation.food_name.ilike(f"%{search}%")) |
            (Donation.pickup_address.ilike(f"%{search}%")) |
            (Donation.description.ilike(f"%{search}%"))
        )

    return query.order_by(Donation.expiry_time.asc()).all()

@router.get("/my-donations", response_model=List[DonationResponse])
def get_my_donations(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.DONOR, UserRole.ADMIN]))
):
    return db.query(Donation).options(
        joinedload(Donation.donor),
        joinedload(Donation.pickup)
    ).filter(Donation.donor_id == current_user.id).order_by(Donation.id.desc()).all()

@router.get("/all", response_model=List[DonationResponse])
def get_all_donations_for_admin(
    status: Optional[DonationStatus] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.ADMIN]))
):
    query = db.query(Donation).options(
        joinedload(Donation.donor),
        joinedload(Donation.pickup)
    )
    if status:
        query = query.filter(Donation.status == status)
    return query.order_by(Donation.id.desc()).all()

@router.get("/{donation_id}", response_model=DonationResponse)
def get_donation_by_id(donation_id: int, db: Session = Depends(get_db)):
    donation = db.query(Donation).options(
        joinedload(Donation.donor),
        joinedload(Donation.pickup)
    ).filter(Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    return donation

@router.put("/{donation_id}", response_model=DonationResponse)
def update_donation(
    donation_id: int,
    donation_update: DonationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    donation = db.query(Donation).filter(Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    # Only donor or admin can update details
    if donation.donor_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to modify this donation")

    if donation.status not in [DonationStatus.AVAILABLE, DonationStatus.ACCEPTED] and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=400, detail="Cannot edit donation once pickup is underway")

    update_data = donation_update.dict(exclude_unset=True) if hasattr(donation_update, "dict") else donation_update.model_dump(exclude_unset=True)
    if "expiry_time" in update_data and update_data["expiry_time"] is not None:
        update_data["expiry_time"] = to_utc_naive(update_data["expiry_time"])
    for key, value in update_data.items():
        setattr(donation, key, value)
    
    db.commit()
    db.refresh(donation)
    return donation

@router.post("/{donation_id}/accept", response_model=DonationResponse)
def accept_donation(
    donation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.NGO, UserRole.ADMIN]))
):
    donation = db.query(Donation).filter(Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    if donation.status != DonationStatus.AVAILABLE:
        raise HTTPException(status_code=400, detail=f"Donation is already in status: {donation.status.value}")

    donation.status = DonationStatus.ACCEPTED

    # Create initial pickup assignment record
    pickup = PickupAssignment(
        donation_id=donation.id,
        ngo_id=current_user.id,
        driver_name=current_user.full_name,
        driver_phone=current_user.phone or "9876543210",
        vehicle_number="DL-01-FD-2026",
        pickup_notes="Accepted by NGO for immediate distribution.",
        status=PickupStatus.ASSIGNED,
        verification_code=str(random.randint(1000, 9999))
    )
    db.add(pickup)

    # Notify Donor
    db.add(Notification(
        user_id=donation.donor_id,
        title="Donation Accepted!",
        message=f"{current_user.organization_name or current_user.full_name} has accepted your donation '{donation.food_name}'. A pickup is being dispatched.",
        type=NotificationType.SUCCESS,
        link="/donor-dashboard"
    ))

    db.commit()
    db.refresh(donation)
    return donation

@router.put("/{donation_id}/status", response_model=DonationResponse)
def update_donation_status(
    donation_id: int,
    status_in: DonationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    donation = db.query(Donation).filter(Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    donation.status = status_in.status

    # Also sync pickup assignment status if relevant
    if donation.pickup:
        if status_in.status == DonationStatus.COLLECTED:
            donation.pickup.status = PickupStatus.COLLECTED
            donation.pickup.collected_at = datetime.utcnow()
        elif status_in.status in [DonationStatus.DISTRIBUTED, DonationStatus.COMPLETED]:
            donation.pickup.status = PickupStatus.DELIVERED
            donation.pickup.delivered_at = datetime.utcnow()

    # Add notification for donor
    db.add(Notification(
        user_id=donation.donor_id,
        title=f"Donation Status: {donation.status.value}",
        message=f"Your donation '{donation.food_name}' is now marked as {donation.status.value}.",
        type=NotificationType.INFO,
        link="/donor-dashboard"
    ))

    db.commit()
    db.refresh(donation)
    return donation

@router.delete("/{donation_id}")
def cancel_or_delete_donation(
    donation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    donation = db.query(Donation).filter(Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    if donation.donor_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this donation")

    donation.status = DonationStatus.CANCELLED
    db.commit()
    return {"message": "Donation cancelled successfully", "id": donation_id}
