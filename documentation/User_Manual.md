# User Manual - Smart Food Distribution Platform

## 1. Introduction
Welcome to the **Smart Food Distribution Platform**. This manual guides students, professors, and evaluators through the complete end-to-end operation of the platform.

The platform provides a complete solution to commercial surplus food recovery, matching donor kitchens with nearby relief teams and community beneficiaries in real-time.

---

## 2. Pre-Configured Demonstration Accounts

To test the application without manual registration, 4 ready-to-use demo accounts are pre-seeded in the database:

| Role | Email Address | Password | Organization / Entity |
| :--- | :--- | :--- | :--- |
| **Food Donor** | `donor@demo.com` | `password123` | Grand Palace Hotel & Banquets |
| **NGO / Volunteer** | `ngo@demo.com` | `password123` | Robin Hood Food Relief Network |
| **Beneficiary** | `beneficiary@demo.com` | `password123` | Asha Community Shelter |
| **Administrator** | `admin@demo.com` | `password123` | Central Platform Operations |

> [!TIP]
> On the **Login Page**, you can click any of the **1-Click Demo Login** buttons to sign in instantly without typing!

---

## 3. End-to-End Walkthrough Scenarios

### Workflow A: Food Donor Experience
1. **Sign In**: Navigate to the Login page and click **"Food Donor"**.
2. **Review Dashboard**: You will see your active listings, total servings provided, and landfill kilograms diverted.
3. **Post Surplus Food**:
   - Click the green **"Create New Food Donation"** button.
   - Enter food title (e.g., *"Buffet Surplus: Veg Biryani & Paneer"*).
   - Select category (`Cooked Meals`), servings (`45`), and dietary tag (`Pure Vegetarian`).
   - Set the Safe Expiry Deadline (e.g., 6 hours ahead).
   - Click **"Publish Surplus Food to Network"**.
4. **Instant Notification**: The platform automatically publishes the food to the marketplace and sends notifications to all registered NGOs within the city.
5. **Driver Handover**: When an NGO accepts your donation, the driver's name, phone, and **4-digit Handover OTP** will appear on your dashboard card.

---

### Workflow B: NGO / Volunteer Relief Experience
1. **Sign In**: Click **"NGO / Volunteer"** on the Login screen.
2. **Browse Marketplace Feed**:
   - On the **"Available Surplus Marketplace"** tab, inspect incoming food listings.
   - Filter by food category (e.g. *Cooked Hot Meals*, *Bakery*), dietary preference, or keyword.
3. **Claim Donation**:
   - Click **"Accept & Assign Driver"** on any food card.
   - Enter volunteer driver name, phone number, vehicle registration number, and dispatch notes.
   - Click **"Confirm Acceptance"**.
4. **Logistics Progression**:
   - Switch to the **"My Assigned Pickups"** tab.
   - Click **"Mark Driver En Route"** when the vehicle sets off.
   - Click **"Confirm Food Collected at Donor"** once the thermal container is loaded.
   - Click **"Record Community Distribution"** when delivering to a local shelter or food distribution point.

---

### Workflow C: Community Beneficiary Experience
1. **Sign In**: Click **"Beneficiary"** on the Login screen.
2. **Submit Food Request**:
   - Click **"Create New Food Request"**.
   - Enter the number of people to feed (e.g., 40), urgency level (*High*), and dietary requirements.
   - Click **"Submit Food Request"**.
3. **Inspect AI Matches**:
   - On your active request card, click **"View AI Matched Food"**.
   - The platform will run the mathematical multi-criteria model, computing:
     - **Haversine Distance**: How close the donor kitchen is to your shelter.
     - **Urgency Decay**: Prioritizing food approaching expiry.
     - **Portion Fit**: Servings compatibility.
   - Review ranked results with calculated compatibility scores (e.g., *92% AI Fit Score*).

---

### Workflow D: Administrator Control Center
1. **Sign In**: Click **"System Administrator"** on the Login screen.
2. **Platform KPI Oversight**:
   - Review live platform metrics: Total Registered Users, Food Rescued (kg), Servings Disbursed, and CO₂ Emissions Prevented.
3. **AI Demand Prediction Model**:
   - Inspect the **Scikit-Learn Random Forest Regression** widget displaying forecasted meal demand and volunteer deployment requirements for the upcoming 7 days.
4. **User Governance**:
   - Switch to the **"User Governance"** tab.
   - View all registered donors, NGOs, and shelters.
   - Click **"Deactivate"** or **"Activate"** to instantly toggle account operational permissions.
5. **Platform Audit Table**:
   - Switch to the **"Donations Audit"** tab to review all commercial listings across the entire city.
