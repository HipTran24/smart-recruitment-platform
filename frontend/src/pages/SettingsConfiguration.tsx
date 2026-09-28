import { useState } from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-green-500' : 'bg-zinc-700'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

const settingsTabs = [
  { label: 'AI Models & Ingestion Engine', badge: 'WBS 3.3' },
  { label: 'Deterministic Scoring & Thresholds', badge: 'WBS 3.3' },
  { label: 'Pipeline Automations & Triggers' },
  { label: 'Role-Based Access (RBAC)' },
  { label: 'Audit & Compliance Policies', badge: 'WBS 3.4' },
];

const weightFields = [
  { label: 'Required Core Skills (Must-Have)', key: 'core', value: 45, desc: 'Direct syntax, tech stack, and hard requirement matches', baseline: '40-90%' },
  { label: 'Experience & Seniority Tenure', key: 'tenure', value: 25, desc: 'Verified years, scope of team leadership, trajectory', baseline: '20-30%' },
  { label: 'Secondary & Preferred Stack', key: 'pref', value: 20, desc: 'Nice-to-have frameworks, secondary languages & tools', baseline: '15-25%' },
  { label: 'Education & Formal Certifications', key: 'edu', value: 10, desc: 'Accredited degrees, cloud certifications (AWS/GCP), patents', baseline: '5-15%' },
];

