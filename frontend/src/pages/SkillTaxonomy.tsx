import { useEffect, useState } from 'react';
import { MetricCard } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { mockSkills } from '../data/mock';
import type { Skill, SkillCategory } from '../types';
import { adminService } from '../services/admin.service';

const categoryColors: Record<SkillCategory, string> = {
  Frontend: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  Backend: 'bg-green-600/20 text-green-300 border border-green-600/30',
  DevOps: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  'Data Science': 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  'Soft Skills': 'bg-pink-500/20 text-pink-300 border border-pink-500/30',
  Cloud: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
  Mobile: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
};

const categoryOptions = [
  { value: 'All Categories', label: 'All Categories' },
  { value: 'Frontend', label: 'Frontend' },
  { value: 'Backend', label: 'Backend' },
  { value: 'DevOps', label: 'DevOps' },
  { value: 'Data Science', label: 'Data Science' },
  { value: 'Soft Skills', label: 'Soft Skills' },
];

const statusOptions = [
  { value: 'All Statuses', label: 'All Statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Deprecated', label: 'Deprecated' },
];

export default function SkillTaxonomy() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [status, setStatus] = useState('All Statuses');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Backend');
  const [skills, setSkills] = useState<Skill[]>(mockSkills);

  const fetchSkills = async () => {
    try {
      const list = await adminService.getSkills();
      if (list && list.length > 0) {
        const mapped: Skill[] = list.map((s, idx) => ({
          id: String(s.id),
          name: s.name,
          category: (s.category as SkillCategory) || 'Backend',
          status: 'Active',
          synonyms: [s.name.toLowerCase()],
          usageCount: 10 + idx,
        }));
        setSkills(mapped);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleAddSkill = async () => {
    if (!newSkillName.trim()) return;
    try {
      await adminService.createSkill({ name: newSkillName.trim(), category: newSkillCategory });
      setNewSkillName('');
      setAddModalOpen(false);
      fetchSkills();
    } catch {
      setAddModalOpen(false);
    }
  };

  const filtered = skills.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.synonyms.some(syn => syn.toLowerCase().includes(search.toLowerCase()));
    const matchCat = category === 'All Categories' || s.category === category;
    const matchStatus = status === 'All Statuses' || s.status === status;
    return matchSearch && matchCat && matchStatus;
  });

  const columns = [
    {
      key: 'name',
      header: 'Skill Name',
      render: (row: Skill) => <span className="text-sm font-medium text-white">{row.name}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      render: (row: Skill) => (
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${categoryColors[row.category]}`}>
          {row.category}
        </span>
      ),
    },
    {
      key: 'synonyms',
      header: 'Synonyms',
      render: (row: Skill) => (
        <div className="flex flex-wrap gap-1.5">
          {row.synonyms.map(syn => (
            <span key={syn} className="text-xs bg-[#2a2a2a] text-zinc-400 px-2 py-0.5 rounded-md">{syn}</span>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Skill) => <StatusBadge variant={row.status === 'Active' ? 'active' : 'deprecated'} label={row.status} dot={row.status === 'Active'} />,
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
          <h1 className="text-3xl font-bold text-white font-['Geist',sans-serif]">Skill Taxonomy Management</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage normalized skills, categories, and synonym mapping for AI matching engine.</p>
        </div>
        <Button icon={<span>+</span>} onClick={() => setAddModalOpen(true)}>Add New Skill</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard label="Total Skills" value="1,247" />
        <MetricCard label="Categories" value="24" />
        <MetricCard label="Synonyms Mapped" value="3,891" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <SearchInput
          placeholder="Search skills or synonyms..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64"
        />
        <Select options={categoryOptions} value={category} onChange={e => setCategory(e.target.value)} />
        <Select options={statusOptions} value={status} onChange={e => setStatus(e.target.value)} />
      </div>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
        <DataTable columns={columns} data={filtered} keyFn={r => r.id} emptyMessage="No skills found matching your filters" />
      </div>

      {/* Add New Skill Modal */}
      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add New Skill">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-zinc-400 font-medium block mb-1.5">Skill Name</label>
            <input
              className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-zinc-500"
              placeholder="e.g. TypeScript"
              value={newSkillName}
              onChange={e => setNewSkillName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 font-medium block mb-1.5">Category</label>
            <select
              className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm outline-none"
              value={newSkillCategory}
              onChange={e => setNewSkillCategory(e.target.value)}
            >
              {categoryOptions.slice(1).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSkill}>Add Skill</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
