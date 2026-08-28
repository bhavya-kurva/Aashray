import math
from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

DATABASE_URL = settings.DATABASE_URL
is_sqlite = DATABASE_URL.startswith("sqlite")

# Helper for Haversine distance in python (registered to SQLite)
def haversine_distance_sql(lat1, lon1, lat2, lon2):
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 0.0
    try:
        lat1, lon1, lat2, lon2 = float(lat1), float(lon1), float(lat2), float(lon2)
        R = 6371.0  # Earth radius in km
        d_lat = math.radians(lat2 - lat1)
        d_lon = math.radians(lon2 - lon1)
        a = (math.sin(d_lat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c
    except Exception:
        return 0.0

# Configure Engine and absolute path resolution for SQLite
if is_sqlite:
    import os
    db_file = DATABASE_URL.replace("sqlite:///", "")
    if not os.path.isabs(db_file):
        # Resolve to backend root directory (parent of app/)
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        db_file = os.path.abspath(os.path.join(backend_dir, db_file))
        DATABASE_URL = f"sqlite:///{db_file}"
        
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )

    # Register the haversine function inside sqlite connection
    @event.listens_for(engine, "connect")
    def register_haversine(dbapi_connection, connection_record):
        try:
            dbapi_connection.create_function("haversine_distance", 4, haversine_distance_sql)
        except Exception:
            pass
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