export default function SettingsConfiguration() {
  const [activeTab, setActiveTab] = useState(0);
  const [strictMode, setStrictMode] = useState(true);
  const [piiRedaction, setPiiRedaction] = useState(true);
  const [storeEmbeddings, setStoreEmbeddings] = useState(false);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-white font-['Geist',sans-serif]">Settings & AI Configuration</h1>
            <span className="text-xs bg-[#2a2a2a] text-zinc-400 px-2 py-0.5 rounded">Config Engine v3.4</span>
            <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">● Deterministic Engine Active</span>
          </div>
          <p className="text-sm text-zinc-500 max-w-2xl">Manage global ATS policies, Gemini LLM parsing quotas, deterministic rubric weights, automated stage gating thresholds, and compliance audit parameters.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button className="px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-xs text-zinc-400 hover:text-white transition-colors">Reset to Defaults</button>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Changes
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 flex-wrap border-b border-[#2a2a2a] pb-0">
        {settingsTabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(i)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-t-lg border-b-2 transition-colors -mb-px ${activeTab === i ? 'border-indigo-400 text-white bg-[#1a1a1a]' : 'border-transparent text-zinc-500 hover:text-zinc-200'}`}
          >
            {tab.label}
            {tab.badge && <span className="text-[10px] bg-[#2a2a2a] text-zinc-400 px-1.5 py-0.5 rounded">{tab.badge}</span>}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        {/* Main left column */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* AI Parser & LLM Orchestration */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <span className="text-zinc-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                  </svg>
                </span>
                <h2 className="text-sm font-semibold text-white">AI Parser & LLM Orchestration</h2>
                <span className="text-xs bg-[#2a2a2a] text-zinc-400 px-1.5 py-0.5 rounded">WBS 3.3</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-zinc-400">Connected • 4.2ms • TLS 1.3</span>
              </div>
            </div>
            <p className="text-xs text-zinc-500 mb-4">Manage runtime ingestion provider, token velocity & determinism</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-500 font-medium block mb-1.5">Primary LLM Engine</label>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-zinc-400">Primary LLM Engine</span>
                  <span className="text-xs text-green-400">Google Vertex AI</span>
                </div>
                <select className="w-full bg-[#111] border border-[#2a2a2a] text-zinc-300 rounded-lg px-3 py-2 text-xs outline-none">
                  <option>gemini-2.5-flash-parse v2.4 (Active - 1.2s avg latency)</option>
                </select>
                <div className="mt-2 flex gap-2">
                  <span className="text-xs bg-[#2a2a2a] text-zinc-400 px-2 py-0.5 rounded">Deterministic Schema</span>
                  <span className="text-xs bg-[#2a2a2a] text-zinc-400 px-2 py-0.5 rounded">JSON Mode Strict</span>
                  <span className="text-xs bg-[#2a2a2a] text-zinc-400 px-2 py-0.5 rounded">Temp = 0.0</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500 font-medium block mb-1.5">Fallback & Multimodal OCR</label>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-zinc-400">Fallback OCR</span>
                  <span className="text-xs text-zinc-500">Cold Standby</span>
                </div>
                <select className="w-full bg-[#111] border border-[#2a2a2a] text-zinc-300 rounded-lg px-3 py-2 text-xs outline-none">
                  <option>gemini-1.5-pro-vision (OCR & Complex PDFs)</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs text-zinc-500 font-medium block mb-1.5">Vertex Secret API Key</label>
              <div className="flex gap-2">
                <div className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs font-mono text-zinc-400 flex items-center justify-between">
                  <span>sk_vertex_live_398341029487293sdf</span>
                  <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <button className="px-3 py-2 bg-[#2a2a2a] text-zinc-300 rounded-lg text-xs hover:bg-[#333] transition-colors">Rotate Key</button>
              </div>
              <p className="text-xs text-zinc-600 mt-1">Last rotated 14 days ago by Compliance Engine.</p>
            </div>

            {/* Toggles */}
            <div className="mt-4 flex flex-col gap-3">
              {[
                { label: 'Strict Deterministic Mode', desc: 'Locks LLM temperature to 0.0, seed=42 to guarantee 100% reproducible parsing scores.', value: strictMode, setter: setStrictMode },
                { label: 'PII Redaction Pre-Ingestion', desc: 'Automatically masks candidate full names, physical addresses, and birth years before model reference.', value: piiRedaction, setter: setPiiRedaction },
                { label: 'Store Raw OCR Embeddings', desc: 'Retains vector embeddings in pgvector cluster for semantic similarity querying and re-parsing.', value: storeEmbeddings, setter: setStoreEmbeddings },
              ].map(item => (
                <div key={item.label} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-white">{item.label}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
                  </div>
                  <Toggle checked={item.value} onChange={item.setter} />
                </div>
              ))}
            </div>
          </div>

          {/* Global Requisition Default Weights */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <h2 className="text-sm font-semibold text-white">Global Requisition Default Weights</h2>
                <span className="text-xs bg-[#2a2a2a] text-zinc-400 px-1.5 py-0.5 rounded">Deterministic Rubric</span>
              </div>
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">✓ 100% Valid Distribution</span>
            </div>
            <p className="text-xs text-zinc-500 mb-4">Default mathematical formula applied to raw match outputs across all pipelines</p>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg px-4 py-2.5 mb-4">
              <p className="text-xs text-amber-300/80">These global weights initialize new job posts automatically. Requisition owners can fine-tune specific job weights, but cannot alter deterministic evaluation criteria without Admin authorization.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {weightFields.map(field => (
                <div key={field.key} className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-sm bg-indigo-400" />
                      {field.label}
                    </span>
                    <span className="text-sm font-bold text-green-400">{field.value}%</span>
                  </div>
                  <p className="text-xs text-zinc-500 mb-2">{field.desc}</p>
                  <p className="text-xs text-zinc-600">Baseline: {field.baseline}</p>
                  <input type="range" min={0} max={100} value={field.value} readOnly className="w-full mt-2 accent-indigo-500" />
                </div>
              ))}
            </div>

            <div className="mt-4 bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-zinc-400">Active Scoring Formula</span>
                <span className="text-xs text-zinc-500">Deterministic Linear Summation</span>
              </div>
              <code className="text-xs text-zinc-300 font-mono">
                Total_Score = (0.45 × S_core) + (0.25 × S_tenure) + (0.20 × S_pref) + (0.10 × S_edu)
              </code>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="w-72 shrink-0 flex flex-col gap-4">
          {/* Engine telemetry */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-xs font-semibold text-zinc-300">Engine Telemetry</span>
              </div>
              <span className="text-xs text-zinc-500">Real-time Stream</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Avg Parse Speed', value: '1.18s', change: '-0.12s vs avg' },
                { label: "Today's Ingestions", value: '48', change: '+2 in queue' },
                { label: 'Match Accuracy', value: '99.4%', change: 'Schema strict' },
                { label: 'Error Rate', value: '0.02%', change: 'Optimal state' },
              ].map(m => (
                <div key={m.label} className="bg-[#111] rounded-lg p-3">
                  <p className="text-[10px] text-zinc-500">{m.label}</p>
                  <p className="text-lg font-bold text-white font-['Geist',sans-serif]">{m.value}</p>
                  <p className="text-[10px] text-zinc-600 mt-0.5">{m.change}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 py-2 bg-[#2a2a2a] hover:bg-[#333] text-zinc-300 text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Run Diagnostics With Synthetic Dossier
            </button>
          </div>

          {/* Compliance guardrails */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-xs font-semibold text-zinc-300">Compliance Guardrails</span>
              </div>
              <span className="text-xs bg-[#2a2a2a] text-zinc-400 px-1.5 py-0.5 rounded">SOC2•GDPR•NYC-LL144</span>
            </div>
            <div className="flex flex-col gap-2">
              {[
                'Deterministic mathematical audit trails recorded per candidate evaluation.',
                'PII Anonymization active during stage-1 blind hiring screenings.',
                'Human-in-the-loop requirement strictly enforced on non-advancement.',
                'Immutable SHA-256 state ledger active on configuration mutations.',
              ].map(item => (
                <div key={item} className="flex items-start gap-2">
                  <svg className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs text-zinc-400">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
