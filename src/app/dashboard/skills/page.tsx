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
          className={`w-1.5 h-1.5 rounded-full ${i < value ? 'bg-blue-400' : 'bg-gray-200'}`}
        />
      ))}
      <span className="ml-1 text-xs text-gray-400">{value}/5</span>
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

  const inputCls = "mt-1 block w-full text-sm rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all text-gray-800";
  const labelCls = "block text-xs font-medium text-gray-500";

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
    >
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Add New Skill</h2>
            {initialCategory && (
              <p className="text-xs text-gray-400 mt-0.5">in {initialCategory}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
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
              <div className="mt-1 flex items-center justify-between h-9 px-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-[13px] font-medium text-blue-700">{initialCategory}</span>
                <span className="text-[10px] font-medium tracking-wide uppercase text-blue-400 bg-blue-100 px-2 py-0.5 rounded-full">locked</span>
              </div>
            ) : (
              <select name="category" value={form.category} onChange={handleChange} required className={inputCls}>
                <option value="">Select category</option>
                {skillCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
          </div>

          {/* Proficiency */}
          <div>
            <label className={labelCls}>
              Proficiency * &nbsp;
              <span className="font-semibold text-blue-500">{form.proficiency} / 5</span>
            </label>
            <input
              type="range"
              name="proficiency"
              min={0}
              max={5}
              step={1}
              value={form.proficiency}
              onChange={handleChange}
              className="mt-2 w-full accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5 px-0.5">
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
                  className="w-4 h-4 accent-blue-500 rounded"
                />
                <span className="text-xs font-medium text-gray-500">Featured</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors"
            >
              {loading ? 'Adding...' : 'Add Skill'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-screen bg-gray-50">

        {/* ── Sticky header ── */}
        <div className="shrink-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Skills Management</h1>
              <p className="text-xs text-gray-400 mt-0.5">{totalSkills} skills across {categoryCount} categories</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Search — desktop: plain input, mobile: icon toggle */}
              <div className="relative">
                {/* Desktop */}
                <div className="hidden sm:block">
                  <input
                    type="text"
                    placeholder="Search skills…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="h-9 w-72 pl-4 pr-8 text-[13px] font-medium text-gray-800 placeholder:text-gray-400 placeholder:font-normal bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 focus:bg-white transition-all duration-200"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                    >
                      <FiX className="w-3 h-3 text-gray-500" />
                    </button>
                  )}
                </div>
                {/* Mobile */}
                <div className="sm:hidden flex items-center">
                  {mobileSearch ? (
                    <div className="flex items-center gap-1">
                      <input
                        autoFocus
                        type="text"
                        placeholder="Search…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="h-9 w-44 pl-3 pr-3 text-[13px] font-medium text-gray-800 placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 focus:bg-white transition-all duration-200"
                      />
                      <button
                        onClick={() => { setMobileSearch(false); setSearch(''); }}
                        className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setMobileSearch(true)}
                      className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <FiSearch className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="w-px h-5 bg-gray-200" />

              {/* Add button */}
              <button
                onClick={() => setModalCategory('')}
                className="h-9 flex items-center gap-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-medium pl-3.5 pr-4 rounded-lg transition-colors duration-150 shadow-sm shadow-blue-500/30 select-none"
              >
                <span className="flex items-center justify-center w-4 h-4 bg-white/20 rounded">
                  <FiPlus className="w-3 h-3" />
                </span>
                Add Skill
              </button>
            </div>
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {Object.keys(filteredSkills).length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-sm">No skills found.</div>
          ) : (
            <div className="flex flex-col gap-4">
              {Object.entries(filteredSkills).map(([category, categorySkills]) => (
                <div key={category} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

                  {/* Category header */}
                  <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-sm font-semibold text-gray-700">{category}</h2>
                      <span className="text-xs text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                        {categorySkills.length} {categorySkills.length === 1 ? 'skill' : 'skills'}
                      </span>
                    </div>
                    <button
                      onClick={() => setModalCategory(category)}
                      className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 hover:bg-blue-50 px-2.5 py-1 rounded-lg transition-colors border border-blue-100"
                      title={`Add skill to ${category}`}
                    >
                      <FiPlus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>

                  {/* Table */}
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                        <th className="px-5 py-2.5 text-left font-medium">Name</th>
                        <th className="px-5 py-2.5 text-left font-medium">Proficiency</th>
                        <th className="px-5 py-2.5 text-left font-medium">Order</th>
                        <th className="px-5 py-2.5 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {categorySkills.map((skill) => (
                        <tr key={skill._id} className="hover:bg-gray-50/60 transition-colors group">
                          <td className="px-5 py-3 font-medium text-gray-800">{skill.name}</td>
                          <td className="px-5 py-3">
                            <ProficiencyDots value={skill.proficiency ?? 0} />
                          </td>
                          <td className="px-5 py-3 text-gray-400 text-xs">{skill.order}</td>
                          <td className="px-5 py-3">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Link
                                href={`/dashboard/skills/edit/${skill._id}`}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDelete(skill._id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
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
