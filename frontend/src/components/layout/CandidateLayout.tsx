import { Outlet } from "react-router-dom";

export default function CandidateLayout() {
  return (
    <div>
      <header>
        <h2>SmartRecruit Candidate</h2>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
