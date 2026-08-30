import os
import sys
from datetime import datetime, timedelta
import random

# Adjust path to find app module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app.models import User, Incident, RescueTeam, Shelter, SupplyDepot, DisasterAlert
from app.utils.security import hash_password

def seed_db(drop_existing=True):
    if drop_existing:
        print("Recreating database tables...")
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        if not drop_existing and db.query(User).count() > 0:
            print("Database already contains data, skipping auto-seed.")
            return
        print("Seeding Users...")
        # Password hashes
        users = [
            User(
                name="Admin Commander",
                phone="9999999999",
                email="admin@disaster.gov.in",
                password_hash=hash_password("adminpassword"),
                role="Authority"
            ),
            User(
                name="Alekha Citizen",
                phone="8888888888",
                email="alekha@gmail.com",
                password_hash=hash_password("password"),
                role="Citizen"
            ),
            User(
                name="Rescue Leader R1",
                phone="7777777777",
                email="rescue1@disaster.gov.in",
                password_hash=hash_password("password"),
                role="Rescue Team"
            ),
            User(
                name="Shelter Manager S1",
                phone="6666666666",
                email="shelter1@relief.org",
                password_hash=hash_password("password"),
                role="Resource Manager"
            )
        ]
        db.add_all(users)
        
        print("Seeding Rescue Teams...")
        teams = [
            RescueTeam(id="TEAM-R01", name="NDRF Team 1 (Heavy Rescue)", latitude=20.2842, longitude=85.8457, capacity=25, personnel_count=12, equipment="Boats, Inflatable Tents, Cutting Saws", status="AVAILABLE"),
            RescueTeam(id="TEAM-R02", name="ODRAF Coastal Rescue", latitude=20.3150, longitude=85.8020, capacity=15, personnel_count=8, equipment="Boats, Life Jackets, Ropes", status="AVAILABLE"),
            RescueTeam(id="TEAM-R03", name="Fire Service Rescue Unit", latitude=20.2720, longitude=85.8200, capacity=10, personnel_count=6, equipment="Water Pumps, Ladders, Medical Kits", status="AVAILABLE"),
            RescueTeam(id="TEAM-R04", name="Civil Defense Team Alpha", latitude=20.3540, longitude=85.8410, capacity=20, personnel_count=10, equipment="Boats, Communication Sets", status="AVAILABLE"),
            RescueTeam(id="TEAM-R05", name="Red Cross Volunteers Group A", latitude=20.2600, longitude=85.8600, capacity=12, personnel_count=5, equipment="First Aid Kits, Stretchers", status="AVAILABLE"),
            RescueTeam(id="TEAM-R06", name="NDRF Team 2 (Flood Specialists)", latitude=20.4600, longitude=85.8900, capacity=30, personnel_count=15, equipment="Speed Boats, Diving Gear", status="AVAILABLE"),
            RescueTeam(id="TEAM-R07", name="ODRAF Landslide Unit", latitude=20.2980, longitude=85.7700, capacity=8, personnel_count=6, equipment="Earth Movers, Digging Gears", status="AVAILABLE"),
            RescueTeam(id="TEAM-R08", name="Bhubaneswar Medical Rescue", latitude=20.3012, longitude=85.8188, capacity=6, personnel_count=4, equipment="Ambulance, Mobile Clinic Equipment", status="AVAILABLE"),
            RescueTeam(id="TEAM-R09", name="Rotary Disaster Relief Team", latitude=20.2450, longitude=85.7950, capacity=15, personnel_count=7, equipment="Food distribution kits, blankets", status="ASSIGNED"),
            RescueTeam(id="TEAM-R10", name="National Cadet Corps Relief", latitude=20.3340, longitude=85.8230, capacity=12, personnel_count=10, equipment="Communication rigs, tents", status="EN_ROUTE")
        ]
        db.add_all(teams)
        
        print("Seeding Shelters...")
        shelters = [
            Shelter(id="SHELTER-01", name="Rasulgarh Multi-Purpose Cyclone Shelter", latitude=20.2882, longitude=85.8647, total_capacity=250, occupied_capacity=45, status="OPEN", facilities="Food, Water, Medical, Toilets, Electricity"),
            Shelter(id="SHELTER-02", name="Patia DAV Public School Relief Hub", latitude=20.3533, longitude=85.8364, total_capacity=300, occupied_capacity=10, status="OPEN", facilities="Food, Water, Medical, Toilets"),
            Shelter(id="SHELTER-03", name="Nayapalli Community Hall", latitude=20.2961, longitude=85.8245, total_capacity=150, occupied_capacity=148, status="NEAR_CAPACITY", facilities="Water, Toilets, Electricity"),
            Shelter(id="SHELTER-04", name="Saheed Nagar Sports Complex", latitude=20.2866, longitude=85.8427, total_capacity=400, occupied_capacity=380, status="NEAR_CAPACITY", facilities="Food, Water, Medical, Toilets, Electricity"),
            Shelter(id="SHELTER-05", name="Khandagiri Shelter Home", latitude=20.2588, longitude=85.7865, total_capacity=180, occupied_capacity=180, status="FULL", facilities="Food, Water, Toilets"),
            Shelter(id="SHELTER-06", name="Cuttack Municipal School Camp", latitude=20.4625, longitude=85.8830, total_capacity=500, occupied_capacity=200, status="OPEN", facilities="Food, Water, Medical, Toilets, Electricity"),
            Shelter(id="SHELTER-07", name="Jayadev Vihar Relief Center", latitude=20.3015, longitude=85.8160, total_capacity=120, occupied_capacity=0, status="OPEN", facilities="Food, Water, Toilets"),
            Shelter(id="SHELTER-08", name="Acharya Vihar Primary School", latitude=20.2990, longitude=85.8310, total_capacity=100, occupied_capacity=8, status="OPEN", facilities="Water, Toilets"),
            Shelter(id="SHELTER-09", name="Old Town Community Center", latitude=20.2440, longitude=85.8280, total_capacity=200, occupied_capacity=50, status="OPEN", facilities="Food, Water, Medical, Toilets"),
            Shelter(id="SHELTER-10", name="Dumuduma Kalyan Mandap", latitude=20.2460, longitude=85.7720, total_capacity=150, occupied_capacity=25, status="OPEN", facilities="Water, Toilets, Electricity")
        ]
        db.add_all(shelters)
        
        print("Seeding Supply Depots...")
        depots = [
            SupplyDepot(id="DEPOT-01", name="Bhubaneswar Central Supply Reserve", latitude=20.2961, longitude=85.8245, water_stock=10000, food_stock=5000, medical_stock=1500, status="AVAILABLE"),
            SupplyDepot(id="DEPOT-02", name="Cuttack Ring Road Depot", latitude=20.4680, longitude=85.8750, water_stock=8000, food_stock=3500, medical_stock=800, status="AVAILABLE"),
            SupplyDepot(id="DEPOT-03", name="Puri Highway Relief Depot", latitude=19.8250, longitude=85.8390, water_stock=4000, food_stock=2000, medical_stock=400, status="AVAILABLE"),
            SupplyDepot(id="DEPOT-04", name="Khurda Junction Relief Depot", latitude=20.1780, longitude=85.6200, water_stock=500, food_stock=200, medical_stock=50, status="LOW_STOCK"),
            SupplyDepot(id="DEPOT-05", name="Balasore Coastal Supply Depot", latitude=21.4934, longitude=86.9337, water_stock=0, food_stock=0, medical_stock=0, status="OUT_OF_STOCK")
        ]
        db.add_all(depots)
        
        print("Seeding Incidents...")
        incidents = [
            Incident(id="INC-1001", incident_type="Flood", severity="Critical", description="Mahanadi flood water has entered low-lying residential houses. 15 people trapped on the first floor.", latitude=20.4580, longitude=85.8710, location="Cuttack CDA Sector 10", people_affected=15, source="APP", status="REPORTED"),
            Incident(id="INC-1002", incident_type="Cyclone", severity="High", description="High-speed winds have uprooted trees and damaged power lines. Inhabitants are stuck inside houses.", latitude=20.2995, longitude=85.8502, location="Saheed Nagar near Park", people_affected=8, source="APP", status="VERIFIED"),
            Incident(id="INC-1003", incident_type="Landslide", severity="High", description="Debris has blocked the arterial highway. Minor landslide near hill caves has trapped 4 tourists.", latitude=20.2590, longitude=85.7890, location="Khandagiri Hilly Track", people_affected=4, source="APP", status="AWAITING_ALLOCATION"),
            Incident(id="INC-1004", incident_type="Flood", severity="Critical", description="Submergence of local slums due to heavy storm water discharge. Elderly and kids trapped.", latitude=20.2820, longitude=85.8610, location="Rasulgarh Canal Basti", people_affected=22, source="SMS", status="REPORTED"),
            Incident(id="INC-1005", incident_type="Fire", severity="Critical", description="Commercial complex caught fire due to a transformer short-circuit. 30 people evacuated, some still inside.", latitude=20.3018, longitude=85.8175, location="Jayadev Vihar Market Complex", people_affected=30, source="APP", status="RESOURCE_ASSIGNED"),
            Incident(id="INC-1006", incident_type="Flood", severity="Medium", description="Water level has risen up to 2 feet in local streets. Sewage drains overflowing. Commuting blocked.", latitude=20.3520, longitude=85.8290, location="Patia Kiit Square", people_affected=30, source="IVR", status="REPORTED"),
            Incident(id="INC-1007", incident_type="Other", severity="Low", description="Uprooted electric pole blocking the main street entrance. No injuries reported.", latitude=20.2910, longitude=85.8190, location="Nayapalli VIP Area", people_affected=0, source="SMS", status="REPORTED"),
            Incident(id="INC-1008", incident_type="Landslide", severity="Medium", description="Boulders fell on the highway blocking traffic lanes. Authorities need to clear with heavy loader.", latitude=20.2310, longitude=85.7480, location="Janghara Foothills", people_affected=2, source="AUTHORITY", status="RESOLVED"),
            Incident(id="INC-1009", incident_type="Flood", severity="High", description="Water levels entering ground floor apartments. Power shut down. Drinking water needed immediately.", latitude=20.2790, longitude=85.8390, location="Bomikhal Flat Complex", people_affected=12, source="APP", status="VERIFIED"),
            Incident(id="INC-1010", incident_type="Cyclone", severity="Critical", description="Tin roofs blown off. Old mud structures collapsed trapping at least 6 people in rubble.", latitude=20.3340, longitude=85.8650, location="Mancheswar Industrial Area", people_affected=6, source="IVR", status="REPORTED"),
            Incident(id="INC-1011", incident_type="Flood", severity="Medium", description="Local pond overflowed. Water has logged school premises. Children shifted safely, but classrooms submerged.", latitude=20.2480, longitude=85.8010, location="Old Town Primary School", people_affected=5, source="APP", status="RESOLVED"),
            Incident(id="INC-1012", incident_type="Fire", severity="High", description="Dry grass and leaves fire spreading near residential boundary wall. Fire Brigade requested.", latitude=20.2612, longitude=85.7821, location="Khandagiri Vihar Corner", people_affected=0, source="APP", status="RESOURCE_ASSIGNED"),
            # Additional incidents to total 20+
            Incident(id="INC-1013", incident_type="Flood", severity="Low", description="Water logging in the residential layout block B.", latitude=20.3200, longitude=85.8450, location="Infocity Residency", people_affected=1, source="APP", status="REPORTED"),
            Incident(id="INC-1014", incident_type="Flood", severity="High", description="Severe water logging, basement flooded. 10 residents stuck.", latitude=20.3450, longitude=85.8120, location="Patia Station Road", people_affected=10, source="SMS", status="REPORTED"),
            Incident(id="INC-1015", incident_type="Cyclone", severity="Medium", description="Uprooted billboard blocking the side road.", latitude=20.2850, longitude=85.8200, location="Vani Vihar Square", people_affected=0, source="APP", status="REPORTED"),
            Incident(id="INC-1016", incident_type="Other", severity="Low", description="Stranded cattle in high water zones. NGO assistance required.", latitude=20.4480, longitude=85.8850, location="Mahanadi river banks", people_affected=0, source="AUTHORITY", status="VERIFIED"),
            Incident(id="INC-1017", incident_type="Fire", severity="Low", description="Small garbage fire behind grocery store.", latitude=20.2980, longitude=85.8350, location="Acharya Vihar Lane 4", people_affected=0, source="APP", status="RESOLVED"),
            Incident(id="INC-1018", incident_type="Landslide", severity="High", description="Small hillock mud slide blocking village connecting road.", latitude=20.1980, longitude=85.6980, location="Chandaka Forest Outskirts", people_affected=3, source="SMS", status="REPORTED"),
            Incident(id="INC-1019", incident_type="Flood", severity="Critical", description="Village completely cut off. 50 families needing food packets.", latitude=20.5100, longitude=85.9200, location="Birupa river bank hamlet", people_affected=50, source="AUTHORITY", status="REPORTED"),
            Incident(id="INC-1020", incident_type="Cyclone", severity="High", description="Asbestos roof of community center damaged. 25 refugees need shelter shifting.", latitude=19.8250, longitude=85.8210, location="Puri Town Ward 3", people_affected=25, source="APP", status="REPORTED"),
            Incident(id="INC-1021", incident_type="Flood", severity="Medium", description="Water entering medical clinic. Reagents and drugs need retrieval.", latitude=20.4710, longitude=85.8620, location="Cuttack Mangalabag", people_affected=4, source="IVR", status="REPORTED"),
            Incident(id="INC-1022", incident_type="Other", severity="Medium", description="Heavy waterlogging causing open drain hazards.", latitude=20.2912, longitude=85.8015, location="Unit 8 Area", people_affected=0, source="APP", status="REPORTED")
        ]
        db.add_all(incidents)
        
        print("Seeding Disaster Alerts...")
        alerts = [
            DisasterAlert(
                source="IMD",
                alert_type="Cyclone",
                severity="High",
                description="Deep depression over Bay of Bengal has intensified into Cyclone 'Asani'. Expected landfall near Odisha coast within 24 hours. Winds up to 110 km/h and heavy rainfall expected.",
                affected_area="Odisha Coastal Region (Puri, Jagatsinghpur, Balasore)",
                latitude=19.8135,
                longitude=85.8312,
                issued_at=datetime.utcnow() - timedelta(hours=2),
                expires_at=datetime.utcnow() + timedelta(days=2)
            ),
            DisasterAlert(
                source="IMD",
                alert_type="Flood",
                severity="Critical",
                description="Mahanadi river water level has breached danger marks at Naraj. High volumes of water being released from Hirakud Dam. Low lying villages and Cuttack city sectors warned of immediate flood risk.",
                affected_area="Mahanadi Basin (Cuttack, Kendrapada, Khurda)",
                latitude=20.4625,
                longitude=85.8830,
                issued_at=datetime.utcnow() - timedelta(minutes=45),
                expires_at=datetime.utcnow() + timedelta(days=1)
            ),
            DisasterAlert(
                source="IMD",
                alert_type="Landslide",
                severity="Medium",
                description="Continuous heavy rainfall has triggered minor landslides in Gajapati and Rayagada hilly regions. Transport routes blocked. Citizens advised to avoid hill slope roads.",
                affected_area="Gajapati Hilly Region",
                latitude=18.8124,
                longitude=84.1482,
                issued_at=datetime.utcnow() - timedelta(hours=4),
                expires_at=datetime.utcnow() + timedelta(hours=12)
            )
        ]
        db.add_all(alerts)
        
        db.commit()
        print("Database seeded successfully with all mock entities!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
