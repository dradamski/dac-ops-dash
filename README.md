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

**Backend (Lightweight / Simulated)**
- REST API (mocked JSON or simple FastAPI service)
- Time-series sensor data simulation

**Tooling & Deployment**
- GitHub Actions (CI)
- Vercel or Netlify (hosting)

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

