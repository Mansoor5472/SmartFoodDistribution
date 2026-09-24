import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime,
    ForeignKey, Text, Enum, Numeric
)
from sqlalchemy.orm import relationship
from backend.database import Base

class UserRole(str, enum.Enum):
    DONOR = "DONOR"
    NGO = "NGO"
    BENEFICIARY = "BENEFICIARY"
    ADMIN = "ADMIN"

class FoodCategory(str, enum.Enum):
    COOKED_MEALS = "COOKED_MEALS"
    BAKERY = "BAKERY"
    PRODUCE_FRUITS = "PRODUCE_FRUITS"
    DAIRY = "DAIRY"
    PACKAGED_FOOD = "PACKAGED_FOOD"
    BEVERAGES = "BEVERAGES"
    OTHER = "OTHER"

class DonationStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    ACCEPTED = "ACCEPTED"
    PICKUP_ASSIGNED = "PICKUP_ASSIGNED"
    COLLECTED = "COLLECTED"
    DISTRIBUTED = "DISTRIBUTED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"

class RequestStatus(str, enum.Enum):
    PENDING = "PENDING"
    MATCHED = "MATCHED"
    ASSIGNED = "ASSIGNED"
    FULFILLED = "FULFILLED"
    CANCELLED = "CANCELLED"

class UrgencyLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class FoodPreference(str, enum.Enum):
    ANY = "ANY"
    VEG_ONLY = "VEG_ONLY"
    NON_VEG = "NON_VEG"

class PickupStatus(str, enum.Enum):
    ASSIGNED = "ASSIGNED"
    EN_ROUTE = "EN_ROUTE"
    COLLECTED = "COLLECTED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class MatchStatus(str, enum.Enum):
    SUGGESTED = "SUGGESTED"
    ACCEPTED = "ACCEPTED"
    DECLINED = "DECLINED"
    COMPLETED = "COMPLETED"

class NotificationType(str, enum.Enum):
    INFO = "INFO"
    SUCCESS = "SUCCESS"
    WARNING = "WARNING"
    URGENT = "URGENT"


# ==========================================================
# 1. USER MODEL
# ==========================================================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.DONOR, nullable=False)
    organization_name = Column(String(150), nullable=True)
    phone = Column(String(30), nullable=True)
    address = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True, default="Delhi")
    latitude = Column(Float, nullable=True, default=28.6139)
    longitude = Column(Float, nullable=True, default=77.2090)
    is_verified = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    donations = relationship("Donation", back_populates="donor", cascade="all, delete-orphan")
    food_requests = relationship("FoodRequest", back_populates="beneficiary", cascade="all, delete-orphan")
    pickup_assignments = relationship("PickupAssignment", back_populates="ngo", foreign_keys="PickupAssignment.ngo_id")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


