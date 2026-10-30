import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { sanitizeReturnUrl } from '../../auth/guards';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, status, login, logout } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const rawReturnTo = searchParams.get('returnTo');
  const returnTo = sanitizeReturnUrl(rawReturnTo);

  const routeByRole = (authenticatedUser: { roleCodes: string[] }) => {
    let targetPath = '/my-applications';
    if (authenticatedUser.roleCodes.includes('ROLE_PLATFORM_ADMIN')) {
      targetPath = '/admin-console';
    } else if (authenticatedUser.roleCodes.includes('ROLE_RECRUITER')) {
      targetPath = '/recruiter/console';
    }

    if (returnTo && returnTo !== '/') {
      if (
        authenticatedUser.roleCodes.includes('ROLE_PLATFORM_ADMIN') &&
        (returnTo.startsWith('/admin') ||
          returnTo.startsWith('/user-') ||
          returnTo.startsWith('/skill-') ||
          returnTo.startsWith('/audit') ||
          returnTo.startsWith('/settings'))
      ) {
        targetPath = returnTo;
      } else if (
        authenticatedUser.roleCodes.includes('ROLE_RECRUITER') &&
        returnTo.startsWith('/recruiter')
      ) {
        targetPath = returnTo;
      } else if (
        authenticatedUser.roleCodes.includes('ROLE_CANDIDATE') &&
        (returnTo.startsWith('/my-applications') ||
          returnTo.startsWith('/explore-jobs') ||
          returnTo.startsWith('/profile-') ||
          returnTo.startsWith('/interviews-') ||
          returnTo.startsWith('/settings_candidate') ||
          returnTo.startsWith('/offers/'))
      ) {
        targetPath = returnTo;
      }
    }

    navigate(targetPath, { replace: true });
  };

  // If user is already authenticated, redirect them automatically to their workspace
  useEffect(() => {
    if (status === 'authenticated' && user) {
      routeByRole(user);
    }
  }, [status, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const loggedInUser = await login({ email: email.trim(), password });
      routeByRole(loggedInUser);
    } catch (err: any) {
      setErrorMessage(err.message || 'Email hoặc mật khẩu không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-slate-100">
      <Card className="max-w-md w-full p-8 space-y-6 bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-2xl mb-1 ring-1 ring-emerald-500/40">
            SR
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">SmartRecruit Platform</h1>
          <p className="text-sm text-slate-400">
            Đăng nhập hệ thống tuyển dụng thông minh có trách nhiệm
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 text-sm rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-start gap-2">
            <span className="font-bold">!</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Địa chỉ Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nhap-email@smartrecruit.local"
              required
              disabled={loading}
              className="bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Mật khẩu</label>
              <Link
                to="/forgot-password"
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              disabled={loading}
              className="bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full py-2.5 font-medium bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 cursor-pointer"
          >
            {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
          </Button>
        </form>

        {/* Demo Accounts Reference Guide */}
        <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 text-[11px] text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">Tài khoản kiểm thử mẫu:</p>
          <div className="space-y-0.5 text-slate-400 font-mono text-[10px]">
            <p>• Admin: <span className="text-indigo-300">admin@smartrecruit.local</span></p>
            <p>• Recruiter: <span className="text-blue-300">recruiter@smartrecruit.local</span></p>
            <p>• Ứng viên: <span className="text-emerald-300">candidate@smartrecruit.local</span></p>
            <p className="text-slate-500 font-sans mt-0.5">Mật khẩu chung: <span className="text-slate-300 font-mono">SecurePassword123!</span></p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 text-center text-xs text-slate-400">
          Chưa có tài khoản ứng viên?{' '}
          <Link
            to="/register"
            className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Đăng ký ngay
          </Link>
        </div>
      </Card>
    </div>
  );
}
