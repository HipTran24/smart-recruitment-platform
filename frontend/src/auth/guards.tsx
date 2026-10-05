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
  const { user, status } = useAuth();

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
    if (user.roleCodes.includes('ROLE_PLATFORM_ADMIN')) redirectPath = '/admin-console';
    else if (user.roleCodes.includes('ROLE_RECRUITER')) redirectPath = '/recruiter/console';

    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <Card className="max-w-md w-full text-center p-8 space-y-4 shadow-xl border border-rose-200 dark:border-rose-900/50">
          <div className="w-14 h-14 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Truy Cập Bị Từ Chối (403 Forbidden)
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Tài khoản của bạn ({user.email}) không có quyền truy cập vào phân hệ này theo nguyên tắc
            Least Privilege.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => (window.location.href = redirectPath)}
            >
              Về Không Gian Được Ủy Quyền
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
}
