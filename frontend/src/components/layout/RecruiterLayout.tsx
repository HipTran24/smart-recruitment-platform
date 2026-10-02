import { Outlet } from 'react-router-dom';
import { RecruiterSidebar } from './RecruiterSidebar';

export function RecruiterLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      <RecruiterSidebar />
      <main className="ml-64 flex-1 min-w-0 min-h-screen bg-slate-50">
        <Outlet />
      </main>
    </div>
  );
}
