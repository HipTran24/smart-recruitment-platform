export default function ViewDetails() {
  return <CandidatePagePlaceholder title="Application Details" />;
}

function CandidatePagePlaceholder({ title }: { title: string }) {
  return (
    <section className="min-h-screen bg-slate-50 p-8">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">Candidate workspace</p>
    </section>
  );
}
