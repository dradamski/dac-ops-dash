import { Routes, Route } from 'react-router-dom';
import { DashboardPage } from '../pages/DashboardPage';
import { SensorsPage } from '../pages/SensorsPage';
import { TestsPage } from '../pages/TestsPage';

/**
 * Application routes configuration
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/sensors" element={<SensorsPage />} />
      <Route path="/tests" element={<TestsPage />} />
    </Routes>
  );
}

