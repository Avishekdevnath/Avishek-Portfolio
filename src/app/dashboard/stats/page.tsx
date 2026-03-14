'use client';

import { useState, useEffect } from 'react';
import { FaSave, FaPlus, FaTrash, FaCode, FaLaptopCode, FaUserGraduate, FaBriefcase, FaLock } from 'react-icons/fa';

interface StatData { value: number; description: string; }
interface CustomStat { title: string; value: number; description: string; icon: string; }
interface StatsData {
  programmingLanguages: StatData; // Dynamic - read only
  projectsCompleted: StatData;    // Dynamic - read only
  studentsCount: StatData;        // Editable
  workExperience: StatData;       // Editable
  customStats: CustomStat[];      // Editable
  tagline: string;                // Editable
}
interface StatsResponse { success: boolean; data: StatsData; error?: string; }

const iconOptions = [
  { value: 'FaCode',          label: 'Code',           icon: FaCode },
  { value: 'FaLaptopCode',    label: 'Laptop Code',    icon: FaLaptopCode },
  { value: 'FaUserGraduate',  label: 'User Graduate',  icon: FaUserGraduate },
  { value: 'FaBriefcase',     label: 'Briefcase',      icon: FaBriefcase },
];

const inputCls =
  'w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem] text-[#2a2118] focus:outline-none focus:border-[#d4622a] focus:ring-1 focus:ring-[#d4622a]/20';

