from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db, haversine_distance_sql
from app.models import Assignment, Incident, RescueTeam, Shelter, SupplyDepot
from app.schemas import (
    AllocationRecommendRequest, AllocationRecommendResponse,
    AllocationAssignRequest, AssignmentResponse
)
from app.services.allocation_engine import (
    recommend_rescue_team, recommend_shelter, recommend_supply_depot,
    ResourceUnavailableException
)
from app.websocket.manager import manager

router = APIRouter(prefix="/allocation", tags=["Allocation & Assignments"])

@router.post("/recommend")
def get_recommendation(
    payload: AllocationRecommendRequest, 
    supply_type: str = "water", # default if resource_type is SUPPLY_DEPOT
    db: Session = Depends(get_db)
):
    """
    Finds and recommends the best resource (Team, Shelter, Depot) for an incident.
    Returns 200 with details, or custom structure if no resources match criteria.
    """
    try:
        if payload.resource_type == "RESCUE_TEAM":
            res = recommend_rescue_team(db, payload.incident_id)
            return res
        elif payload.resource_type == "SHELTER":
            res = recommend_shelter(db, payload.incident_id)
            return res
        elif payload.resource_type == "SUPPLY_DEPOT":
            res = recommend_supply_depot(db, payload.incident_id, supply_type)
            return res
        else:
            raise HTTPException(status_code=400, detail="Invalid resource type")
            
    except ResourceUnavailableException as e:
        return {
            "error": "NO_SUITABLE_RESOURCE_AVAILABLE",
            "message": str(e),
            "alternatives": e.alternatives
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal algorithm error: {str(e)}")

@router.post("/assign", response_model=AssignmentResponse)
async def create_assignment(
    payload: AllocationAssignRequest,
    db: Session = Depends(get_db)
):
    """
    Commits an allocation recommendation, linking the incident with the resource.
    Updates statuses and broadcasts WebSockets.
    """
    incident = db.query(Incident).filter(Incident.id == payload.incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    distance = 0.0
    res_name = ""
    
    # Process by Resource Type
    if payload.resource_type == "RESCUE_TEAM":
        team = db.query(RescueTeam).filter(RescueTeam.id == payload.resource_id).first()
        if not team:
            raise HTTPException(status_code=404, detail="Rescue team not found")
            
        distance = haversine_distance_sql(incident.latitude, incident.longitude, team.latitude, team.longitude)
        res_name = team.name
        
        # Update Team Status
        team.status = "ASSIGNED"
        team.updated_at = datetime.utcnow()
        
        # Update Incident Status
        incident.status = "RESOURCE_ASSIGNED"
        incident.updated_at = datetime.utcnow()
        
    elif payload.resource_type == "SHELTER":
        shelter = db.query(Shelter).filter(Shelter.id == payload.resource_id).first()
        if not shelter:
            raise HTTPException(status_code=404, detail="Shelter not found")
            
        distance = haversine_distance_sql(incident.latitude, incident.longitude, shelter.latitude, shelter.longitude)
        res_name = shelter.name
        
        # Add occupants
        shelter.occupied_capacity += incident.people_affected
        if shelter.occupied_capacity >= shelter.total_capacity:
            shelter.status = "FULL"
        elif shelter.occupied_capacity >= shelter.total_capacity * 0.9:
            shelter.status = "NEAR_CAPACITY"
            
    elif payload.resource_type == "SUPPLY_DEPOT":
        depot = db.query(SupplyDepot).filter(SupplyDepot.id == payload.resource_id).first()
        if not depot:
            raise HTTPException(status_code=404, detail="Supply Depot not found")
            
        distance = haversine_distance_sql(incident.latitude, incident.longitude, depot.latitude, depot.longitude)
        res_name = depot.name
        
        # Deduct some stock as a dummy relief allocation (e.g. 50 items or people_affected * 2)
        qty = max(10, incident.people_affected * 2)
        depot.water_stock = max(0, depot.water_stock - qty)
        depot.food_stock = max(0, depot.food_stock - qty)
        depot.medical_stock = max(0, depot.medical_stock - (qty // 5))
        
        # Recalculate status
        total_stock = depot.water_stock + depot.food_stock + depot.medical_stock
        if total_stock == 0:
            depot.status = "OUT_OF_STOCK"
        elif depot.water_stock < 100 or depot.food_stock < 50:
            depot.status = "LOW_STOCK"
            
    else:
        raise HTTPException(status_code=400, detail="Invalid resource type")
        
    # Create Assignment Record
    assignment = Assignment(
        incident_id=payload.incident_id,
        resource_type=payload.resource_type,
        resource_id=payload.resource_id,
        distance=distance,
        status="ACTIVE"
    )
    
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    
    # Broadcast live updates to dashboards
    await manager.broadcast({
        "event": "RESOURCE_ASSIGNED",
        "data": {
            "assignment_id": assignment.id,
            "incident_id": assignment.incident_id,
            "resource_type": assignment.resource_type,
            "resource_id": assignment.resource_id,
            "resource_name": res_name,
            "distance": round(assignment.distance, 2),
            "status": assignment.status,
            "incident_latitude": incident.latitude,
            "incident_longitude": incident.longitude,
            # coordinates are needed to draw map connection lines
            "resource_latitude": team.latitude if payload.resource_type == "RESCUE_TEAM" else (shelter.latitude if payload.resource_type == "SHELTER" else depot.latitude),
            "resource_longitude": team.longitude if payload.resource_type == "RESCUE_TEAM" else (shelter.longitude if payload.resource_type == "SHELTER" else depot.longitude)
        }
    })
    
    # Broadcast status updates
    await manager.broadcast({
        "event": "INCIDENT_UPDATED",
        "data": {
            "id": incident.id,
            "status": incident.status
        }
    })
    
    await manager.broadcast({
        "event": "RESOURCE_UPDATED",
        "data": {"type": "ALL"}
    })
    
    return assignment

@router.get("/assignments", response_model=list[AssignmentResponse])
def get_assignments(db: Session = Depends(get_db)):
    return db.query(Assignment).order_by(Assignment.assigned_at.desc()).all()
