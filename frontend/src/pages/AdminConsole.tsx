import { mockServiceHealth } from '../data/mock';
import type { ServiceHealth } from '../types';

const aiPipelineItems = [
  { label: 'Resume Parsing & Attribute Extraction', ops: '18,420 operations', pct: 54 },
  { label: 'Candidate Similarity Matching Vector Query', ops: '8,870 operations', pct: 26 },
  { label: 'OCR Ingestion (Multi-page PDF/DOCX)', ops: '4,780 operations', pct: 14 },
  { label: 'Third-party ATS & Webhook Payloads', ops: '2,045 calls', pct: 6 },
];

const securityGuardrails = [
  { title: 'CV Raw Access Ban (PII Masking)', badge: 'Enforced • PII Masked', desc: 'Admins and API callers view tokenized CV hashes only. Unredacted PII requires dual-key authorization from Chief Privacy Officer.' },
  { title: 'Last-Admin Self-Demotion Lock', badge: 'Strictly Enforced', desc: 'Prevents session admin Alex Johnson from revoking root credentials without external quorum to eliminate organizational lockout risks.' },
  { title: 'Deterministic AI Scoring Sandbox', badge: 'Zero Drift', desc: 'AI recommendations operate under strict advisory rules. Autonomous adverse rejection is hardware disabled at API gateway.' },
];

const serviceTabs = ['Core Services Status (6/6 Operational)', 'Recent Security Events (5)', 'API & Webhook Health'];

