import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { CandidateSidebar } from "./CandidateSidebar"; // Đường dẫn trỏ tới component Sidebar bạn vừa gửi

export function CandidateLayout() {
  const location = useLocation();
  const navigate = useNavigate();
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
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      <CandidateSidebar
        isSettingsOpen={isSettingsOpen}
        onSettingsClick={handleSettingsClick}
      />

      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-slate-50">
        <Outlet />
      </main>
    </div>
  );
}
