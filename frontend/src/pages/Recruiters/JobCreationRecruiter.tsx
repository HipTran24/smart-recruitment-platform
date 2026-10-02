import React, { useState } from "react";

export default function JobCreationStudio() {
  // Form State
  const [jobTitle, setJobTitle] = useState("Senior Product Designer");
  const [department, setDepartment] = useState("Product & Design");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [location, setLocation] = useState("New York - Hybrid");

  // Matching Weights State
  const [weights, setWeights] = useState({
    requiredSkills: 40,
    experience: 30,
    optionalSkills: 20,
    education: 10,
  });

  // Skills State
  const [newSkill, setNewSkill] = useState("");
  const [requiredSkills, setRequiredSkills] = useState([
    "Product Design",
    "Figma",
    "Design Systems",
    "User Research",
  ]);
  const [optionalSkills, setOptionalSkills] = useState([
    "Prototyping",
    "SaaS",
    "Accessibility",
  ]);

  const totalAllocation =
    weights.requiredSkills +
    weights.experience +
    weights.optionalSkills +
    weights.education;

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    setRequiredSkills([...requiredSkills, newSkill.trim()]);
    setNewSkill("");
  };

  const removeRequiredSkill = (index: number) => {
    setRequiredSkills(requiredSkills.filter((_, i) => i !== index));
  };

  const removeOptionalSkill = (index: number) => {
    setOptionalSkills(optionalSkills.filter((_, i) => i !== index));
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 text-slate-900 font-sans antialiased">
        {/* Top Navbar */}
        <header className="h-14 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Workspace</span>
            <span>/</span>
            <span>Manager</span>
            <span>/</span>
            <span>Jobs</span>
            <span>/</span>
            <span className="font-semibold text-slate-900">Create New Requisition</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search workspace..."
                className="w-64 h-8 pl-8 pr-12 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <kbd className="absolute right-2 top-2 text-[10px] bg-white border border-slate-200 px-1 rounded text-slate-400 font-mono">⌘ K</kbd>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Sync</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header Title & Status */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Job Creation Studio</h1>
              <p className="text-sm text-slate-500 mt-1">Define job metadata, skill taxonomies, and AI matching weights</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-semibold shadow-sm">
              <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Draft</span>
            </div>
          </div>

          {/* Grid Layout 2 Cột */}
          <div className="grid grid-cols-12 gap-6 items-start">
            {/* Cột Trái (Metadata, Description, Skill Taxonomy) */}
            <div className="col-span-7 space-y-6">
              {/* Box 1: Metadata */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 leading-tight">Metadata</h2>
                    <p className="text-xs text-slate-500">Set the core information candidates will use to discover this role.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Job Title *</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* Department */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Department</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full pl-9 pr-7 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>Product & Design</option>
                        <option>Engineering</option>
                        <option>Marketing</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Employment Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Employment Type</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <select
                        value={employmentType}
                        onChange={(e) => setEmploymentType(e.target.value)}
                        className="w-full pl-9 pr-7 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Contract</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Location</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      </div>
                      <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full pl-9 pr-7 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>New York - Hybrid</option>
                        <option>San Francisco - Onsite</option>
                        <option>Remote</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 2: Description */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 leading-tight">Description</h2>
                    <p className="text-xs text-slate-500">Write a clear overview of the opportunity, impact, and expectations.</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  {/* Toolbar */}
                  <div className="bg-slate-50/70 border-b border-slate-200 px-3 py-1.5 flex items-center gap-2 text-slate-600">
                    <button className="p-1 hover:bg-slate-200 rounded font-bold text-xs">B</button>
                    <button className="p-1 hover:bg-slate-200 rounded italic text-xs">I</button>
                    <button className="p-1 hover:bg-slate-200 rounded text-xs">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                      </svg>
                    </button>
                    <div className="h-4 w-px bg-slate-300 mx-1" />
                    <button className="flex items-center gap-1 text-xs font-medium text-slate-600 px-1 py-0.5 rounded hover:bg-slate-200">
                      <span>Paragraph</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Textarea Area */}
                  <div className="p-4 text-xs text-slate-700 space-y-3 leading-relaxed">
                    <p>
                      We're looking for a Senior Product Designer to shape intuitive, high-impact experiences across our hiring platform. You'll partner with product, engineering, and research to turn complex workflows into simple, trusted tools.
                    </p>
                    <div>
                      <p className="font-bold text-slate-900 mb-1">What you'll do</p>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                        <li>Lead end-to-end design for recruiter workflows and candidate experiences</li>
                        <li>Translate research insights into clear product strategy</li>
                        <li>Evolve our design system with accessible, reusable patterns</li>
                      </ul>
                    </div>
                  </div>

                  {/* Word count footer */}
                  <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Aim for 300–700 words</span>
                    <span>92 words</span>
                  </div>
                </div>
              </div>

              {/* Box 3: Skill Taxonomy */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 leading-tight">Skill Taxonomy</h2>
                    <p className="text-xs text-slate-500">Add normalized skills to improve candidate discovery and match quality.</p>
                  </div>
                </div>

                {/* Input Add Skill */}
                <form onSubmit={handleAddSkill} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search and add a skill..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold transition"
                  >
                    Add skill
                  </button>
                </form>

                {/* Required Skills */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Required Skills</span>
                    <span className="text-[11px] font-medium text-slate-400">{requiredSkills.length} selected</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {requiredSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-700"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeRequiredSkill(index)}
                          className="hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Optional Skills */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Optional Skills</span>
                    <span className="text-[11px] font-medium text-slate-400">{optionalSkills.length} selected</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {optionalSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-600"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeOptionalSkill(index)}
                          className="hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Cột Phải (AI Match Weights, Publish Actions) */}
            <div className="col-span-5 space-y-6">
              {/* Box: AI Match Scoring Weights */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 leading-tight">AI Match Scoring Weights</h2>
                    <p className="text-xs text-slate-500">Prioritize the signals used to rank qualified candidates.</p>
                  </div>
                </div>

                {/* Range Sliders */}
                <div className="space-y-4">
                  {/* Required Skills */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                      <span>Required Skills</span>
                      <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-600 rounded text-[11px]">
                        {weights.requiredSkills}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={weights.requiredSkills}
                      onChange={(e) => setWeights({ ...weights, requiredSkills: Number(e.target.value) })}
                      className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Experience */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                      <span>Experience</span>
                      <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-600 rounded text-[11px]">
                        {weights.experience}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={weights.experience}
                      onChange={(e) => setWeights({ ...weights, experience: Number(e.target.value) })}
                      className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Optional Skills */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                      <span>Optional Skills</span>
                      <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-600 rounded text-[11px]">
                        {weights.optionalSkills}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={weights.optionalSkills}
                      onChange={(e) => setWeights({ ...weights, optionalSkills: Number(e.target.value) })}
                      className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Education */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                      <span>Education</span>
                      <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-600 rounded text-[11px]">
                        {weights.education}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={weights.education}
                      onChange={(e) => setWeights({ ...weights, education: Number(e.target.value) })}
                      className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Total Allocation Bar */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Total allocation</span>
                    </div>
                    <span className={totalAllocation === 100 ? "text-emerald-600" : "text-amber-600"}>
                      {totalAllocation}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${totalAllocation === 100 ? "bg-emerald-500" : "bg-amber-500"}`}
                      style={{ width: `${Math.min(totalAllocation, 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">Weights are balanced and ready for matching.</p>
                </div>
              </div>

              {/* Box: Publish Actions */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 leading-tight">Publish Actions</h2>
                    <p className="text-xs text-slate-500">Save your progress or make this role visible to your hiring team.</p>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-xs font-bold text-emerald-800 leading-tight">Ready to publish</p>
                    <p className="text-[11px] text-emerald-700 leading-tight mt-0.5">All required fields are complete.</p>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => alert("Saved as Draft")}
                    className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    <span>Save as Draft</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => alert("Job Published Successfully!")}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 shadow-sm shadow-blue-200 transition"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Publish Job</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 text-center leading-normal pt-1">
                  Publishing notifies your hiring team and activates AI candidate matching. You can pause the job anytime.
                </p>
              </div>

              {/* Status Hint */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Changes saved automatically · just now</span>
              </div>
            </div>
          </div>
        </main>
    </div>
  );
}