export default function AdminConsole() {
  return (
    <div>
      {/* Status badges */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2.5 py-1 rounded-full">● SYSTEM HEALTH: 99.98% OPTIMAL</span>
        <span className="text-xs bg-[#1a1a1a] text-zinc-400 border border-[#2a2a2a] px-2.5 py-1 rounded-full">⊙ WBS 3.6 • ISO 27001 / SOC 2 TYPE II COMPLIANT</span>
        <span className="text-xs bg-[#1a1a1a] text-zinc-400 border border-[#2a2a2a] px-2.5 py-1 rounded-full">⚡ GEMINI 2.5 LLM ENGINE ACTIVE</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white font-['Geist',sans-serif]">Admin Console Overview</h1>
          <p className="text-sm text-zinc-500 mt-1">Unified platform health telemetry, AI quota utilization, RBAC privilege posture, and compliance telemetry.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-xs text-zinc-400 hover:text-white transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10" />
            </svg>
            System Health Diagnostic
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-xs text-zinc-400 hover:text-white transition-colors">
            + System Action
          </button>
        </div>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <span className="text-xs text-zinc-500 uppercase tracking-wide">Active Identities & Seats</span>
          <div className="flex items-end gap-2 mt-1.5">
            <span className="text-3xl font-bold text-white font-['Geist',sans-serif]">1,248</span>
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full mb-0.5">+14 this week</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">4 Admin • 68 Recruiters • 1/120 Candidates • 0 Orphaned</p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <span className="text-xs text-zinc-500 uppercase tracking-wide">Gemini LLM Quota Usage</span>
          <div className="flex items-end gap-2 mt-1.5">
            <span className="text-3xl font-bold text-white font-['Geist',sans-serif]">68.2%</span>
            <span className="text-xs text-zinc-500 mb-0.5">682K / 1.0M Tokens</span>
          </div>
          <div className="h-1 bg-[#2a2a2a] rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: '68.2%' }} />
          </div>
          <p className="text-xs text-zinc-500 mt-1">Resets in 7 days</p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 uppercase tracking-wide">Security & Audit Mutations</span>
            <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">Alert Level: Low</span>
          </div>
          <span className="text-3xl font-bold text-white font-['Geist',sans-serif] block mt-1.5">14 Alerts</span>
          <p className="text-xs text-zinc-500 mt-1">0 Privilege breaches • 2 Elevations dual-sign</p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 uppercase tracking-wide">Ledger & WORM Tamper Guard</span>
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Immutable Active</span>
          </div>
          <span className="text-2xl font-bold text-white font-['Geist',sans-serif] block mt-1.5">SHA-256 Valid</span>
          <p className="text-xs text-zinc-500 mt-1">Block #94,812 • Next sync in 14m</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* AI Engine Throughput */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h2 className="text-sm font-semibold text-white">AI Engine & Infrastructure Throughput</h2>
            </div>
            <span className="text-xs text-green-400">Real-Time Telemetry (Last 24h)</span>
          </div>
          <p className="text-xs text-zinc-500 mb-4">Model processing pipelines and vector executions</p>

          {/* Progress bar legend */}
          <div className="flex flex-wrap gap-3 mb-3">
            {[
              { label: 'Gemini 2.5 Flash (54%)', color: 'bg-green-500' },
              { label: 'Vector Query (26%)', color: 'bg-blue-500' },
              { label: 'OCR Intake (14%)', color: 'bg-orange-500' },
              { label: 'ATS Sync (6%)', color: 'bg-purple-500' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5 text-xs text-zinc-500">
                <span className={`w-2 h-2 rounded-full ${item.color}`} />
                {item.label}
              </div>
            ))}
          </div>

          {/* Stacked bar */}
          <div className="h-2 rounded-full overflow-hidden flex mb-4">
            <div className="h-full bg-green-500" style={{ width: '54%' }} />
            <div className="h-full bg-blue-500" style={{ width: '26%' }} />
            <div className="h-full bg-orange-500" style={{ width: '14%' }} />
            <div className="h-full bg-purple-500" style={{ width: '6%' }} />
          </div>

          {aiPipelineItems.map(item => (
            <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-[#1e1e1e] last:border-0">
              <span className="text-xs text-zinc-300">{item.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500">{item.ops}</span>
                <div className="w-20 h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${item.pct}%` }} />
                </div>
                <span className="text-xs font-medium text-zinc-300 w-8 text-right">{item.pct}%</span>
              </div>
            </div>
          ))}

          <p className="text-xs text-zinc-600 mt-3">⊙ Deterministic Temperature = 0.0 • Strict schema verification enabled</p>
          <p className="text-xs text-zinc-600">Cluster: GCP us-central1</p>
        </div>

        {/* Active Security Posture */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h2 className="text-sm font-semibold text-white">Active Security Posture</h2>
            </div>
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">● 4 Active Guards</span>
          </div>
          <p className="text-xs text-zinc-500 mb-4">RBAC Guardrails & Privilege Defense</p>

          <div className="flex flex-col gap-3">
            {securityGuardrails.map(item => (
              <div key={item.title} className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white">{item.title}</span>
                  <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-medium">{item.badge}</span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <button className="mt-3 text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            View Security Policy & RBAC Matrix →
          </button>
        </div>
      </div>

      {/* Service Health Table */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
        <div className="flex items-center justify-between px-5 pt-4 pb-0">
          <div className="flex gap-1 flex-wrap">
            {serviceTabs.map((tab, i) => (
              <button
                key={tab}
                className={`px-3 py-2 text-xs rounded-t-lg border-b-2 -mb-px transition-colors ${i === 0 ? 'border-indigo-400 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-200'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 pb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            Auto-refresh: 10s
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-t border-[#2a2a2a]">
              {['Service Name & Endpoint', 'Latency', 'Status', '30-Day Uptime', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockServiceHealth.map((svc: ServiceHealth) => (
              <tr key={svc.id} className="border-b border-[#1e1e1e] hover:bg-[#1e1e1e] transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-[#2a2a2a] rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{svc.name}</p>
                      <p className="text-xs text-zinc-500">{svc.endpoint}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className="text-sm font-medium text-green-400">{svc.latency}</span>
                </td>
                <td className="px-5 py-3">
                  <span className="flex items-center gap-1.5 text-xs text-green-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    {svc.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className="text-sm text-zinc-300">{svc.uptime}</span>
                </td>
                <td className="px-5 py-3">
                  <button className="text-xs text-zinc-400 hover:text-white transition-colors border border-zinc-700 px-2.5 py-1 rounded-md">Logs</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-[#2a2a2a] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span className="text-xs text-zinc-500">All systems operational • Last full platform sync: 12 seconds ago</span>
          <span className="ml-auto text-xs text-zinc-500">Incident history: <span className="text-green-400">0 degraded incidents</span> in 30 days</span>
        </div>
      </div>
    </div>
  );
}
