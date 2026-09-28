import { useState } from 'react';
import { MetricCard } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { Pagination } from '../components/ui/Pagination';
import { mockJobs } from '../data/mock';
import type { Job } from '../types';

const tabs = ['All', 'Published', 'Draft', 'Closed'];

export default function JobManagement() {
  const [activeTab, setActiveTab] = useState('All');
  const [sortBy] = useState('newest');
  const [page, setPage] = useState(1);

  const filtered = activeTab === 'All' ? mockJobs : mockJobs.filter(j => j.status.toLowerCase() === activeTab.toLowerCase());

  const columns = [
    {
      key: 'title',
      header: 'Job Title & Dept',
      render: (row: Job) => (
        <div>
          <p className="text-sm font-medium text-white">{row.title}</p>
          <p className="text-xs text-zinc-500">{row.type} • {row.department}</p>
        </div>
      ),
    },
    {
      key: 'skills',
      header: 'Required Skills',
      render: (row: Job) => (
        <div className="flex flex-wrap gap-1.5">
          {row.requiredSkills.map(s => (
            <span key={s} className="text-xs bg-[#2a2a2a] text-zinc-400 px-2 py-0.5 rounded-md">{s}</span>
          ))}
        </div>
      ),
    },
    {
      key: 'applicants',
      header: 'Applicants',
      render: (row: Job) => (
        <div>
          <p className="text-sm text-white font-medium">{row.applicantCount} Applied</p>
          {row.highMatchCount && (
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">{row.highMatchCount} High Match</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Job) => <StatusBadge variant={row.status.toLowerCase()} label={row.status} />,
    },
    {
      key: 'owner',
      header: 'Owner',
      render: (row: Job) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-semibold text-white">{row.ownerInitials}</div>
          <span className="text-sm text-zinc-300">{row.owner}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
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
          <h1 className="text-3xl font-bold text-white font-['Geist',sans-serif]">Job Postings</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage listings and candidate pipelines</p>
        </div>
        <Button icon={<span>+</span>}>Create job</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Active Jobs" value="12" badge="●" badgeColor="bg-green-500/20 text-green-400 border-green-500/30" />
        <MetricCard label="Total Applicants" value="148" badge="●" badgeColor="bg-blue-500/20 text-blue-400 border-blue-500/30" />
        <MetricCard
          label="Avg Match Rate"
          value="84%"
          icon={
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        <MetricCard label="Closing Soon" value="3" badge="Closing soon" badgeColor="bg-orange-500/20 text-orange-400 border-orange-500/30" icon={
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" strokeWidth="1.75" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 6v6l4 2" />
          </svg>
        } />
      </div>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
        {/* Tabs + sort */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#2a2a2a]">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${activeTab === tab ? 'bg-[#2a2a2a] text-white font-medium' : 'text-zinc-500 hover:text-zinc-200'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              className="bg-[#1a1a1a] border border-[#2a2a2a] text-zinc-400 text-sm rounded-lg px-3 py-1.5 outline-none"
              onChange={() => {}}
            >
              <option value="newest">Department</option>
              <option value="oldest">Oldest first</option>
            </select>
            <button className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              Sort by newest
            </button>
          </div>
        </div>

        <DataTable columns={columns} data={filtered} keyFn={r => r.id} />
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(filtered.length / 5) || 1}
          totalItems={filtered.length}
          pageSize={5}
          onPageChange={setPage}
          label={`Showing ${filtered.length} of ${mockJobs.length} jobs`}
        />
      </div>
    </div>
  );
}
