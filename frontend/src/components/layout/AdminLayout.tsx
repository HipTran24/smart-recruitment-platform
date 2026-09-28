import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <Header />
      <main className="ml-[220px] pt-12 min-h-screen">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
