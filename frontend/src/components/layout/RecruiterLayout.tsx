import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { RecruiterSidebar } from './RecruiterSidebar';
import { RoleSwitcher } from './RoleSwitcher';

export function RecruiterLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="theme-recruiter min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-primary)] flex">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Recruiter Sidebar with responsive drawer */}
      <RecruiterSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 lg:ml-64 flex flex-col min-h-screen bg-[var(--color-canvas)]">
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
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                S
              </div>
              <span className="font-bold text-sm text-slate-900">SmartRecruit</span>
              <span className="text-[10px] font-semibold text-blue-600 px-1.5 py-0.5 bg-blue-50 rounded">Recruiter</span>
            </div>
          </div>

          <RoleSwitcher variant="header" />
        </header>

        <main className="flex-1 min-w-0 bg-[var(--color-canvas)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
