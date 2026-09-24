import os
import sys
from datetime import datetime, timedelta

# Ensure parent directory is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.database import SessionLocal, Base, engine
from backend.models import (
    User, Donation, FoodRequest, PickupAssignment, DistributionRecord,
    Notification, UserRole, FoodCategory, DonationStatus, RequestStatus,
    UrgencyLevel, FoodPreference, PickupStatus, NotificationType
)
from backend.security import get_password_hash

def seed_database():
    # Automatically create tables if not exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        existing_admin = db.query(User).filter(User.email == "admin@demo.com").first()
        if existing_admin:
            print("[INFO] Database already contains seed data. Skipping duplicate seeding.")
            return

        print("[INFO] Seeding database with realistic demonstration data...")

        # 1. Create Core Users for all 4 Roles
        hashed_pwd = get_password_hash("password123")

        admin_user = User(
            full_name="Platform Administrator",
            email="admin@demo.com",
            hashed_password=hashed_pwd,
            role=UserRole.ADMIN,
            organization_name="Smart Food Central Operations",
            phone="+91 9811002233",
            address="HQ Civic Centre, Connaught Place",
            city="Delhi",
            latitude=28.6304,
            longitude=77.2177,
            is_verified=True,
            is_active=True
        )

        donor_user = User(
            full_name="Rajesh Sharma (Chef & Manager)",
            email="donor@demo.com",
            hashed_password=hashed_pwd,
            role=UserRole.DONOR,
            organization_name="Grand Palace Hotel & Banquets",
            phone="+91 9876501234",
            address="Ring Road, South Extension Part II",
            city="Delhi",
            latitude=28.5672,
            longitude=77.2215,
            is_verified=True,
            is_active=True
        )

        donor_user2 = User(
            full_name="Anita Roy (Bakery Owner)",
            email="bakery@demo.com",
            hashed_password=hashed_pwd,
            role=UserRole.DONOR,
            organization_name="The Golden Crust Artisan Bakery",
            phone="+91 9899112233",
            address="Khan Market, Central Delhi",
            city="Delhi",
            latitude=28.6003,
            longitude=77.2272,
            is_verified=True,
            is_active=True
        )

        ngo_user = User(
            full_name="Sunil Verma (Coordinator)",
            email="ngo@demo.com",
            hashed_password=hashed_pwd,
            role=UserRole.NGO,
            organization_name="Robin Hood Food Relief Network",
            phone="+91 9812345678",
            address="Lajpat Nagar IV Community Hall",
            city="Delhi",
            latitude=28.5684,
            longitude=77.2435,
            is_verified=True,
            is_active=True
        )

        beneficiary_user = User(
            full_name="Pooja Mehta (Superintendent)",
            email="beneficiary@demo.com",
            hashed_password=hashed_pwd,
            role=UserRole.BENEFICIARY,
            organization_name="Asha Community Shelter & Care Home",
            phone="+91 9822334455",
            address="Lodhi Colony Shelter Block B",
            city="Delhi",
            latitude=28.5833,
            longitude=77.2238,
            is_verified=True,
            is_active=True
        )

        db.add_all([admin_user, donor_user, donor_user2, ngo_user, beneficiary_user])
        db.commit()
        db.refresh(admin_user)
        db.refresh(donor_user)
        db.refresh(donor_user2)
        db.refresh(ngo_user)
        db.refresh(beneficiary_user)

        # 2. Create Realistic Donations
        now = datetime.utcnow()

        d1 = Donation(
            donor_id=donor_user.id,
            food_name="Fresh Lunch Buffet Surplus (Paneer, Dal, Basmati Rice, Roti)",
            food_category=FoodCategory.COOKED_MEALS,
            is_veg=True,
            quantity_kg=18.5,
            servings=45,
            preparation_time=now - timedelta(hours=2),
            expiry_time=now + timedelta(hours=6),
            pickup_address="Grand Palace Hotel Kitchen, Gate 3, South Extension II",
            latitude=28.5672,
            longitude=77.2215,
            description="High quality freshly cooked vegetarian lunch spread from corporate banquet event. Packed in food-grade thermal containers.",
            image_url="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
            contact_phone="+91 9876501234",
            status=DonationStatus.AVAILABLE
        )

        d2 = Donation(
            donor_id=donor_user2.id,
            food_name="Artisan Sourdough, Baguettes & Multigrain Loaves",
            food_category=FoodCategory.BAKERY,
            is_veg=True,
            quantity_kg=12.0,
            servings=35,
            preparation_time=now - timedelta(hours=5),
            expiry_time=now + timedelta(hours=24),
            pickup_address="Shop 14, Khan Market, Central Delhi",
            latitude=28.6003,
            longitude=77.2272,
            description="Freshly baked artisan bread and savory rolls from today morning. Clean, sealed in hygienic paper bags.",
            image_url="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
            contact_phone="+91 9899112233",
            status=DonationStatus.AVAILABLE
        )

        d3 = Donation(
            donor_id=donor_user.id,
            food_name="Steamed Rice with Mixed Vegetable Curry & Fruit Salad",
            food_category=FoodCategory.COOKED_MEALS,
            is_veg=True,
            quantity_kg=15.0,
            servings=30,
            preparation_time=now - timedelta(hours=3),
            expiry_time=now + timedelta(hours=5),
            pickup_address="Grand Palace Hotel, South Extension II",
            latitude=28.5672,
            longitude=77.2215,
            description="Warm nutritional dinner food remaining from private conference.",
            image_url="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
            contact_phone="+91 9876501234",
            status=DonationStatus.ACCEPTED
        )

        # Donation that has already been collected and distributed
        d4 = Donation(
            donor_id=donor_user.id,
            food_name="Sandwiches, Apples & Packaged Juice Boxes",
            food_category=FoodCategory.PACKAGED_FOOD,
            is_veg=True,
            quantity_kg=22.0,
            servings=60,
            preparation_time=now - timedelta(days=1, hours=4),
            expiry_time=now - timedelta(hours=2),
            pickup_address="South Extension Hall Gate 1",
            latitude=28.5672,
            longitude=77.2215,
            description="Boxed snacks and fresh fruits distributed yesterday evening.",
            image_url="https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&w=800&q=80",
            contact_phone="+91 9876501234",
            status=DonationStatus.COMPLETED
        )

        db.add_all([d1, d2, d3, d4])
        db.commit()
        db.refresh(d1)
        db.refresh(d2)
        db.refresh(d3)
        db.refresh(d4)

        # 3. Create Pickup for d3
        p3 = PickupAssignment(
            donation_id=d3.id,
            ngo_id=ngo_user.id,
            driver_name="Ramesh Kumar",
            driver_phone="+91 9871122334",
            vehicle_number="DL-03-FD-9821",
            pickup_notes="Thermal van dispatched. ETA 25 minutes.",
            verification_code="5281",
            status=PickupStatus.EN_ROUTE,
            assigned_at=now - timedelta(minutes=45)
        )
        db.add(p3)

        # 4. Create Pickup & Distribution Record for d4
        p4 = PickupAssignment(
            donation_id=d4.id,
            ngo_id=ngo_user.id,
            driver_name="Vikram Singh",
            driver_phone="+91 9811447788",
            vehicle_number="DL-01-FD-1100",
            pickup_notes="Collected on time and transported safely.",
            verification_code="3912",
            status=PickupStatus.DELIVERED,
            assigned_at=now - timedelta(days=1, hours=3),
            collected_at=now - timedelta(days=1, hours=2),
            delivered_at=now - timedelta(days=1, hours=1)
        )
        db.add(p4)

        # 5. Create Beneficiary Food Requests
        req1 = FoodRequest(
            beneficiary_id=beneficiary_user.id,
            title="Evening Meals for 40 Shelter Residents",
            required_servings=40,
            food_preference=FoodPreference.VEG_ONLY,
            urgency=UrgencyLevel.HIGH,
            delivery_address="Asha Community Shelter, Lodhi Colony Block B",
            latitude=28.5833,
            longitude=77.2238,
            contact_phone="+91 9822334455",
            notes="We care for elderly citizens and night workers. Warm wholesome food is urgently appreciated.",
            status=RequestStatus.PENDING
        )

        req2 = FoodRequest(
            beneficiary_id=beneficiary_user.id,
            title="Morning Bread & Snacks for Children Care Center",
            required_servings=25,
            food_preference=FoodPreference.ANY,
            urgency=UrgencyLevel.MEDIUM,
            delivery_address="Lodhi Road Community Hall Annex",
            latitude=28.5860,
            longitude=77.2290,
            contact_phone="+91 9822334455",
            notes="Seeking bakery bread, fruits or healthy snacks for breakfast.",
            status=RequestStatus.PENDING
        )

        db.add_all([req1, req2])
        db.commit()
        db.refresh(req1)
        db.refresh(req2)

        # Distribution record for d4
        dist4 = DistributionRecord(
            donation_id=d4.id,
            ngo_id=ngo_user.id,
            beneficiary_id=beneficiary_user.id,
            servings_distributed=60,
            distribution_address="Asha Community Shelter, Lodhi Road",
            proof_notes="Distributed snacks and fruits directly to 60 shelter residents with smiles!",
            distributed_at=now - timedelta(days=1, hours=1)
        )
        db.add(dist4)

        # 6. Seed In-App Notifications
        notifications = [
            Notification(
                user_id=donor_user.id,
                title="New Pickup Scheduled",
                message="Robin Hood Relief Network driver Ramesh Kumar is en route for 'Steamed Rice & Curry'. Code: 5281",
                type=NotificationType.INFO,
                link="/donor-dashboard"
            ),
            Notification(
                user_id=ngo_user.id,
                title="AI Match Alert: 92% Compatibility",
                message="Surplus food from Grand Palace Hotel matches Asha Shelter food request perfectly!",
                type=NotificationType.SUCCESS,
                link="/ngo-dashboard"
            ),
            Notification(
                user_id=beneficiary_user.id,
                title="Food Request Logged",
                message="Your request for 40 meals is active and visible to nearby relief NGOs.",
                type=NotificationType.INFO,
                link="/beneficiary-dashboard"
            )
        ]
        db.add_all(notifications)

        db.commit()
        print("[SUCCESS] Database seeded successfully with demo users, donations, requests, and logs.")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error while seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
