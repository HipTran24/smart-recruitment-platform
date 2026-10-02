import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './components/layout/AdminLayout';
import { RecruiterLayout } from './components/layout/RecruiterLayout';

// Admin Workspace Pages
import AdminConsole from './pages/AdminConsole';
import JobManagement from './pages/JobManagement';
import ApplicationManagement from './pages/ApplicationManagement';
import CandidateDirectory from './pages/CandidateDirectory';
import UserDirectory from './pages/UserDirectory';
import UserRoleManagement from './pages/UserRoleManagement';
import SkillTaxonomy from './pages/SkillTaxonomy';
import AuditEventExplorer from './pages/AuditEventExplorer';
import SettingsConfiguration from './pages/SettingsConfiguration';
import RecruiterDashboard from './pages/RecruiterDashboard';

// Recruiter Workspace Pages (Đầy đủ tất cả trang trong thư mục pages/Recruiters)
import RecruiterConsole from './pages/Recruiters/RecruiterConsole';
import JobRequisitionsDashboard from './pages/Recruiters/JobRequisitionsDashboard';
import JobCreationStudio from './pages/Recruiters/JobCreationRecruiter';
import CandidateManagement from './pages/Recruiters/CandidateManagement';
import BulkCandidateScreeningHub from './pages/Recruiters/BulkCandidatesRecruiter';
import ApplicationDetailDossier from './pages/Recruiters/ApplicationDetailRecruiter';
import EvaluationFeedbackRecruiter from './pages/Recruiters/Evaluation&FeedbackRecruiter';
import AIFeedbackDraftStudio from './pages/Recruiters/AIFeedbackRecruiter';
import InterviewCalendar from './pages/Recruiters/InterviewCalendarRecruiter';
import HiringAnalyticsRecruiter from './pages/Recruiters/HiringAnalyticsRecruiter';
import NotificationAuditLogCenter from './pages/Recruiters/NotifucationRecruiter';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ========================================================================= */}
        {/* GIAO DIỆN RECRUITER (CHẠY RIÊNG BIỆT VỚI RECRUITERLAYOUT)                */}
        {/* ========================================================================= */}
        <Route element={<RecruiterLayout />}>
          {/* Mặc định chuyển hướng vào console overview */}
          <Route path="/recruiter" element={<Navigate to="/recruiter/console" replace />} />
          <Route path="/recruiter-console" element={<Navigate to="/recruiter/console" replace />} />

          {/* 1. Dashboard / Overview Tuyển dụng */}
          <Route path="/recruiter/console" element={<RecruiterConsole />} />
          <Route path="/recruiter/overview" element={<RecruiterConsole />} />
          <Route path="/recruiter/dashboard" element={<RecruiterConsole />} />

          {/* 2. Quản lý công việc (Jobs) & Tạo việc mới */}
          <Route path="/recruiter/jobs" element={<JobRequisitionsDashboard />} />
          <Route path="/recruiter/jobs/create" element={<JobCreationStudio />} />
          <Route path="/recruiter/job-creation" element={<JobCreationStudio />} />
          <Route path="/job-requisitions" element={<JobRequisitionsDashboard />} />

          {/* 3. Quản lý ứng viên (Candidates), Sàng lọc hồ sơ (Bulk) & Chi tiết ứng viên (Dossier) */}
          <Route path="/recruiter/candidates" element={<CandidateManagement />} />
          <Route path="/recruiter/candidates/screening" element={<BulkCandidateScreeningHub />} />
          <Route path="/recruiter/candidates/bulk" element={<BulkCandidateScreeningHub />} />
          <Route path="/recruiter/candidates/detail" element={<ApplicationDetailDossier />} />

          {/* 4. Đánh giá & Phản hồi (Evaluations) & AI Feedback Drafts */}
          <Route path="/recruiter/evaluations" element={<EvaluationFeedbackRecruiter />} />
          <Route path="/recruiter/evaluations/ai-feedback" element={<AIFeedbackDraftStudio />} />
          <Route path="/recruiter/ai-feedback" element={<AIFeedbackDraftStudio />} />

          {/* 5. Lịch phỏng vấn trực quan */}
          <Route path="/recruiter/calendar" element={<InterviewCalendar />} />
          <Route path="/recruiter/interview-calendar" element={<InterviewCalendar />} />

          {/* 6. Phân tích & Báo cáo tuyển dụng (Analytics) */}
          <Route path="/recruiter/analytics" element={<HiringAnalyticsRecruiter />} />
          <Route path="/recruiter/hiring-analytics" element={<HiringAnalyticsRecruiter />} />

          {/* 7. Thông báo & Nhật ký kiểm toán (Notifications & Audit Log) */}
          <Route path="/recruiter/notifications" element={<NotificationAuditLogCenter />} />
        </Route>

        {/* ========================================================================= */}
        {/* GIAO DIỆN ADMIN (CHẠY RIÊNG BIỆT VỚI ADMINLAYOUT - DARK THEME)           */}
        {/* ========================================================================= */}
        <Route element={<AdminLayout />}>
          <Route index element={<AdminConsole />} />
          <Route path="/admin" element={<AdminConsole />} />
          <Route path="/admin-console" element={<AdminConsole />} />
          <Route path="/jobs" element={<JobManagement />} />
          <Route path="/applications" element={<ApplicationManagement />} />
          <Route path="/candidates" element={<CandidateDirectory />} />
          <Route path="/user-directory" element={<UserDirectory />} />
          <Route path="/users-roles" element={<UserRoleManagement />} />
          <Route path="/skill-taxonomy" element={<SkillTaxonomy />} />
          <Route path="/audit" element={<AuditEventExplorer />} />
          <Route path="/settings" element={<SettingsConfiguration />} />
          <Route path="/operations" element={<RecruiterDashboard />} />
        </Route>

        {/* Fallback cho bất kỳ URL không xác định nào */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
