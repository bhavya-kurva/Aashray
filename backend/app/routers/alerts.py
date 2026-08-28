from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models import DisasterAlert
from app.schemas import DisasterAlertResponse
from app.services.alert_service import fetch_external_alerts
from app.websocket.manager import manager

router = APIRouter(prefix="/alerts", tags=["Disaster Alerts"])

@router.get("", response_model=List[DisasterAlertResponse])
def get_alerts(db: Session = Depends(get_db)):
    """
    Fetches latest alerts. Syncs mock or external API alerts with the database 
    and returns them to the caller.
    """
    # 1. Fetch latest alerts
    api_alerts = fetch_external_alerts()
    
    # 2. Synchronize with database (avoid duplicates)
    for alert_data in api_alerts:
        # Check if alert already exists in DB
        exists = db.query(DisasterAlert).filter(
            DisasterAlert.alert_type == alert_data["alert_type"],
            DisasterAlert.affected_area == alert_data["affected_area"]
        ).first()
        
        if not exists:
            alert = DisasterAlert(
                source=alert_data["source"],
                alert_type=alert_data["alert_type"],
                severity=alert_data["severity"],
                description=alert_data["description"],
                affected_area=alert_data["affected_area"],
                latitude=alert_data["latitude"],
                longitude=alert_data["longitude"],
                issued_at=alert_data["issued_at"],
                expires_at=alert_data["expires_at"]
            )
            db.add(alert)
            
    db.commit()
    
    # Return all current alerts from database
    return db.query(DisasterAlert).order_by(DisasterAlert.issued_at.desc()).all()
