from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

# ================= USER SCHEMAS =================
class UserBase(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    role: str = "Citizen"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    phone: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    phone: Optional[str] = None
    role: Optional[str] = None

# ================= INCIDENT SCHEMAS =================
class IncidentBase(BaseModel):
    incident_type: str  # Flood, Cyclone, Landslide, Fire, Other
    severity: str       # Critical, High, Medium, Low
    description: Optional[str] = None
    latitude: float
    longitude: float
    location: Optional[str] = None
    people_affected: int = 1
    source: str = "APP"  # APP, SMS, IVR, AUTHORITY

class IncidentCreate(IncidentBase):
    photo_url: Optional[str] = None

class IncidentUpdate(BaseModel):
    incident_type: Optional[str] = None
    severity: Optional[str] = None
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location: Optional[str] = None
    people_affected: Optional[int] = None
    status: Optional[str] = None

class IncidentResponse(IncidentBase):
    id: str
    photo_url: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ================= RESCUE TEAM SCHEMAS =================
class RescueTeamBase(BaseModel):
    name: str
    latitude: float
    longitude: float
    capacity: int
    personnel_count: int
    equipment: Optional[str] = None
    status: str = "AVAILABLE"  # AVAILABLE, ASSIGNED, EN_ROUTE, RESCUING, UNAVAILABLE

class RescueTeamCreate(RescueTeamBase):
    id: str

class RescueTeamResponse(RescueTeamBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ================= SHELTER SCHEMAS =================
class ShelterBase(BaseModel):
    name: str
    latitude: float
    longitude: float
    total_capacity: int
    occupied_capacity: int = 0
    status: str = "OPEN"
    facilities: str = ""

class ShelterCreate(ShelterBase):
    id: str

class ShelterResponse(ShelterBase):
    id: str

    class Config:
        from_attributes = True

# ================= SUPPLY DEPOT SCHEMAS =================
class SupplyDepotBase(BaseModel):
    name: str
    latitude: float
    longitude: float
    water_stock: int
    food_stock: int
    medical_stock: int
    status: str = "AVAILABLE"

class SupplyDepotCreate(SupplyDepotBase):
    id: str

class SupplyDepotResponse(SupplyDepotBase):
    id: str

    class Config:
        from_attributes = True

# ================= ALLOCATION SCHEMAS =================
class AllocationRecommendRequest(BaseModel):
    incident_id: str
    resource_type: str  # RESCUE_TEAM, SHELTER, SUPPLY_DEPOT

class AllocationRecommendResponse(BaseModel):
    incident_id: str
    recommended_resource_id: str
    resource_type: str
    name: str
    latitude: float
    longitude: float
    distance_km: float
    capacity: int
    occupied_or_stock: int
    status: str
    reason: str

class AllocationAssignRequest(BaseModel):
    incident_id: str
    resource_type: str  # RESCUE_TEAM, SHELTER, SUPPLY_DEPOT
    resource_id: str

# ================= ASSIGNMENT SCHEMAS =================
class AssignmentResponse(BaseModel):
    id: int
    incident_id: str
    resource_type: str
    resource_id: str
    assigned_by: Optional[int] = None
    distance: float
    status: str
    assigned_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ================= DISASTER ALERT SCHEMAS =================
class DisasterAlertBase(BaseModel):
    source: str = "IMD"
    alert_type: str
    severity: str
    description: str
    affected_area: str
    latitude: float
    longitude: float

class DisasterAlertCreate(DisasterAlertBase):
    pass

class DisasterAlertResponse(DisasterAlertBase):
    id: int
    issued_at: datetime
    expires_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ================= WEBHOOK MOCK SCHEMAS =================
class SMSWebhookInput(BaseModel):
    message: str
    from_phone: str

class IVRWebhookInput(BaseModel):
    from_phone: str
    disaster_type_key: str  # 1 for Flood, 2 for Cyclone, 3 for Landslide
    severity_key: str       # 1 for Critical, 2 for High, 3 for Medium
    people_affected: int
    locality: str

class AllResourcesResponse(BaseModel):
    rescue_teams: List[RescueTeamResponse]
    shelters: List[ShelterResponse]
    supply_depots: List[SupplyDepotResponse]