const labelCls = 'block text-[0.75rem] font-medium text-[#4a3728] mb-1';

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData>({
    programmingLanguages: { value: 0, description: '' },
    projectsCompleted:    { value: 0, description: '' },
    studentsCount:        { value: 0, description: '' },
    workExperience:       { value: 0, description: '' },
    customStats: [],
    tagline: ''
  });
  const [loading, setLoading]               = useState(true);
  const [saving, setSaving]                 = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data: StatsResponse = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch stats');
      setStats(data.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      const editableStats = {
        studentsCount:  stats.studentsCount,
        workExperience: stats.workExperience,
        customStats:    stats.customStats,
        tagline:        stats.tagline
      };
      const response = await fetch('/api/stats', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editableStats)
      });
      if (!response.ok) throw new Error('Failed to update stats');
      const data: StatsResponse = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to update stats');
      setSuccessMessage('Stats updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetchStats();
    } catch (err) {
      console.error('Error saving stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to save stats');
    } finally {
      setSaving(false);
    }
  };

  const addCustomStat = () => {
    setStats(prev => ({
      ...prev,
      customStats: [...prev.customStats, { title: '', value: 0, description: '', icon: 'FaCode' }]
    }));
  };

  const removeCustomStat = (index: number) => {
    setStats(prev => ({ ...prev, customStats: prev.customStats.filter((_, i) => i !== index) }));
  };

  const updateCustomStat = (index: number, field: keyof CustomStat, value: string | number) => {
    setStats(prev => ({
      ...prev,
      customStats: prev.customStats.map((stat, i) => i === index ? { ...stat, [field]: value } : stat)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2a2118]" />
      </div>
    );
  }

  return (
    <div className="font-body max-w-6xl mx-auto">

      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#2a2118]">Portfolio Statistics</h1>
          <p className="text-[0.875rem] text-[#8a7a6a] mt-1">Manage your portfolio stats and achievements</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-[#2a2118] text-[#f0ece3] rounded-lg text-[0.82rem] font-medium hover:bg-[#d4622a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaSave className={saving ? 'animate-spin' : ''} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Feedback banners */}
      {error && (
        <div className="mb-6 bg-[#fceaea] border border-[#f0b8b8] text-[#c0392b] rounded-lg p-4 text-[0.875rem]">
          <strong className="font-medium">Error:</strong> {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-6 bg-[#e6f2ee] border border-[#b8ddd0] text-[#2a6b4f] rounded-lg p-4 text-[0.875rem]">
          <strong className="font-medium">Success:</strong> {successMessage}
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Left — Dynamic stats (read-only) */}
        <div className="bg-[#faf8f4] border border-[#e8e3db] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <FaLock className="text-[#8a7a6a] text-[0.75rem]" />
            <h2 className="text-[0.875rem] font-semibold text-[#2a2118]">Dynamic Stats</h2>
            <span className="ml-auto text-[0.65rem] font-mono tracking-wider uppercase text-[#8a7a6a] bg-[#f3f1ee] px-2 py-0.5 rounded-full">Read-only</span>
          </div>
          <p className="text-[0.75rem] text-[#8a7a6a] mb-5">Auto-calculated from your database — cannot be edited here.</p>

          <div className="space-y-3">
            {/* Programming Languages */}
            <div className="bg-white border border-[#e8e3db] rounded-xl p-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-[#e8f0fc] text-[#2d4eb3] flex items-center justify-center flex-shrink-0">
                <FaCode size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-[0.7rem] text-[#8a7a6a] uppercase tracking-wider font-mono">Programming Languages</p>
                <p className="font-mono text-2xl font-semibold text-[#2a2118] leading-none mt-0.5">{stats.programmingLanguages.value}</p>
                {stats.programmingLanguages.description && (
                  <p className="text-[0.75rem] text-[#8a7a6a] mt-0.5 truncate">{stats.programmingLanguages.description}</p>
                )}
              </div>
            </div>

            {/* Projects Completed */}
            <div className="bg-white border border-[#e8e3db] rounded-xl p-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-[#e6f2ee] text-[#2a6b4f] flex items-center justify-center flex-shrink-0">
                <FaLaptopCode size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-[0.7rem] text-[#8a7a6a] uppercase tracking-wider font-mono">Projects Completed</p>
                <p className="font-mono text-2xl font-semibold text-[#2a2118] leading-none mt-0.5">{stats.projectsCompleted.value}</p>
                {stats.projectsCompleted.description && (
                  <p className="text-[0.75rem] text-[#8a7a6a] mt-0.5 truncate">{stats.projectsCompleted.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right — Editable stats */}
        <div className="space-y-4">

          {/* Students Mentored */}
          <div className="bg-white border border-[#e8e3db] rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#fef3e2] text-[#92510a] flex items-center justify-center">
                <FaUserGraduate size={12} />
              </div>
              <h2 className="text-[0.875rem] font-semibold text-[#2a2118]">Students Mentored</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Count</label>
                <input
                  type="number"
                  value={stats.studentsCount.value}
                  onChange={e => setStats(prev => ({
                    ...prev,
                    studentsCount: { ...prev.studentsCount, value: parseInt(e.target.value) || 0 }
                  }))}
                  className={inputCls}
                  min="0"
                />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <input
                  type="text"
                  value={stats.studentsCount.description}
                  onChange={e => setStats(prev => ({
                    ...prev,
                    studentsCount: { ...prev.studentsCount, description: e.target.value }
                  }))}
                  className={inputCls}
                  placeholder="e.g., Students mentored and guided"
                />
              </div>
            </div>
          </div>

          {/* Work Experience */}
          <div className="bg-white border border-[#e8e3db] rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#fdf0eb] text-[#d4622a] flex items-center justify-center">
                <FaBriefcase size={12} />
              </div>
              <h2 className="text-[0.875rem] font-semibold text-[#2a2118]">Work Experience</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Years</label>
                <input
                  type="number"
                  value={stats.workExperience.value}
                  onChange={e => setStats(prev => ({
                    ...prev,
                    workExperience: { ...prev.workExperience, value: parseInt(e.target.value) || 0 }
                  }))}
                  className={inputCls}
                  min="0"
                />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <input
                  type="text"
                  value={stats.workExperience.description}
                  onChange={e => setStats(prev => ({
                    ...prev,
                    workExperience: { ...prev.workExperience, description: e.target.value }
                  }))}
                  className={inputCls}
                  placeholder="e.g., Years of professional experience"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div className="bg-white border border-[#e8e3db] rounded-xl p-5 shadow-sm mb-6">
        <h2 className="text-[0.875rem] font-semibold text-[#2a2118] mb-3">Portfolio Tagline</h2>
        <textarea
          value={stats.tagline}
          onChange={e => setStats(prev => ({ ...prev, tagline: e.target.value }))}
          className={`${inputCls} resize-none`}
          rows={3}
          placeholder="Write an inspiring tagline that represents your professional journey..."
        />
      </div>

      {/* Custom Stats */}
      <div className="bg-white border border-[#e8e3db] rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e3db]">
          <h2 className="text-[0.875rem] font-semibold text-[#2a2118]">Custom Statistics</h2>
          <button
            onClick={addCustomStat}
            className="flex items-center gap-2 px-4 py-2 bg-[#2a2118] text-[#f0ece3] rounded-lg text-[0.82rem] font-medium hover:bg-[#d4622a] transition-colors"
          >
            <FaPlus size={11} /> Add Custom Stat
          </button>
        </div>

        {stats.customStats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-12 h-12 rounded-xl bg-[#f7f5f1] flex items-center justify-center mb-4">
              <FaCode className="text-[#8a7a6a] text-xl" />
            </div>
            <p className="text-[0.875rem] font-medium text-[#4a3728]">No custom statistics yet</p>
            <p className="text-[0.8rem] text-[#8a7a6a] mt-1">Add custom stats to showcase unique achievements</p>
          </div>
        ) : (
          <div className="divide-y divide-[#e8e3db]">
            {stats.customStats.map((stat, index) => (
              <div key={index} className="px-5 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                  <div>
                    <label className={labelCls}>Title</label>
                    <input
                      type="text"
                      value={stat.title}
                      onChange={e => updateCustomStat(index, 'title', e.target.value)}
                      className={inputCls}
                      placeholder="e.g., Awards Won"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Value</label>
                    <input
                      type="number"
                      value={stat.value}
                      onChange={e => updateCustomStat(index, 'value', parseInt(e.target.value) || 0)}
                      className={inputCls}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Description</label>
                    <input
                      type="text"
                      value={stat.description}
                      onChange={e => updateCustomStat(index, 'description', e.target.value)}
                      className={inputCls}
                      placeholder="e.g., Recognition received"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Icon</label>
                    <select
                      value={stat.icon}
                      onChange={e => updateCustomStat(index, 'icon', e.target.value)}
                      className={inputCls}
                    >
                      {iconOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => removeCustomStat(index)}
                      className="p-2 text-[#8a7a6a] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove stat"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
