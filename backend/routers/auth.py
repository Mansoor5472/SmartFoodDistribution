from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import User, UserRole, Notification, NotificationType
from backend.schemas import UserCreate, UserLogin, UserResponse, UserUpdate, Token
from backend.security import get_password_hash, verify_password, create_access_token, get_current_user, require_roles

router = APIRouter(prefix="/auth", tags=["Authentication & Users"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(User).filter(User.email.ilike(user_in.email)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
    
    hashed_pwd = get_password_hash(user_in.password)
    new_user = User(
        full_name=user_in.full_name,
        email=user_in.email.lower(),
        hashed_password=hashed_pwd,
        role=user_in.role,
        organization_name=user_in.organization_name,
        phone=user_in.phone,
        address=user_in.address,
        city=user_in.city or "Delhi",
        latitude=user_in.latitude or 28.6139,
        longitude=user_in.longitude or 77.2090,
        is_verified=True,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create a welcome notification
    welcome_notif = Notification(
        user_id=new_user.id,
        title="Welcome to Smart Food Distribution!",
        message=f"Hello {new_user.full_name}, thank you for joining as a {new_user.role.value}. Together we reduce waste and feed communities.",
        type=NotificationType.SUCCESS,
        link="/dashboard"
    )
    db.add(welcome_notif)
    db.commit()

    token = create_access_token(data={
        "sub": new_user.email,
        "role": new_user.role.value,
        "user_id": new_user.id
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email.ilike(login_data.email)).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support."
        )
    
    token = create_access_token(data={
        "sub": user.email,
        "role": user.role.value,
        "user_id": user.id
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    update_data = user_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    role: Optional[UserRole] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.ADMIN]))
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.order_by(User.id.desc()).all()

@router.put("/users/{user_id}/toggle-active", response_model=UserResponse)
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.ADMIN]))
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    target_user.is_active = not target_user.is_active
    db.commit()
    db.refresh(target_user)
    return target_user
