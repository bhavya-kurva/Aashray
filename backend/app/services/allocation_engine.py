from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Incident, RescueTeam, Shelter, SupplyDepot
from app.database import haversine_distance_sql, is_sqlite

class ResourceUnavailableException(Exception):
    def __init__(self, message: str, alternatives: list = None):
        super().__init__(message)
        self.alternatives = alternatives or []

def recommend_rescue_team(db: Session, incident_id: str) -> dict:
    """
    Recommends the best rescue team for a given incident.
    Algorithm:
    1. Filter rescue teams with status = 'AVAILABLE'.
    2. Check capacity suitability (capacity >= incident.people_affected).
    3. Calculate Haversine distance.
    4. Rank by distance.
    5. Return nearest suitable team within 20 km. If none, throw custom exception with alternatives.
    """
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise ValueError("Incident not found")
        
    people = incident.people_affected
    
    # Query all available rescue teams
    teams = db.query(RescueTeam).filter(RescueTeam.status == "AVAILABLE").all()
    
    suitable_teams = []
    insufficient_capacity_teams = []
    
    for team in teams:
        # Distance calculation
        dist = haversine_distance_sql(incident.latitude, incident.longitude, team.latitude, team.longitude)
        
        # Check capacity
        if team.capacity >= people:
            suitable_teams.append((team, dist))
        else:
            insufficient_capacity_teams.append((team, dist))
            
    # Filter by distance <= 20 km and sort by distance
    suitable_in_range = [(t, d) for t, d in suitable_teams if d <= 20.0]
    suitable_in_range.sort(key=lambda x: x[1])
    
    if suitable_in_range:
        best_team, best_dist = suitable_in_range[0]
        return {
            "incident_id": incident_id,
            "recommended_resource_id": best_team.id,
            "resource_type": "RESCUE_TEAM",
            "name": best_team.name,
            "latitude": best_team.latitude,
            "longitude": best_team.longitude,
            "distance_km": round(best_dist, 2),
            "capacity": best_team.capacity,
            "occupied_or_stock": best_team.personnel_count,
            "status": best_team.status,
            "reason": f"Nearest available team ({round(best_dist, 1)} km away) with sufficient capacity ({best_team.capacity} pax)."
        }
        
    # No suitable team in range. Prepare alternatives (closest teams, even if lower capacity or further away)
    all_teams_with_dist = []
    for team in teams:
        dist = haversine_distance_sql(incident.latitude, incident.longitude, team.latitude, team.longitude)
        all_teams_with_dist.append({
            "id": team.id,
            "name": team.name,
            "distance_km": round(dist, 2),
            "capacity": team.capacity,
            "status": team.status
        })
    all_teams_with_dist.sort(key=lambda x: x["distance_km"])
    
    raise ResourceUnavailableException(
        message=f"No available rescue team with sufficient capacity ({people}) was found within 20 km.",
        alternatives=all_teams_with_dist[:3]  # Return top 3 closest available teams
    )

def recommend_shelter(db: Session, incident_id: str) -> dict:
    """
    Recommends the best shelter for rescued citizens of an incident.
    Algorithm:
    1. Filter shelters with status = 'OPEN'.
    2. Check available capacity (total_capacity - occupied_capacity >= incident.people_affected).
    3. Rank by distance.
    4. Return closest.
    """
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise ValueError("Incident not found")
        
    people = incident.people_affected
    shelters = db.query(Shelter).filter(Shelter.status == "OPEN").all()
    
    suitable_shelters = []
    for shelter in shelters:
        avail_capacity = shelter.total_capacity - shelter.occupied_capacity
        if avail_capacity >= people:
            dist = haversine_distance_sql(incident.latitude, incident.longitude, shelter.latitude, shelter.longitude)
            suitable_shelters.append((shelter, dist))
            
    suitable_shelters.sort(key=lambda x: x[1])
    
    if suitable_shelters:
        best_shelter, best_dist = suitable_shelters[0]
        return {
            "incident_id": incident_id,
            "recommended_resource_id": best_shelter.id,
            "resource_type": "SHELTER",
            "name": best_shelter.name,
            "latitude": best_shelter.latitude,
            "longitude": best_shelter.longitude,
            "distance_km": round(best_dist, 2),
            "capacity": best_shelter.total_capacity,
            "occupied_or_stock": best_shelter.occupied_capacity,
            "status": best_shelter.status,
            "reason": f"Sufficient capacity ({best_shelter.total_capacity - best_shelter.occupied_capacity} available) and closest suitable shelter ({round(best_dist, 1)} km)."
        }
        
    # Fallback/Alternatives
    all_shelters = []
    for s in db.query(Shelter).all():
        dist = haversine_distance_sql(incident.latitude, incident.longitude, s.latitude, s.longitude)
        all_shelters.append({
            "id": s.id,
            "name": s.name,
            "distance_km": round(dist, 2),
            "available_capacity": s.total_capacity - s.occupied_capacity,
            "status": s.status
        })
    all_shelters.sort(key=lambda x: x["distance_km"])
    
    raise ResourceUnavailableException(
        message=f"No open shelter with sufficient available capacity ({people}) was found.",
        alternatives=all_shelters[:3]
    )

def recommend_supply_depot(db: Session, incident_id: str, supply_type: str) -> dict:
    """
    Recommends the best supply depot for relief materials.
    supply_type: 'water', 'food', or 'medical'
    """
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise ValueError("Incident not found")
        
    depots = db.query(SupplyDepot).filter(SupplyDepot.status != "OUT_OF_STOCK").all()
    
    suitable_depots = []
    for depot in depots:
        stock = 0
        if supply_type.lower() == "water":
            stock = depot.water_stock
        elif supply_type.lower() == "food":
            stock = depot.food_stock
        elif supply_type.lower() == "medical":
            stock = depot.medical_stock
            
        if stock > 0:
            dist = haversine_distance_sql(incident.latitude, incident.longitude, depot.latitude, depot.longitude)
            suitable_depots.append((depot, dist, stock))
            
    suitable_depots.sort(key=lambda x: x[1])
    
    if suitable_depots:
        best_depot, best_dist, best_stock = suitable_depots[0]
        return {
            "incident_id": incident_id,
            "recommended_resource_id": best_depot.id,
            "resource_type": "SUPPLY_DEPOT",
            "name": best_depot.name,
            "latitude": best_depot.latitude,
            "longitude": best_depot.longitude,
            "distance_km": round(best_dist, 2),
            "capacity": best_stock,  # representing stock level
            "occupied_or_stock": best_stock,
            "status": best_depot.status,
            "reason": f"Closest supply depot ({round(best_dist, 1)} km) with available {supply_type} stock ({best_stock} units)."
        }
        
    raise ResourceUnavailableException(
        message=f"No supply depot with available {supply_type} stock was found."
    )
