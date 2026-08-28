import random
import string
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database import get_db, haversine_distance_sql
from app.models import Incident, Assignment, RescueTeam
from app.schemas import IncidentResponse, IncidentUpdate, IncidentCreate
from app.utils.storage import save_upload_file
from app.websocket.manager import manager
from app.routers.auth import get_current_user

router = APIRouter(prefix="/incidents", tags=["Incidents"])

def generate_incident_id(db: Session) -> str:
    """Generates a unique incident ID in the format INC-XXXX (4-digit random number)"""
    while True:
        num = "".join(random.choices(string.digits, k=4))
        inc_id = f"INC-{num}"
        # Ensure unique
        exists = db.query(Incident).filter(Incident.id == inc_id).first()
        if not exists:
            return inc_id

def check_for_duplicate(db: Session, inc_type: str, lat: float, lon: float) -> bool:
    """
    Checks if there's an active incident of the same type reported 
    within 500 meters (0.5 km) in the last 30 minutes.
    """
    time_threshold = datetime.utcnow() - timedelta(minutes=30)
    # Query incidents in the last 30 minutes
    recent_incidents = db.query(Incident).filter(
        Incident.incident_type == inc_type,
        Incident.created_at >= time_threshold,
        Incident.status != "RESOLVED",
        Incident.status != "REJECTED"
    ).all()
    
    for existing in recent_incidents:
        dist = haversine_distance_sql(lat, lon, existing.latitude, existing.longitude)
        if dist <= 0.5:  # 500 meters
            return True
    return False

@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
async def create_incident_form(
    incident_type: str = Form(...),
    severity: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    description: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    people_affected: int = Form(1),
    source: str = Form("APP"),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """
    Creates an incident using Form-Data. Perfect for browser uploads supporting an image file.
    """
    photo_url = None
    if photo:
        photo_url = await save_upload_file(photo)
        
    incident_id = generate_incident_id(db)
    
    # Check duplicate
    is_dup = check_for_duplicate(db, incident_type, latitude, longitude)
    initial_status = "DUPLICATE" if is_dup else "REPORTED"
    
    incident = Incident(
        id=incident_id,
        incident_type=incident_type,
        severity=severity,
        description=description,
        latitude=latitude,
        longitude=longitude,
        location=location,
        photo_url=photo_url,
        people_affected=people_affected,
        source=source,
        status=initial_status
    )
    
    db.add(incident)
    db.commit()
    db.refresh(incident)
    
    # Broadcast to websocket
    await manager.broadcast({
        "event": "NEW_INCIDENT",
        "data": {
            "id": incident.id,
            "incident_type": incident.incident_type,
            "severity": incident.severity,
            "description": incident.description,
            "latitude": incident.latitude,
            "longitude": incident.longitude,
            "location": incident.location,
            "photo_url": incident.photo_url,
            "people_affected": incident.people_affected,
            "source": incident.source,
            "status": incident.status,
            "created_at": incident.created_at.isoformat()
        }
    })
    
    return incident

@router.post("/json", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
async def create_incident_json(
    payload: IncidentCreate,
    db: Session = Depends(get_db)
):
    """
    Creates an incident using JSON. Ideal for API clients, SMS/IVR hooks.
    """
    incident_id = generate_incident_id(db)
    is_dup = check_for_duplicate(db, payload.incident_type, payload.latitude, payload.longitude)
    initial_status = "DUPLICATE" if is_dup else "REPORTED"
    
    incident = Incident(
        id=incident_id,
        incident_type=payload.incident_type,
        severity=payload.severity,
        description=payload.description,
        latitude=payload.latitude,
        longitude=payload.longitude,
        location=payload.location,
        photo_url=payload.photo_url,
        people_affected=payload.people_affected,
        source=payload.source,
        status=initial_status
    )
    
    db.add(incident)
    db.commit()
    db.refresh(incident)
    
    await manager.broadcast({
        "event": "NEW_INCIDENT",
        "data": {
            "id": incident.id,
            "incident_type": incident.incident_type,
            "severity": incident.severity,
            "description": incident.description,
            "latitude": incident.latitude,
            "longitude": incident.longitude,
            "location": incident.location,
            "photo_url": incident.photo_url,
            "people_affected": incident.people_affected,
            "source": incident.source,
            "status": incident.status,
            "created_at": incident.created_at.isoformat()
        }
    })
    
    return incident

@router.get("", response_model=List[IncidentResponse])
def get_incidents(db: Session = Depends(get_db)):
    return db.query(Incident).order_by(Incident.created_at.desc()).all()

@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.patch("/{incident_id}", response_model=IncidentResponse)
async def update_incident(
    incident_id: str,
    payload: IncidentUpdate,
    db: Session = Depends(get_db)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    update_data = payload.model_dump(exclude_unset=True)
    
    # If resolving, update related assignments
    if "status" in update_data and update_data["status"] == "RESOLVED":
        active_assignments = db.query(Assignment).filter(
            Assignment.incident_id == incident_id,
            Assignment.status == "ACTIVE"
        ).all()
        for assignment in active_assignments:
            assignment.status = "COMPLETED"
            assignment.completed_at = datetime.utcnow()
            
            # Release rescue teams
            if assignment.resource_type == "RESCUE_TEAM":
                team = db.query(RescueTeam).filter(RescueTeam.id == assignment.resource_id).first()
                if team:
                    team.status = "AVAILABLE"
                    
    for key, value in update_data.items():
        setattr(incident, key, value)
        
    db.commit()
    db.refresh(incident)
    
    # Broadcast to websocket
    await manager.broadcast({
        "event": "INCIDENT_UPDATED",
        "data": {
            "id": incident.id,
            "status": incident.status,
            "severity": incident.severity,
            "people_affected": incident.people_affected,
            "updated_at": incident.updated_at.isoformat()
        }
    })
    
    # Also broadcast resources since their status may have changed
    await manager.broadcast({
        "event": "RESOURCE_UPDATED",
        "data": {"type": "ALL"}
    })
    
    return incident
