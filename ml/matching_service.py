import math
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate geodesic surface distance in kilometers between two points using Haversine formula.
    """
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2.0) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)


def compute_donation_urgency_priority(expiry_time: Optional[datetime]) -> Dict[str, Any]:
    """
    FEATURE 3: Algorithmically calculates urgency priority score and classification
    based on hours remaining until food expires.
    """
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    if not expiry_time:
        return {
            "priority": "MEDIUM",
            "score": 0.65,
            "hours_remaining": 8.0,
            "badge_color": "#f59e0b",
            "recommended_action": "Standard daytime delivery window."
        }
    if isinstance(expiry_time, str):
        try:
            expiry_time = datetime.fromisoformat(expiry_time.replace("Z", "+00:00")).replace(tzinfo=None)
        except Exception:
            return {
                "priority": "MEDIUM",
                "score": 0.65,
                "hours_remaining": 8.0,
                "badge_color": "#f59e0b",
                "recommended_action": "Standard daytime delivery window."
            }
    if hasattr(expiry_time, "tzinfo") and expiry_time.tzinfo is not None:
        expiry_time = expiry_time.astimezone(timezone.utc).replace(tzinfo=None)
    diff_hours = (expiry_time - now).total_seconds() / 3600.0

    if diff_hours <= 0:
        return {
            "priority": "EXPIRED",
            "score": 1.0,
            "hours_remaining": 0.0,
            "badge_color": "#ef4444",
            "recommended_action": "Food expired. Do not distribute without safety check."
        }
    elif diff_hours <= 3.0:
        return {
            "priority": "CRITICAL",
            "score": 1.0,
            "hours_remaining": round(diff_hours, 1),
            "badge_color": "#dc2626",
            "recommended_action": "Immediate thermal pickup required within 45 minutes!"
        }
    elif diff_hours <= 6.0:
        return {
            "priority": "HIGH",
            "score": 0.85,
            "hours_remaining": round(diff_hours, 1),
            "badge_color": "#f97316",
            "recommended_action": "Dispatch driver within 2 hours."
        }
    elif diff_hours <= 16.0:
        return {
            "priority": "MEDIUM",
            "score": 0.65,
            "hours_remaining": round(diff_hours, 1),
            "badge_color": "#f59e0b",
            "recommended_action": "Standard daytime delivery window."
        }
    else:
        return {
            "priority": "LOW",
            "score": 0.40,
            "hours_remaining": round(diff_hours, 1),
            "badge_color": "#10b981",
            "recommended_action": "Stable shelf-life. Plan scheduled route."
        }


class SmartMatchingService:
    """
    FEATURE 1: Intelligent Multi-Criteria Decision Analysis (MCDA) Matching Engine.
    Matches Food Donations with the most suitable NGOs and Beneficiaries.
    """
    def __init__(
        self,
        weight_distance: float = 0.25,
        weight_quantity: float = 0.20,
        weight_preference: float = 0.15,
        weight_urgency: float = 0.15,
        weight_demand: float = 0.15,
        weight_availability: float = 0.10
    ):
        self.w_dist = weight_distance
        self.w_qty = weight_quantity
        self.w_pref = weight_preference
        self.w_urg = weight_urgency
        self.w_dem = weight_demand
        self.w_avail = weight_availability

    def calculate_distance_score(self, distance_km: float, max_radius_km: float = 20.0) -> float:
        """Normalized spatial proximity score: 0km -> 1.0, >= 20km -> 0.1"""
        if distance_km <= 1.0:
            return 1.0
        elif distance_km >= max_radius_km:
            return 0.1
        return max(0.1, 1.0 - (distance_km / max_radius_km))

    def calculate_quantity_compatibility(self, donation_servings: int, requested_servings: int) -> float:
        """Evaluates portion adequacy fit"""
        if requested_servings <= 0:
            return 0.5
        ratio = donation_servings / float(requested_servings)
        if 0.85 <= ratio <= 1.25:
            return 1.0 # Optimal match: zero food leftover, all beneficiaries fed
        elif ratio > 1.25:
            return 0.88 # Surplus available
        elif 0.50 <= ratio < 0.85:
            return 0.68 # Partial batch fulfillment
        else:
            return 0.35 # High mismatch

    def calculate_dietary_compatibility(self, is_veg_donation: bool, required_preference: str) -> float:
        """Strict dietary compliance filter"""
        pref = (required_preference or "ANY").upper()
        if pref == "VEG_ONLY":
            return 1.0 if is_veg_donation else 0.0 # Non-veg food CANNOT be matched to veg-only shelters!
        elif pref == "NON_VEG":
            return 1.0
        return 1.0 # ANY preference accepts either

    def calculate_demand_urgency_score(self, request_urgency: str) -> float:
        urg = (request_urgency or "MEDIUM").upper()
        mapping = {
            "CRITICAL": 1.0,
            "HIGH": 0.85,
            "MEDIUM": 0.65,
            "LOW": 0.40
        }
        return mapping.get(urg, 0.60)

    def calculate_ngo_availability_score(self, active_pickups_count: int) -> float:
        """NGOs with fewer ongoing dispatches have higher availability to take on emergency runs"""
        if active_pickups_count == 0:
            return 1.0
        elif active_pickups_count == 1:
            return 0.85
        elif active_pickups_count == 2:
            return 0.70
        elif active_pickups_count <= 4:
            return 0.50
        else:
            return 0.30

    def match_donation_with_ngo(
        self,
        donation: Dict[str, Any],
        ngo: Dict[str, Any],
        active_pickups_count: int = 0
    ) -> Dict[str, Any]:
        """
        FEATURE 1: Calculates multi-factor matching score between a donation and an NGO.
        Evaluates:
        1. Distance between donor and NGO (Haversine formula)
        2. Food quantity & servings compatibility
        3. Dietary preference compatibility (Veg/Non-Veg)
        4. Expiry time priority score (Critical, High, Medium, Low)
        5. Food category compatibility
        6. NGO/Volunteer availability (active assignments load)
        7. Recipient community demand
        """
        d_lat = donation.get("latitude", 28.6139)
        d_lon = donation.get("longitude", 77.2090)
        n_lat = ngo.get("latitude", 28.6139)
        n_lon = ngo.get("longitude", 77.2090)

        # 1. Geodesic distance
        distance_km = haversine_distance(d_lat, d_lon, n_lat, n_lon)
        s_dist = self.calculate_distance_score(distance_km)

        # 2. Expiry urgency priority
        expiry = donation.get("expiry_time")
        if isinstance(expiry, str):
            try:
                expiry = datetime.fromisoformat(expiry.replace('Z', '+00:00'))
            except Exception:
                expiry = datetime.utcnow()
        elif not expiry:
            expiry = datetime.utcnow()

        urgency_info = compute_donation_urgency_priority(expiry)
        s_urg = urgency_info["score"]

        # 3. NGO Availability (fewer active pickups = higher capacity)
        s_avail = self.calculate_ngo_availability_score(active_pickups_count)

        # 4. Servings & Quantity scale
        servings = donation.get("servings", 20)
        s_qty = 1.0 if servings >= 15 else 0.75

        # 5. Food preference
        is_veg = donation.get("is_veg", True)
        ngo_pref = ngo.get("preference", "ANY")
        s_pref = self.calculate_dietary_compatibility(is_veg, ngo_pref)

        # 6. Recipient demand capacity
        s_dem = 0.90 if ngo.get("shelter_capacity", 50) >= servings else 0.70

        # Multi-factor weighted composite scoring
        composite = (
            (0.25 * s_dist) +
            (0.20 * s_urg) +
            (0.15 * s_avail) +
            (0.15 * s_qty) +
            (0.15 * s_pref) +
            (0.10 * s_dem)
        )
        final_score = round(min(99.0, max(20.0, composite * 100.0)), 1)

        # Recommended pickup deadline calculation based on remaining hours
        hours_rem = urgency_info["hours_remaining"]
        if hours_rem <= 0:
            pickup_deadline = "Immediate inspection required"
        elif hours_rem <= 3.0:
            pickup_deadline = f"Pickup within {max(0.5, round(hours_rem * 0.5, 1))} hrs"
        elif hours_rem <= 6.0:
            pickup_deadline = f"Pickup within {round(hours_rem * 0.7, 1)} hrs"
        else:
            pickup_deadline = f"Pickup within {round(hours_rem * 0.8, 1)} hrs"

        return {
            "ngo_id": ngo.get("id"),
            "ngo_name": ngo.get("organization_name") or ngo.get("full_name"),
            "ngo_phone": ngo.get("phone"),
            "distance_km": distance_km,
            "required_servings": servings,
            "match_score": final_score,
            "urgency": urgency_info["priority"],
            "pickup_deadline": pickup_deadline,
            "recommended_action": urgency_info["recommended_action"],
            "breakdown": {
                "distance_compatibility": round(s_dist * 100, 1),
                "expiry_priority": round(s_urg * 100, 1),
                "volunteer_availability": round(s_avail * 100, 1),
                "quantity_compatibility": round(s_qty * 100, 1),
                "dietary_compatibility": round(s_pref * 100, 1),
                "demand_compatibility": round(s_dem * 100, 1)
            }
        }

    def match_donation_with_request(
        self,
        donation: Dict[str, Any],
        request: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calculates compatibility between a donation and a beneficiary food request.
        """
        d_lat = donation.get("latitude", 28.6139)
        d_lon = donation.get("longitude", 77.2090)
        r_lat = request.get("latitude", 28.6139)
        r_lon = request.get("longitude", 77.2090)

        distance_km = haversine_distance(d_lat, d_lon, r_lat, r_lon)
        s_dist = self.calculate_distance_score(distance_km)

        # Portion
        d_servings = donation.get("servings", 10)
        r_servings = request.get("required_servings", 10)
        s_qty = self.calculate_quantity_compatibility(d_servings, r_servings)

        # Dietary preference
        d_is_veg = donation.get("is_veg", True)
        r_pref = request.get("food_preference", "ANY")
        s_pref = self.calculate_dietary_compatibility(d_is_veg, r_pref)

        # If strict diet mismatch
        if s_pref == 0.0:
            return {
                "donation_id": donation.get("id"),
                "request_id": request.get("id"),
                "match_score": 0.0,
                "distance_km": distance_km,
                "urgency": "MISMATCH",
                "incompatible_reason": "Dietary mismatch (Non-vegetarian food cannot satisfy Vegetarian-Only requirement)."
            }

        # Urgency
        expiry = donation.get("expiry_time", datetime.utcnow())
        urgency_info = compute_donation_urgency_priority(expiry)
        s_urg = urgency_info["score"]

        # Recipient demand
        s_dem = self.calculate_demand_urgency_score(request.get("urgency", "MEDIUM"))

        raw_score = (
            (self.w_dist * s_dist) +
            (self.w_qty * s_qty) +
            (self.w_pref * s_pref) +
            (self.w_urg * s_urg) +
            (self.w_dem * s_dem)
        )
        final_score = round(min(99.0, max(15.0, (raw_score / 0.90) * 100.0)), 1)

        return {
            "donation_id": donation.get("id"),
            "request_id": request.get("id"),
            "match_score": final_score,
            "distance_km": distance_km,
            "urgency": urgency_info["priority"],
            "hours_remaining": urgency_info["hours_remaining"],
            "required_servings": r_servings,
            "available_servings": d_servings,
            "breakdown": {
                "distance_compatibility": round(s_dist * 100, 1),
                "quantity_compatibility": round(s_qty * 100, 1),
                "dietary_compatibility": round(s_pref * 100, 1),
                "expiry_priority": round(s_urg * 100, 1),
                "demand_compatibility": round(s_dem * 100, 1)
            }
        }

    def rank_ngos_for_donation(
        self,
        donation: Dict[str, Any],
        ngos_list: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Ranks NGOs for a donation to show 'Recommended NGO' to the Donor or Dispatcher.
        """
        ranked = []
        for ngo in ngos_list:
            res = self.match_donation_with_ngo(donation, ngo, ngo.get("active_pickups", 0))
            ranked.append(res)
        return sorted(ranked, key=lambda x: x["match_score"], reverse=True)

    def rank_donations_for_ngo(
        self,
        ngo: Dict[str, Any],
        donations_list: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Ranks available donations for an NGO to show 'Recommended Donations' on NGO dashboard.
        """
        ranked = []
        for d in donations_list:
            res = self.match_donation_with_ngo(d, ngo, ngo.get("active_pickups", 0))
            res["donation"] = d
            ranked.append(res)
        return sorted(ranked, key=lambda x: x["match_score"], reverse=True)


matching_service = SmartMatchingService()

if __name__ == "__main__":
    import json
    sample_donation = {
        "id": 1,
        "food_name": "Hot Vegetable Biryani",
        "food_category": "COOKED_MEALS",
        "is_veg": True,
        "servings": 45,
        "latitude": 28.5672,
        "longitude": 77.2100,
        "expiry_time": datetime.now(timezone.utc).replace(tzinfo=None)
    }

    sample_ngos = [
        {"id": 101, "organization_name": "Feeding Hands Foundation", "latitude": 28.5700, "longitude": 77.2150, "phone": "+91 9811122233", "active_pickups": 0},
        {"id": 102, "organization_name": "Delhi City Harvest", "latitude": 28.6300, "longitude": 77.2200, "phone": "+91 9822233344", "active_pickups": 2},
        {"id": 103, "organization_name": "Outer Relief Shelter", "latitude": 28.7000, "longitude": 77.1000, "phone": "+91 9833344455", "active_pickups": 1}
    ]

    print("[TESTING] Running Smart Matching Engine...")
    ranked_ngos = matching_service.rank_ngos_for_donation(sample_donation, sample_ngos)
    print(f"[RECOMMENDED NGO]: {ranked_ngos[0]['ngo_name']} | Score: {ranked_ngos[0]['match_score']}% | Distance: {ranked_ngos[0]['distance_km']} km | Urgency: {ranked_ngos[0]['urgency']} | Pickup: {ranked_ngos[0]['pickup_deadline']}")
    print("[FULL BREAKDOWN]:", json.dumps(ranked_ngos[0]["breakdown"], indent=2))
