import { useState } from 'react';
import { MetricCard } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { Avatar } from '../components/ui/Avatar';
import { StatusBadge, applicationStageBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { mockApplications, mockPipeline, mockAttentionItems } from '../data/mock';
import type { Application } from '../types';

function MatchBadge({ score }: { score: number }) {
  const color = score >= 90 ? 'bg-green-500' : score >= 80 ? 'bg-green-500/80' : score >= 70 ? 'bg-yellow-500' : 'bg-orange-500';
  return (
    <span className={`${color} text-black text-xs font-bold px-2.5 py-1 rounded-full`}>
      {score}% Match
    </span>
  );
}

export default function RecruiterDashboard() {
  const [, setPage] = useState(1);

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
    {
      key: 'role',
      header: 'Role',
      render: (row: Application) => <span className="text-sm text-zinc-300">{row.role}</span>,
    },
    {
      key: 'matchScore',
      header: 'Match Score',
      render: (row: Application) => <MatchBadge score={row.matchScore} />,
    },
    {
      key: 'stage',
      header: 'Status',
      render: (row: Application) => applicationStageBadge(row.stage),
    },
    {
      key: 'lastActive',
      header: 'Last Activity',
      render: (row: Application) => <span className="text-xs text-zinc-500">{row.lastActive}</span>,
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
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-500/60 font-['Geist',sans-serif]">Good morning, Alex</h1>
          <p className="text-sm text-zinc-500 mt-1">Here's what needs your attention today</p>
        </div>
        <Button icon={<span>+</span>}>Create job</Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Active Jobs" value="12" change="+2 this week" changePositive />
        <MetricCard label="New Candidates" value="48" change="+18%" changePositive />
        <MetricCard label="Pending Review" value="9" />
        <MetricCard label="Time to Hire" value="14.2 days" change="-1.6 days" changePositive />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Hiring pipeline */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
          <h2 className="text-base font-semibold text-white mb-1">Hiring pipeline</h2>
          <p className="text-xs text-zinc-500 mb-5">Conversion stage breakdown across all open positions</p>
          <div className="flex flex-col gap-4">
            {mockPipeline.map(stage => (
              <div key={stage.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-zinc-300">{stage.name}</span>
                  <span className="text-sm text-zinc-400">{stage.count} <span className="text-zinc-600">({stage.percentage}%)</span></span>
                </div>
                <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-zinc-400 rounded-full"
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Needs attention */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
          <h2 className="text-base font-semibold text-white mb-4">Needs attention</h2>
          <div className="flex flex-col gap-2">
            {mockAttentionItems.map(item => {
              const borderColor = item.urgency === 'red' ? 'border-red-500' : item.urgency === 'orange' ? 'border-orange-500' : 'border-zinc-600';
              return (
                <div key={item.id} className={`flex items-center justify-between bg-[#111] border border-[#2a2a2a] border-l-2 ${borderColor} rounded-lg px-4 py-3`}>
                  <div>
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{item.subtitle}</p>
                  </div>
                  <svg className="w-4 h-4 text-zinc-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              );
            })}
          </div>

          {/* DS System State Previews */}
          <div className="mt-4 bg-[#111] border border-[#2a2a2a] rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <svg className="w-3 h-3 text-zinc-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide">DS System State Previews</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Loading...
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                No data
              </div>
              <div className="flex items-center gap-1.5 text-xs text-red-400">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                API Error
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent candidates */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
        <div className="px-5 pt-5 pb-3">
          <h2 className="text-base font-semibold text-white">Recent candidates</h2>
          <p className="text-xs text-zinc-500 mt-0.5">A complete list of active applicants across top roles</p>
        </div>
        <DataTable
          columns={columns}
          data={mockApplications.slice(0, 3)}
          keyFn={r => r.id}
        />
        <div className="px-5 py-3 border-t border-[#2a2a2a] flex items-center justify-between">
          <span className="text-xs text-zinc-500">Showing 1–3 of 312 candidates</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1.5 text-xs text-zinc-400 border border-zinc-700 rounded-md hover:bg-zinc-800 transition-colors">Previous</button>
            <button onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-xs text-white bg-zinc-800 rounded-md hover:bg-zinc-700 transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* Status badges legend */}
      <div className="mt-4 flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <StatusBadge variant="active" label="Active" dot />
          <StatusBadge variant="interviewing" label="Interviewing" />
          <StatusBadge variant="offer" label="Offer Sent" />
          <StatusBadge variant="rejected" label="Rejected" />
        </div>
      </div>
    </div>
  );
}