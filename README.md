# Direct Air Capture Operations Dashboard

A React + TypeScript web application for visualizing and monitoring operational data from Direct Air Capture (DAC) units.  
The dashboard is designed to translate complex, time-series sensor data into clear, actionable insights for operators and stakeholders.

This project focuses on usability, system observability, and end-to-end ownership of a data-driven product.

---

## Features

- **Real-Time Sensor Visualization**
  - Time-series charts for CO₂ concentration, temperature, airflow, and capture efficiency
  - Configurable time ranges and sensor selection
  - Building-based filtering for multi-location deployments
- **System Health Overview**
  - High-level status indicators for DAC units
  - Threshold-based alerts for anomalous or degraded performance
  - Click-to-navigate from dashboard to detailed views
- **Operational Workflows**
  - Ability to trigger test runs and view results (simulated with mock data generation)
  - Background task execution for long-running tests
  - Click-to-navigate from test results to sensor data views
- **Responsive UI**
  - Designed for use across desktop and tablet devices
  - Intuitive navigation with state persistence via URL parameters
- **Production-Oriented Architecture**
  - Strong typing with TypeScript
  - Clean separation between UI, data fetching, and domain logic
  - Structured logging and error handling
  - Input validation and security best practices

---

## Tech Stack

**Frontend**
- React 18.2.0
- TypeScript 5.2.2
- Vite 5.0.8
- Recharts 2.10.3 (data visualization)
- React Router DOM 6.20.0
- Styled-jsx (scoped CSS)

**Backend**
- FastAPI 0.104.1 (Python REST API)
- PostgreSQL 15 (Alpine)
- SQLAlchemy 2.0.23 (ORM)
- Alembic 1.12.1 (database migrations)
- Pydantic 2.5.0 (data validation)
- Structured JSON logging

**Tooling & Deployment**
- Docker & Docker Compose
- Automated startup script (`start.sh`)
- Security vulnerability scanning (npm audit, pip-audit/safety)
- Database seeding scripts

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
   
   Create a `.env` file in the project root with the following **required** variables:
   
   ```env
   # PostgreSQL Configuration (REQUIRED - no defaults allowed)
   POSTGRES_USER=your_username
   POSTGRES_PASSWORD=your_secure_password_min_8_chars
   POSTGRES_DB=dac_ops_db
   
   # Database Connection URL (REQUIRED - must match credentials above)
   DATABASE_URL=postgresql://your_username:your_secure_password_min_8_chars@postgres:5432/dac_ops_db
   
   # Backend Database Settings (REQUIRED - must match POSTGRES_* values)
   DATABASE_HOST=postgres
   DATABASE_PORT=5432
   DATABASE_NAME=dac_ops_db
   DATABASE_USER=your_username
   DATABASE_PASSWORD=your_secure_password_min_8_chars
   
   # CORS Configuration
   CORS_ORIGINS=http://localhost:3000,http://localhost:5173
   
   # Frontend API URL
   VITE_API_BASE_URL=http://localhost:8000/api
   
   # Backend Development Mode (set to empty string "" for production)
   UVICORN_RELOAD=--reload
   ```
   
   **Important Security Notes:**
   - Passwords must be at least 8 characters long
   - Default credentials (`dac_user`/`dac_password`) are not allowed
   - All database-related variables are required (no fallback defaults)

