from datetime import datetime, timedelta
from typing import List
import requests
from app.config import settings

def fetch_external_alerts() -> List[dict]:
    """
    Fetches alerts from IMD/weather API, or falls back to returning mock warnings.
    """
    if settings.IMD_API_URL.lower() == "mock":
        return get_mock_alerts()
        
    try:
        # Example of fetching external alerts if url is configured
        headers = {}
        if settings.IMD_API_KEY:
            headers["Authorization"] = f"Bearer {settings.IMD_API_KEY}"
            
        response = requests.get(settings.IMD_API_URL, headers=headers, timeout=5)
        if response.status_code == 200:
            # Parse responses (would normally transform mapping to standard dict list)
            return response.json()
    except Exception:
        # Log error in production, fallback to mock in dev
        pass
        
    return get_mock_alerts()

def get_mock_alerts() -> List[dict]:
    """Generates standard, realistic mock alerts for Odisha coastal regions."""
    now = datetime.utcnow()
    return [
        {
            "source": "IMD",
            "alert_type": "Cyclone",
            "severity": "High",
            "description": "Deep depression over Bay of Bengal has intensified into Cyclone 'Asani'. Expected landfall near Odisha coast within 24 hours. High winds up to 110 km/h and heavy rainfall expected.",
            "affected_area": "Odisha Coastal Region (Puri, Jagatsinghpur, Balasore)",
            "latitude": 19.8135,
            "longitude": 85.8312,
            "issued_at": now - timedelta(hours=2),
            "expires_at": now + timedelta(days=2)
        },
        {
            "source": "IMD",
            "alert_type": "Flood",
            "severity": "Critical",
            "description": "Mahanadi river water level has breached danger marks at Naraj. High volumes of water being released from Hirakud Dam. Low lying villages and urban areas of Cuttack and Khurda are warned of immediate flood risk.",
            "affected_area": "Mahanadi Basin (Cuttack, Kendrapada, Khurda)",
            "latitude": 20.4625,
            "longitude": 85.8830,
            "issued_at": now - timedelta(minutes=45),
            "expires_at": now + timedelta(days=1)
        },
        {
            "source": "IMD",
            "alert_type": "Landslide",
            "severity": "Medium",
            "description": "Continuous heavy rainfall has triggered minor landslides in Gajapati and Rayagada hilly regions. Transport routes blocked. Citizens advised to avoid hill slope roads.",
            "affected_area": "Gajapati Hilly Region",
            "latitude": 18.8124,
            "longitude": 84.1482,
            "issued_at": now - timedelta(hours=4),
            "expires_at": now + timedelta(hours=12)
        }
    ]
