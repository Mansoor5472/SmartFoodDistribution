# REST API Documentation - Smart Food Distribution Platform

## 1. Overview
The platform backend exposes a high-performance RESTful API constructed with FastAPI, Pydantic v2 schemas, and JWT bearer authentication.

- **Base URL**: `http://localhost:8000/api/v1`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

---

## 2. Authentication & Authorization

All protected routes require an HTTP Bearer header:
```http
Authorization: Bearer <your_jwt_access_token>
```

### Endpoints

#### `POST /auth/register`
Creates a new platform user and issues an initial JWT token.
- **Request Body**:
```json
{
  "full_name": "Chef Rajesh Sharma",
  "email": "donor@demo.com",
  "password": "password123",
  "role": "DONOR",
  "organization_name": "Grand Palace Hotel",
  "phone": "+91 9876543210",
  "address": "Ring Road, South Extension II",
  "city": "Delhi"
}
```
- **Response**: `201 Created`
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "user": { "id": 2, "full_name": "Chef Rajesh Sharma", "role": "DONOR", ... }
}
```

#### `POST /auth/login`
Validates credentials and returns a JWT token.
- **Request Body**:
```json
{
  "email": "donor@demo.com",
  "password": "password123"
}
```

#### `GET /auth/me`
Retrieves the authenticated user's profile.

#### `PUT /auth/profile`
Updates organization details, contact number, or address coordinates.

#### `GET /auth/users` *(Admin only)*
Returns list of all registered platform accounts with filtering by role.

#### `PUT /auth/users/{id}/toggle-active` *(Admin only)*
Activates or deactivates a user account.

---

## 3. Surplus Food Donations

#### `POST /donations/` *(Role: DONOR, ADMIN)*
Publishes a new surplus food batch.
- **Request Body**:
```json
{
  "food_name": "Fresh Lunch Buffet Spread",
  "food_category": "COOKED_MEALS",
  "is_veg": true,
  "quantity_kg": 15.5,
  "servings": 40,
  "preparation_time": "2026-09-22T13:00:00Z",
  "expiry_time": "2026-09-22T21:00:00Z",
  "pickup_address": "Gate 3, Grand Palace Kitchen",
  "contact_phone": "+91 9876543210",
  "description": "Wholesome dal, rice, and paneer curry.",
  "image_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
}
```

#### `GET /donations/available`
Fetches all currently unclaimed surplus donations for the marketplace. Supports query parameters:
- `category` (optional enum)
- `is_veg` (optional boolean)
- `search` (optional string)

#### `GET /donations/my-donations` *(Role: DONOR)*
Retrieves all historical and active donations posted by the logged-in donor.

#### `POST /donations/{id}/accept` *(Role: NGO, ADMIN)*
NGO claims an available surplus donation, creating an initial pickup record and notifying the donor.

#### `PUT /donations/{id}/status`
Transitions donation lifecycle status (`AVAILABLE` -> `ACCEPTED` -> `PICKUP_ASSIGNED` -> `COLLECTED` -> `DISTRIBUTED` -> `COMPLETED`).

#### `DELETE /donations/{id}`
Cancels an uncollected donation.

---

## 4. Food Assistance Requests (Beneficiaries)

#### `POST /requests/` *(Role: BENEFICIARY, ADMIN)*
Submits a community meal requirement.
- **Request Body**:
```json
{
  "title": "Evening Meals for 35 Shelter Residents",
  "required_servings": 35,
  "food_preference": "VEG_ONLY",
  "urgency": "HIGH",
  "delivery_address": "Asha Shelter, Lodhi Colony Block B",
  "contact_phone": "+91 9822334455",
  "notes": "Elderly and daily wage workers."
}
```

#### `GET /requests/my-requests` *(Role: BENEFICIARY)*
Lists requests created by current shelter account.

#### `GET /requests/active`
Lists active community requests for NGOs and administrators.

---

## 5. Pickup Logistics & Dispatch

#### `POST /pickups/` *(Role: NGO, ADMIN)*
Assigns a volunteer driver and vehicle to collect claimed food.
- **Request Body**:
```json
{
  "donation_id": 3,
  "driver_name": "Ramesh Kumar",
  "driver_phone": "+91 9871122334",
  "vehicle_number": "DL-03-FD-9821",
  "pickup_notes": "Thermal van arriving in 20 minutes."
}
```

#### `GET /pickups/my-pickups` *(Role: NGO)*
Returns assigned dispatches and delivery statuses.

#### `GET /pickups/{id}`
Returns real-time status and verification code for a specific dispatch.

#### `PUT /pickups/{id}/status`
Updates driver transit status (`ASSIGNED` -> `EN_ROUTE` -> `COLLECTED` -> `DELIVERED`).

---

## 6. Distribution Records & Fulfillment

#### `POST /distribution/` *(Role: NGO, ADMIN)*
Logs successful meal dropoff at shelter, updates community impact, and notifies donor.
- **Request Body**:
```json
{
  "donation_id": 3,
  "servings_distributed": 40,
  "distribution_address": "Asha Community Shelter, Lodhi Road",
  "proof_notes": "Handed out to 40 residents."
}
```

#### `GET /distribution/records`
Lists distribution logs.

---

## 7. AI / Machine Learning Endpoints

#### `GET /ml/match/request/{request_id}`
Executes multi-factor AI matching to rank candidate surplus donations against a beneficiary request.
- **Response**:
```json
{
  "request_id": 1,
  "total_candidates": 4,
  "matches": [
    {
      "donation_id": 1,
      "match_score": 92.4,
      "distance_km": 2.1,
      "breakdown": {
        "distance_factor": 89.5,
        "urgency_factor": 85.0,
        "portion_factor": 100.0,
        "dietary_factor": 100.0
      },
      "donation": { ... }
    }
  ]
}
```

#### `GET /ml/forecast/weekly`
Executes scikit-learn regression model to return a 7-day community meal demand and volunteer deployment forecast.

---

## 8. Analytics & Impact

#### `GET /analytics/summary`
Returns comprehensive platform KPIs (total users, kg saved, servings, CO2 prevented, monthly trends).

#### `GET /analytics/public-counters`
Lightweight public metrics for landing page counters.
