# System Architecture - Smart Food Distribution Platform

## 1. Executive Summary
The **Smart Food Distribution Platform** is a full-stack, AI-powered humanitarian logistics platform engineered to reduce commercial food waste and eradicate hunger. It connects four distinct ecosystem roles:
1. **Food Donors**: Commercial kitchens, hotels, banquet halls, supermarkets, and individuals.
2. **NGOs & Volunteers**: Relief teams and field volunteers who collect and distribute food.
3. **Beneficiaries**: Homeless shelters, community orphanages, eldercare centers, and families.
4. **Platform Administrators**: Super-users managing verification, analytics, and audit logging.

---

## 2. High-Level Architecture Diagram

```mermaid
graph TD
    subgraph Client_Layer [Client Presentation Layer - React + Vite]
        UI_Guest[Landing Page & Registration]
        UI_Donor[Donor Dashboard & Food Listing]
        UI_Ngo[NGO Feed, Dispatcher & Tracking]
        UI_Ben[Beneficiary Hub & Match Viewer]
        UI_Admin[Admin Control Center & Forecast]
    end

    subgraph API_Gateway [FastAPI Gateway & Security Layer]
        CORS[CORS Middleware & SSL]
        JWT[JWT Bearer Token Authenticator]
        RBAC[Role-Based Access Control Guard]
    end

    subgraph Service_Engines [Backend Microservices & Routers]
        AuthRouter[Auth & User Management]
        DonationRouter[Donation Lifecycle Service]
        RequestRouter[Food Request Service]
        PickupRouter[Logistics & Dispatch Service]
        DistRouter[Distribution Record Service]
        AnalyticsRouter[Platform KPI & Impact Aggregator]
        MLRouter[AI Recommendation Router]
    end

    subgraph Intelligence_Core [AI / Machine Learning Engine]
        Haversine[Haversine Spatial Proximity Engine]
        ExpiryRanker[Perishable Decay Urgency Ranker]
        PortionMatcher[Portion & Dietary Fit Optimizer]
        DemandForecaster[Scikit-Learn Random Forest Forecaster]
    end

    subgraph Data_Layer [Relational Storage Layer]
        MySQL[(MySQL 8.0 / SQLite Storage)]
        UsersTable[(users)]
        DonationsTable[(donations)]
        RequestsTable[(food_requests)]
        PickupsTable[(pickup_assignments)]
        DistRecordsTable[(distribution_records)]
        NotifsTable[(notifications)]
    end

    Client_Layer -->|HTTPS / REST API with Bearer JWT| API_Gateway
    API_Gateway --> Service_Engines
    DonationRouter --> Intelligence_Core
    RequestRouter --> Intelligence_Core
    MLRouter --> Intelligence_Core
    Service_Engines --> Data_Layer
```

---

## 3. Database Entity-Relationship (ER) Model

```mermaid
erDiagram
    USERS ||--o{ DONATIONS : creates
    USERS ||--o{ FOOD_REQUESTS : requests
    USERS ||--o{ PICKUP_ASSIGNMENTS : claims
    USERS ||--o{ NOTIFICATIONS : receives
    DONATIONS ||--o| PICKUP_ASSIGNMENTS : assigns
    DONATIONS ||--o{ DISTRIBUTION_RECORDS : completes
    FOOD_REQUESTS ||--o{ DISTRIBUTION_RECORDS : fulfills

    USERS {
        int id PK
        string full_name
        string email UK
        string hashed_password
        enum role "DONOR, NGO, BENEFICIARY, ADMIN"
        string organization_name
        string phone
        string address
        string city
        float latitude
        float longitude
        boolean is_active
        timestamp created_at
    }

    DONATIONS {
        int id PK
        int donor_id FK
        string food_name
        enum food_category
        boolean is_veg
        float quantity_kg
        int servings
        datetime preparation_time
        datetime expiry_time
        string pickup_address
        string image_url
        enum status "AVAILABLE, ACCEPTED, PICKUP_ASSIGNED, COLLECTED, DISTRIBUTED, COMPLETED, CANCELLED, EXPIRED"
        timestamp created_at
    }

    FOOD_REQUESTS {
        int id PK
        int beneficiary_id FK
        string title
        int required_servings
        enum food_preference "ANY, VEG_ONLY, NON_VEG"
        enum urgency "LOW, MEDIUM, HIGH, CRITICAL"
        string delivery_address
        enum status "PENDING, MATCHED, ASSIGNED, FULFILLED, CANCELLED"
        timestamp created_at
    }

    PICKUP_ASSIGNMENTS {
        int id PK
        int donation_id FK, UK
        int ngo_id FK
        string driver_name
        string driver_phone
        string vehicle_number
        string verification_code
        enum status "ASSIGNED, EN_ROUTE, COLLECTED, DELIVERED, CANCELLED"
        timestamp assigned_at
        timestamp collected_at
        timestamp delivered_at
    }

    DISTRIBUTION_RECORDS {
        int id PK
        int donation_id FK
        int ngo_id FK
        int beneficiary_id FK
        int servings_distributed
        string distribution_address
        text proof_notes
        timestamp distributed_at
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        string title
        text message
        enum type "INFO, SUCCESS, WARNING, URGENT"
        boolean is_read
        string link
        timestamp created_at
    }
```

---

## 4. Role-Based Access Control (RBAC) Matrix

| Resource / Action | Food Donor | NGO / Volunteer | Beneficiary | Admin |
| :--- | :---: | :---: | :---: | :---: |
| **Post Surplus Food** | ✅ | ❌ | ❌ | ✅ |
| **Edit / Cancel Own Listing** | ✅ | ❌ | ❌ | ✅ |
| **Browse Surplus Marketplace** | ❌ | ✅ | ❌ | ✅ |
| **Claim & Assign Driver** | ❌ | ✅ | ❌ | ✅ |
| **Update Logistics Status** | ❌ | ✅ | ❌ | ✅ |
| **Submit Meal Request** | ❌ | ❌ | ✅ | ✅ |
| **View AI Matched Food** | ❌ | ✅ | ✅ | ✅ |
| **Record Distribution Proof** | ❌ | ✅ | ❌ | ✅ |
| **Platform User Governance** | ❌ | ❌ | ❌ | ✅ |
| **AI Demand Forecast Model** | ❌ | ✅ | ❌ | ✅ |

---

## 5. AI / ML Smart Matching Model Formulation

The matching engine uses multi-criteria decision analysis (MCDA) combining spatial distance, perishable urgency decay, capacity fit, and dietary preferences:

$$
\text{Match Score} = w_1 \cdot \mathcal{S}_{\text{dist}} + w_2 \cdot \mathcal{S}_{\text{urgency}} + w_3 \cdot \mathcal{S}_{\text{portion}} + w_4 \cdot \mathcal{S}_{\text{diet}}
$$

Where weights are configured as:
- $w_1 = 0.35$ (Distance Proximity via Haversine)
- $w_2 = 0.30$ (Perishable Expiry Decay)
- $w_3 = 0.20$ (Portion Capacity Fit)
- $w_4 = 0.15$ (Dietary Preference Compliance)

### Haversine Formula for Distance
$$
d = 2R \arcsin \left( \sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)} \right)
$$
Where $R = 6371 \text{ km}$. Distance is normalized over a 20 km urban delivery radius.
