import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "./components/layout/AdminLayout";
import { CandidateLayout } from "./components/layout/CandidateLayout";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import JobManagement from "./pages/JobManagement";
import ApplicationManagement from "./pages/ApplicationManagement";
import CandidateDirectory from "./pages/CandidateDirectory";
import UserDirectory from "./pages/UserDirectory";
import UserRoleManagement from "./pages/UserRoleManagement";
import SkillTaxonomy from "./pages/SkillTaxonomy";
import AuditEventExplorer from "./pages/AuditEventExplorer";
import SettingsConfiguration from "./pages/SettingsConfiguration";
import AdminConsole from "./pages/AdminConsole";
import MyApplication from "./pages/candidate/MyApplication";
import ExploreJobs from "./pages/candidate/ExploreJobs";
import InterviewsOffer from "./pages/candidate/InterviewsOffer";
import ProfileResume from "./pages/candidate/ProfileResume";
import ReviewOffer from "./pages/candidate/ReviewOffer";
import ViewDetails from "./pages/candidate/ViewDetails";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout của Admin (Đứng độc lập) */}
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
        </Route>

        <Route element={<CandidateLayout />}>
          <Route path="/my-applications" element={<MyApplication />} />
          <Route path="/explore-jobs" element={<ExploreJobs />} />
          <Route path="/profile-resume" element={<ProfileResume />} />
          <Route path="/interviews-offers" element={<InterviewsOffer />} />
          <Route
            path="/applications/:applicationId"
            element={<ViewDetails />}
          />
          <Route path="/offers/:offerId/review" element={<ReviewOffer />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
