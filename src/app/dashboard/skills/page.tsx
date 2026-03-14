"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import { useToast } from '@/context/ToastContext';

interface Skill {
  _id: string;
  name: string;
  category: string;
  proficiency: number;
  icon?: string;
  iconSet?: string;
  description?: string;
  featured: boolean;
  order: number;
}

// Valid categories from the DB enum
const skillCategories = [
  'Frontend Development',
  'Backend Development',
  'AI & Machine Learning',
  'Graphics & Design',
  'Office & Productivity',
];

const emptyForm = {
  name: '',
  category: '',
  proficiency: 3,
  icon: '',
  iconSet: '',
  description: '',
  featured: false,
  order: 0,
};

// Proficiency dot indicator (0–5)
function ProficiencyDots({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${i < value ? 'bg-[#d4622a]' : 'bg-[#e8e3db]'}`}
        />
      ))}
      <span className="ml-1 text-xs text-[#8a7a6a] font-mono">{value}/5</span>
    </div>
  );
}

// ── Add Skill Modal ──
function AddSkillModal({
  initialCategory,
  onClose,
  onSuccess,
}: {
  initialCategory: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ ...emptyForm, category: initialCategory });
  const backdropRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : name === 'proficiency' || name === 'order'
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        showToast({ title: 'Success', description: 'Skill added successfully', status: 'success' });
        onSuccess();
        onClose();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      showToast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to add skill', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  const inputCls = "bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem] text-[#2a2118] focus:outline-none focus:border-[#d4622a] focus:ring-1 focus:ring-[#d4622a]/20 w-full transition-colors";
  const labelCls = "block text-[0.72rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5";

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8e3db] shrink-0">
          <div>
            <h2 className="text-[0.875rem] font-semibold text-[#2a2118]">Add New Skill</h2>
            {initialCategory && (
              <p className="text-[0.75rem] text-[#8a7a6a] mt-0.5">in {initialCategory}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8a7a6a] hover:text-[#2a2118] hover:bg-[#f7f5f1] rounded-lg transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          {/* Name */}
          <div>
            <label className={labelCls}>Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g. TypeScript"
              className={inputCls}
            />
          </div>

          {/* Category */}
          <div>
            <label className={labelCls}>Category *</label>
            {initialCategory ? (
              <div className="flex items-center justify-between h-9 px-3 bg-[#fdf0eb] border border-[#f0c8b0] rounded-lg">
                <span className="text-[0.8rem] font-medium text-[#4a3728]">{initialCategory}</span>
                <span className="text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#d4622a] bg-[#fdf0eb] border border-[#f0c8b0] px-2 py-0.5 rounded-full">locked</span>
              </div>
            ) : (
              <div className="relative">
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className={`${inputCls} appearance-none pr-8`}
                >
                  <option value="">Select category</option>
                  {skillCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a7a6a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            )}
          </div>

          {/* Proficiency */}
          <div>
            <label className={labelCls}>
              Proficiency *&nbsp;
              <span className="font-semibold text-[#d4622a]">{form.proficiency} / 5</span>
            </label>
            <input
              type="range"
              name="proficiency"
              min={0}
              max={5}
              step={1}
              value={form.proficiency}
              onChange={handleChange}
              className="mt-2 w-full"
              style={{ accentColor: '#d4622a' }}
            />
            <div className="flex justify-between text-[0.625rem] text-[#8a7a6a] mt-0.5 px-0.5 font-mono">
              {['0', '1', '2', '3', '4', '5'].map(n => <span key={n}>{n}</span>)}
            </div>
          </div>

          {/* Icon & IconSet — side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Icon</label>
              <input type="text" name="icon" value={form.icon} onChange={handleChange} placeholder="e.g. SiReact" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Icon Set</label>
              <input type="text" name="iconSet" value={form.iconSet} onChange={handleChange} placeholder="e.g. si" className={inputCls} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              placeholder="Short description (optional)"
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Order + Featured — side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Order</label>
              <input type="number" name="order" value={form.order} onChange={handleChange} className={inputCls} />
            </div>
            <div className="flex flex-col justify-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="featured"
                  checked={form.featured}
                  onChange={handleChange}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: '#d4622a' }}
                />
                <span className="text-[0.75rem] font-mono tracking-[0.05em] uppercase text-[#8a7a6a]">Featured</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#2a2118] text-[#f0ece3] rounded-lg text-[0.82rem] font-medium hover:bg-[#d4622a] transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Skill'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#ddd5c5] text-[#4a3728] rounded-lg text-[0.82rem] hover:border-[#2a2118] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ──
export default function SkillsPage() {
  const [skills, setSkills] = useState<{ [key: string]: Skill[] }>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalCategory, setModalCategory] = useState<string | null>(null);
  const [mobileSearch, setMobileSearch] = useState(false);
  const { showToast } = useToast();

  useEffect(() => { fetchSkills(); }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/skills');
      const data = await response.json();
      if (data.success) setSkills(data.data);
      else throw new Error(data.error);
    } catch (error) {
      showToast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to fetch skills', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    try {
      const response = await fetch(`/api/skills/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        showToast({ title: 'Success', description: 'Skill deleted successfully', status: 'success' });
        fetchSkills();
      } else throw new Error(data.error);
    } catch (error) {
      showToast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to delete skill', status: 'error' });
    }
  };

  const totalSkills = Object.values(skills).reduce((n, arr) => n + arr.length, 0);
  const categoryCount = Object.keys(skills).length;

  const filteredSkills = Object.entries(skills).reduce<{ [key: string]: Skill[] }>((acc, [cat, items]) => {
    const filtered = items.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
    if (filtered.length > 0) acc[cat] = filtered;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#e8e3db] border-t-[#d4622a]" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">

        {/* ── Header row ── */}
        <div className="flex items-center justify-between gap-4">
          <p className="text-[0.65rem] font-mono tracking-[0.15em] uppercase text-[#8a7a6a]">
            {totalSkills} skill{totalSkills !== 1 ? 's' : ''} · {categoryCount} categories
          </p>

          <div className="flex items-center gap-2">
            {/* Search — desktop */}
            <div className="relative hidden sm:block">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a7a6a] pointer-events-none" />
              <input
                type="text"
                placeholder="Search skills…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-9 w-64 pl-8 pr-8 bg-[#faf8f4] border border-[#ddd5c5] rounded-lg text-[0.875rem] text-[#2a2118] placeholder:text-[#8a7a6a] focus:outline-none focus:border-[#d4622a] focus:ring-1 focus:ring-[#d4622a]/20 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a7a6a] hover:text-[#2a2118] transition-colors"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search — mobile */}
            <div className="sm:hidden flex items-center">
              {mobileSearch ? (
                <div className="flex items-center gap-1">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="h-9 w-40 px-3 bg-[#faf8f4] border border-[#ddd5c5] rounded-lg text-[0.875rem] text-[#2a2118] placeholder:text-[#8a7a6a] focus:outline-none focus:border-[#d4622a] focus:ring-1 focus:ring-[#d4622a]/20 transition-colors"
                  />
                  <button
                    onClick={() => { setMobileSearch(false); setSearch(''); }}
                    className="p-1.5 text-[#8a7a6a] hover:text-[#2a2118] hover:bg-[#f7f5f1] rounded-lg transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setMobileSearch(true)}
                  className="p-2 border border-[#ddd5c5] bg-[#faf8f4] text-[#8a7a6a] hover:text-[#2a2118] hover:border-[#2a2118] rounded-lg transition-colors"
                >
                  <FiSearch className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-[#e8e3db]" />

            {/* Add Skill button */}
            <button
              onClick={() => setModalCategory('')}
              className="flex items-center gap-2 px-4 py-2 bg-[#2a2118] text-[#f0ece3] rounded-lg text-[0.82rem] font-medium hover:bg-[#d4622a] transition-colors"
            >
              <FiPlus className="w-3.5 h-3.5" />
              Add Skill
            </button>
          </div>
        </div>

        {/* ── Category cards ── */}
        {Object.keys(filteredSkills).length === 0 ? (
          <div className="text-center py-20 text-[#8a7a6a] text-[0.875rem]">No skills found.</div>
        ) : (
          <div className="flex flex-col gap-5">
            {Object.entries(filteredSkills).map(([category, categorySkills]) => (
              <div key={category} className="bg-white border border-[#e8e3db] rounded-xl shadow-sm overflow-hidden">

                {/* Category header */}
                <div className="flex items-center justify-between px-5 py-3 bg-[#f7f5f1] border-b border-[#e8e3db]">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-[0.875rem] font-semibold text-[#2a2118]">{category}</h2>
                    <span className="text-[0.7rem] font-mono text-[#8a7a6a] bg-white border border-[#e8e3db] px-2 py-0.5 rounded-full">
                      {categorySkills.length} {categorySkills.length === 1 ? 'skill' : 'skills'}
                    </span>
                  </div>
                  <button
                    onClick={() => setModalCategory(category)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[0.72rem] border border-[#ddd5c5] text-[#4a3728] rounded-lg hover:border-[#d4622a] hover:text-[#d4622a] transition-colors"
                    title={`Add skill to ${category}`}
                  >
                    <FiPlus className="w-3 h-3" />
                    Add to {category.split(' ')[0]}
                  </button>
                </div>

                {/* Table */}
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="bg-[#f7f5f1] text-[0.65rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a] px-4 py-2.5 font-medium text-left">Name</th>
                      <th className="bg-[#f7f5f1] text-[0.65rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a] px-4 py-2.5 font-medium text-left">Proficiency</th>
                      <th className="bg-[#f7f5f1] text-[0.65rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a] px-4 py-2.5 font-medium text-left">Order</th>
                      <th className="bg-[#f7f5f1] text-[0.65rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a] px-4 py-2.5 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorySkills.map((skill) => (
                      <tr key={skill._id} className="border-b border-[#e8e3db] hover:bg-[#faf8f4] transition-colors group">
                        <td className="px-4 py-3 text-[0.875rem] text-[#2a2118] font-medium">{skill.name}</td>
                        <td className="px-4 py-3">
                          <ProficiencyDots value={skill.proficiency ?? 0} />
                        </td>
                        <td className="px-4 py-3 text-[0.875rem] text-[#8a7a6a] font-mono">{skill.order}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <Link
                              href={`/dashboard/skills/edit/${skill._id}`}
                              className="p-1.5 text-[#8a7a6a] hover:text-[#2a2118] hover:bg-[#f7f5f1] rounded-lg transition-colors"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(skill._id)}
                              className="p-1.5 text-[#8a7a6a] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {modalCategory !== null && (
        <AddSkillModal
          initialCategory={modalCategory}
          onClose={() => setModalCategory(null)}
          onSuccess={fetchSkills}
        />
      )}
    </>
  );
}
