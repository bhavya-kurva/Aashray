from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import random

from app.database import get_db
from app.models import Incident
from app.schemas import SMSWebhookInput, IVRWebhookInput, IncidentResponse
from app.services.sms_service import parse_sms_message, MOCK_LOCATIONS
from app.routers.incidents import generate_incident_id, check_for_duplicate
from app.websocket.manager import manager

router = APIRouter(tags=["Webhooks"])

@router.post("/sms/webhook")
async def receive_sms_webhook(payload: SMSWebhookInput, db: Session = Depends(get_db)):
    """
    Webhook received from SMS gateway.
    Parses the message, creates an incident and returns an SMS reply structure.
    """
    # 1. Parse text message
    parsed_data = parse_sms_message(payload.message)
    
    # 2. Assign unique ID & check duplicates
    incident_id = generate_incident_id(db)
    is_dup = check_for_duplicate(db, parsed_data["incident_type"], parsed_data["latitude"], parsed_data["longitude"])
    initial_status = "DUPLICATE" if is_dup else "REPORTED"
    
    # 3. Create incident record
    incident = Incident(
        id=incident_id,
        incident_type=parsed_data["incident_type"],
        severity=parsed_data["severity"],
        description=parsed_data["description"] + f" (From: {payload.from_phone})",
        latitude=parsed_data["latitude"],
        longitude=parsed_data["longitude"],
        location=parsed_data["location"],
        people_affected=parsed_data["people_affected"],
        source="SMS",
        status=initial_status
    )
    
    db.add(incident)
    db.commit()
    db.refresh(incident)
    
    # 4. Broadcast live update
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
            "people_affected": incident.people_affected,
            "source": incident.source,
            "status": incident.status,
            "created_at": incident.created_at.isoformat()
        }
    })
    
    # 5. Return SMS response
    return {
        "reply": f"Emergency report received. Incident ID: {incident.id}. Severity: {incident.severity}. Authorities have been notified.",
        "incident_id": incident.id
    }

@router.post("/ivr/webhook")
async def receive_ivr_webhook(payload: IVRWebhookInput, db: Session = Depends(get_db)):
    """
    Webhook received from IVR service.
    Maps IVR options to DB types, creates an incident and returns confirmation.
    """
    # Map IVR disaster keys
    type_map = {
        "1": "Flood",
        "2": "Cyclone",
        "3": "Landslide",
        "4": "Fire"
    }
    disaster_type = type_map.get(payload.disaster_type_key, "Other")
    
    # Map IVR severity keys
    severity_map = {
        "1": "Critical",
        "2": "High",
        "3": "Medium",
        "4": "Low"
    }
    severity = severity_map.get(payload.severity_key, "Medium")
    
    # Find Coordinates
    loc_clean = payload.locality.strip().upper()
    latitude, longitude = 20.2961, 85.8245  # Default central
    resolved_location = payload.locality
    
    found_loc = False
    for loc_key, coords in MOCK_LOCATIONS.items():
        if loc_key in loc_clean:
            latitude, longitude = coords
            resolved_location = loc_key.capitalize()
            found_loc = True
            break
            
    if not found_loc:
        # Give random offset from central regional area
        latitude = 20.2961 + random.uniform(-0.04, 0.04)
        longitude = 85.8245 + random.uniform(-0.04, 0.04)
        resolved_location = payload.locality or "Reported locality via IVR"
        
    incident_id = generate_incident_id(db)
    is_dup = check_for_duplicate(db, disaster_type, latitude, longitude)
    initial_status = "DUPLICATE" if is_dup else "REPORTED"
    
    # Save incident
    incident = Incident(
        id=incident_id,
        incident_type=disaster_type,
        severity=severity,
        description=f"IVR phone call reporting. (From: {payload.from_phone})",
        latitude=round(latitude, 5),
        longitude=round(longitude, 5),
        location=resolved_location,
        people_affected=payload.people_affected,
        source="IVR",
        status=initial_status
    )
    
    db.add(incident)
    db.commit()
    db.refresh(incident)
    
    # Broadcast live update
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
            "people_affected": incident.people_affected,
            "source": incident.source,
            "status": incident.status,
            "created_at": incident.created_at.isoformat()
        }
    })
    
    return {
        "status": "success",
        "message": "Incident successfully created via IVR call",
        "incident_id": incident.id
    }
