from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import (
    DistributionRecord, Donation, FoodRequest, User, UserRole,
    DonationStatus, RequestStatus, Notification, NotificationType
)
from backend.schemas import (
    DistributionRecordCreate, DistributionRecordResponse
)
from backend.security import get_current_user, require_roles

router = APIRouter(prefix="/distribution", tags=["Food Distribution Records"])

@router.post("/", response_model=DistributionRecordResponse, status_code=status.HTTP_201_CREATED)
def record_distribution(
    record_in: DistributionRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.NGO, UserRole.ADMIN]))
):
    donation = db.query(Donation).filter(Donation.id == record_in.donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    dist_record = DistributionRecord(
        donation_id=record_in.donation_id,
        ngo_id=current_user.id,
        beneficiary_id=record_in.beneficiary_id,
        food_request_id=record_in.food_request_id,
        servings_distributed=record_in.servings_distributed,
        distribution_address=record_in.distribution_address,
        proof_notes=record_in.proof_notes,
        distributed_at=datetime.utcnow()
    )
    db.add(dist_record)

    # Mark donation as COMPLETED
    donation.status = DonationStatus.COMPLETED

    # If linked to a food request, mark request as FULFILLED
    if record_in.food_request_id:
        req = db.query(FoodRequest).filter(FoodRequest.id == record_in.food_request_id).first()
        if req:
            req.status = RequestStatus.FULFILLED
            # Notify Beneficiary
            db.add(Notification(
                user_id=req.beneficiary_id,
                title="Food Request Fulfilled! 🎉",
                message=f"Your request for '{req.title}' has been successfully fulfilled by {current_user.organization_name or current_user.full_name}!",
                type=NotificationType.SUCCESS,
                link="/beneficiary-dashboard"
            ))

    # Notify Donor of complete cycle
    db.add(Notification(
        user_id=donation.donor_id,
        title="Impact Complete! Meals Served 🎉",
        message=f"{record_in.servings_distributed} meals from your donation '{donation.food_name}' have been served at {record_in.distribution_address}. Thank you for making a difference!",
        type=NotificationType.SUCCESS,
        link="/donor-dashboard"
    ))

    db.commit()
    db.refresh(dist_record)
    return dist_record

@router.get("/records", response_model=List[DistributionRecordResponse])
def get_distribution_records(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(DistributionRecord)
    if current_user.role == UserRole.NGO:
        query = query.filter(DistributionRecord.ngo_id == current_user.id)
    elif current_user.role == UserRole.BENEFICIARY:
        query = query.filter(DistributionRecord.beneficiary_id == current_user.id)
    return query.order_by(DistributionRecord.id.desc()).all()
