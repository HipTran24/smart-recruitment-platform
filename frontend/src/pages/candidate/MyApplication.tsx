import { MainArea } from "../../components/Candidate/MainArea";
import { Sidebar } from "../../components/Candidate/Sidebar";
export default function MyApplication() {
  return (
    <div className="flex min-h-screen items-start relative bg-slate-50">
      <Sidebar />
      <MainArea />
    </div>
  );
}
