import os
import sys

# Adjust path to find app module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app.models import Incident, RescueTeam
from app.services.allocation_engine import recommend_rescue_team, ResourceUnavailableException

def run_tests():
    print("Starting Allocation Engine Unit Tests...")
    db = SessionLocal()
    try:
        # Clear existing data to isolate the test
        db.query(Incident).delete()
        db.query(RescueTeam).delete()
        db.commit()

        # Create a mock incident for testing
        test_incident_1 = Incident(
            id="INC-TEST-01",
            incident_type="Flood",
            severity="Critical",
            description="Test Incident 1",
            latitude=20.2961,
            longitude=85.8245,
            people_affected=15,  # Needs a team with capacity >= 15
            source="APP",
            status="REPORTED"
        )
        db.add(test_incident_1)
        
        # Team A: Very close (0.5 km) but low capacity (10 pax)
        team_a = RescueTeam(
            id="TEAM-TEST-A",
            name="Close Low Capacity Team",
            latitude=20.298,
            longitude=85.826,
            capacity=10,  # Insufficient
            personnel_count=5,
            status="AVAILABLE"
        )
        
        # Team B: Further away (5.0 km) but high capacity (20 pax)
        team_b = RescueTeam(
            id="TEAM-TEST-B",
            name="Far High Capacity Team",
            latitude=20.34,
            longitude=85.84,
            capacity=20,  # Sufficient
            personnel_count=8,
            status="AVAILABLE"
        )
        
        # Team C: Extremely close (0.1 km) and available, but busy/assigned
        team_c = RescueTeam(
            id="TEAM-TEST-C",
            name="Close Busy Team",
            latitude=20.295,
            longitude=85.824,
            capacity=30,
            personnel_count=10,
            status="ASSIGNED"  # Unavailable
        )
        
        db.add_all([team_a, team_b, team_c])
        db.commit()
        
        # Test 1: Run recommendation
        print("Test 1: Running recommendation for INC-TEST-01 (needs capacity 15)...")
        rec = recommend_rescue_team(db, "INC-TEST-01")
        
        print(f"Recommended resource: {rec['recommended_resource_id']}")
        print(f"Distance: {rec['distance_km']} km")
        print(f"Reason: {rec['reason']}")
        
        # Verify that Team B was selected over Team A (insufficient capacity) and Team C (not AVAILABLE)
        assert rec["recommended_resource_id"] == "TEAM-TEST-B", "Failed: Selected incorrect team!"
        print("SUCCESS: Correctly selected high capacity team further away over closer low capacity/busy teams.")
        
        # Test 2: Check exception throwing when no team matches
        # Update Incident 1 to require 100 people (greater than max capacity 20)
        test_incident_1.people_affected = 100
        db.commit()
        
        print("\nTest 2: Requesting recommendation for extremely large incident (needs capacity 100)...")
        try:
            recommend_rescue_team(db, "INC-TEST-01")
            print("FAILED: Did not raise exception when no team was large enough!")
            sys.exit(1)
        except ResourceUnavailableException as e:
            print("SUCCESS: Correctly raised ResourceUnavailableException.")
            print(f"Exception message: {e}")
            print(f"Alternatives provided: {e.alternatives}")
            assert len(e.alternatives) > 0, "Failed: Did not supply alternatives"
            
        # Clean up test records
        db.delete(test_incident_1)
        db.delete(team_a)
        db.delete(team_b)
        db.delete(team_c)
        db.commit()
        
        # Re-seed the database
        print("\nRestoring database demo seed data...")
        from seed import seed_db
        seed_db()
        
        print("\nAll unit tests PASSED successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"\nUnit test failed with exception: {e}")
        # Re-seed just in case
        try:
            from seed import seed_db
            seed_db()
        except Exception:
            pass
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    run_tests()

