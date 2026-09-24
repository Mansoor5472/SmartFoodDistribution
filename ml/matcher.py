import math
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on Earth (in kilometers).
    """
    R = 6371.0  # Earth radius in kilometers
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


def calculate_expiry_urgency_score(expiry_time: Any) -> float:
    """
    Calculates urgency score based on hours remaining until food expires.
    Returns value between 0.0 (lots of time) and 1.0 (imminent expiration).
    """
    now = datetime.utcnow()
    if not expiry_time:
        return 0.5
    if isinstance(expiry_time, str):
        try:
            expiry_time = datetime.fromisoformat(expiry_time.replace('Z', '+00:00'))
        except Exception:
            return 0.5
    if hasattr(expiry_time, "tzinfo") and expiry_time.tzinfo is not None:
        expiry_time = expiry_time.astimezone(timezone.utc).replace(tzinfo=None)
    diff = (expiry_time - now).total_seconds() / 3600.0  # hours remaining

    if diff <= 0:
        return 1.0  # Expired or about to expire
    elif diff <= 3.0:
        return 0.95
    elif diff <= 6.0:
        return 0.85
    elif diff <= 12.0:
        return 0.70
    elif diff <= 24.0:
        return 0.50
    elif diff <= 48.0:
        return 0.30
    else:
        return 0.15


def calculate_portion_fit(available_servings: int, requested_servings: int) -> float:
    """
    Calculates portion fit compatibility between 0.0 and 1.0.
    """
    if requested_servings <= 0:
        return 0.5
    ratio = available_servings / float(requested_servings)
    if 0.8 <= ratio <= 1.2:
        return 1.0  # Near perfect match
    elif ratio > 1.2:
        return 0.85  # Surplus available
    elif 0.5 <= ratio < 0.8:
        return 0.65  # Partial fulfillment
    else:
        return 0.30


def calculate_preference_compatibility(is_veg_donation: bool, request_preference: str) -> float:
    """
    Evaluates dietary compliance.
    """
    pref = request_preference.upper() if request_preference else "ANY"
    if pref == "ANY":
        return 1.0
    if pref == "VEG_ONLY":
        return 1.0 if is_veg_donation else 0.0
    if pref == "NON_VEG":
        return 1.0  # Non-veg eaters can also consume veg or meat
    return 1.0


class SmartFoodMatcher:
    """
    AI Multi-Criteria Decision Analysis Engine for matching
    food donations to beneficiaries and nearby NGOs.
    """
    def __init__(
        self,
        weight_distance: float = 0.35,
        weight_urgency: float = 0.30,
        weight_portion: float = 0.20,
        weight_pref: float = 0.15
    ):
        self.w_dist = weight_distance
        self.w_urgency = weight_urgency
        self.w_portion = weight_portion
        self.w_pref = weight_pref

    def compute_match_score(
        self,
        donation: Dict[str, Any],
        request: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Computes match score between a donation and a food request.
        """
        d_lat = donation.get("latitude", 28.6139)
        d_lon = donation.get("longitude", 77.2090)
        r_lat = request.get("latitude", 28.6139)
        r_lon = request.get("longitude", 77.2090)

        # 1. Distance
        distance_km = haversine_distance(d_lat, d_lon, r_lat, r_lon)
        # Normalize distance: 0km -> 1.0, 20km+ -> 0.0
        norm_dist = max(0.0, 1.0 - (distance_km / 20.0))

        # 2. Urgency
        expiry = donation.get("expiry_time", datetime.utcnow())
        urgency_score = calculate_expiry_urgency_score(expiry)

        # 3. Portion fit
        d_servings = donation.get("servings", 10)
        r_servings = request.get("required_servings", 10)
        portion_score = calculate_portion_fit(d_servings, r_servings)

        # 4. Dietary match
        d_is_veg = donation.get("is_veg", True)
        r_pref = request.get("food_preference", "ANY")
        pref_score = calculate_preference_compatibility(d_is_veg, r_pref)

        # If strict diet mismatch (e.g. non-veg food for veg-only shelter)
        if pref_score == 0.0:
            final_percentage = 0.0
        else:
            raw_score = (
                (self.w_dist * norm_dist) +
                (self.w_urgency * urgency_score) +
                (self.w_portion * portion_score) +
                (self.w_pref * pref_score)
            )
            final_percentage = round(raw_score * 100.0, 1)

        return {
            "donation_id": donation.get("id"),
            "request_id": request.get("id"),
            "match_score": min(99.0, max(10.0, final_percentage)),
            "distance_km": distance_km,
            "breakdown": {
                "distance_factor": round(norm_dist * 100, 1),
                "urgency_factor": round(urgency_score * 100, 1),
                "portion_factor": round(portion_score * 100, 1),
                "dietary_factor": round(pref_score * 100, 1)
            }
        }

    def rank_donations_for_request(
        self,
        request: Dict[str, Any],
        donations: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        ranked = []
        for d in donations:
            res = self.compute_match_score(d, request)
            res["donation"] = d
            ranked.append(res)
        return sorted(ranked, key=lambda x: x["match_score"], reverse=True)


matcher = SmartFoodMatcher()
