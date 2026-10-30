import { useState } from 'react';
import { mockServiceHealth } from '../data/mock';
import type { ServiceHealth } from '../types';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';

const aiPipelineItems = [
  { label: 'Resume Parsing & Attribute Extraction', ops: '18,420 operations', pct: 54 },
  { label: 'Candidate Similarity Matching Vector Query', ops: '8,870 operations', pct: 26 },
  { label: 'OCR Ingestion (Multi-page PDF/DOCX)', ops: '4,780 operations', pct: 14 },
  { label: 'Third-party ATS & Webhook Payloads', ops: '2,045 calls', pct: 6 },
];

const securityGuardrails = [
  {
    title: 'CV Raw Access Ban (PII Masking)',
    badge: 'Enforced • PII Masked',
    desc: 'Admins view tokenized metadata hashes only. Unredacted PII is restricted to authorized recruiters to preserve candidate privacy.',
  },
  {
    title: 'Last-Admin Self-Demotion Lock',
    badge: 'Strictly Enforced',
    desc: 'Prevents session administrators from revoking root credentials without external quorum to eliminate organizational lockout risks.',
  },
  {
    title: 'Deterministic AI Scoring Sandbox',
    badge: 'Advisory Mode Only',
    desc: 'Gemini 2.5 recommendations operate under strict advisory rules. Autonomous adverse rejection is strictly disabled at API gateway.',
  },
];

const serviceTabs = ['Core Services Status (6/6 Operational)', 'Recent Security Events (5)', 'API & Webhook Health'];

