import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { sanitizeReturnUrl } from '../../auth/guards';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const rawReturnTo = searchParams.get('returnTo');
  const returnTo = sanitizeReturnUrl(rawReturnTo);

  const routeByRole = (user: { roleCodes: string[] }) => {
    let userHome = '/my-applications';
    if (user.roleCodes.includes('ROLE_PLATFORM_ADMIN')) {
      userHome = '/admin-console';
    } else if (user.roleCodes.includes('ROLE_RECRUITER')) {
      userHome = '/recruiter/console';
    }

    let targetPath = userHome;
    if (returnTo && returnTo !== '/') {
      if (
        user.roleCodes.includes('ROLE_PLATFORM_ADMIN') &&
        (returnTo.startsWith('/admin') ||
          returnTo.startsWith('/user-') ||
          returnTo.startsWith('/skill-') ||
          returnTo.startsWith('/audit') ||
          returnTo.startsWith('/settings'))
      ) {
        targetPath = returnTo;
      } else if (user.roleCodes.includes('ROLE_RECRUITER') && returnTo.startsWith('/recruiter')) {
        targetPath = returnTo;
      } else if (
        user.roleCodes.includes('ROLE_CANDIDATE') &&
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const user = await login({ email, password });
      routeByRole(user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Email hoặc mật khẩu không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('SecurePassword123!');
    setLoading(true);
    setErrorMessage(null);

    try {
      const user = await login({ email: demoEmail, password: 'SecurePassword123!' });
      routeByRole(user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Đăng nhập nhanh thất bại.');
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

        {/* Quick Demo Switcher */}
        <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">⚡ Đăng nhập 1-Click theo vai trò:</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Demo Ready</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('admin@smartrecruit.local')}
              className="flex flex-col items-center justify-center p-2 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-white transition-all text-center cursor-pointer group"
            >
              <span className="text-base group-hover:scale-110 transition-transform">🛡️</span>
              <span className="text-[11px] font-bold mt-1 text-slate-200">Admin</span>
              <span className="text-[9px] text-slate-400">Quản trị</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('recruiter@smartrecruit.local')}
              className="flex flex-col items-center justify-center p-2 rounded-lg bg-blue-950/60 hover:bg-blue-900/70 border border-blue-700/60 text-white transition-all text-center cursor-pointer group"
            >
              <span className="text-base group-hover:scale-110 transition-transform">👔</span>
              <span className="text-[11px] font-bold mt-1 text-blue-200">Recruiter</span>
              <span className="text-[9px] text-blue-300/80">Tuyển dụng</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('candidate@smartrecruit.local')}
              className="flex flex-col items-center justify-center p-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-700/60 text-white transition-all text-center cursor-pointer group"
            >
              <span className="text-base group-hover:scale-110 transition-transform">👤</span>
              <span className="text-[11px] font-bold mt-1 text-emerald-200">Candidate</span>
              <span className="text-[9px] text-emerald-300/80">Ứng viên</span>
            </button>
          </div>
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
              placeholder="ten@smartrecruit.internal"
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
            className="w-full py-2.5 font-medium bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30"
          >
            {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
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