# ==========================================================
# 2. LOCATION MODEL
# ==========================================================
class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(100), nullable=False)
    address_line = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    contact_person = Column(String(100), nullable=True)
    contact_phone = Column(String(30), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# ==========================================================
# 3. DONATION MODEL
# ==========================================================
class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    food_name = Column(String(180), nullable=False)
    food_category = Column(Enum(FoodCategory), default=FoodCategory.COOKED_MEALS, nullable=False)
    is_veg = Column(Boolean, default=True, nullable=False)
    quantity_kg = Column(Float, default=5.0, nullable=False)
    servings = Column(Integer, default=15, nullable=False)
    preparation_time = Column(DateTime, nullable=False)
    expiry_time = Column(DateTime, nullable=False)
    pickup_address = Column(String(255), nullable=False)
    latitude = Column(Float, default=28.6139, nullable=False)
    longitude = Column(Float, default=77.2090, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    contact_phone = Column(String(30), nullable=False)
    status = Column(Enum(DonationStatus), default=DonationStatus.AVAILABLE, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    donor = relationship("User", back_populates="donations")
    pickup = relationship("PickupAssignment", back_populates="donation", uselist=False, cascade="all, delete-orphan")
    matches = relationship("Match", back_populates="donation", cascade="all, delete-orphan")
    distribution_records = relationship("DistributionRecord", back_populates="donation", cascade="all, delete-orphan")

    def get_urgency_priority(self):
        """Dynamic algorithmic urgency priority calculation"""
        now = datetime.utcnow()
        if not self.expiry_time:
            return {"priority": "MEDIUM", "score": 0.65, "hours_remaining": 8.0}
        diff = (self.expiry_time - now).total_seconds() / 3600.0
        if diff <= 0:
            return {"priority": "EXPIRED", "score": 1.0, "hours_remaining": 0.0}
        elif diff <= 3.0:
            return {"priority": "CRITICAL", "score": 1.0, "hours_remaining": round(diff, 1)}
        elif diff <= 6.0:
            return {"priority": "HIGH", "score": 0.85, "hours_remaining": round(diff, 1)}
        elif diff <= 16.0:
            return {"priority": "MEDIUM", "score": 0.65, "hours_remaining": round(diff, 1)}
        else:
            return {"priority": "LOW", "score": 0.40, "hours_remaining": round(diff, 1)}


# ==========================================================
# 4. FOOD REQUEST MODEL
# ==========================================================
class FoodRequest(Base):
    __tablename__ = "food_requests"

    id = Column(Integer, primary_key=True, index=True)
    beneficiary_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(150), nullable=False)
    required_servings = Column(Integer, default=20, nullable=False)
    food_preference = Column(Enum(FoodPreference), default=FoodPreference.ANY, nullable=False)
    urgency = Column(Enum(UrgencyLevel), default=UrgencyLevel.MEDIUM, nullable=False)
    delivery_address = Column(String(255), nullable=False)
    latitude = Column(Float, default=28.6139, nullable=False)
    longitude = Column(Float, default=77.2090, nullable=False)
    contact_phone = Column(String(30), nullable=False)
    notes = Column(Text, nullable=True)
    status = Column(Enum(RequestStatus), default=RequestStatus.PENDING, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    beneficiary = relationship("User", back_populates="food_requests")
    matches = relationship("Match", back_populates="request")


# ==========================================================
# 5. MATCH MODEL (AI Recommendations)
# ==========================================================
class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    donation_id = Column(Integer, ForeignKey("donations.id", ondelete="CASCADE"), nullable=False)
    request_id = Column(Integer, ForeignKey("food_requests.id", ondelete="SET NULL"), nullable=True)
    ngo_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    match_score = Column(Float, default=85.0, nullable=False)  # 0 to 100%
    distance_km = Column(Float, default=2.5, nullable=False)
    factors_json = Column(Text, nullable=True)  # Detailed 9-factor scoring breakdown JSON
    status = Column(Enum(MatchStatus), default=MatchStatus.SUGGESTED, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    donation = relationship("Donation", back_populates="matches")
    request = relationship("FoodRequest", back_populates="matches")
    ngo = relationship("User")


# ==========================================================
# 6. PICKUP ASSIGNMENT MODEL
# ==========================================================
class PickupAssignment(Base):
    __tablename__ = "pickup_assignments"

    id = Column(Integer, primary_key=True, index=True)
    donation_id = Column(Integer, ForeignKey("donations.id", ondelete="CASCADE"), unique=True, nullable=False)
    ngo_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    driver_name = Column(String(120), nullable=False)
    driver_phone = Column(String(30), nullable=False)
    vehicle_number = Column(String(50), nullable=True)
    pickup_notes = Column(Text, nullable=True)
    verification_code = Column(String(10), default="4821", nullable=False)
    status = Column(Enum(PickupStatus), default=PickupStatus.ASSIGNED, index=True, nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow)
    collected_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)

    # Relationships
    donation = relationship("Donation", back_populates="pickup")
    ngo = relationship("User", foreign_keys=[ngo_id], back_populates="pickup_assignments")


# ==========================================================
# 7. DISTRIBUTION RECORD MODEL
# ==========================================================
class DistributionRecord(Base):
    __tablename__ = "distribution_records"

    id = Column(Integer, primary_key=True, index=True)
    donation_id = Column(Integer, ForeignKey("donations.id", ondelete="CASCADE"), nullable=False)
    ngo_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    beneficiary_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    food_request_id = Column(Integer, ForeignKey("food_requests.id", ondelete="SET NULL"), nullable=True)
    servings_distributed = Column(Integer, nullable=False)
    distribution_address = Column(String(255), nullable=False)
    proof_notes = Column(Text, nullable=True)
    distributed_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    donation = relationship("Donation", back_populates="distribution_records")
    ngo = relationship("User", foreign_keys=[ngo_id])
    beneficiary = relationship("User", foreign_keys=[beneficiary_id])


# ==========================================================
# 8. NOTIFICATION MODEL
# ==========================================================
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(Enum(NotificationType), default=NotificationType.INFO, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    link = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notifications")


# ==========================================================
# 9. REVIEW MODEL
# ==========================================================
class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    donation_id = Column(Integer, ForeignKey("donations.id", ondelete="CASCADE"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reviewee_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# ==========================================================
# 10. DEMAND PREDICTION RECORD MODEL (AI/ML Predictions)
# ==========================================================
class DemandPredictionRecord(Base):
    __tablename__ = "demand_predictions"

    id = Column(Integer, primary_key=True, index=True)
    target_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    location = Column(String(100), nullable=False, default="South Extension")
    food_category = Column(String(50), nullable=False, default="COOKED_MEALS")
    predicted_meals = Column(Integer, nullable=False)
    predicted_food_kg = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=False, default=92.5)
    model_name = Column(String(100), nullable=False, default="Random Forest Regressor")
    features_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
