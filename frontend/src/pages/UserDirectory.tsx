import { useEffect, useState } from 'react';
import { MetricCard } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { Avatar } from '../components/ui/Avatar';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { Pagination } from '../components/ui/Pagination';
import { mockUsers } from '../data/mock';
import type { User } from '../types';
import { adminService } from '../services/admin.service';

const tabs = ['All', 'Admins', 'Recruiters', 'Suspended'];

const roleColors: Record<string, string> = {
  'System Admin': 'bg-red-500/20 text-red-300 border border-red-500/30',
  'Lead Recruiter': 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  'Hiring Manager': 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
  'Candidate': 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
  'External Recruiter': 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  'Admin': 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
};

const roleDistribution = [
  { label: 'Candidate / Jobseeker', count: 1120, percentage: 89.7, color: 'bg-indigo-500' },
  { label: 'Recruiter & Hiring Manager', count: 68, percentage: 5.5, color: 'bg-green-500' },
  { label: 'Suspended / Pending Verification', count: 56, percentage: 4.5, color: 'bg-yellow-500' },
  { label: 'System Administrator (Superuser)', count: 4, percentage: 0.3, color: 'bg-orange-500' },
];

export default function UserDirectory() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [totalCount, setTotalCount] = useState<number>(mockUsers.length);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadUsers() {
      try {
        setLoading(true);
        const res = await adminService.getUsers({ page: page - 1, size: 20 });
        if (!cancelled && res.items && res.items.length > 0) {
          const mapped: User[] = res.items.map(u => ({
            id: String(u.id),
            name: u.fullName,
            email: u.email,
            role: u.roles.includes('ROLE_PLATFORM_ADMIN')
              ? 'Admin'
              : u.roles.includes('ROLE_RECRUITER')
              ? 'Recruiter'
              : 'Candidate',
            status: u.active ? 'Active' : 'Suspended',
            avatarInitials: u.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U',
            avatarColor: '#6366f1',
            authProvider: 'Password + MFA',
            lastLogin: 'Today',
            lastActivity: 'Active',
            createdAt: u.createdAt,
          }));
          setUsers(mapped);
          setTotalCount(res.total);
        }
      } catch {
        // Fallback retained
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadUsers();
    return () => { cancelled = true; };
  }, [page]);

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (row: User) => (
        <div className="flex items-center gap-2.5">
          <Avatar initials={row.avatarInitials} color={row.avatarColor} size="sm" />
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-white">{row.name}</p>
              {row.id === '1' && <span className="text-xs bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded">You</span>}
            </div>
            <p className="text-xs text-zinc-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Assigned Role',
      render: (row: User) => (
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleColors[row.role] ?? 'bg-zinc-700 text-zinc-300'}`}>
          {row.role}
        </span>
      ),
    },
    {
      key: 'authProvider',
      header: 'Auth Provider',
      render: (row: User) => row.authProvider ? (
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          {row.authProvider}
        </div>
      ) : <span className="text-zinc-600 text-xs">—</span>,
    },
    {
      key: 'status',
      header: 'Account Status',
      render: (row: User) => (
        <StatusBadge variant={row.status.toLowerCase()} label={row.status} dot />
      ),
    },
    {
      key: 'lastActivity',
      header: 'Last Activity',
      render: (row: User) => <span className="text-xs text-zinc-500">{row.lastActivity ?? row.lastLogin}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: User) => row.id === '5' || row.id === '11' ? (
        <Button variant="outline" size="sm">Unlock</Button>
      ) : row.id === '1' ? (
        <span className="text-xs text-zinc-500">Self-change locked</span>
      ) : (
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
          <h1 className="text-3xl font-bold text-white font-['Geist',sans-serif]">User Directory & Access Governance</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage system accounts, RBAC role assignments, and governance audit records.</p>
        </div>
        <Button icon={<span>+</span>}>Provision user</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Users" value="1,248" change="+14 this week" changePositive />
        <MetricCard label="Candidate Accounts" value="1,120" subtitle="89.7% of base" />
        <MetricCard label="Recruiters" value="68" subtitle="12 active pods" />
        <MetricCard label="System Admins" value="4" badge="Guard active" badgeColor="bg-yellow-500/20 text-yellow-400 border-yellow-500/30" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Role distribution */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-white">Role Distribution & Governance</h2>
            <span className="text-xs text-zinc-500">Total 1,246 accounts</span>
          </div>
          <p className="text-xs text-zinc-500 mb-4">Authorization breakdown across tenant role tiers</p>
          <div className="flex flex-col gap-3">
            {roleDistribution.map(r => (
              <div key={r.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-zinc-300">{r.label}</span>
                  <span className="text-xs text-zinc-500">{r.count.toLocaleString()} ({r.percentage}%)</span>
                </div>
                <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                  <div className={`h-full ${r.color} rounded-full`} style={{ width: `${r.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Compliance Alerts */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-1">Security & Compliance Alerts</h2>
          <p className="text-xs text-zinc-500 mb-4">Automated policy checks requiring admin action</p>
          <div className="flex flex-col gap-2">
            {[
              { label: '3 failed MFA attempts detected', sub: 'Account locked for user: david.s@partner.com', color: 'bg-red-500' },
              { label: 'Privilege elevation request', sub: 'Harriet Lawrence requested Lead Recruiter tier', color: 'bg-orange-500' },
              { label: 'Quarterly Access Review due', sub: 'SOC2 audit cycle expires in 5 calendar days', color: 'bg-yellow-500' },
            ].map(alert => (
              <div key={alert.label} className="flex items-center justify-between bg-[#111] border border-[#2a2a2a] rounded-lg px-4 py-3">
                <div className="flex items-start gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${alert.color} mt-1.5 shrink-0`} />
                  <div>
                    <p className="text-xs font-medium text-white">{alert.label}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{alert.sub}</p>
                  </div>
                </div>
                <svg className="w-3.5 h-3.5 text-zinc-500 shrink-0 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active User Directory */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Active User Directory</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Enterprise accounts, Single Sign-On providers, and privilege assignments</p>
          </div>
          <div className="flex gap-1 flex-wrap">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${activeTab === tab ? 'bg-[#2a2a2a] text-white font-medium' : 'text-zinc-500 hover:text-zinc-200'}`}
              >
                {tab}
              </button>
            ))}
            <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-400 border border-[#2a2a2a] rounded-lg hover:text-white transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </button>
          </div>
        </div>

        <DataTable columns={columns} data={users.slice(0, 10)} keyFn={r => r.id} />
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(totalCount / 10) || 1}
          totalItems={totalCount}
          pageSize={10}
          onPageChange={setPage}
          label={`Showing ${users.length > 0 ? (page - 1) * 10 + 1 : 0}–${Math.min(page * 10, totalCount)} of ${totalCount} directory records`}
        />
      </div>
    </div>
  );
}
