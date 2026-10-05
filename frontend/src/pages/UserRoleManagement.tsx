import { useEffect, useState } from 'react';
import { MetricCard } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { Avatar } from '../components/ui/Avatar';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Pagination } from '../components/ui/Pagination';
import { mockUsers } from '../data/mock';
import type { User } from '../types';
import { adminService } from '../services/admin.service';

export default function UserRoleManagement() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [totalCount, setTotalCount] = useState<number>(mockUsers.length);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const roleParam = roleFilter === 'Admin' ? 'ROLE_PLATFORM_ADMIN' : roleFilter === 'Recruiter' ? 'ROLE_RECRUITER' : roleFilter === 'Candidate' ? 'ROLE_CANDIDATE' : undefined;
      const activeParam = statusFilter === 'Active' ? true : statusFilter === 'Suspended' ? false : undefined;
      const res = await adminService.getUsers({
        keyword: search || undefined,
        role: roleParam,
        active: activeParam,
        page: page - 1,
        size: 20
      });
      if (res.items && res.items.length > 0) {
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
          lastActivity: 'Active',
          lastLogin: 'Today',
          createdAt: u.createdAt,
          complianceFlags: [],
        }));
        setUsers(mapped);
        setTotalCount(res.total);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter, page]);

  const handleToggleStatus = async (user: User) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      const newActive = user.status !== 'Active';
      await adminService.updateUserStatus(user.id, newActive);
      setActionSuccess(`User ${user.name} status updated to ${newActive ? 'Active' : 'Suspended'}.`);
      fetchUsers();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update user status.');
    }
  };

  const filtered = users;

  const roleOptions = [
    { value: 'All', label: 'All' },
    { value: 'Admin', label: 'Admin' },
    { value: 'Recruiter', label: 'Recruiter' },
    { value: 'Candidate', label: 'Candidate' },
    { value: 'System Admin', label: 'System Admin' },
  ];

  const statusOptions = [
    { value: 'All', label: 'All' },
    { value: 'Active', label: 'Active' },
    { value: 'Suspended', label: 'Suspended' },
    { value: 'Pending', label: 'Pending' },
  ];

  const roleBadgeClasses: Record<string, string> = {
    Admin: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
    Recruiter: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    Candidate: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
    'Lead Recruiter': 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    'Hiring Manager': 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
    'External Recruiter': 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  };

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (row: User) => (
        <div className="flex items-center gap-2.5">
          <Avatar initials={row.avatarInitials} color={row.avatarColor} size="sm" />
          <div>
            <p className="text-sm font-medium text-white">{row.name}</p>
            <p className="text-xs text-zinc-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (row: User) => (
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleBadgeClasses[row.role] ?? 'bg-zinc-700 text-zinc-300'}`}>
          {row.role}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: User) => <StatusBadge variant={row.status.toLowerCase()} label={row.status} dot />,
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      render: (row: User) => <span className="text-xs text-zinc-500">{row.lastLogin}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: User) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleToggleStatus(row)}
        >
          {row.status === 'Active' ? 'Suspend' : 'Activate'}
        </Button>
      ),
    },
  ];

  return (
    <div>
      {actionError && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-sm text-red-200">
          ⚠️ {actionError}
        </div>
      )}
      {actionSuccess && (
        <div className="mb-4 p-3 bg-emerald-900/50 border border-emerald-500 rounded-lg text-sm text-emerald-200">
          ✓ {actionSuccess}
        </div>
      )}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white font-['Geist',sans-serif]">User & Role Management</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage access control and security permissions with audit logs</p>
        </div>
        <Button icon={<span>+</span>}>Add New User</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Users" value="12,486" change="+184 this month" changePositive />
        <MetricCard label="Recruiters" value="348" subtitle="326 active" />
        <MetricCard label="Candidates" value="12,126" subtitle="96.8% verified" />
        <MetricCard label="Active Admins" value="12" subtitle="Last active admin is protected"
          icon={<svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
        />
      </div>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
        {/* Search & filters */}
        <div className="px-5 pt-5 pb-3 flex flex-wrap items-center gap-3">
          <SearchInput
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
          <Select
            options={roleOptions}
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="w-32"
          />
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-32"
          />
        </div>

        {/* Role change warning */}
        <div className="mx-5 mb-3 flex items-center justify-between bg-orange-500/10 border border-orange-500/20 rounded-lg px-4 py-2.5">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-orange-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-xs text-orange-300">Role changes require a mandatory audit reason and immediately revoke sessions.</span>
          </div>
          <button className="text-xs text-orange-400 hover:text-orange-300 transition-colors whitespace-nowrap ml-4">View policy →</button>
        </div>

        <DataTable columns={columns} data={filtered} keyFn={r => r.id} />
        <Pagination
          currentPage={page}
          totalPages={2081}
          totalItems={12486}
          pageSize={6}
          onPageChange={setPage}
          label={`Showing 1–6 of ${filtered.length === mockUsers.length ? '12,486' : filtered.length} users`}
        />
      </div>
    </div>
  );
}
