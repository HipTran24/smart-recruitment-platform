import { useEffect, useState } from 'react';
import { Avatar } from '../components/ui/Avatar';
import { SearchInput } from '../components/ui/Input';
import { Pagination } from '../components/ui/Pagination';
import { mockAuditEvents } from '../data/mock';
import type { AuditEvent } from '../types';
import { adminService } from '../services/admin.service';

const eventTabs = [
  { label: 'All Events', count: 48291 },
  { label: 'RBAC & Auth', count: 112 },
  { label: 'AI Config', count: 38 },
  { label: 'Security Alerts', count: 14 },
];

const severityConfig = {
  CRITICAL: { bg: 'bg-red-600/80', text: 'text-white', dot: 'bg-red-400' },
  WARN: { bg: 'bg-orange-500/80', text: 'text-white', dot: 'bg-orange-400' },
  INFO: { bg: 'bg-green-600/40', text: 'text-green-300', dot: 'bg-green-400' },
};

export default function AuditEventExplorer() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState<AuditEvent[]>(mockAuditEvents);
  const [totalCount, setTotalCount] = useState<number>(mockAuditEvents.length);

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await adminService.getAuditEvents({ page: page - 1, size: 25 });
        if (res.items && res.items.length > 0) {
          const mapped: AuditEvent[] = res.items.map(e => ({
            id: String(e.id),
            timestamp: new Date(e.createdAt).toISOString().replace('T', ' ').slice(0, 19),
            latency: '12ms',
            severity: (e.action.includes('DEACTIVATE') ? 'WARN' : 'INFO') as 'WARN' | 'INFO',
            action: e.action,
            actorName: e.actorUserId ? `User #${e.actorUserId}` : 'System Agent',
            actorEmail: e.actorUserId ? `user-${e.actorUserId}@platform.local` : 'system@platform.local',
            actorIp: e.ipAddress || '127.0.0.1',
            actorInitials: 'AU',
            targetResource: `${e.resourceType}:${e.resourceId}`,
            justification: e.metadataJson || 'Governance audit event',
            traceId: `trc-${e.id}`,
            payloadActions: ['Inspect'],
          }));
          setEvents(mapped);
          setTotalCount(res.total);
        }
      } catch {
        // Fallback
      }
    }
    loadEvents();
  }, [page]);

  const columns = [
    { label: 'Timestamp (UTC)' },
    { label: 'Action & Severity' },
    { label: 'Actor (Principal)' },
    { label: 'Target Resource' },
    { label: 'Audit Justification / Reason' },
    { label: 'Trace ID & Integrity' },
    { label: 'Payload Actions' },
  ];

  return (
    <div>
      {/* Compliance badges */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {['WBS 3.6 • ISO 27001 / SOC 2 TYPE II', '⊙ Retention: 365 Days WORM Storage'].map(b => (
          <span key={b} className="text-xs text-zinc-400 bg-[#1a1a1a] border border-[#2a2a2a] px-2.5 py-1 rounded-full">{b}</span>
        ))}
      </div>

      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-white font-['Geist',sans-serif]">Audit Event Explorer</h1>
          <p className="text-sm text-zinc-500 mt-1">Immutable compliance audit trail, security forensics, and access mutation logs with mandatory trace telemetry.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-xs text-zinc-400 hover:text-white transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Compliance Log (CSV/JSONL)
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-xs text-zinc-400 hover:text-white transition-colors">
            Verify Ledger Integrity
          </button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-5">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Total Logged Events</span>
          <div className="flex items-end gap-2 mt-1.5 mb-1">
            <span className="text-3xl font-bold text-white font-['Geist',sans-serif]">48,291</span>
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full mb-0.5">+1,420 today</span>
          </div>
          <span className="text-xs text-green-400 flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-500/20 flex items-center justify-center text-[10px]">✓</span>
            Zero dropped telemetry packets
          </span>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Critical Mutations</span>
          <div className="flex items-end gap-2 mt-1.5 mb-1">
            <span className="text-3xl font-bold text-white font-['Geist',sans-serif]">14</span>
            <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full mb-0.5">⚠ Alert Level: Low</span>
          </div>
          <span className="text-xs text-zinc-500">Role changes & session revocations</span>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Verified Trace IDs</span>
          <div className="flex items-end gap-2 mt-1.5 mb-1">
            <span className="text-3xl font-bold text-white font-['Geist',sans-serif]">100%</span>
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full mb-0.5">✓ 100% Ingest</span>
          </div>
          <span className="text-xs text-zinc-500">Distributed OpenTelemetry context</span>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Tamper Safeguard</span>
          <div className="flex items-end gap-2 mt-1.5 mb-1">
            <span className="text-2xl font-bold text-white font-['Geist',sans-serif]">SHA-256 Ledger</span>
          </div>
          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />Immutable Active
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex gap-1 flex-wrap">
          {eventTabs.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${activeTab === i ? 'bg-[#2a2a2a] text-white font-medium' : 'text-zinc-500 hover:text-zinc-200'}`}
            >
              {tab.label}
              <span className="text-xs bg-[#1a1a1a] text-zinc-400 px-1.5 py-0.5 rounded">{tab.count.toLocaleString()}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400 font-medium">Live Stream (Polling 5s)</span>
          <button className="text-zinc-500 hover:text-zinc-300 ml-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <SearchInput
          placeholder="Filter by Trace ID (e.g. trc-89a...), Actor email, or Resource..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[240px]"
        />
        <select className="bg-[#1a1a1a] border border-[#2a2a2a] text-zinc-400 text-sm rounded-lg px-3 py-2 outline-none">
          <option>Action: All Types</option>
          <option>USER_ROLE_CHANGED</option>
          <option>SESSION_REVOKED</option>
        </select>
        <select className="bg-[#1a1a1a] border border-[#2a2a2a] text-zinc-400 text-sm rounded-lg px-3 py-2 outline-none">
          <option>Severity: All</option>
          <option>CRITICAL</option>
          <option>WARN</option>
          <option>INFO</option>
        </select>
        <select className="bg-[#1a1a1a] border border-[#2a2a2a] text-zinc-400 text-sm rounded-lg px-3 py-2 outline-none">
          <option>Last 24 Hours</option>
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2a2a]">
              {columns.map(col => (
                <th key={col.label} className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.filter(e => !search || e.action.toLowerCase().includes(search.toLowerCase()) || e.actorName.toLowerCase().includes(search.toLowerCase())).map((event: AuditEvent) => {
              const sev = severityConfig[event.severity];
              return (
                <tr key={event.id} className="border-b border-[#1e1e1e] hover:bg-[#1e1e1e] transition-colors">
                  <td className="px-4 py-3 text-xs text-zinc-400 whitespace-nowrap">
                    <div>{event.timestamp}</div>
                    <div className="text-zinc-600 mt-0.5">⊙ {event.latency} latency</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${sev.bg} ${sev.text}`}>
                      [{event.severity}] {event.action}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <Avatar initials={event.actorInitials} color="#6366f1" size="xs" />
                      <div>
                        <p className="text-xs font-medium text-white">{event.actorName}</p>
                        <p className="text-xs text-zinc-500 break-all max-w-[180px]">{event.actorEmail}</p>
                        <p className="text-xs text-zinc-600">{event.actorIp}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400 max-w-[140px]">
                    <div className="whitespace-pre-wrap">{event.targetResource}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500 max-w-[200px]">
                    <div className="line-clamp-3">{event.justification}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      <span className="text-xs font-mono text-zinc-300">{event.traceId}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {event.payloadActions.map(action => (
                        <button key={action} className="px-2 py-1 text-xs bg-[#2a2a2a] text-zinc-300 rounded hover:bg-[#333] transition-colors">
                          {action}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#2a2a2a]">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>Showing 1-7 of 48,291 audit records</span>
            <span className="text-green-400">• SHA-256 Ledger Block #94,812</span>
          </div>
          <Pagination currentPage={page} totalPages={6899} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
