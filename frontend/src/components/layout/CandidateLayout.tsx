import { Outlet } from "react-router-dom";
import { CandidateSidebar } from "./CandidateSidebar"; // Đường dẫn trỏ tới component Sidebar bạn vừa gửi

export function CandidateLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      <CandidateSidebar />

      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-slate-50">
        <Outlet />
      </main>
    </div>
  );
}