export default function AdminConsole() {
  const [activeTab, setActiveTab] = useState(0);
  const [diagnosticModalOpen, setDiagnosticModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Platform Status Badges Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>SYSTEM HEALTH: 99.98% OPTIMAL</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
          <span>⊙ WBS 3.6 • Least-Privilege Enforced</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
          <span>⚡ Gemini 2.5 Flash Advisory Engine Active</span>
        </span>
      </div>

      {/* Main Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] font-['Inter',sans-serif] tracking-tight">
            Admin Console Overview
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1.5 leading-relaxed max-w-3xl">
            Unified telemetry on cluster health, Gemini AI quota utilization, RBAC privilege posture, and tamper-evident audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Button
            variant="secondary"
            size="md"
            icon={
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10" />
              </svg>
            }
            onClick={() => setDiagnosticModalOpen(true)}
          >
            System Health Diagnostic
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => showToast("Exporting cryptographic audit log snapshot (SHA-256)...")}
          >
            Export Audit Snapshot
          </Button>
        </div>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--color-text-secondary)] font-medium uppercase tracking-wider">
                Active Identities &amp; Seats
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-[var(--color-text-primary)] tabular-nums leading-none">
                1,248
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-500/15 text-emerald-300">
                +14 this week
              </span>
            </div>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-3">
            4 Admins • 68 Recruiters • 1,176 Candidates
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--color-text-secondary)] font-medium uppercase tracking-wider">
                Gemini LLM Quota Usage
              </span>
              <span className="text-xs text-indigo-400 font-semibold">Tier 1</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-[var(--color-text-primary)] tabular-nums leading-none">
                68.2%
              </span>
              <span className="text-xs text-[var(--color-text-secondary)]">682K / 1.0M Tokens</span>
            </div>
            <div className="h-1.5 bg-[#232936] rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '68.2%' }} />
            </div>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-2">
            Monthly quota window resets in 7 days
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--color-text-secondary)] font-medium uppercase tracking-wider">
                Security &amp; RBAC Mutations
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-amber-500/15 text-amber-300">
                Low Alert
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-[var(--color-text-primary)] tabular-nums leading-none">
                14 Events
              </span>
            </div>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-3">
            0 Privilege breaches • 2 Role elevations verified
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--color-text-secondary)] font-medium uppercase tracking-wider">
                Ledger Tamper Guard
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-500/15 text-emerald-300">
                Immutable
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-[var(--color-text-primary)] tabular-nums leading-none">
                SHA-256 Valid
              </span>
            </div>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-3">
            Block #94,812 • Next sync checkpoint in 14m
          </p>
        </div>
      </div>

      {/* Grid: AI Engine Throughput & Security Posture */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* AI Throughput Telemetry */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                  AI Engine &amp; Infrastructure Throughput
                </h2>
              </div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Real-Time Telemetry
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mb-4">
              Model processing pipelines and vector similarity query distribution
            </p>

            {/* Stacked bar */}
            <div className="h-2.5 rounded-full overflow-hidden flex mb-4 bg-[#232936]">
              <div className="h-full bg-emerald-500" style={{ width: '54%' }} title="Resume Parsing: 54%" />
              <div className="h-full bg-indigo-500" style={{ width: '26%' }} title="Vector Query: 26%" />
              <div className="h-full bg-amber-500" style={{ width: '14%' }} title="OCR Intake: 14%" />
              <div className="h-full bg-purple-500" style={{ width: '6%' }} title="ATS Payloads: 6%" />
            </div>

            <div className="divide-y divide-[var(--color-border)]/50">
              {aiPipelineItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2.5">
                  <span className="text-xs text-[var(--color-text-primary)] font-medium">{item.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[var(--color-text-secondary)] tabular-nums">{item.ops}</span>
                    <div className="w-20 h-1.5 bg-[#232936] rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${item.pct}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-[var(--color-text-primary)] w-8 text-right tabular-nums">
                      {item.pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-[var(--color-border)]/50 text-xs text-[var(--color-text-muted)] flex items-center justify-between">
            <span>Deterministic Temp = 0.0 • Strict schema verification</span>
            <span className="text-emerald-400">GCP us-central1 (Active)</span>
          </div>
        </div>

        {/* Security Posture & Guardrails */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Active Security Posture &amp; Ethics
                </h2>
              </div>
              <span className="text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                ● Least Privilege Enforced
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mb-4">
              Human-in-the-loop ethical guardrails and cryptographic data isolation
            </p>

            <div className="flex flex-col gap-3">
              {securityGuardrails.map((item) => (
                <div
                  key={item.title}
                  className="bg-[#12151d] border border-[var(--color-border)] rounded-xl p-3.5 flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--color-text-primary)]">{item.title}</span>
                    <span className="text-xs bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-md font-semibold">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-[var(--color-border)]/50 flex items-center justify-between">
            <span className="text-xs text-[var(--color-text-muted)]">No auto-rejections permitted at API gateway</span>
            <button
              type="button"
              onClick={() => showToast("Navigating to Users & Roles management...")}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              Manage Roles &amp; Permissions →
            </button>
          </div>
        </div>
      </div>

      {/* Core Services Health Table */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 pt-4 pb-2 border-b border-[var(--color-border)]">
          <div className="flex gap-2 flex-wrap">
            {serviceTabs.map((tab, i) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(i)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === i
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] mt-2 sm:mt-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Telemetry heartbeat: 10s</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-hover)]/40 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                <th className="px-5 py-3.5">Service Name &amp; Endpoint</th>
                <th className="px-5 py-3.5">Latency</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">30-Day Uptime</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]/50">
              {mockServiceHealth.map((svc: ServiceHealth) => (
                <tr key={svc.id} className="hover:bg-[var(--color-surface-hover)] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#1f2533] border border-[var(--color-border)] rounded-lg flex items-center justify-center shrink-0 text-indigo-400 font-bold text-xs">
                        ⚡
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">{svc.name}</p>
                        <p className="text-xs text-[var(--color-text-secondary)]">{svc.endpoint}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-semibold text-emerald-400 tabular-nums">
                      {svc.latency}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge variant="healthy" label={svc.status} dot />
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-medium text-[var(--color-text-primary)] tabular-nums">
                      {svc.uptime}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => showToast(`Opening real-time trace stream for ${svc.name}`)}
                    >
                      Stream Logs
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3.5 border-t border-[var(--color-border)]/60 bg-[var(--color-surface-hover)]/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--color-text-secondary)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>All 6 core services verified operational • Next automated canary in 28s</span>
          </div>
          <span className="text-emerald-400 font-medium">0 degraded incidents over last 30 days</span>
        </div>
      </div>

      {/* Diagnostic Modal */}
      <Modal
        open={diagnosticModalOpen}
        onClose={() => setDiagnosticModalOpen(false)}
        title="Full Cluster Diagnostic Report"
        description="Synthetic health probes executed across microservice endpoints and database read replicas."
        width="max-w-xl"
      >
        <div className="flex flex-col gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
            <span className="font-semibold text-emerald-300">Cluster Health Status:</span>
            <span className="font-bold text-emerald-300">HEALTHY (100% Passed)</span>
          </div>

          <div className="space-y-2 border border-[var(--color-border)] rounded-xl p-3 bg-[#12151d]">
            <div className="flex justify-between py-1 border-b border-[var(--color-border)]/40 text-[var(--color-text-secondary)]">
              <span>Database Connection Pool (HikariCP):</span>
              <span className="text-[var(--color-text-primary)] font-semibold">18/20 Active • 1.2ms Avg</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--color-border)]/40 text-[var(--color-text-secondary)]">
              <span>Flyway Schema Migration Checksum:</span>
              <span className="text-emerald-400 font-semibold">Matched V12__init.sql</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--color-border)]/40 text-[var(--color-text-secondary)]">
              <span>AWS S3 Private Bucket Latency:</span>
              <span className="text-[var(--color-text-primary)] font-semibold">22ms (Encrypted at rest)</span>
            </div>
            <div className="flex justify-between py-1 text-[var(--color-text-secondary)]">
              <span>Gemini 2.5 Flash Response Time:</span>
              <span className="text-[var(--color-text-primary)] font-semibold">410ms p95</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
            <Button variant="secondary" size="sm" onClick={() => setDiagnosticModalOpen(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setDiagnosticModalOpen(false);
                showToast("Probes refreshed successfully.");
              }}
            >
              Re-run Probes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 border border-[var(--color-border)] text-white px-4 py-3 text-xs font-medium shadow-2xl flex items-center gap-2 animate-in fade-in duration-150"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
