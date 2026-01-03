# Direct Air Capture Operations Dashboard

A React + TypeScript web application for visualizing and monitoring operational data from Direct Air Capture (DAC) units.  
The dashboard is designed to translate complex, time-series sensor data into clear, actionable insights for operators and stakeholders.

This project focuses on usability, system observability, and end-to-end ownership of a data-driven product.

---

## Features

- **Real-Time Sensor Visualization**
  - Time-series charts for CO₂ concentration, temperature, airflow, and capture efficiency
  - Configurable time ranges and sensor selection
- **System Health Overview**
  - High-level status indicators for DAC units
  - Threshold-based alerts for anomalous or degraded performance
- **Operational Workflows**
  - Ability to trigger test runs and view results (simulated)
  - Clear separation between operational and public-facing views
- **Responsive UI**
  - Designed for use across desktop and tablet devices
- **Production-Oriented Architecture**
  - Strong typing with TypeScript
  - Clean separation between UI, data fetching, and domain logic

---

## Tech Stack

**Frontend**
- React
- TypeScript
- Vite
- Recharts (data visualization)
- CSS Modules or Tailwind CSS

**Backend**
- FastAPI (Python) REST API
- PostgreSQL database
- SQLAlchemy ORM
- Alembic for database migrations

**Tooling & Deployment**
- Docker & Docker Compose
- Alembic for database migrations
- GitHub Actions (CI) - optional
- Vercel or Netlify (hosting) - optional

---

## Getting Started

### Prerequisites

Before setting up this repository, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- **Git** - Usually pre-installed on macOS/Linux

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd dac-ops-dash
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the following:
   - `POSTGRES_PASSWORD` - Set a strong password for the database
   - `DATABASE_URL` - Update with your chosen password
   - `CORS_ORIGINS` - Add your frontend URLs if different from defaults
   - `UVICORN_RELOAD` - Set to empty string `""` for production

4. **Start all services with Docker:**
   ```bash
   docker-compose up -d
   ```

5. **Wait for services to be ready:**
   ```bash
   # Check service status
   docker-compose ps
   
   # View logs to ensure everything started correctly
   docker-compose logs -f
   ```

6. **Seed the database with sample data (optional):**
   ```bash
   docker-compose exec backend python seed_data.py
   ```

7. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Running Locally (Without Docker)

If you prefer to run services locally without Docker, follow these steps:

#### Prerequisites for Local Development

