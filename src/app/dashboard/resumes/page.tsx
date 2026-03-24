"use client";

import { useEffect, useMemo, useState } from 'react';
import { FiUpload, FiPlus, FiStar, FiTrash2, FiEye, FiEdit2, FiRotateCcw } from 'react-icons/fi';
import { useToast } from '@/context/ToastContext';

interface ResumeFileVersion {
  version?: number;
  url: string;
  fileName?: string;
  uploadedAt: string;
}

interface ResumeVariant {
  _id: string;
  title: string;
  slug: string;
  summary?: string;
  markdownContent?: string;
  markdownUpdatedAt?: string;
  focusTags: string[];
  fileUrl?: string;
  fileName?: string;
  fileSizeBytes?: number;
  currentFileVersion?: number;
  status: 'draft' | 'ready' | 'failed';
  publicViewEnabled: boolean;
  isPrimary: boolean;
  fileVersions: ResumeFileVersion[];
  updatedAt: string;
}

interface ResumeFormState {
  title: string;
  slug: string;
  summary: string;
  focusTags: string;
  markdownContent: string;
}

const emptyForm: ResumeFormState = {
  title: '',
  slug: '',
  summary: '',
  focusTags: '',
  markdownContent: '',
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function DashboardResumesPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<ResumeVariant[]>([]);
  const [editing, setEditing] = useState<ResumeVariant | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ResumeFormState>(emptyForm);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [dragOverCardId, setDragOverCardId] = useState<string | null>(null);
  const [isDragOverModalUpload, setIsDragOverModalUpload] = useState(false);
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [openVersionMenu, setOpenVersionMenu] = useState<string | null>(null);
  const [openCardMenu, setOpenCardMenu] = useState<string | null>(null);

  const totalPublic = useMemo(() => items.filter((item) => item.publicViewEnabled).length, [items]);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/resumes', { cache: 'no-store' });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to load resumes');
      setItems(data.data || []);
    } catch (error) {
      showToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load resumes',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setSlugManuallyEdited(false);
    setOpen(true);
  };

  const openEdit = (item: ResumeVariant) => {
    setEditing(item);
    setForm({
      title: item.title,
      slug: item.slug,
      summary: item.summary || '',
      focusTags: item.focusTags.join(', '),
      markdownContent: item.markdownContent || '',
    });
    setSlugManuallyEdited(true);
    setOpen(true);
  };

  const handleTitleChange = (title: string) => {
    setForm((prev) => {
      const next = { ...prev, title };
      if (!slugManuallyEdited) {
        next.slug = toSlug(title);
      }
      return next;
    });
  };

  const handleSlugChange = (slug: string) => {
    setSlugManuallyEdited(true);
    setForm((prev) => ({ ...prev, slug: toSlug(slug) }));
  };

  const handleRegenerateSlug = () => {
    setSlugManuallyEdited(false);
    setForm((prev) => ({ ...prev, slug: toSlug(prev.title) }));
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        title: form.title,
        slug: form.slug,
        summary: form.summary,
        markdownContent: form.markdownContent,
        focusTags: form.focusTags
          .split(',')
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean),
      };

      const response = await fetch(editing ? `/api/resumes/${editing._id}` : '/api/resumes', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to save resume variant');

      showToast({
        title: 'Success',
        description: editing ? 'Resume variant updated' : 'Resume variant created',
        status: 'success',
      });
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      setSlugManuallyEdited(false);
      await fetchResumes();
    } catch (error) {
      showToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save',
        status: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: ResumeVariant) => {
    if (!confirm(`Delete resume variant "${item.title}"?`)) return;
    try {
      const response = await fetch(`/api/resumes/${item._id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to delete');

      showToast({ title: 'Deleted', description: 'Resume variant removed', status: 'success' });
      fetchResumes();
    } catch (error) {
      showToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete',
        status: 'error',
      });
    }
  };

  const handleRemoveFile = async (item: ResumeVariant) => {
    if (!confirm(`Remove PDF file from "${item.title}"? The variant and all metadata will remain.`)) return;
    try {
      const response = await fetch(`/api/resumes/${item._id}/remove-file`, { method: 'POST' });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to remove file');

      showToast({ title: 'File Removed', description: 'PDF removed, variant kept', status: 'success' });
      fetchResumes();
      if (editing?._id === item._id) {
        openEdit(data.data);
      }
    } catch (error) {
      showToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove file',
        status: 'error',
      });
    }
  };

  const handleSetPrimary = async (item: ResumeVariant) => {
    try {
      const response = await fetch(`/api/resumes/${item._id}/set-primary`, { method: 'POST' });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to set primary');

      showToast({ title: 'Primary updated', description: `${item.title} is now primary`, status: 'success' });
      fetchResumes();
    } catch (error) {
      showToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to set primary',
        status: 'error',
      });
    }
  };

  const handleTogglePublic = async (item: ResumeVariant) => {
    try {
      const response = await fetch(`/api/resumes/${item._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicViewEnabled: !item.publicViewEnabled }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to change visibility');

      showToast({
        title: 'Visibility updated',
        description: !item.publicViewEnabled ? 'Resume is now public' : 'Resume is now private',
        status: 'success',
      });
      fetchResumes();
    } catch (error) {
      showToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update visibility',
        status: 'error',
      });
    }
  };

  const handleUpload = async (item: ResumeVariant, file?: File) => {
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      showToast({
        title: 'Invalid file',
        description: 'Please upload a PDF file only.',
        status: 'error',
      });
      return;
    }

    try {
      setUploadingItemId(item._id);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', file);

      const response = await new Promise<Response>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(new Response(xhr.responseText, { status: xhr.status }));
          } else {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'));
        });

        xhr.open('POST', `/api/resumes/${item._id}/upload`);
        xhr.send(formData);
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Upload failed');

      showToast({
        title: 'Upload complete',
        description: `${file.name} uploaded successfully`,
        status: 'success',
      });
      fetchResumes();
    } catch (error) {
      showToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Upload failed',
        status: 'error',
      });
    } finally {
      setUploadingItemId(null);
      setUploadProgress(0);
    }
  };

  const preventDragDefaults = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleCardDrop = (item: ResumeVariant, e: React.DragEvent<HTMLDivElement>) => {
    preventDragDefaults(e);
    setDragOverCardId(null);
    const file = e.dataTransfer.files?.[0];
    void handleUpload(item, file);
  };

  const handleModalDrop = (e: React.DragEvent<HTMLDivElement>) => {
    preventDragDefaults(e);
    setIsDragOverModalUpload(false);
    if (!editing) return;
    const file = e.dataTransfer.files?.[0];
    void handleUpload(editing, file);
  };

  const handleRollback = async (item: ResumeVariant, version: number) => {
    try {
      const response = await fetch(`/api/resumes/${item._id}/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Rollback failed');

      showToast({ title: 'Rolled back', description: 'Previous version restored', status: 'success' });
      fetchResumes();
    } catch (error) {
      showToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Rollback failed',
        status: 'error',
      });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-mono tracking-[0.15em] uppercase text-[#8a7a6a]">
            {items.length} variants · {totalPublic} public
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#2a2118] text-[#f0ece3] rounded-lg text-[0.82rem] font-medium hover:bg-[#d4622a] transition-colors"
        >
          <FiPlus className="w-3.5 h-3.5" />
          Add Resume Variant
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#e8e3db] border-t-[#d4622a]" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-[#e8e3db] rounded-xl p-8 text-center text-[#8a7a6a] text-[0.9rem]">
          No resume variants yet. Create your first one.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item._id} className="bg-white border border-[#e8e3db] rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-[0.95rem] font-semibold text-[#2a2118] flex items-center gap-2">
                    {item.title}
                    {item.isPrimary && (
                      <span className="text-[0.62rem] font-mono uppercase tracking-[0.1em] px-2 py-0.5 rounded-full border border-[#f0c8b0] text-[#d4622a] bg-[#fdf0eb]">
                        Primary
                      </span>
                    )}
                    {item.publicViewEnabled && (
                      <span className="text-[0.62rem] font-mono uppercase tracking-[0.1em] px-2 py-0.5 rounded-full border border-[#cde8df] text-[#2b7a68] bg-[#eef9f5]">
                        Public
                      </span>
                    )}
                  </h3>
                  <p className="text-[0.73rem] font-mono text-[#8a7a6a] mt-1">/resume/{item.slug}</p>
                  {item.summary && <p className="text-[0.82rem] text-[#4a3728] mt-2">{item.summary}</p>}
                </div>
                
                {/* 3-Dot Options Menu */}
                <div className="relative">
                  <button
                    onClick={() => setOpenCardMenu(openCardMenu === item._id ? null : item._id)}
                    className="px-2 py-1.5 text-[#8a7a6a] hover:text-[#2a2118] hover:bg-[#faf8f4] rounded-lg border border-[#ddd5c5] hover:border-[#2a2118] transition-colors"
                    title="Actions"
                  >
                    ⋮
                  </button>
                  
                  {/* Dropdown Menu */}
                  {openCardMenu === item._id && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-[#ddd5c5] rounded-lg shadow-xl z-50 min-w-[160px] py-1">
                      <button
                        onClick={() => {
                          openEdit(item);
                          setOpenCardMenu(null);
                        }}
                        className="block w-full text-left px-3 py-1.5 text-[0.7rem] text-[#2a2118] hover:bg-[#faf8f4] transition-colors flex items-center gap-2"
                      >
                        <FiEdit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          handleSetPrimary(item);
                          setOpenCardMenu(null);
                        }}
                        className="block w-full text-left px-3 py-1.5 text-[0.7rem] text-[#2a2118] hover:bg-[#faf8f4] transition-colors flex items-center gap-2"
                      >
                        <FiStar className="w-3.5 h-3.5" /> Set Primary
                      </button>
                      <button
                        onClick={() => {
                          handleTogglePublic(item);
                          setOpenCardMenu(null);
                        }}
                        className="block w-full text-left px-3 py-1.5 text-[0.7rem] text-[#2a2118] hover:bg-[#faf8f4] transition-colors flex items-center gap-2"
                      >
                        <FiEye className="w-3.5 h-3.5" /> {item.publicViewEnabled ? 'Make Private' : 'Make Public'}
                      </button>
                      {item.fileUrl && (
                        <button
                          onClick={() => {
                            handleRemoveFile(item);
                            setOpenCardMenu(null);
                          }}
                          className="block w-full text-left px-3 py-1.5 text-[0.7rem] text-[#b8710f] hover:bg-[#fffcf7] transition-colors flex items-center gap-2"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" /> Remove File
                        </button>
                      )}
                      <button
                        onClick={() => {
                          handleDelete(item);
                          setOpenCardMenu(null);
                        }}
                        className="block w-full text-left px-3 py-1.5 text-[0.7rem] text-[#9b3f3f] hover:bg-[#fff5f5] transition-colors flex items-center gap-2 border-t border-[#eee7dc]"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" /> Delete Variant
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[0.76rem] text-[#8a7a6a]">
                <span>Status: <strong className="text-[#4a3728]">{item.status}</strong></span>
                {item.currentFileVersion ? <span>Current Version: <strong className="text-[#4a3728]">v{item.currentFileVersion}</strong></span> : null}
                {item.fileName && <span>File: <strong className="text-[#4a3728]">{item.fileName}</strong></span>}
                {item.markdownContent ? <span>MD: <strong className="text-[#4a3728]">available</strong></span> : null}
                {item.fileSizeBytes ? <span>Size: <strong className="text-[#4a3728]">{(item.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB</strong></span> : null}
                <span>Updated: <strong className="text-[#4a3728]">{new Date(item.updatedAt).toLocaleString()}</strong></span>
              </div>

              <div
                onDragEnter={(e) => {
                  preventDragDefaults(e);
                  setDragOverCardId(item._id);
                }}
                onDragOver={(e) => {
                  preventDragDefaults(e);
                  setDragOverCardId(item._id);
                }}
                onDragLeave={(e) => {
                  preventDragDefaults(e);
                  setDragOverCardId((prev) => (prev === item._id ? null : prev));
                }}
                onDrop={(e) => handleCardDrop(item, e)}
                className={`flex flex-col gap-2 rounded-lg border px-2 py-2 transition-colors ${
                  dragOverCardId === item._id
                    ? 'border-[#d4622a] bg-[#fdf0eb]'
                    : 'border-[#efe9df] bg-[#fbfaf8]'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-[0.74rem] rounded-lg border border-[#ddd5c5] text-[#4a3728] hover:border-[#2a2118] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" style={{ pointerEvents: uploadingItemId === item._id ? 'none' : 'auto', opacity: uploadingItemId === item._id ? 0.6 : 1 }}>
                    <FiUpload className="w-3.5 h-3.5" /> {uploadingItemId === item._id ? 'Uploading...' : 'Upload PDF'}
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => handleUpload(item, e.target.files?.[0])}
                      disabled={uploadingItemId === item._id}
                    />
                  </label>
                  {item.fileUrl && (
                    <a
                      href={`/r/${item.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-[0.74rem] rounded-lg border border-[#ddd5c5] text-[#4a3728] hover:border-[#2a2118] transition-colors"
                    >
                      Open File
                    </a>
                  )}
                  <span className="text-[0.7rem] text-[#8a7a6a]">
                    {uploadingItemId === item._id ? `${uploadProgress}%` : 'or drag & drop PDF here'}
                  </span>
                </div>
                {uploadingItemId === item._id && (
                  <div className="w-full bg-[#e8e3db] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#d4622a] h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>

              {item.fileVersions?.length > 0 && (
                <div className="border-t border-[#eee7dc] pt-3">
                  <p className="text-[0.68rem] font-mono uppercase tracking-[0.12em] text-[#8a7a6a] mb-2">Version History</p>
                  <div className="flex flex-col gap-2">
                    {item.fileVersions
                      .slice()
                      .sort((a, b) => Number(b.version || 0) - Number(a.version || 0))
                      .slice(0, 5)
                      .map((version, idx) => (
                      <div key={`${version.version || idx}-${version.url}-${idx}`} className="flex flex-wrap items-center justify-between gap-2 text-[0.76rem]">
                        <a className="text-[#2a2118] underline" href={version.url} target="_blank" rel="noopener noreferrer">
                          {version.version ? `v${version.version} · ` : ''}{version.fileName || version.url}
                        </a>
                        <button
                          onClick={() => handleRollback(item, Number(version.version || 0))}
                          disabled={!version.version}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[0.7rem] border border-[#ddd5c5] rounded-md hover:border-[#2a2118] text-[#4a3728]"
                        >
                          <FiRotateCcw className="w-3 h-3" /> Rollback
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-2">
          <div className="w-full max-w-6xl max-h-[92vh] bg-white rounded-2xl border border-[#e8e3db] shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-7 py-4 border-b border-[#eee7dc] bg-gradient-to-r from-[#faf8f4] via-[#fcfbf8] to-white">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#2a2118]">
                    {editing ? '✎ Edit Resume Variant' : '+ Create New Resume'}
                  </h2>
                  <p className="text-[0.75rem] text-[#8a7a6a] mt-1.5 max-w-2xl">
                    {editing 
                      ? 'Update your resume details, add internal notes, and upload new PDF versions with automatic versioning'
                      : 'Create a new resume variant optimized for different roles or positions'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Form Content - NO SCROLL */}
            <form onSubmit={submitForm} className="flex-1 overflow-hidden px-7 py-5">
              <div className="grid grid-cols-2 gap-6 h-full">
                {/* Left Column - Core Details */}
                <div className="space-y-4 flex flex-col">
                  {/* Title */}
                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-[0.12em] text-[#8a7a6a] mb-2 font-bold">Title *</label>
                    <input
                      value={form.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      required
                      placeholder="e.g., Backend Engineer, Data Scientist, Full Stack"
                      className="w-full h-10 px-4 bg-[#faf8f4] border border-[#ddd5c5] rounded-lg text-[0.88rem] font-medium focus:border-[#d4622a] focus:bg-white focus:ring-2 focus:ring-[#fdf0eb] focus:outline-none transition-all"
                    />
                    {form.title && <p className="text-[0.7rem] text-[#8a7a6a] mt-1">✓ Title set</p>}
                  </div>

                  {/* Slug with Real-time Preview */}
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <label className="block text-[0.7rem] font-mono uppercase tracking-[0.12em] text-[#8a7a6a] font-bold">Public URL Slug</label>
                      {!slugManuallyEdited && form.title && (
                        <span className="text-[0.65rem] text-[#d4622a] font-semibold">AUTO MODE</span>
                      )}
                    </div>
                    <input
                      value={form.slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder="auto-generated-from-title"
                      className="w-full h-10 px-4 bg-[#faf8f4] border border-[#ddd5c5] rounded-lg text-[0.88rem] font-mono focus:border-[#d4622a] focus:bg-white focus:ring-2 focus:ring-[#fdf0eb] focus:outline-none transition-all"
                    />
                    <div className="mt-2 p-2.5 bg-gradient-to-r from-[#faf8f4] to-[#fcfbf8] rounded-lg border border-[#eee7dc]">
                      <p className="text-[0.72rem] text-[#2a2118] font-mono">
                        <span className="text-[#8a7a6a]">👁 Public:</span> <span className="font-bold text-[#2a2118]">/resume/{form.slug || 'your-slug'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Focus Tags */}
                  <div>
                    <label className="block text-[0.7rem] font-mono uppercase tracking-[0.12em] text-[#8a7a6a] mb-2 font-bold">Focus Tags (searchable)</label>
                    <input
                      value={form.focusTags}
                      onChange={(e) => setForm((prev) => ({ ...prev, focusTags: e.target.value }))}
                      placeholder="React, TypeScript, Node.js, Cloud Architecture"
                      className="w-full h-10 px-4 bg-[#faf8f4] border border-[#ddd5c5] rounded-lg text-[0.88rem] focus:border-[#d4622a] focus:bg-white focus:ring-2 focus:ring-[#fdf0eb] focus:outline-none transition-all"
                    />
                    {form.focusTags && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {form.focusTags.split(',').map((tag, idx) => (
                          <span key={idx} className="inline-block px-2.5 py-1 bg-[#f0ece3] text-[#4a3728] text-[0.7rem] font-medium rounded-full border border-[#ddd5c5]">
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="flex-1 min-h-0">
                    <label className="block text-[0.7rem] font-mono uppercase tracking-[0.12em] text-[#8a7a6a] mb-2 font-bold">Summary</label>
                    <textarea
                      value={form.summary}
                      onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
                      placeholder="Brief overview describing this resume variant and the roles it targets..."
                      className="w-full h-full px-4 py-3 bg-[#faf8f4] border border-[#ddd5c5] rounded-lg text-[0.86rem] focus:border-[#d4622a] focus:bg-white focus:ring-2 focus:ring-[#fdf0eb] focus:outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Right Column - Markdown & Upload */}
                <div className="space-y-4 flex flex-col">
                  {/* Markdown Content */}
                  <div className="flex-1 min-h-0 flex flex-col">
                    <label className="block text-[0.7rem] font-mono uppercase tracking-[0.12em] text-[#8a7a6a] mb-2 font-bold">
                      Internal Markdown <span className="text-[#d4622a]">(private scoring)</span>
                    </label>
                    <textarea
                      value={form.markdownContent}
                      onChange={(e) => setForm((prev) => ({ ...prev, markdownContent: e.target.value }))}
                      placeholder="Paste your markdown resume here for internal job matching. Not visible on public page."
                      className="flex-1 px-4 py-3 bg-[#faf8f4] border border-[#ddd5c5] rounded-lg text-[0.82rem] font-mono focus:border-[#d4622a] focus:bg-white focus:ring-2 focus:ring-[#fdf0eb] focus:outline-none transition-all resize-none"
                    />
                  </div>

                  {/* PDF Upload Area - Compact but Smart */}
                  <div>
                    <label className="text-[0.7rem] font-mono uppercase tracking-[0.12em] text-[#8a7a6a] mb-2 font-bold block">PDF Versions</label>
                    
                    {/* PDF Version List */}
                    {editing?.fileVersions && editing.fileVersions.length > 0 && (
                      <div className="mb-3 space-y-2 max-h-[140px] overflow-y-auto">
                        {editing.fileVersions
                          .slice()
                          .sort((a, b) => Number(b.version || 0) - Number(a.version || 0))
                          .map((version, idx) => {
                            const versionKey = `${version.version || idx}`;
                            const isOpenMenu = openVersionMenu === versionKey;
                            return (
                              <div key={versionKey} className="flex items-center justify-between gap-2 p-2.5 bg-[#f5f2ed] border border-[#e8e3db] rounded-lg hover:border-[#d4622a] hover:bg-[#faf8f4] transition-all group relative">
                                <div className="flex-1 min-w-0">
                                  <p className="text-[0.7rem] font-semibold text-[#2a2118] truncate">
                                    v{version.version || idx + 1} • {version.fileName?.split('/').pop() || 'resume.pdf'}
                                  </p>
                                  <p className="text-[0.62rem] text-[#8a7a6a]">
                                    {version.fileSizeBytes ? `${(version.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB • ` : ''}
                                    {new Date(version.uploadedAt).toLocaleDateString()}
                                  </p>
                                </div>
                                
                                {/* Vertical Options Menu Button */}
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() => setOpenVersionMenu(isOpenMenu ? null : versionKey)}
                                    className="px-1.5 py-1 text-[#8a7a6a] hover:text-[#2a2118] hover:bg-white rounded-md opacity-0 group-hover:opacity-100 transition-all"
                                    title="Options"
                                  >
                                    ⋮
                                  </button>
                                  
                                  {/* Dropdown Menu */}
                                  {isOpenMenu && (
                                    <div className="absolute right-0 top-full mt-1 bg-white border border-[#ddd5c5] rounded-lg shadow-lg z-50 min-w-[140px] py-1">
                                      <a
                                        href={version.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block px-3 py-1.5 text-[0.7rem] text-[#2a2118] hover:bg-[#faf8f4] transition-colors"
                                      >
                                        👁 View
                                      </a>
                                      {version.version !== editing.currentFileVersion && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleRollback(editing, Number(version.version || 0));
                                            setOpenVersionMenu(null);
                                          }}
                                          className="block w-full text-left px-3 py-1.5 text-[0.7rem] text-[#2a2118] hover:bg-[#faf8f4] transition-colors"
                                        >
                                          ↶ Restore
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          showToast({ title: 'Feature coming', description: 'Individual version delete coming soon', status: 'info' });
                                          setOpenVersionMenu(null);
                                        }}
                                        className="block w-full text-left px-3 py-1.5 text-[0.7rem] text-[#9b3f3f] hover:bg-[#fff5f5] transition-colors"
                                      >
                                        🗑 Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                    
                    {/* Current File Info */}
                    {editing && editing.fileUrl && (
                      <div className="mb-3 p-3 bg-[#eef9f5] border border-[#cde8df] rounded-lg">
                        <p className="text-[0.7rem] text-[#2b7a68] font-semibold mb-2">📄 Current File</p>
                        <div className="space-y-1.5">
                          <p className="text-[0.68rem] text-[#2b7a68]">
                            <span className="font-semibold">v{editing.currentFileVersion || 1}</span> — {editing.fileName}
                          </p>
                          {editing.fileSizeBytes && (
                            <p className="text-[0.68rem] text-[#2b7a68]">
                              <span className="font-semibold">{(editing.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB</span> • Updated {new Date(editing.updatedAt).toLocaleDateString()}
                            </p>
                          )}
                          <a href={`/r/${editing.slug}`} target="_blank" rel="noopener noreferrer" className="inline-block text-[0.68rem] text-[#d4622a] underline font-semibold hover:text-[#c24a1a]">
                            👁 View Current PDF
                          </a>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(editing)}
                            className="inline-block text-[0.68rem] text-[#b8710f] underline font-semibold hover:text-[#9b5a0a] ml-2"
                          >
                            🗑 Remove File
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Upload Area */}
                    {editing ? (
                      <div
                        onDragEnter={(e) => {
                          preventDragDefaults(e);
                          setIsDragOverModalUpload(true);
                        }}
                        onDragOver={(e) => {
                          preventDragDefaults(e);
                          setIsDragOverModalUpload(true);
                        }}
                        onDragLeave={(e) => {
                          preventDragDefaults(e);
                          setIsDragOverModalUpload(false);
                        }}
                        onDrop={handleModalDrop}
                        className={`rounded-lg border-2 border-dashed p-3 transition-all ${
                          isDragOverModalUpload
                            ? 'border-[#d4622a] bg-[#fdf0eb]'
                            : 'border-[#ddd5c5] bg-[#faf8f4]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 text-[0.72rem] rounded-md border border-[#ddd5c5] bg-white text-[#4a3728] hover:border-[#d4622a] hover:bg-[#fdf0eb] font-semibold transition-all" style={{ pointerEvents: uploadingItemId === editing?._id ? 'none' : 'auto', opacity: uploadingItemId === editing?._id ? 0.6 : 1 }}>
                            <FiUpload className="w-3.5 h-3.5" /> {uploadingItemId === editing?._id ? `Uploading ${uploadProgress}%` : 'Replace PDF'}
                            <input
                              type="file"
                              accept="application/pdf"
                              className="hidden"
                              onChange={(e) => handleUpload(editing, e.target.files?.[0])}
                              disabled={uploadingItemId === editing?._id}
                            />
                          </label>
                        </div>
                        {uploadingItemId === editing?._id && (
                          <div className="mt-3 w-full bg-[#e8e3db] rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-[#d4622a] to-[#c24a1a] h-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[0.72rem] text-[#8a7a6a] px-4 py-3 bg-[#faf8f4] rounded-lg border border-[#eee7dc] italic">
                        💾 Save first, then you can upload your PDF
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </form>

            {/* Footer Actions */}
            <div className="px-7 py-3.5 border-t border-[#eee7dc] bg-gradient-to-r from-[#faf8f4] to-[#fcfbf8] flex items-center justify-between">
              <p className="text-[0.68rem] text-[#8a7a6a] font-mono">
                {form.title && form.slug ? '✓ Ready to save' : '⚠ Complete required fields'}
              </p>
              <div className="flex items-center gap-2.5">
                {editing && (
                  <div className="flex items-center gap-2.5 border-l border-[#eee7dc] pl-2.5">
                    {editing.fileUrl && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(editing)}
                        className="px-3 py-1.5 text-[0.75rem] font-semibold border border-[#f5e6cc] rounded-lg text-[#b8710f] hover:border-[#e6c990] hover:bg-[#fffcf7] transition-all"
                        title="Remove PDF but keep variant"
                      >
                        🗄 Remove File
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(editing)}
                      className="px-3 py-1.5 text-[0.75rem] font-semibold border border-[#f0d5d5] rounded-lg text-[#9b3f3f] hover:border-[#d87a7a] hover:bg-[#fff5f5] transition-all"
                      title="Delete entire variant and all data"
                    >
                      🗑 Delete Variant
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-[0.8rem] font-semibold border border-[#ddd5c5] rounded-lg text-[#4a3728] hover:border-[#8a7a6a] hover:bg-[#faf8f4] transition-all"
                >
                  Cancel
                </button>
                <button
                  disabled={saving || !form.title || !form.slug}
                  type="submit"
                  onClick={(e) => { e.preventDefault(); submitForm(e as any); }}
                  className="px-5 py-2 text-[0.8rem] font-semibold rounded-lg bg-[#2a2118] text-[#f0ece3] hover:bg-[#1a1410] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {saving ? '⏳ Saving…' : editing ? '✓ Update' : '✓ Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
