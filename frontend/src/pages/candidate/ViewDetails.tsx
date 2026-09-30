export default function ViewDetails() {
  return <CandidatePagePlaceholder title="Application Details" />;
}

function CandidatePagePlaceholder({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="candidate-header">
        <nav className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-500">
          <span>Workspace</span>
          <span>/</span>
          <span>Candidate</span>
          <span>/</span>
          <span className="truncate font-semibold text-slate-900">{title}</span>
        </nav>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-slate-400 sm:inline">
            Candidate workspace
          </span>
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Live Sync
          </div>
        </div>
      </header>
      <section className="min-h-[calc(100vh-72px)] p-8">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">Candidate workspace</p>
      </section>
    </div>
  );
}
