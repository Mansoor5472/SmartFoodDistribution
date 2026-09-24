# SMART FOOD DISTRIBUTION PLATFORM 🍲🚚🤝

> **AI & ML Semester Project**: An intelligent, production-grade web platform that connects food donors, relief NGOs, and community beneficiaries to eliminate food waste and fight urban hunger using machine learning demand prediction, geospatial Haversine optimization, and multi-factor decision matching.

---

## 🌟 Key Capabilities & Intelligent Features

### FEATURE 1 — SMART FOOD DONATION MATCHING (`ml/matching_service.py`)
A multi-criteria decision analysis (MCDA) recommendation engine that evaluates active food donations and pairs them with the most suitable NGO/volunteer depot or beneficiary shelter.

**9 Evaluation Factors:**
1. **Geodesic Distance**: Calculated using the **Haversine formula** between donor `(latitude, longitude)` and recipient `(latitude, longitude)`.
2. **Food Quantity**: Total volume of food (kg).
3. **Number of Required Servings**: Portion adequacy ratio between donation servings and recipient requirement.
4. **Food Type / Category**: Category compatibility (`COOKED_MEALS`, `BAKERY`, `PRODUCE_FRUITS`, `DAIRY`, `PACKAGED_FOOD`, etc.).
5. **Vegetarian / Non-Vegetarian Preference**: Strict dietary filter (e.g., non-veg food cannot be allocated to pure vegetarian shelters).
6. **Recipient Urgency**: Beneficiary emergency level (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
7. **Food Expiry Time**: Priority decay score calculated algorithmically based on remaining shelf life.
8. **Recipient Demand**: Scale of community hunger need and shelter headcount.
9. **NGO / Volunteer Availability**: Real-time availability score based on ongoing active dispatches.

**Conceptual Scoring Formula:**
$$\text{Matching Score} = w_{\text{dist}} \cdot s_{\text{dist}} + w_{\text{qty}} \cdot s_{\text{qty}} + w_{\text{pref}} \cdot s_{\text{pref}} + w_{\text{urg}} \cdot s_{\text{urg}} + w_{\text{exp}} \cdot s_{\text{exp}} + w_{\text{dem}} \cdot s_{\text{dem}} + w_{\text{avail}} \cdot s_{\text{avail}}$$
- Normalized output: **0% to 100%**.
- High scores generate immediate "Recommended NGO" cards with contact details, Haversine distance, urgency badge, and pickup deadlines.

---

### FEATURE 2 — FOOD DEMAND PREDICTION (`ml/`)
A trained machine learning regression model that forecasts upcoming community meal requirements to optimize food allocation and volunteer driver staffing.

**Input Features:**
- `location` (neighborhoods with varied shelter density)
- `day_of_week` (0 to 6, modeling weekend surges)
- `month` (1 to 12, temporal seasonality)
- `shelter_density` (density of relief shelters in the area)
- `donor_activity_index` (commercial food donor density)
- `food_category` (type of food demanded)
- `temperature_celsius` (ambient weather conditions)
- `beneficiaries_count` (headcount requiring nutrition)
- `historical_demand_lag1` (prior day demand)
- `historical_demand_lag7` (prior week demand)

**Model Comparison & Selection:**
The training pipeline (`ml/train_model.py`) trains and compares two models:
1. **Linear Regression** (Baseline model)
2. **Random Forest Regressor** (Ensemble decision trees modeling non-linear interactions)

**Evaluation Metrics (80/20 Train/Test Split):**
- **MAE** (Mean Absolute Error)
- **RMSE** (Root Mean Squared Error)
- **$R^2$ Score** (Coefficient of Determination)
*Evaluation metrics are computed genuinely on the test split and stored in `ml/metrics.json`.*

> [!NOTE]
> **Academic Dataset Disclaimer:**
> The training dataset (`ml/dataset/food_demand_dataset.csv`, 1,200 records) is synthetically generated for demonstration and academic evaluation purposes. It models realistic temporal curves and hunger distributions, but does not represent real-world municipal census data.

---

### FEATURE 3 — DYNAMIC URGENCY PRIORITY SCORING
An algorithmic priority score calculated in backend code rather than assigned manually:
- **`CRITICAL`** ($\le 3.0$ hours remaining): Urgency score 1.0. Immediate thermal dispatch within 45 minutes.
- **`HIGH`** ($> 3.0$ and $\le 6.0$ hours remaining): Urgency score 0.85. Dispatch driver within 2 hours.
- **`MEDIUM`** ($> 6.0$ and $\le 16.0$ hours remaining): Urgency score 0.65. Standard daytime delivery window.
- **`LOW`** ($> 16.0$ hours remaining): Urgency score 0.40. Stable shelf-life; scheduled delivery.
- **`EXPIRED`** ($\le 0$ hours): Flagged for safety inspection.

---

### FEATURE 4 — SMART DASHBOARDS & VISUALIZATIONS

#### 1. 🛡️ Admin Dashboard
- **Key Metrics**: Total donations, total meals distributed, active donations, completed distributions, and pending requests.
- **Predicted Demand Chart**: 7-day future hunger forecast using **Recharts BarChart**.
- **Distribution Trends**: Monthly community servings trajectory using **Recharts AreaChart**.
- **High-Priority Donations Table**: Ranked live listing of critical and high-urgency batches.
- **Top Active Areas**: Neighborhood density index and projected weekly meal volumes.
- **ML Verification Card**: Displays champion model name, MAE, RMSE, and $R^2$ score.

#### 2. 🍕 Donor Dashboard
- **Donation Status**: Live lifecycle stage (Available, Accepted, En Route, Collected, Distributed).
- **Recommended Pickup Time & Deadline**: Real-time calculated countdown based on expiry urgency.
- **Potentially Served**: Number of individuals fed per listing.
- **Distribution Completion**: Progress bar tracking physical delivery to shelters.
- **"Recommended NGO" Card**: Displays best-matched NGO name, Haversine distance in km, match score %, urgency tier, pickup deadline, and multi-factor breakdown.

#### 3. 🚚 NGO Dashboard
- **"Recommended Donations" View**: Available surplus ranked by compatibility score with Haversine distance, urgency badges, and 1-click dispatch.
- **Interactive OpenStreetMap (Leaflet)**: Free, open geospatial map with custom color-coded pins (Donations = Green, NGO Depot = Blue, Critical = Red pulse marker).
- **Current Requests**: Beneficiary community requirements list.
- **Dispatch Tracker**: Driver assignments with 4-digit handover verification codes.

#### 4. 🤝 Beneficiary Dashboard
- **Food Requests**: Submit community headcount, dietary preference, and urgency level.
- **"Matching Donations" View**: Algorithmic match suggestions showing portions fit, distance, and match score.
- **Status Tracking**: Monitor pending and fulfilled food allocations.

#### 5. 💡 Smart Insights Section
Available across dashboards with 5 cards:
1. **"Predicted Demand"**
2. **"High Priority Donations"**
3. **"Recommended Match"**
4. **"Meals Saved"**
5. **"Food Waste Reduced"**

---

## 🏗️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Recharts, Leaflet, Lucide Icons | Responsive UI, interactive charts, and OpenStreetMap |
| **Backend** | Python 3, FastAPI, Pydantic v2, SQLAlchemy | Async RESTful API with automated Swagger docs |
| **Machine Learning** | Scikit-Learn, Pandas, NumPy | Regression demand forecasting and feature scaling |
| **Database** | SQLite (Default) / MySQL Compatible | Relational tables with foreign keys and indexes |
| **Security** | JWT (JSON Web Tokens), Bcrypt | Secure role-based authentication and endpoint guards |

---

## 🔬 How to Train & Run the ML System

### 1. Generate the Synthetic Dataset
```powershell
python ml/dataset/generate_dataset.py
```
*Generates 1,200 synthetic records with temporal, weather, and lag demand features at `ml/dataset/food_demand_dataset.csv`.*

### 2. Train and Evaluate Models
```powershell
python ml/train_model.py
```
*Trains Linear Regression and Random Forest Regressor, evaluates MAE, RMSE, and $R^2$, and saves `ml/model.pkl`, `ml/scaler.pkl`, and `ml/metrics.json`.*

### 3. Run Inference Predictions
```powershell
python ml/predict.py
```
*Loads the trained model and outputs predicted meal requirements, kg estimates, and volunteer staffing.*

### 4. Test the Matching Service
```powershell
python ml/matching_service.py
```
*Runs the 9-factor Haversine matching algorithm and prints score breakdown for sample donations.*

### 5. Run the Automated API Test Suite
```powershell
python test_api_endpoints.py
```
*Verifies all REST endpoints (health, auth, priority, demand prediction, analytics, recommendations).*

---

## 🚀 Running the Full Platform

### Option A: 1-Click Launch (Recommended)
Simply double-click **`run.bat`** (or **`start.bat`**) in the project root folder.
* Automatically verifies Python & Node.js environment.
* Launches the FastAPI backend in its own terminal window on `http://127.0.0.1:8000`.
* Launches the Vite frontend in its own terminal window on `http://localhost:5173`.
* Automatically opens your default browser at `http://localhost:5173`.
* To stop both services at any time, double-click **`stop.bat`**.

---

### Option B: Manual Terminal Execution

#### Step 1: Start Backend (Terminal 1)
```powershell
cd "SmartFoodDistribution"
python -m uvicorn backend.main:app --port 8000 --reload
```
- API Root: `http://localhost:8000/`
- Interactive Swagger Documentation: `http://localhost:8000/docs`

#### Step 2: Start Frontend (Terminal 2)
```powershell
cd "SmartFoodDistribution\frontend"
npm.cmd run dev
```
- Open browser at: **`http://localhost:5173`**

---

## 🔑 Pre-Configured Demo Accounts

| Role | Email | Password | Organization |
| :--- | :--- | :--- | :--- |
| **Food Donor** | `donor@demo.com` | `password123` | Grand Palace Hotel & Banquets |
| **NGO / Volunteer** | `ngo@demo.com` | `password123` | Robin Hood Food Relief Network |
| **Beneficiary** | `beneficiary@demo.com` | `password123` | Asha Community Shelter |
| **Admin** | `admin@demo.com` | `password123` | Platform Operations Center |

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/matching/recommend` | Multi-factor NGO and Beneficiary matching recommendations |
| `GET` | `/api/matching/{donation_id}` | Recommendation rankings for a specific donation ID |
| `GET` | `/api/matching/ngo/recommended` | Ranked available donations for the authenticated NGO |
| `GET` | `/api/demand/prediction` | ML food demand forecast based on input features |
| `GET` | `/api/demand/prediction/weekly` | 7-day predicted food demand curve |
| `GET` | `/api/demand/metrics` | Transparent ML evaluation metrics (MAE, RMSE, $R^2$) |
| `GET` | `/api/donations/priority` | Active donations classified by urgency (Critical, High, etc.) |
| `GET` | `/api/analytics/demand` | Demand forecasts, top active areas, and distribution trends |
| `GET` | `/api/analytics/summary` | Platform-wide operational KPIs |