- **PostgreSQL 15** - Install via:
  - macOS: `brew install postgresql@15`
  - Linux: `sudo apt-get install postgresql-15` (Ubuntu/Debian)
  - Windows: [Download PostgreSQL installer](https://www.postgresql.org/download/windows/)
- **Python 3.11+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 18+** - Already required above

#### Step 1: Set Up PostgreSQL Database

```bash
# Start PostgreSQL service
# macOS:
brew services start postgresql@15

# Linux:
sudo systemctl start postgresql

# Windows: PostgreSQL service should start automatically after installation

# Create the database
createdb dac_ops_db

# Or using psql:
psql -U postgres -c "CREATE DATABASE dac_ops_db;"
```

#### Step 2: Set Up Backend Environment

```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

#### Step 3: Configure Backend Environment Variables

```bash
# In the backend directory, create .env file
cd backend
cp .env.example .env  # If .env.example exists, or create manually
```

Edit `backend/.env` with your local database credentials:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/dac_ops_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=dac_ops_db
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### Step 4: Run Database Migrations

```bash
# Make sure you're in the backend directory with venv activated
cd backend
source venv/bin/activate  # If not already activated

# Run migrations
alembic upgrade head
```

#### Step 5: Seed the Database (Optional)

```bash
# Still in backend directory with venv activated
python seed_data.py
```

#### Step 6: Start the Backend Server

```bash
# In backend directory with venv activated
uvicorn main:app --reload --port 8000
```

The backend API will be available at:
- API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

#### Step 7: Configure Frontend Environment

```bash
# Return to project root
cd ..

# Create .env file in project root (if not already created)
# Edit .env and set:
# VITE_API_BASE_URL=http://localhost:8000/api
```

#### Step 8: Start the Frontend Development Server

```bash
# In project root directory
npm run dev
```

The frontend will be available at http://localhost:5173 (or the port Vite assigns).

#### Running All Services

You'll need **three terminal windows**:

1. **Terminal 1 - PostgreSQL** (if not running as a service):
   ```bash
   # macOS
   brew services start postgresql@15
   ```

2. **Terminal 2 - Backend**:
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn main:app --reload --port 8000
   ```

3. **Terminal 3 - Frontend**:
   ```bash
   npm run dev
   ```

#### Troubleshooting Local Setup

- **Database connection errors**: Ensure PostgreSQL is running and credentials in `.env` are correct
- **Port already in use**: Change ports in `uvicorn` command or frontend `vite.config.ts`
- **Module not found errors**: Ensure virtual environment is activated and dependencies are installed
- **Migration errors**: Try `alembic downgrade -1` then `alembic upgrade head` to reset migrations

---

## Architecture Overview

The application is structured around a clear separation of concerns:

- **UI Components**: Presentational components focused on usability and clarity
- **Domain Components**: DAC-specific concepts such as units, sensors, and test runs
- **Data Layer**: Typed API clients and data-fetching hooks
- **State Management**: Local component state and React context for shared filters

This approach keeps the UI intuitive while ensuring the system remains extensible as data volume and complexity grow.

---

## Data Model (Simplified)

```ts
type SensorReading = {
  timestamp: string;
  sensorType: 'co2' | 'temperature' | 'airflow' | 'efficiency';
  value: number;
  unit: string;
};

type DacUnit = {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical';
};
```

---

## Project Structure

```
dac_dashboard/
├── app/
│   ├── App.tsx               # Main React component that mounts the app; contains JSX
│   ├── routes.tsx            # Defines route components using JSX for pages
│   └── Layout.tsx            # Layout wrapper with JSX for consistent page structure
│
├── components/
│   ├── overview/
│   │   ├── SystemStatusCard.tsx   # UI component rendering status cards with JSX
│   │   ├── UnitStatusGrid.tsx     # UI grid component showing DAC units; JSX included
│   │   └── AlertBanner.tsx        # UI alert banner component; JSX included
│   │
│   ├── sensors/
│   │   ├── SensorChart.tsx        # Component rendering charts with JSX
│   │   ├── SensorSelector.tsx     # UI dropdown selector; JSX included
│   │   ├── TimeRangePicker.tsx    # UI component for selecting time ranges; JSX included
│   │   └── SensorLegend.tsx       # UI component displaying chart legends; JSX included
│   │
│   ├── workflows/
│   │   ├── TestRunButton.tsx      # Button component triggering workflow; JSX included
│   │   ├── TestRunStatus.tsx      # Component showing test status; JSX included
│   │   └── TestResultsPanel.tsx   # Panel component displaying test results; JSX included
│   │
│   └── common/
│       ├── Card.tsx               # Reusable UI card component; JSX included
│       ├── LoadingState.tsx       # Component for loading spinner or placeholder; JSX included
│       ├── ErrorState.tsx         # Error display component; JSX included
│       └── Tooltip.tsx            # Tooltip UI component; JSX included
│
├── pages/
│   ├── DashboardPage.tsx          # Page component rendering overview dashboard with JSX
│   ├── SensorsPage.tsx            # Page component rendering sensor-specific charts and selectors; JSX included
│   └── TestsPage.tsx              # Page component rendering workflow tests UI; JSX included
│
├── hooks/
│   ├── useSensorData.ts           # Custom hook for fetching/managing sensor data; no JSX
│   ├── useDacUnits.ts             # Custom hook for fetching/managing DAC units; no JSX
│   └── useTestRuns.ts             # Custom hook for fetching/managing test run data; no JSX
│
├── api/
│   ├── client.ts                  # API client logic; no JSX
│   ├── sensors.ts                 # Functions for fetching sensor data; no JSX
│   ├── units.ts                   # Functions for fetching DAC unit data; no JSX
│   └── tests.ts                   # Functions for triggering and fetching test run results; no JSX
│
├── context/
│   └── FilterContext.tsx          # React context provider for filters; JSX used for provider component
│
├── types/
│   └── domain.ts                  # TypeScript type definitions for domain objects; no JSX
│
├── utils/
│   ├── thresholds.ts              # Utility functions for threshold calculations; no JSX
│   ├── formatters.ts              # Utility functions for formatting data; no JSX
│   └── mockData.ts                # Simulated/mock sensor data; no JSX
│
└── main.tsx                       # Entry point that renders <App /> into the DOM; JSX included
```

