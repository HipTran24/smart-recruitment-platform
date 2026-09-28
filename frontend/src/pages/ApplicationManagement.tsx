import { useState } from 'react';
import { MetricCard } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { Avatar } from '../components/ui/Avatar';
import { StatusBadge, applicationStageBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/Input';
import { Pagination } from '../components/ui/Pagination';
import { mockApplications, mockAttentionItems } from '../data/mock';
import type { Application } from '../types';

function MatchBadge({ score }: { score: number }) {
  const color = score >= 90 ? 'bg-green-500' : score >= 80 ? 'bg-green-500/80' : score >= 70 ? 'bg-yellow-500' : 'bg-orange-500';
  return <span className={`${color} text-black text-xs font-bold px-2.5 py-1 rounded-full`}>{score}% Match</span>;
}

export default function ApplicationManagement() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [jobFilter] = useState('All');
  const [stageFilter] = useState('All Stages');

  const filtered = mockApplications.filter(a =>
    !search || a.candidateName.toLowerCase().includes(search.toLowerCase()) || a.role.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'candidate',
      header: 'Candidate',
      render: (row: Application) => (
        <div className="flex items-center gap-2.5">
          <Avatar initials={row.candidateInitials} color={row.avatarColor} size="sm" />
          <div>
            <p className="text-sm font-medium text-white">{row.candidateName}</p>
            <p className="text-xs text-zinc-500">{row.appliedAgo}</p>
          </div>
        </div>
      ),
    },
    { key: 'role', header: 'Role', render: (row: Application) => <span className="text-sm text-zinc-300">{row.role}</span> },
    { key: 'matchScore', header: 'Match', render: (row: Application) => <MatchBadge score={row.matchScore} /> },
    {
      key: 'stage',
      header: 'Stage',
      render: (row: Application) => (
        <div className="flex items-center gap-1.5">
          {applicationStageBadge(row.stage)}
          <svg className="w-3.5 h-3.5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </div>
      ),
    },
    { key: 'recruiter', header: 'Recruiter', render: (row: Application) => <span className="text-sm text-zinc-400">{row.recruiter}</span> },
    { key: 'lastActive', header: 'Last Active', render: (row: Application) => <span className="text-xs text-zinc-500">{row.lastActive}</span> },
    {
      key: 'actions',
      header: 'Actions',
      render: () => (
        <button className="text-zinc-500 hover:text-zinc-300">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white font-['Geist',sans-serif]">Application Management</h1>
          <p className="text-sm text-zinc-500 mt-1">Monitor and progress candidate applications across open roles</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">Export CSV</Button>
          <Button icon={<span>+</span>}>Create Application</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Applications" value="312" change="+24 this week" changePositive />
        <MetricCard label="Pending Review" value="42" badge="12 overdue" badgeColor="bg-red-500/20 text-red-400 border-red-500/30" />
        <MetricCard label="Interviews Scheduled" value="18" subtitle="6 today" />
        <MetricCard label="Offers Extended" value="5" badge="2 pending reply" badgeColor="bg-orange-500/20 text-orange-400 border-orange-500/30" />
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Main table */}
        <div className="flex-1 min-w-0">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
            <div className="px-5 pt-5 pb-3">
              <h2 className="text-sm font-semibold text-white">Active Applications</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Showing {filtered.length} of 312 current applicants</p>
            </div>
            {/* Filter row */}
            <div className="px-5 pb-3 flex flex-wrap items-center gap-2">
              <SearchInput
                placeholder="Search candidates, roles, or recruiters..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 min-w-[200px]"
              />
              <button className="px-3 py-2 bg-[#111] border border-[#2a2a2a] rounded-lg text-xs text-zinc-400 hover:text-white transition-colors">
                Job Opening: {jobFilter}
              </button>
              <button className="px-3 py-2 bg-[#111] border border-[#2a2a2a] rounded-lg text-xs text-zinc-400 hover:text-white transition-colors">
                Stage: {stageFilter}
              </button>
              <button className="px-3 py-2 bg-[#111] border border-[#2a2a2a] rounded-lg text-xs text-zinc-400 hover:text-white transition-colors">
                Recruiter: Alex
              </button>
              <button className="text-xs text-red-400 hover:text-red-300 transition-colors">Clear</button>
            </div>

            <DataTable columns={columns} data={filtered} keyFn={r => r.id} />
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(312 / 4)}
              totalItems={312}
              pageSize={4}
              onPageChange={setPage}
            />
          </div>
        </div>

        {/* Sidebar: Needs attention */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
            <h2 className="text-sm font-semibold text-white mb-3">Needs attention</h2>
            <div className="flex flex-col gap-2">
              {mockAttentionItems.map(item => {
                const borderColor = item.urgency === 'red' ? 'border-red-500' : item.urgency === 'orange' ? 'border-orange-500' : 'border-zinc-600';
                return (
                  <div key={item.id} className={`flex items-center justify-between bg-[#111] border border-[#2a2a2a] border-l-2 ${borderColor} rounded-lg px-3 py-2.5`}>
                    <div>
                      <p className="text-xs font-medium text-white">{item.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{item.subtitle}</p>
                    </div>
                    <svg className="w-3.5 h-3.5 text-zinc-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 bg-[#111] border border-[#2a2a2a] rounded-lg p-3">
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide mb-2">DS Sandbox Previews</p>
              <div className="flex flex-col gap-1.5">
                {[
                  { label: 'Loading candidates...', color: 'text-zinc-500' },
                  { label: 'No candidates found', color: 'text-zinc-500' },
                  { label: '▲ Sync Connection Lost', color: 'text-red-400' },
                ].map(s => (
                  <div key={s.label} className={`text-xs ${s.color} flex items-center gap-1.5`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                    {s.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
