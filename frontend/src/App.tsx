import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  Outlet,
} from "react-router-dom";
import { AdminLayout } from "./components/layout/AdminLayout";
import { RecruiterLayout } from "./components/layout/RecruiterLayout";
import { CandidateLayout } from "./components/layout/CandidateLayout";

import { AuthProvider, useAuth } from "./auth/AuthContext";
import { RequireRole } from "./auth/guards";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Admin Workspace Pages
import AdminConsole from "./pages/AdminConsole";
import JobManagement from "./pages/JobManagement";
import ApplicationManagement from "./pages/ApplicationManagement";
import CandidateDirectory from "./pages/CandidateDirectory";
import UserDirectory from "./pages/UserDirectory";
import UserRoleManagement from "./pages/UserRoleManagement";
import SkillTaxonomy from "./pages/SkillTaxonomy";
import AuditEventExplorer from "./pages/AuditEventExplorer";
import SettingsConfiguration from "./pages/SettingsConfiguration";
import RecruiterDashboard from "./pages/RecruiterDashboard";

// Recruiter Workspace Pages (Đầy đủ tất cả trang trong thư mục pages/Recruiters)
import RecruiterConsole from "./pages/Recruiters/RecruiterConsole";
import JobRequisitionsDashboard from "./pages/Recruiters/JobRequisitionsDashboard";
import JobCreationStudio from "./pages/Recruiters/JobCreationRecruiter";
import CandidateManagement from "./pages/Recruiters/CandidateManagement";
import BulkCandidateScreeningHub from "./pages/Recruiters/BulkCandidatesRecruiter";
import ApplicationDetailDossier from "./pages/Recruiters/ApplicationDetailRecruiter";
import EvaluationFeedbackRecruiter from "./pages/Recruiters/Evaluation&FeedbackRecruiter";
import AIFeedbackDraftStudio from "./pages/Recruiters/AIFeedbackRecruiter";
import InterviewCalendar from "./pages/Recruiters/InterviewCalendarRecruiter";
import HiringAnalyticsRecruiter from "./pages/Recruiters/HiringAnalyticsRecruiter";
import NotificationAuditLogCenter from "./pages/Recruiters/NotifucationRecruiter";

// Candidate Workspace Pages
import { MyApplication } from "./pages/candidate/MyApplication";
import ExploreJobs from "./pages/candidate/ExploreJobs";
import InterviewsOffer from "./pages/candidate/InterviewsOffer";
import ProfileResume from "./pages/candidate/ProfileResume";
import ReviewOffer from "./pages/candidate/ReviewOffer";
import ViewDetails from "./pages/candidate/ViewDetails";
import { CandidateSettings } from "./pages/candidate/CandidateSettings";

function CandidateSettingsRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const from = (location.state as { from?: string } | null)?.from;
  const returnTo =
    from?.startsWith("/") &&
    !from.startsWith("//") &&
    from !== "/settings_candidate"
      ? from
      : "/my-applications";

  return (
    <CandidateSettings onClose={() => navigate(returnTo, { replace: true })} />
  );
}

function RootRedirect() {
  const { user, status } = useAuth();
  if (status === "initializing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/explore-jobs" replace />;
  }
  if (user.roleCodes.includes("ROLE_PLATFORM_ADMIN")) {
    return <Navigate to="/admin-console" replace />;
  }
  if (user.roleCodes.includes("ROLE_RECRUITER")) {
    return <Navigate to="/recruiter/console" replace />;
  }
  return <Navigate to="/my-applications" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ========================================================================= */}
          {/* ROOT REDIRECT DỰA TRÊN ROLE HOẶC ANONYMOUS                                */}
          {/* ========================================================================= */}
          <Route path="/" element={<RootRedirect />} />

          {/* ========================================================================= */}
          {/* CÁC TUYẾN XÁC THỰC CÔNG KHAI (AUTH ROUTES)                               */}
          {/* ========================================================================= */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ========================================================================= */}
          {/* GIAO DIỆN CANDIDATE (CÔNG KHAI XEM VIỆC / BẢO VỆ NỘP HỒ SƠ & QUẢN LÝ)      */}
          {/* ========================================================================= */}
          <Route element={<CandidateLayout />}>
            {/* Tuyến công khai (Public browsing) */}
            <Route path="/explore-jobs" element={<ExploreJobs />} />
            <Route path="/explore-jobs/:jobId" element={<ExploreJobs />} />
            <Route path="/views_details" element={<ViewDetails />} />
            <Route path="/jobs/:jobId" element={<ViewDetails />} />

            {/* Tuyến bảo vệ (Candidate Workspace Protected) */}
            <Route element={<RequireRole roles={["ROLE_CANDIDATE"]} />}>
              <Route path="/candidate" element={<Navigate to="/my-applications" replace />} />
              <Route path="/my-applications" element={<MyApplication />} />
              <Route path="/my-applications/:applicationId" element={<MyApplication />} />
              <Route path="/profile-resume" element={<ProfileResume />} />
              <Route path="/interviews-offers" element={<InterviewsOffer />} />
              <Route path="/settings_candidate" element={<CandidateSettingsRoute />} />
              <Route path="/offers/:offerId/review" element={<ReviewOffer />} />
            </Route>
          </Route>

          {/* ========================================================================= */}
          {/* GIAO DIỆN RECRUITER (BẢO VỆ VỚI ROLE_RECRUITER)                           */}
          {/* ========================================================================= */}
          <Route element={<RequireRole roles={["ROLE_RECRUITER"]} />}>
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
              <Route path="/recruiter/jobs/:jobId" element={<JobRequisitionsDashboard />} />
              <Route path="/recruiter/jobs/create" element={<JobCreationStudio />} />
              <Route path="/recruiter/job-creation" element={<JobCreationStudio />} />
              <Route path="/job-requisitions" element={<JobRequisitionsDashboard />} />

              {/* 3. Quản lý ứng viên (Candidates), Sàng lọc hồ sơ (Bulk) & Chi tiết ứng viên (Dossier) */}
              <Route path="/recruiter/candidates" element={<CandidateManagement />} />
              <Route path="/recruiter/candidates/screening" element={<BulkCandidateScreeningHub />} />
              <Route path="/recruiter/candidates/bulk" element={<BulkCandidateScreeningHub />} />
              <Route path="/recruiter/candidates/detail" element={<ApplicationDetailDossier />} />
              <Route path="/recruiter/candidates/:applicationId" element={<ApplicationDetailDossier />} />

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
          </Route>

          {/* ========================================================================= */}
          {/* GIAO DIỆN ADMIN (BẢO VỆ VỚI ROLE_PLATFORM_ADMIN - DARK THEME)             */}
          {/* ========================================================================= */}
          <Route element={<RequireRole roles={["ROLE_PLATFORM_ADMIN"]} />}>
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
          </Route>

          {/* Fallback cho bất kỳ URL không xác định nào */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
