import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { CandidateSidebar } from "./CandidateSidebar";
import { useAuth } from "../../auth/AuthContext";

export function CandidateLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };
  const isSettingsOpen = location.pathname === "/settings_candidate";
  const from = (location.state as { from?: string } | null)?.from;
  const returnTo =
    from?.startsWith("/") &&
    !from.startsWith("//") &&
    from !== "/settings_candidate"
      ? from
      : "/my-applications";

  const handleSettingsClick = () => {
    if (isSettingsOpen) {
      navigate(returnTo, { replace: true });
      return;
    }

    navigate("/settings_candidate", {
      state: {
        from: `${location.pathname}${location.search}${location.hash}`,
      },
    });
  };

  return (
    <div className="theme-candidate flex h-screen overflow-hidden bg-[var(--color-canvas)] text-[var(--color-text-primary)]">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Candidate Sidebar with responsive drawer */}
      <CandidateSidebar
        isSettingsOpen={isSettingsOpen}
        onSettingsClick={handleSettingsClick}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Mobile Topbar */}
        <header className="lg:hidden sticky top-0 z-20 h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                S
              </div>
              <span className="font-bold text-sm text-slate-900">SmartRecruit</span>
              <span className="text-[10px] font-semibold text-emerald-600 px-1.5 py-0.5 bg-emerald-50 rounded">Candidate</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Đăng xuất khỏi hệ thống"
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </header>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-[var(--color-canvas)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
