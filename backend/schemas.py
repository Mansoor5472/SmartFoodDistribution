from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from backend.models import (
    UserRole, FoodCategory, DonationStatus, RequestStatus,
    UrgencyLevel, FoodPreference, PickupStatus, MatchStatus, NotificationType
)

# ==========================================================
# 1. AUTH & USER SCHEMAS
# ==========================================================
class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    role: UserRole = UserRole.DONOR
    organization_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = "Delhi"
    latitude: Optional[float] = 28.6139
    longitude: Optional[float] = 77.2090

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    organization_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class UserResponse(UserBase):
    id: int
    is_verified: bool
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    user_id: Optional[int] = None


# ==========================================================
# 2. DONATION SCHEMAS
# ==========================================================
class DonationBase(BaseModel):
    food_name: str
    food_category: FoodCategory = FoodCategory.COOKED_MEALS
    is_veg: bool = True
    quantity_kg: float = Field(..., gt=0)
    servings: int = Field(..., gt=0)
    preparation_time: datetime
    expiry_time: datetime
    pickup_address: str
    latitude: Optional[float] = 28.6139
    longitude: Optional[float] = 77.2090
    description: Optional[str] = None
    image_url: Optional[str] = None
    contact_phone: str

class DonationCreate(DonationBase):
    pass

class DonationUpdate(BaseModel):
    food_name: Optional[str] = None
    food_category: Optional[FoodCategory] = None
    is_veg: Optional[bool] = None
    quantity_kg: Optional[float] = None
    servings: Optional[int] = None
    expiry_time: Optional[datetime] = None
    pickup_address: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    contact_phone: Optional[str] = None
    status: Optional[DonationStatus] = None

class DonationStatusUpdate(BaseModel):
    status: DonationStatus

class PickupAssignmentSummary(BaseModel):
    id: int
    driver_name: str
    driver_phone: str
    vehicle_number: Optional[str] = None
    status: PickupStatus
    verification_code: str
    assigned_at: datetime
    collected_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DonationResponse(DonationBase):
    id: int
    donor_id: int
    status: DonationStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    donor: Optional[UserResponse] = None
    pickup: Optional[PickupAssignmentSummary] = None

    class Config:
        from_attributes = True


# ==========================================================
# 3. FOOD REQUEST SCHEMAS (BENEFICIARIES)
# ==========================================================
class FoodRequestBase(BaseModel):
    title: str
    required_servings: int = Field(..., gt=0)
    food_preference: FoodPreference = FoodPreference.ANY
    urgency: UrgencyLevel = UrgencyLevel.MEDIUM
    delivery_address: str
    latitude: Optional[float] = 28.6139
    longitude: Optional[float] = 77.2090
    contact_phone: str
    notes: Optional[str] = None

class FoodRequestCreate(FoodRequestBase):
    pass

class FoodRequestUpdate(BaseModel):
    title: Optional[str] = None
    required_servings: Optional[int] = None
    food_preference: Optional[FoodPreference] = None
    urgency: Optional[UrgencyLevel] = None
    delivery_address: Optional[str] = None
    contact_phone: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[RequestStatus] = None

class FoodRequestResponse(FoodRequestBase):
    id: int
    beneficiary_id: int
    status: RequestStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    beneficiary: Optional[UserResponse] = None

    class Config:
        from_attributes = True


# ==========================================================
# 4. PICKUP ASSIGNMENT SCHEMAS
# ==========================================================
class PickupAssignmentCreate(BaseModel):
    donation_id: int
    driver_name: str
    driver_phone: str
    vehicle_number: Optional[str] = None
    pickup_notes: Optional[str] = None

class PickupStatusUpdate(BaseModel):
    status: PickupStatus

class PickupAssignmentResponse(BaseModel):
    id: int
    donation_id: int
    ngo_id: int
    driver_name: str
    driver_phone: str
    vehicle_number: Optional[str] = None
    pickup_notes: Optional[str] = None
    verification_code: str
    status: PickupStatus
    assigned_at: datetime
    collected_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    donation: Optional[DonationResponse] = None
    ngo: Optional[UserResponse] = None

    class Config:
        from_attributes = True


# ==========================================================
# 5. DISTRIBUTION RECORD SCHEMAS
# ==========================================================
class DistributionRecordCreate(BaseModel):
    donation_id: int
    beneficiary_id: Optional[int] = None
    food_request_id: Optional[int] = None
    servings_distributed: int = Field(..., gt=0)
    distribution_address: str
    proof_notes: Optional[str] = None

class DistributionRecordResponse(BaseModel):
    id: int
    donation_id: int
    ngo_id: int
    beneficiary_id: Optional[int] = None
    food_request_id: Optional[int] = None
    servings_distributed: int
    distribution_address: str
    proof_notes: Optional[str] = None
    distributed_at: datetime

    class Config:
        from_attributes = True


# ==========================================================
# 6. MATCH SCHEMAS
# ==========================================================
class MatchResponse(BaseModel):
    id: int
    donation_id: int
    request_id: Optional[int] = None
    ngo_id: int
    match_score: float
    distance_km: float
    status: MatchStatus
    created_at: datetime
    donation: Optional[DonationResponse] = None
    request: Optional[FoodRequestResponse] = None

    class Config:
        from_attributes = True


# ==========================================================
# 7. NOTIFICATION SCHEMAS
# ==========================================================
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: NotificationType
    is_read: bool
    link: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================================
# 8. ANALYTICS & STATS SCHEMAS
# ==========================================================
class CategoryCount(BaseModel):
    category: str
    count: int

class MonthlyStat(BaseModel):
    month: str
    donations_count: int
    servings_count: int
    meals_saved: int

class PlatformStats(BaseModel):
    total_users: int
    total_donations: int
    active_donations: int
    completed_distributions: int
    total_servings_distributed: int
    total_food_kg_saved: float
    active_ngos: int
    pending_requests: int
    co2_emissions_prevented_kg: float
    categories_breakdown: List[CategoryCount]
    monthly_trends: List[MonthlyStat]
