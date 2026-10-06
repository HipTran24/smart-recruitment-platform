import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_ACCOUNTS } from '../../auth/AuthContext';

interface RoleSwitcherProps {
  variant?: 'sidebar' | 'header' | 'inline';
  className?: string;
  onSwitched?: () => void;
}

export function RoleSwitcher({ variant = 'sidebar', className = '', onSwitched }: RoleSwitcherProps) {
  const { user, quickSwitch, logout } = useAuth();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState<string | null>(null);

  const currentRole = user?.roleCodes.includes('ROLE_PLATFORM_ADMIN')
    ? 'admin'
    : user?.roleCodes.includes('ROLE_RECRUITER')
    ? 'recruiter'
    : 'candidate';

  const handleSwitch = async (targetRole: 'admin' | 'recruiter' | 'candidate') => {
    if (targetRole === currentRole) return;
    try {
      setSwitching(targetRole);
      const targetPath = await quickSwitch(targetRole);
      onSwitched?.();
      navigate(targetPath, { replace: true });
    } catch (err) {
      console.error('Failed to switch role', err);
    } finally {
      setSwitching(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Failed to logout', err);
    }
  };

  if (variant === 'header') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
          <button
            type="button"
            disabled={switching !== null}
            onClick={() => handleSwitch('admin')}
            title="Đăng nhập tài khoản Admin: admin@smartrecruit.local"
            className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
              currentRole === 'admin'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700'
            }`}
          >
            {switching === 'admin' ? '...' : 'Admin'}
          </button>
          <button
            type="button"
            disabled={switching !== null}
            onClick={() => handleSwitch('recruiter')}
            title="Đăng nhập tài khoản Recruiter: recruiter@smartrecruit.local"
            className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
              currentRole === 'recruiter'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700'
            }`}
          >
            {switching === 'recruiter' ? '...' : 'Recruiter'}
          </button>
          <button
            type="button"
            disabled={switching !== null}
            onClick={() => handleSwitch('candidate')}
            title="Đăng nhập tài khoản Candidate: candidate@smartrecruit.local"
            className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
              currentRole === 'candidate'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700'
            }`}
          >
            {switching === 'candidate' ? '...' : 'Candidate'}
          </button>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          title="Đăng xuất khỏi hệ thống"
          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    );
  }

  // Sidebar variant (default)
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Phân Quyền Vận Hành (Demo Switcher)
        </span>
        {switching && (
          <span className="text-[10px] text-blue-500 animate-pulse font-medium">Đang chuyển...</span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
        <button
          type="button"
          disabled={switching !== null}
          onClick={() => handleSwitch('admin')}
          className={`py-1.5 px-2 rounded-md text-[11px] font-semibold text-center transition cursor-pointer ${
            currentRole === 'admin'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/80'
          }`}
        >
          {switching === 'admin' ? '...' : 'Admin'}
        </button>
        <button
          type="button"
          disabled={switching !== null}
          onClick={() => handleSwitch('recruiter')}
          className={`py-1.5 px-2 rounded-md text-[11px] font-semibold text-center transition cursor-pointer ${
            currentRole === 'recruiter'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/80'
          }`}
        >
          {switching === 'recruiter' ? '...' : 'Recruiter'}
        </button>
        <button
          type="button"
          disabled={switching !== null}
          onClick={() => handleSwitch('candidate')}
          className={`py-1.5 px-2 rounded-md text-[11px] font-semibold text-center transition cursor-pointer ${
            currentRole === 'candidate'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/80'
          }`}
        >
          {switching === 'candidate' ? '...' : 'Ứng Viên'}
        </button>
      </div>

      {/* User info & Logout */}
      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
              currentRole === 'admin'
                ? 'bg-indigo-600'
                : currentRole === 'recruiter'
                ? 'bg-blue-600'
                : 'bg-emerald-600'
            }`}
          >
            {user?.fullName?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight">
              {user?.fullName || DEMO_ACCOUNTS[currentRole].label}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {user?.email || DEMO_ACCOUNTS[currentRole].email}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          title="Đăng xuất tài khoản"
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition cursor-pointer shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  );
}
