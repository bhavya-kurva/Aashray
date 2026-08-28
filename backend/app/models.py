from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="Citizen", nullable=False)  # Citizen, Authority, Rescue Team, Resource Manager
    created_at = Column(DateTime, default=datetime.utcnow)

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, index=True)  # INC-1024
    incident_type = Column(String, nullable=False)  # Flood, Cyclone, Landslide, Fire, Other
    severity = Column(String, nullable=False)  # Critical, High, Medium, Low
    description = Column(Text, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location = Column(String, nullable=True)  # Name of locality/landmark
    photo_url = Column(String, nullable=True)
    people_affected = Column(Integer, default=0)
    source = Column(String, default="APP", nullable=False)  # APP, SMS, IVR, AUTHORITY
    status = Column(String, default="REPORTED", nullable=False)
    # REPORTED, VERIFIED, AWAITING_ALLOCATION, RESOURCE_ASSIGNED, RESCUE_IN_PROGRESS, RESOLVED, REJECTED, DUPLICATE
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    assignments = relationship("Assignment", back_populates="incident")

class RescueTeam(Base):
    __tablename__ = "rescue_teams"

    id = Column(String, primary_key=True, index=True)  # TEAM-R12
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    capacity = Column(Integer, default=10, nullable=False)  # Maximum people they can rescue in one trip
    personnel_count = Column(Integer, default=5, nullable=False)
    equipment = Column(String, nullable=True)  # Comma-separated or JSON
    status = Column(String, default="AVAILABLE", nullable=False)  # AVAILABLE, ASSIGNED, EN_ROUTE, RESCUING, UNAVAILABLE
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Shelter(Base):
    __tablename__ = "shelters"

    id = Column(String, primary_key=True, index=True)  # SHELTER-01
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    total_capacity = Column(Integer, default=100, nullable=False)
    occupied_capacity = Column(Integer, default=0, nullable=False)
    status = Column(String, default="OPEN", nullable=False)  # OPEN, NEAR_CAPACITY, FULL
    facilities = Column(String, default="", nullable=False)  # Comma-separated (Food, Water, Medical, Toilets, Electricity)

class SupplyDepot(Base):
    __tablename__ = "supply_depots"

    id = Column(String, primary_key=True, index=True)  # DEPOT-01
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    water_stock = Column(Integer, default=1000, nullable=False)  # in Litres
    food_stock = Column(Integer, default=500, nullable=False)    # in Rations
    medical_stock = Column(Integer, default=100, nullable=False)  # in Kits
    status = Column(String, default="AVAILABLE", nullable=False)  # AVAILABLE, LOW_STOCK, OUT_OF_STOCK

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False)
    resource_type = Column(String, nullable=False)  # RESCUE_TEAM, SHELTER, SUPPLY_DEPOT
    resource_id = Column(String, nullable=False)    # ID of the team, shelter or depot
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    distance = Column(Float, nullable=False)  # Distance in km
    status = Column(String, default="ACTIVE", nullable=False)  # ACTIVE, COMPLETED, CANCELLED
    assigned_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    incident = relationship("Incident", back_populates="assignments")

class DisasterAlert(Base):
    __tablename__ = "disaster_alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    source = Column(String, default="IMD", nullable=False)  # IMD, AUTHORITY
    alert_type = Column(String, nullable=False)  # Cyclone, Flood, Heavy Rainfall, Landslide, Other
    severity = Column(String, nullable=False)  # Critical, High, Medium, Low
    description = Column(Text, nullable=False)
    affected_area = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    issued_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
