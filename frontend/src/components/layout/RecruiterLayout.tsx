import { Outlet } from 'react-router-dom';
import { RecruiterSidebar } from './RecruiterSidebar';

export function RecruiterLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <RecruiterSidebar />
      <main className="ml-64 min-h-screen">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