4. **Start all services with Docker:**
   
   **Option A: Use the automated startup script (recommended):**
   ```bash
   ./start.sh
   ```
   
   This script will:
   - Verify `.env` file exists
   - Start all Docker containers
   - Wait for services to be healthy
   - Automatically seed the database if it's empty
   
   **Option B: Manual startup:**
   ```bash
   # Start containers
   docker-compose up -d
   
   # Check service status
   docker-compose ps
   
   # View logs
   docker-compose logs -f
   
   # Seed database (if needed)
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
# All fields are REQUIRED (no defaults)
DATABASE_URL=postgresql://postgres:your_secure_password@localhost:5432/dac_ops_db
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=dac_ops_db
DATABASE_USER=postgres
DATABASE_PASSWORD=your_secure_password  # Must be at least 8 characters
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Note:** The password must be at least 8 characters and cannot be the default `dac_password`.

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

- **Database connection errors**: 
  - Ensure PostgreSQL is running and credentials in `.env` are correct
  - Verify password meets requirements (min 8 chars, not default)
  - Check that `DATABASE_URL` matches your credentials
- **Port already in use**: Change ports in `uvicorn` command or frontend `vite.config.ts`
- **Module not found errors**: Ensure virtual environment is activated and dependencies are installed
- **Migration errors**: Try `alembic downgrade -1` then `alembic upgrade head` to reset migrations
- **Validation errors on startup**: Check that all required environment variables are set and passwords meet security requirements

---

## Security

This project implements several security best practices:

### Input Validation
- All string fields have length limits to prevent DoS attacks
- XSS protection on user-input fields (summary, names, etc.)
- Pydantic schema validation on all API endpoints

### Credential Management
- **No hardcoded credentials** - All database credentials must be provided via environment variables
- Password strength validation (minimum 8 characters, no default passwords)
- Environment variable validation on startup

### Security Scanning
- **Frontend**: Run `npm run security:audit` to check for vulnerable dependencies
- **Backend**: Run `python backend/check_security.py` to scan Python dependencies (requires `pip-audit` or `safety`)

### Security Audit Report
A comprehensive security audit report is available at `.cursor/SECURITY_FIX.md` documenting identified vulnerabilities and remediation strategies.

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
  id: string;
  unitId: string;
  sensorType: 'co2' | 'temperature' | 'airflow' | 'efficiency';
  value: number;
  unit: string;
  timestamp: string;
  createdAt: string;
};

type DacUnit = {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  location: string | null;
  lastUpdated: string | null;
  createdAt: string;
  updatedAt: string;
};

type TestRun = {
  id: string;
  unitId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt: string | null;
  error: string | null;
  result: TestResult | null;
};

type TestResult = {
  id: string;
  testRunId: string;
  passed: boolean;
  summary: string;
  metrics: TestMetric[];
  createdAt: string;
};
```

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run security:audit` - Check for vulnerable npm dependencies
- `npm run security:fix` - Auto-fix npm vulnerabilities
- `npm run docker:up` - Start Docker containers
- `npm run docker:down` - Stop Docker containers
- `npm run docker:logs` - View container logs
- `npm run docker:build` - Rebuild Docker images

### Backend
- `python backend/check_security.py` - Scan Python dependencies for vulnerabilities
- `docker-compose exec backend python seed_data.py` - Seed database with sample data
- `docker-compose exec backend alembic upgrade head` - Run database migrations

---

## Project Structure

```
dac-ops-dash/
├── app/                          # React app configuration
│   ├── App.tsx                   # Main React component with router setup
│   ├── routes.tsx                # Route definitions
│   └── Layout.tsx                 # Layout wrapper component
│
├── backend/                      # FastAPI backend
│   ├── app/
│   │   ├── database.py           # Database connection & settings
│   │   ├── models.py             # SQLAlchemy ORM models
│   │   ├── schemas.py            # Pydantic request/response schemas
│   │   ├── logging_config.py     # Structured logging configuration
│   │   ├── routers/              # API route handlers
│   │   │   ├── units.py          # DAC unit endpoints
│   │   │   ├── sensors.py        # Sensor reading endpoints
│   │   │   └── tests.py          # Test run endpoints
│   │   ├── services/            # Business logic
│   │   │   └── test_executor.py  # Test execution service
│   │   └── utils/               # Utility functions
│   │       ├── database.py      # Transaction management
│   │       └── transformers.py  # Model-to-schema transformers
│   ├── alembic/                 # Database migrations
│   ├── main.py                  # FastAPI application entry point
│   ├── seed_data.py             # Database seeding script
│   ├── check_security.py        # Security vulnerability scanner
│   ├── requirements.txt         # Python dependencies
│   └── Dockerfile               # Backend container definition
│
├── components/
│   ├── common/                   # Reusable UI components
│   │   ├── Card.tsx
│   │   ├── LoadingState.tsx
│   │   ├── ErrorState.tsx
│   │   ├── Tooltip.tsx
│   │   └── BuildingFilter.tsx   # Building location filter
│   ├── overview/              # Dashboard components
│   │   ├── SystemStatusCard.tsx
│   │   ├── UnitStatusGrid.tsx
│   │   └── AlertBanner.tsx
│   ├── sensors/                 # Sensor visualization components
│   │   ├── SensorChart.tsx
│   │   ├── SensorSelector.tsx
│   │   ├── SensorLegend.tsx
│   │   └── TimeRangePicker.tsx
│   └── workflows/               # Test workflow components
│       ├── TestRunButton.tsx
│       ├── TestRunStatus.tsx
│       └── TestResultsPanel.tsx
│
├── pages/                        # Page components
│   ├── DashboardPage.tsx         # Main dashboard
│   ├── SensorsPage.tsx           # Sensor data visualization
│   └── TestsPage.tsx            # Test run management
│
├── hooks/                        # Custom React hooks
│   ├── useSensorData.ts
│   ├── useDacUnits.ts
│   └── useTestRuns.ts
│
├── api/                          # API client functions
│   ├── client.ts                # Base API client
│   ├── sensors.ts
│   ├── units.ts
│   └── tests.ts
│
├── context/
│   └── FilterContext.tsx         # Global filter state management
│
├── types/
│   └── domain.ts                # TypeScript type definitions
│
├── utils/                        # Utility functions
│   ├── thresholds.ts
│   ├── formatters.ts
│   ├── buildings.ts             # Building extraction utilities
│   └── mockData.ts
│
├── docker-compose.yml            # Multi-container orchestration
├── Dockerfile                    # Frontend container definition
├── start.sh                      # Automated startup script
├── package.json                  # Frontend dependencies & scripts
└── main.tsx                      # React entry point
```

