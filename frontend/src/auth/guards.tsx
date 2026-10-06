import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function sanitizeReturnUrl(returnTo?: string | null): string {
  if (!returnTo) return '/';
  if (!returnTo.startsWith('/') || returnTo.startsWith('//')) return '/';
  if (
    returnTo.startsWith('/login') ||
    returnTo.startsWith('/register') ||
    returnTo.startsWith('/forgot-password') ||
    returnTo.startsWith('/reset-password')
  ) {
    return '/';
  }
  return returnTo;
}

export function RequireAuth({ children }: { children?: React.ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'initializing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Đang tải phiên làm việc...
          </span>
        </div>
      </div>
    );
  }

  if (status === 'anonymous') {
    const returnTo = sanitizeReturnUrl(location.pathname + location.search);
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

export function RequireRole({
  roles,
  children,
}: {
  roles: string[];
  children?: React.ReactNode;
}) {
  const { user, status, logout } = useAuth();

  if (status === 'initializing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasRequiredRole = roles.some((role) => user.roleCodes.includes(role));

  if (!hasRequiredRole) {
    let redirectPath = '/my-applications';
    let currentRoleLabel = 'Ứng Viên (Candidate)';
    if (user.roleCodes.includes('ROLE_PLATFORM_ADMIN')) {
      redirectPath = '/admin-console';
      currentRoleLabel = 'Quản Trị Viên (Platform Admin)';
    } else if (user.roleCodes.includes('ROLE_RECRUITER')) {
      redirectPath = '/recruiter/console';
      currentRoleLabel = 'Nhà Tuyển Dụng (Recruiter)';
    }

    let targetRole: 'admin' | 'recruiter' | 'candidate' = 'candidate';
    let targetLabel = 'Ứng Viên (Candidate)';
    let targetEmail = 'candidate@smartrecruit.local';

    if (roles.includes('ROLE_RECRUITER')) {
      targetRole = 'recruiter';
      targetLabel = 'Nhà Tuyển Dụng (Recruiter)';
      targetEmail = 'recruiter@smartrecruit.local';
    } else if (roles.includes('ROLE_PLATFORM_ADMIN')) {
      targetRole = 'admin';
      targetLabel = 'Quản Trị Viên (Platform Admin)';
      targetEmail = 'admin@smartrecruit.local';
    }

    const handleLogout = async () => {
      await logout();
      window.location.href = '/login';
    };

    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <Card className="max-w-lg w-full p-8 space-y-6 shadow-2xl border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-slate-900">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold shadow-xs">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Yêu Cầu Quyền Hạn ({targetLabel})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Theo quy chuẩn kiến trúc bảo mật <strong>ADR 0003 (Admin Least Privilege)</strong>, các phân hệ Admin, Recruiter và Candidate hoàn toàn tách biệt để đảm bảo an toàn dữ liệu và quyền riêng tư ứng viên.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Tài khoản đang đăng nhập:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{user.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Vai trò hiện tại:</span>
              <span className="font-medium text-amber-600 dark:text-amber-400">{currentRoleLabel}</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-700 pt-2">
              <span className="text-slate-500 dark:text-slate-400">Quyền phân hệ này:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{targetLabel}</span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <Button
              variant="primary"
              className="w-full justify-center py-2.5 font-semibold text-sm shadow-md"
              onClick={() => (window.location.href = redirectPath)}
            >
              Về Không Gian Được Ủy Quyền ({currentRoleLabel})
            </Button>

            <Button
              variant="outline"
              className="w-full justify-center text-xs text-rose-600 hover:text-rose-700 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              onClick={handleLogout}
            >
              Đăng Xuất Để Đăng Nhập Tài Khoản Khác
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
}
