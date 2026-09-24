from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from backend.database import get_db
from backend.models import (
    FoodRequest, User, UserRole, RequestStatus, Notification, NotificationType
)
from backend.schemas import (
    FoodRequestCreate, FoodRequestUpdate, FoodRequestResponse
)
from backend.security import get_current_user, require_roles

router = APIRouter(prefix="/requests", tags=["Food Requests"])

@router.post("/", response_model=FoodRequestResponse, status_code=status.HTTP_201_CREATED)
def create_food_request(
    request_in: FoodRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.BENEFICIARY, UserRole.ADMIN]))
):
    new_request = FoodRequest(
        beneficiary_id=current_user.id,
        title=request_in.title,
        required_servings=request_in.required_servings,
        food_preference=request_in.food_preference,
        urgency=request_in.urgency,
        delivery_address=request_in.delivery_address,
        latitude=request_in.latitude or current_user.latitude or 28.6139,
        longitude=request_in.longitude or current_user.longitude or 77.2090,
        contact_phone=request_in.contact_phone or current_user.phone or "9876543210",
        notes=request_in.notes,
        status=RequestStatus.PENDING
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    # Notify all active NGOs about this community need
    ngos = db.query(User).filter(User.role == UserRole.NGO, User.is_active == True).all()
    for ngo in ngos:
        db.add(Notification(
            user_id=ngo.id,
            title="Urgent Food Request Received",
            message=f"{request_in.required_servings} servings requested for '{request_in.title}' at {request_in.delivery_address}.",
            type=NotificationType.URGENT if request_in.urgency in ["HIGH", "CRITICAL"] else NotificationType.INFO,
            link="/ngo-dashboard"
        ))
    db.commit()

    return new_request

@router.get("/my-requests", response_model=List[FoodRequestResponse])
def get_my_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.BENEFICIARY, UserRole.ADMIN]))
):
    return db.query(FoodRequest).options(
        joinedload(FoodRequest.beneficiary)
    ).filter(FoodRequest.beneficiary_id == current_user.id).order_by(FoodRequest.id.desc()).all()

@router.get("/active", response_model=List[FoodRequestResponse])
def get_active_requests(
    status_filter: Optional[RequestStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(FoodRequest).options(joinedload(FoodRequest.beneficiary))
    if status_filter:
        query = query.filter(FoodRequest.status == status_filter)
    else:
        query = query.filter(FoodRequest.status.in_([RequestStatus.PENDING, RequestStatus.MATCHED, RequestStatus.ASSIGNED]))
    return query.order_by(FoodRequest.id.desc()).all()

@router.get("/{request_id}", response_model=FoodRequestResponse)
def get_food_request(request_id: int, db: Session = Depends(get_db)):
    food_request = db.query(FoodRequest).options(
        joinedload(FoodRequest.beneficiary)
    ).filter(FoodRequest.id == request_id).first()
    if not food_request:
        raise HTTPException(status_code=404, detail="Food request not found")
    return food_request

@router.put("/{request_id}", response_model=FoodRequestResponse)
def update_food_request(
    request_id: int,
    request_update: FoodRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    food_request = db.query(FoodRequest).filter(FoodRequest.id == request_id).first()
    if not food_request:
        raise HTTPException(status_code=404, detail="Food request not found")
    
    # Check permissions
    if food_request.beneficiary_id != current_user.id and current_user.role not in [UserRole.ADMIN, UserRole.NGO]:
        raise HTTPException(status_code=403, detail="Not authorized to modify this request")

    update_data = request_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(food_request, key, value)
    
    db.commit()
    db.refresh(food_request)
    return food_request

@router.delete("/{request_id}")
def cancel_food_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    food_request = db.query(FoodRequest).filter(FoodRequest.id == request_id).first()
    if not food_request:
        raise HTTPException(status_code=404, detail="Food request not found")
    
    if food_request.beneficiary_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this request")

    food_request.status = RequestStatus.CANCELLED
    db.commit()
    return {"message": "Food request cancelled successfully", "id": request_id}
