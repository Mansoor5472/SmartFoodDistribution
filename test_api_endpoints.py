import os
import sys

# Ensure SmartFoodDistribution directory is on path
sys.path.insert(0, os.path.dirname(__file__))

from fastapi.testclient import TestClient
from backend.main import app

def run_tests():
    print("[TESTING] Starting API Verification...")
    client = TestClient(app)

    # 1. Health check
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] GET /health: 200 OK")

    # 2. Login to get token
    donor_login = client.post("/api/v1/auth/login", json={"email": "donor@demo.com", "password": "password123"})
    assert donor_login.status_code == 200, f"Donor login failed: {donor_login.text}"
    donor_token = donor_login.json()["access_token"]
    donor_headers = {"Authorization": f"Bearer {donor_token}"}
    print("[PASS] POST /api/v1/auth/login: 200 OK (Donor authenticated)")

    # Login as NGO
    ngo_login = client.post("/api/v1/auth/login", json={"email": "ngo@demo.com", "password": "password123"})
    assert ngo_login.status_code == 200, f"NGO login failed: {ngo_login.text}"
    ngo_token = ngo_login.json()["access_token"]
    ngo_headers = {"Authorization": f"Bearer {ngo_token}"}
    print("[PASS] POST /api/v1/auth/login: 200 OK (NGO authenticated)")

    # 3. Urgency Priority endpoint
    prio_res = client.get("/api/donations/priority", headers=donor_headers)
    assert prio_res.status_code == 200, f"Priority endpoint failed: {prio_res.text}"
    prio_data = prio_res.json()
    assert "summary" in prio_data and "critical" in prio_data
    print(f"[PASS] GET /api/donations/priority: 200 OK (Active: {prio_data['summary']['total_active']})")

    # 4. Demand Prediction endpoint
    pred_res = client.get(
        "/api/demand/prediction?location=Karol%20Bagh&beneficiaries_count=70&day_of_week=5",
        headers=donor_headers
    )
    assert pred_res.status_code == 200, f"Demand prediction failed: {pred_res.text}"
    pred_data = pred_res.json()
    assert "predicted_meals" in pred_data
    print(f"[PASS] GET /api/demand/prediction: 200 OK (Predicted: {pred_data['predicted_meals']} meals, Model: {pred_data['model_metadata']['model_name']})")

    # 5. Demand Analytics endpoint
    analytics_res = client.get("/api/analytics/demand", headers=donor_headers)
    assert analytics_res.status_code == 200, f"Demand analytics failed: {analytics_res.text}"
    analytics_data = analytics_res.json()
    assert "weekly_forecast" in analytics_data
    print(f"[PASS] GET /api/analytics/demand: 200 OK (Forecast days: {len(analytics_data['weekly_forecast'])})")

    # 6. Smart Matching Recommendation endpoint
    recommend_payload = {
        "food_name": "Nutritious Rice & Lentil Stew",
        "food_category": "COOKED_MEALS",
        "is_veg": True,
        "servings": 35,
        "pickup_address": "South Extension II, Delhi",
        "latitude": 28.5672,
        "longitude": 77.2100
    }
    match_res = client.post("/api/matching/recommend", json=recommend_payload, headers=donor_headers)
    assert match_res.status_code == 200, f"Matching recommend failed: {match_res.text}"
    match_data = match_res.json()
    assert len(match_data["recommended_ngos"]) > 0
    top_match = match_data["recommended_ngos"][0]
    print(f"[PASS] POST /api/matching/recommend: 200 OK (Top NGO: {top_match['ngo_name']}, Score: {top_match['match_score']}%, Dist: {top_match['distance_km']} km)")

    # 7. Specific Donation Matches
    first_don_res = client.get("/api/donations/available")
    if first_don_res.status_code == 200 and len(first_don_res.json()) > 0:
        first_id = first_don_res.json()[0]["id"]
        don_match_res = client.get(f"/api/matching/{first_id}", headers=donor_headers)
        assert don_match_res.status_code == 200
        print(f"[PASS] GET /api/matching/{first_id}: 200 OK (Best match: {don_match_res.json().get('best_match', {}).get('ngo_name')})")

    # 8. NGO Recommended Donations
    ngo_recs_res = client.get("/api/matching/ngo/recommended", headers=ngo_headers)
    assert ngo_recs_res.status_code == 200
    print(f"[PASS] GET /api/matching/ngo/recommended: 200 OK ({len(ngo_recs_res.json())} recommended donations returned)")

    # 9. Create donation with ISO timezone string (verifying fix for user bug)
    from datetime import datetime, timedelta, timezone
    future_exp = (datetime.now(timezone.utc) + timedelta(hours=8)).isoformat()
    past_prep = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
    create_don_res = client.post(
        "/api/v1/donations/",
        json={
            "food_name": "Fresh Veg Buffet",
            "food_category": "COOKED_MEALS",
            "is_veg": True,
            "quantity_kg": 10.0,
            "servings": 25,
            "preparation_time": past_prep,
            "expiry_time": future_exp,
            "pickup_address": "Connaught Place, New Delhi",
            "contact_phone": "840034873",
            "description": "Surplus lunch meals"
        },
        headers=donor_headers
    )
    assert create_don_res.status_code == 201, f"Create donation failed: {create_don_res.text}"
    print(f"[PASS] POST /api/v1/donations/: 201 Created (ID: {create_don_res.json()['id']})")

    print("\n[ALL TESTS PASSED SUCCESSFULLY!]")

if __name__ == "__main__":
    run_tests()
