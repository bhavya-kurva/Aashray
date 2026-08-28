import re
import random
from typing import Dict, Tuple

# Mock Geocoder for regional localities (Odisha focus area)
MOCK_LOCATIONS: Dict[str, Tuple[float, float]] = {
    "RASULGARH": (20.2882, 85.8647),
    "PATIA": (20.3533, 85.8364),
    "NAYAPALLI": (20.2961, 85.8245),
    "SAHEED NAGAR": (20.2866, 85.8427),
    "KHANDAGIRI": (20.2588, 85.7865),
    "CUTTACK": (20.4625, 85.8830),
    "PURI": (19.8135, 85.8312),
    "BALASORE": (21.4934, 86.9337),
    "BHUBANESWAR": (20.2961, 85.8245)
}

def parse_sms_message(text: str) -> dict:
    """
    Parses a text message like: "HELP FLOOD HIGH 20 NEAR RASULGARH"
    Returns a dictionary of fields suitable for creating an incident.
    """
    text_upper = text.upper()
    
    # 1. Detect Disaster Type
    disaster_type = "Other"
    for d in ["FLOOD", "CYCLONE", "LANDSLIDE", "FIRE"]:
        if d in text_upper:
            disaster_type = d.capitalize()
            break
            
    # 2. Detect Severity
    severity = "Medium"
    for s in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]:
        if s in text_upper:
            severity = s.capitalize()
            break
            
    # 3. Detect People Affected
    people_affected = 1
    # Find any standalone number
    numbers = re.findall(r"\b\d+\b", text_upper)
    if numbers:
        people_affected = int(numbers[0])
        
    # 4. Geocode Locality
    latitude, longitude = 20.2961, 85.8245  # Default central Bhubaneswar
    location_name = "Unknown Location"
    
    # Look for matching keys in our mock geocoder
    found_loc = False
    for loc_key, coords in MOCK_LOCATIONS.items():
        if loc_key in text_upper:
            latitude, longitude = coords
            location_name = loc_key.capitalize()
            found_loc = True
            break
            
    if not found_loc:
        # Check if there is text after "NEAR"
        near_match = re.search(r"NEAR\s+([A-Z\s]+)", text_upper)
        if near_match:
            potential_name = near_match.group(1).strip()
            # If not in dictionary, give a slight random offset from center
            latitude = 20.2961 + random.uniform(-0.05, 0.05)
            longitude = 85.8245 + random.uniform(-0.05, 0.05)
            location_name = potential_name.capitalize()
        else:
            # Random offset so multiple unknown location SMS reports don't overlay exactly
            latitude = 20.2961 + random.uniform(-0.05, 0.05)
            longitude = 85.8245 + random.uniform(-0.05, 0.05)
            location_name = "Reported locality via SMS"

    return {
        "incident_type": disaster_type,
        "severity": severity,
        "description": f"SMS received: \"{text}\"",
        "latitude": round(latitude, 5),
        "longitude": round(longitude, 5),
        "location": location_name,
        "people_affected": people_affected,
        "source": "SMS"
    }
