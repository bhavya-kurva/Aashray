# Real-Time Disaster Management & Resource Coordination Platform

A full-stack, production-ready prototype for a **Real-Time Disaster Management and Resource Coordination Platform**. It enables seamless coordination and communication between citizens, emergency response groups, and relief coordinators during floods, cyclones, landslides, and fires.

---

## 1. Project Overview & Features

### Core Capabilities
* **Interactive Command Center**: Large map-centric authority interface mapping incidents, active rescue units, relief camps, and stock supply depots.
* **Geotagged Citizen Reporting**: Mobile-friendly incident creation with automatic GPS coordinates capture (`navigator.geolocation`) and photo file verification (<5MB validation).
* **Automated Decision Engine**: Explains and recommends optimal resources (Rescue Teams, Shelters, Supply Depots) matching distance and capacity logic.
* **Low-connectivity Fallbacks**: Mock integration layers for voice hotline (IVR options mapping) and SMS texts parses.
* **Real-time Synchronization**: Instant client updates via persistent WebSockets broadcast channels.
* **Aggregated Heatmaps**: Native weight-based radial overlapping circular hotspots showing concentration densities.
* **i18n Translation Support**: Instant UI translation toggle supporting English, Hindi (हिंदी), and Odia (ଓଡ଼ିଆ).
* **Role-Based Access Control**: Separate workflows mapped to Citizens, Admins/Authority, Rescue Units, and Shelter Managers.

---

## 2. Platform Architecture

```
                    DISASTER ALERT (IMD Feed)
                         ↓
             CITIZEN APP / SMS / IVR WEBHOOK
                         ↓
               STORES IN DB (PostgreSQL / SQLite)
                         ↓
           REAL-TIME WEBSOCKET PUSH EVENT TO DASHBOARD
                         ↓
           DASHBOARD RENDERS MARKERS & HEATMAPS
                         ↓
           ALLOCATION MATCHING DECISION ENGINE RUNS
                         ↓
          RECOMMENDS BEST RESOURCE (Capacity & Distance)
                         ↓
             AUTHORITY APPROVES DISPATCH / ASSIGN
                         ↓
           MAP DRAW DOTTED ROUTE / PINS CONNECTED
                         ↓
            RESCUE DEPLOYED & RESOLVED -> SHELTER
```

---

## 3. Technology Stack

### Backend
* **Python** (FastAPI)
* **Pydantic** (Data validations and parsing)
* **SQLAlchemy** (Object relation mapping)
* **SQLite / PostgreSQL + PostGIS** (Spatial models and indexing)
* **WebSockets** (Real-time updates)

### Frontend
* **React.js** (Vite scaffolding)
* **Tailwind CSS** (Styling framework)
* **React-Leaflet** (Map container overlays)
* **Recharts** (Visual graphs and telemetry KPI)
* **Lucide React** (Modern visual glyphs)

---

## 4. Prerequisites & Environment Settings

Install **Python 3.10+** and **NodeJS v18+**.

### Environment Variables (`backend/.env`)
Copy `backend/.env.example` into a new file named `backend/.env`:
```ini
DATABASE_URL=sqlite:///./disaster_management.db
JWT_SECRET=supersecretjwtkeyforlocaldevelopment12345
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
UPLOAD_DIR=uploads
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SMS_PROVIDER=mock
IVR_PROVIDER=mock
IMD_API_URL=mock
IMD_API_KEY=
PORT=8000
```

---

## 5. Setup & Running Locally

### Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # Linux/macOS:
   source .venv/bin/activate
   ```
3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the seed script to populate the tables with 20+ incidents, 10+ rescue teams, 10+ shelters, and 3+ weather warnings:
   ```bash
   python seed.py
   ```
5. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### Frontend Setup
1. Open a new terminal window and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install NodeJS packages:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 6. PostgreSQL & PostGIS Setup (Production)

To migrate from the local development SQLite database to a PostgreSQL instance in production:
1. Ensure your PostgreSQL server has the **PostGIS extension** installed:
   ```sql
   CREATE EXTENSION postgis;
   ```
2. Update the `DATABASE_URL` setting inside the backend `.env` file to target the PostgreSQL instance:
   ```ini
   DATABASE_URL=postgresql://db_user:db_password@localhost:5432/disaster_db
   ```
3. On startup, the SQLAlchemy database connector automatically detects the connection dialect and executes native geographic queries.

---

## 7. The Resource Allocation Algorithm

The matching engine ranks resources (rescue teams, shelters, supply depots) using a deterministic approach:
1. **Filters Availability**: Excludes rescue teams with status other than `AVAILABLE`. Excludes shelters marked `FULL`.
2. **Checks Suitability Constraints**: Filters out rescue teams whose capacity is smaller than the incident's headcount (`RescueTeam.capacity < Incident.people_affected`).
3. **Geodesic Distance Rating**: Calculates distance using the Haversine formula (SQLite fallback) or PostGIS functions.
4. **Distance Threshold Constraint**: Excludes teams located further than **20 km** from the incident coordinates.
5. **Alternative Fallback**: If no resource satisfies the capacity threshold within 20 km, it raises a custom `ResourceUnavailableException` returning the closest available teams as force-dispatch alternatives.

---

## 8. Step-by-Step Demo Scenario Script

Use the following flow to demonstrate all aspects of the platform:
1. **Welcome Portal**: Open `http://localhost:5173` to view the home portal and active advisories.
2. **Authority Sign In**: Click **Login** and log in using the Authority credentials:
   * **Phone**: `9999999999`
   * **Password**: `adminpassword`
3. **Inspect Command Board**: Verify the dashboard shows the interactive Leaflet map, seeded incidents, available rescue teams, and active alerts.
4. **Trigger Weather Warning**: Open the **Developer Simulation Panel** at the bottom-left of the map, and click **Sync Feeds** under the IMD advisory panel. Watch the alert list update.
5. **File Mobile Incident**: Open a new browser window (e.g. Incognito or simulated mobile view) at `http://localhost:5173/citizen`, log in with the Citizen credentials:
   * **Phone**: `8888888888`
   * **Password**: `password`
6. **Submit Emergency Form**: Fill out a report:
   * **Type**: Flood
   * **Severity**: Critical
   * **Affected**: 15 citizens
   * **Locality**: Rasulgarh
   * **Location**: Click **GPS Lock** (or click the mini-map to drop a pin).
   * **Attachment**: Upload a mock image file.
   * Click **Submit**.
7. **Real-time Sync**: Look at the Authority Dashboard. The red incident marker immediately drops on the Leaflet map via WebSockets without refreshing.
8. **Analyze Recommendations**: Click on the new red incident pin on the map. The side control card opens. The system automatically recommends the closest suitable rescue unit (`TEAM-R01` with capacity 25) and shows the exact distance and reason.
9. **Assign Team**: Click **Assign Team**. A dotted red line immediately links the incident marker and the rescue team on the map, and the team's status updates to `ASSIGNED`.
10. **Track Progress**: In the incident side panel, click **Rescue in Progress**. Observe the status tags updates.
11. **Resolve and Shelter**: Click **Resolved**. Since citizens are rescued, the card changes to recommend the closest open shelter with capacity $\ge$ 15, and lists supply depots. Click **Allocate Space** to check them in, and see the map stats update.
