import { useState } from 'react';
import { MetricCard } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Drawer } from '../components/ui/Drawer';
import { mockCandidates } from '../data/mock';
import type { Candidate } from '../types';

const filterTabs = ['All', 'High Match >85%', 'Interviewing', 'Needs Review'];

function MatchBadge({ score }: { score: number }) {
  const color = score >= 90 ? 'bg-green-500' : score >= 80 ? 'bg-green-400' : score >= 70 ? 'bg-yellow-500' : 'bg-orange-500';
  return <span className={`${color} text-black text-xs font-bold px-2.5 py-1 rounded-full`}>{score}% Match</span>;
}

export default function CandidateDirectory() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const columns = [
    {
      key: 'name',
      header: 'Candidate Name',
      render: (row: Candidate) => (
        <div className="flex items-center gap-2.5">
          <Avatar initials={row.initials} color={row.avatarColor} size="sm" />
          <div>
            <p className="text-sm font-medium text-white">{row.name}</p>
            <p className="text-xs text-zinc-500">{row.location}</p>
          </div>
        </div>
      ),
    },
    { key: 'appliedRole', header: 'Applied Role', render: (row: Candidate) => <span className="text-sm text-zinc-300">{row.appliedRole}</span> },
    { key: 'matchScore', header: 'AI Match Score', render: (row: Candidate) => <MatchBadge score={row.matchScore} /> },
    {
      key: 'keySkills',
      header: 'Key Skills',
      render: (row: Candidate) => (
        <div className="flex flex-wrap gap-1.5">
          {row.keySkills.map(s => (
            <span key={s} className="text-xs bg-[#2a2a2a] text-zinc-400 px-2 py-0.5 rounded-md">{s}</span>
          ))}
        </div>
      ),
    },
    {
      key: 'pipeline',
      header: 'Pipeline',
      render: () => (
        <div className="w-6 h-6 rounded-full border-2 border-orange-400 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-orange-400" />
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: () => (
        <button className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white font-['Geist',sans-serif]">Candidates Directory</h1>
          <p className="text-sm text-zinc-500 mt-1">Review applicant dossiers, AI match scores, and hiring stages</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </Button>
          <Button icon={<span>+</span>}>Add candidate</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Applicants" value="184" change="+24 this week" changePositive />
        <MetricCard label="AI-Screened" value="142" subtitle="Ready" />
        <MetricCard label="In Interview" value="28" subtitle="Active stages" />
        <MetricCard label="Offers Extended" value="6" subtitle="92% accepted" />
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {filterTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${activeFilter === tab ? 'bg-[#2a2a2a] text-white font-medium' : 'text-zinc-500 hover:text-zinc-200 border border-[#2a2a2a]'}`}
          >
            {tab === 'High Match >85%' && activeFilter === tab && <span className="mr-1.5 bg-zinc-600 text-zinc-200 text-xs px-1.5 rounded">18</span>}
            {tab}
          </button>
        ))}
        <div className="flex items-center gap-2 ml-auto">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-400 border border-[#2a2a2a] rounded-lg hover:text-white transition-colors">
            Role: All Product & Design
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <span className="text-xs text-zinc-500">Sort: Match</span>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 min-w-0 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
          <DataTable
            columns={columns}
            data={mockCandidates}
            keyFn={r => r.id}
            onRowClick={row => setSelectedCandidate(row)}
          />
        </div>
      </div>

      {/* AI Match Details Drawer */}
      <Drawer
        open={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        title="AI Match Details"
        width="w-80"
      >
        {selectedCandidate && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <Avatar initials={selectedCandidate.initials} color={selectedCandidate.avatarColor} size="lg" />
              <div>
                <p className="font-semibold text-white text-sm">{selectedCandidate.name}</p>
                <p className="text-xs text-zinc-500">Applied: {selectedCandidate.appliedRole}</p>
              </div>
            </div>

            <div className="bg-[#111] rounded-xl p-4 flex items-center gap-3">
              <span className="text-3xl font-bold text-white">{selectedCandidate.matchScore}%</span>
              <div>
                <p className="text-sm font-semibold text-white">Excellent Match Profile</p>
                <p className="text-xs text-zinc-500">Top 5% of candidate pool</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Match Breakdown</p>
              {[
                { label: 'Skill Alignment', value: 95 },
                { label: 'Experience Level', value: 90 },
                { label: 'Domain Expertise', value: 88 },
                { label: 'Interview Confidence', value: 92 },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-[#2a2a2a]">
                  <span className="text-sm text-zinc-300">{item.label}</span>
                  <span className="text-sm font-semibold text-white">{item.value}%</span>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Evaluation Notes</p>
              <div className="bg-[#111] rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-zinc-400">Alex Johnson (Recruiter)</span>
                  <span className="text-xs text-zinc-600">Today, 10:22 AM</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">Strong theoretical foundation in cognitive research. Harriet led complex qualitative labs in her previous role at Spotify. Perfect candidate for our research expansion.</p>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
