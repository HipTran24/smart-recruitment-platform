import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './components/layout/AdminLayout';
import RecruiterDashboard from './pages/RecruiterDashboard';
import JobManagement from './pages/JobManagement';
import ApplicationManagement from './pages/ApplicationManagement';
import CandidateDirectory from './pages/CandidateDirectory';
import UserDirectory from './pages/UserDirectory';
import UserRoleManagement from './pages/UserRoleManagement';
import SkillTaxonomy from './pages/SkillTaxonomy';
import AuditEventExplorer from './pages/AuditEventExplorer';
import SettingsConfiguration from './pages/SettingsConfiguration';
import AdminConsole from './pages/AdminConsole';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<RecruiterDashboard />} />
          <Route path="/admin-console" element={<AdminConsole />} />
          <Route path="/jobs" element={<JobManagement />} />
          <Route path="/applications" element={<ApplicationManagement />} />
          <Route path="/candidates" element={<CandidateDirectory />} />
          <Route path="/user-directory" element={<UserDirectory />} />
          <Route path="/users-roles" element={<UserRoleManagement />} />
          <Route path="/skill-taxonomy" element={<SkillTaxonomy />} />
          <Route path="/audit" element={<AuditEventExplorer />} />
          <Route path="/settings" element={<SettingsConfiguration />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
