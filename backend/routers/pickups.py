import random
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from backend.database import get_db
from backend.models import (
    PickupAssignment, Donation, User, UserRole,
    PickupStatus, DonationStatus, Notification, NotificationType
)
from backend.schemas import (
    PickupAssignmentCreate, PickupStatusUpdate, PickupAssignmentResponse
)
from backend.security import get_current_user, require_roles

router = APIRouter(prefix="/pickups", tags=["Pickup Assignments & Logistics"])

@router.post("/", response_model=PickupAssignmentResponse, status_code=status.HTTP_201_CREATED)
def create_or_assign_pickup(
    pickup_in: PickupAssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.NGO, UserRole.ADMIN]))
):
    donation = db.query(Donation).filter(Donation.id == pickup_in.donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    existing_pickup = db.query(PickupAssignment).filter(PickupAssignment.donation_id == donation.id).first()
    otp_code = str(random.randint(1000, 9999))

    if existing_pickup:
        existing_pickup.driver_name = pickup_in.driver_name
        existing_pickup.driver_phone = pickup_in.driver_phone
        existing_pickup.vehicle_number = pickup_in.vehicle_number
        existing_pickup.pickup_notes = pickup_in.pickup_notes
        if not existing_pickup.verification_code or existing_pickup.verification_code in ["8492", "4821"]:
            existing_pickup.verification_code = otp_code
        pickup_record = existing_pickup
    else:
        pickup_record = PickupAssignment(
            donation_id=donation.id,
            ngo_id=current_user.id,
            driver_name=pickup_in.driver_name,
            driver_phone=pickup_in.driver_phone,
            vehicle_number=pickup_in.vehicle_number,
            pickup_notes=pickup_in.pickup_notes,
            verification_code=otp_code,
            status=PickupStatus.ASSIGNED
        )
        db.add(pickup_record)

    donation.status = DonationStatus.PICKUP_ASSIGNED

    # Notify Donor
    db.add(Notification(
        user_id=donation.donor_id,
        title="Driver Assigned for Food Pickup",
        message=f"Driver {pickup_in.driver_name} ({pickup_in.driver_phone}) is assigned to pick up '{donation.food_name}'. Verification code: {pickup_record.verification_code}",
        type=NotificationType.INFO,
        link="/donor-dashboard"
    ))

    db.commit()
    db.refresh(pickup_record)
    return pickup_record

@router.get("/my-pickups", response_model=List[PickupAssignmentResponse])
def get_ngo_pickups(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.NGO, UserRole.ADMIN]))
):
    query = db.query(PickupAssignment).options(
        joinedload(PickupAssignment.donation).joinedload(Donation.donor),
        joinedload(PickupAssignment.ngo)
    )
    if current_user.role == UserRole.NGO:
        query = query.filter(PickupAssignment.ngo_id == current_user.id)
    return query.order_by(PickupAssignment.id.desc()).all()

@router.get("/{pickup_id}", response_model=PickupAssignmentResponse)
def get_pickup_details(pickup_id: int, db: Session = Depends(get_db)):
    pickup = db.query(PickupAssignment).options(
        joinedload(PickupAssignment.donation).joinedload(Donation.donor),
        joinedload(PickupAssignment.ngo)
    ).filter(PickupAssignment.id == pickup_id).first()
    if not pickup:
        raise HTTPException(status_code=404, detail="Pickup assignment not found")
    return pickup

@router.put("/{pickup_id}/status", response_model=PickupAssignmentResponse)
def update_pickup_status(
    pickup_id: int,
    status_update: PickupStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.NGO, UserRole.ADMIN]))
):
    pickup = db.query(PickupAssignment).filter(PickupAssignment.id == pickup_id).first()
    if not pickup:
        raise HTTPException(status_code=404, detail="Pickup assignment not found")

    new_status = status_update.status
    pickup.status = new_status
    donation = pickup.donation

    if new_status == PickupStatus.EN_ROUTE:
        db.add(Notification(
            user_id=donation.donor_id,
            title="Pickup Driver En Route",
            message=f"Driver {pickup.driver_name} is on the way to collect '{donation.food_name}'.",
            type=NotificationType.INFO,
            link="/donor-dashboard"
        ))
    elif new_status == PickupStatus.COLLECTED:
        pickup.collected_at = datetime.utcnow()
        donation.status = DonationStatus.COLLECTED
        db.add(Notification(
            user_id=donation.donor_id,
            title="Food Collected Successfully!",
            message=f"Your donation '{donation.food_name}' has been collected safely.",
            type=NotificationType.SUCCESS,
            link="/donor-dashboard"
        ))
    elif new_status == PickupStatus.DELIVERED:
        pickup.delivered_at = datetime.utcnow()
        donation.status = DonationStatus.DISTRIBUTED
        db.add(Notification(
            user_id=donation.donor_id,
            title="Food Distributed to Community!",
            message=f"Great news! Your donation '{donation.food_name}' was successfully distributed to beneficiaries.",
            type=NotificationType.SUCCESS,
            link="/donor-dashboard"
        ))

    db.commit()
    db.refresh(pickup)
    return pickup
