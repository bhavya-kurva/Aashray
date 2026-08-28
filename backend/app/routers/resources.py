from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import RescueTeam, Shelter, SupplyDepot
from app.schemas import (
    RescueTeamResponse, RescueTeamCreate,
    ShelterResponse, ShelterCreate,
    SupplyDepotResponse, SupplyDepotCreate,
    AllResourcesResponse
)
from app.websocket.manager import manager

router = APIRouter(tags=["Resources"])

# ================= UNIFIED API =================
@router.get("/resources", response_model=AllResourcesResponse)
def get_all_resources(db: Session = Depends(get_db)):
    """Returns a dictionary containing all resources for easy initial loading."""
    teams = db.query(RescueTeam).all()
    shelters = db.query(Shelter).all()
    depots = db.query(SupplyDepot).all()
    return {
        "rescue_teams": teams,
        "shelters": shelters,
        "supply_depots": depots
    }


# ================= RESCUE TEAMS =================
@router.get("/rescue-teams", response_model=List[RescueTeamResponse])
def get_rescue_teams(db: Session = Depends(get_db)):
    return db.query(RescueTeam).all()

@router.post("/rescue-teams", response_model=RescueTeamResponse, status_code=status.HTTP_201_CREATED)
def create_rescue_team(payload: RescueTeamCreate, db: Session = Depends(get_db)):
    # Check duplicate
    exists = db.query(RescueTeam).filter(RescueTeam.id == payload.id).first()
    if exists:
        raise HTTPException(status_code=400, detail="Rescue team ID already exists")
    team = RescueTeam(**payload.model_dump())
    db.add(team)
    db.commit()
    db.refresh(team)
    
    # Broadcast to websocket
    manager.active_connections and db.commit() # Trigger update check
    return team

@router.patch("/rescue-teams/{team_id}/status", response_model=RescueTeamResponse)
async def update_rescue_team_status(team_id: str, payload: Dict[str, str], db: Session = Depends(get_db)):
    team = db.query(RescueTeam).filter(RescueTeam.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Rescue team not found")
        
    status_val = payload.get("status")
    if not status_val:
        raise HTTPException(status_code=400, detail="Missing status parameter")
        
    team.status = status_val
    team.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(team)
    
    # Broadcast update
    await manager.broadcast({
        "event": "RESOURCE_UPDATED",
        "data": {
            "type": "RESCUE_TEAM",
            "id": team.id,
            "status": team.status,
            "latitude": team.latitude,
            "longitude": team.longitude
        }
    })
    
    return team

# ================= SHELTERS =================
@router.get("/shelters", response_model=List[ShelterResponse])
def get_shelters(db: Session = Depends(get_db)):
    return db.query(Shelter).all()

@router.post("/shelters", response_model=ShelterResponse, status_code=status.HTTP_201_CREATED)
def create_shelter(payload: ShelterCreate, db: Session = Depends(get_db)):
    exists = db.query(Shelter).filter(Shelter.id == payload.id).first()
    if exists:
        raise HTTPException(status_code=400, detail="Shelter ID already exists")
    shelter = Shelter(**payload.model_dump())
    db.add(shelter)
    db.commit()
    db.refresh(shelter)
    return shelter

@router.patch("/shelters/{shelter_id}", response_model=ShelterResponse)
async def update_shelter(shelter_id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    shelter = db.query(Shelter).filter(Shelter.id == shelter_id).first()
    if not shelter:
        raise HTTPException(status_code=404, detail="Shelter not found")
        
    for key, val in payload.items():
        if hasattr(shelter, key):
            setattr(shelter, key, val)
            
    # Auto recalculate status based on occupancy
    if shelter.occupied_capacity >= shelter.total_capacity:
        shelter.status = "FULL"
    elif shelter.occupied_capacity >= shelter.total_capacity * 0.9:
        shelter.status = "NEAR_CAPACITY"
    else:
        shelter.status = "OPEN"
        
    db.commit()
    db.refresh(shelter)
    
    # Broadcast update
    await manager.broadcast({
        "event": "RESOURCE_UPDATED",
        "data": {
            "type": "SHELTER",
            "id": shelter.id,
            "occupied_capacity": shelter.occupied_capacity,
            "status": shelter.status
        }
    })
    
    return shelter

# ================= SUPPLY DEPOTS =================
@router.get("/supply-depots", response_model=List[SupplyDepotResponse])
def get_supply_depots(db: Session = Depends(get_db)):
    return db.query(SupplyDepot).all()

@router.post("/supply-depots", response_model=SupplyDepotResponse, status_code=status.HTTP_201_CREATED)
def create_supply_depot(payload: SupplyDepotCreate, db: Session = Depends(get_db)):
    exists = db.query(SupplyDepot).filter(SupplyDepot.id == payload.id).first()
    if exists:
        raise HTTPException(status_code=400, detail="Supply Depot ID already exists")
    depot = SupplyDepot(**payload.model_dump())
    db.add(depot)
    db.commit()
    db.refresh(depot)
    return depot

@router.patch("/supply-depots/{depot_id}", response_model=SupplyDepotResponse)
async def update_supply_depot(depot_id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    depot = db.query(SupplyDepot).filter(SupplyDepot.id == depot_id).first()
    if not depot:
        raise HTTPException(status_code=404, detail="Supply Depot not found")
        
    for key, val in payload.items():
        if hasattr(depot, key):
            setattr(depot, key, val)
            
    # Auto status based on stock
    total_stock = depot.water_stock + depot.food_stock + depot.medical_stock
    if total_stock == 0:
        depot.status = "OUT_OF_STOCK"
    elif depot.water_stock < 100 or depot.food_stock < 50 or depot.medical_stock < 10:
        depot.status = "LOW_STOCK"
    else:
        depot.status = "AVAILABLE"
        
    db.commit()
    db.refresh(depot)
    
    # Broadcast update
    await manager.broadcast({
        "event": "RESOURCE_UPDATED",
        "data": {
            "type": "SUPPLY_DEPOT",
            "id": depot.id,
            "water_stock": depot.water_stock,
            "food_stock": depot.food_stock,
            "medical_stock": depot.medical_stock,
            "status": depot.status
        }
    })
    
    return depot
