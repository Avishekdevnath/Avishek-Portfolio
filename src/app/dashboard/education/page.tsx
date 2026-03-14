"use client";

import React, { useState, useEffect } from 'react';
import {
  GraduationCap, Calendar, MapPin, Star, Plus, Pencil, Trash2,
  BookOpen, Award, Eye, X, Trophy, Users, FileText
} from 'lucide-react';
import type { IEducation, DraftContent } from '@/types/experience';
import EducationForm from '@/components/dashboard/EducationForm';

type Education = Omit<IEducation, '_id' | 'startDate' | 'endDate'> & {
  _id?: string;
  startDate: string;
  endDate?: string;
};

interface EducationData {
  _id?: string;
  type: 'education';
  title: string;
  degree: string;
  institution: string;
  organization: string;
  location: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  featured: boolean;
  order: number;
  status: 'draft' | 'published';
  fieldOfStudy: string;
  gpa?: number | null;
  maxGpa?: number | null;
  activities: string[];
  honors: string[];
  coursework: string[];
  thesis?: { title?: string; description?: string; supervisor?: string; } | null;
}

const renderDescription = (description: string | DraftContent): JSX.Element => {
  if (typeof description === 'string') return <div>{description}</div>;
  return <div>{typeof description === 'string' ? description : JSON.stringify(description)}</div>;
};

function EducationDetailsModal({ education, onClose }: { education: Education; onClose: () => void; }) {
  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getDateRange = () => {
    const start = formatDate(education.startDate);
    const end = education.isCurrent ? 'Present' : (education.endDate ? formatDate(education.endDate) : 'Present');
    return `${start} – ${end}`;
  };

  const InfoRow = ({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) => (
    <div className="flex items-start gap-3 p-3 bg-[#faf8f4] rounded-lg">
      <div className="w-8 h-8 rounded-lg bg-white border border-[#e8e3db] flex items-center justify-center flex-shrink-0">
        <Icon size={14} className="text-[#6b5c4e]" />
      </div>
      <div className="min-w-0">
        <p className="text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a]">{label}</p>
        <div className="text-[0.82rem] font-medium text-[#2a2118] mt-0.5">{children}</div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[#e8e3db] px-5 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#fef3e2] text-[#92510a] flex items-center justify-center flex-shrink-0">
              <GraduationCap size={16} />
            </div>
            <div>
              <h2 className="text-[0.95rem] font-semibold text-[#2a2118]">{education.degree}</h2>
              <p className="text-[0.78rem] text-[#8a7a6a]">{education.institution}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#8a7a6a] hover:text-[#2a2118] hover:bg-[#f7f5f1] rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InfoRow icon={GraduationCap} label="Institution">{education.institution}</InfoRow>
            <InfoRow icon={BookOpen} label="Field of Study">{education.fieldOfStudy}</InfoRow>
            <InfoRow icon={Calendar} label="Duration">{getDateRange()}</InfoRow>
            <InfoRow icon={MapPin} label="Location">{education.location}</InfoRow>
            {education.gpa && education.maxGpa && (
              <InfoRow icon={Trophy} label="GPA">
                <div>
                  <span>{education.gpa} / {education.maxGpa}</span>
                  <div className="w-full bg-[#e8e3db] rounded-full h-1.5 mt-1.5">
                    <div className="bg-[#d4622a] h-1.5 rounded-full" style={{ width: `${(education.gpa / education.maxGpa) * 100}%` }} />
                  </div>
                </div>
              </InfoRow>
            )}
            <InfoRow icon={Star} label="Status">
              <div className="flex flex-wrap gap-1.5">
                <span className={`text-[0.65rem] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full ${education.status === 'published' ? 'bg-[#e6f2ee] text-[#2a6b4f]' : 'bg-[#fef3e2] text-[#92510a]'}`}>{education.status}</span>
                {education.featured && <span className="text-[0.65rem] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#fdf0eb] text-[#d4622a]">Featured</span>}
                {education.isCurrent && <span className="text-[0.65rem] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#e8f0fc] text-[#2d4eb3]">Current</span>}
              </div>
            </InfoRow>
          </div>

          {education.honors && education.honors.length > 0 && (
            <div className="bg-[#faf8f4] border border-[#e8e3db] rounded-xl p-4">
              <p className="text-[0.65rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a] mb-3 flex items-center gap-1.5"><Award size={12} /> Honors & Awards</p>
              <div className="flex flex-wrap gap-1.5">
                {education.honors.map((honor, i) => (
                  <span key={i} className="text-[0.72rem] font-mono px-2.5 py-0.5 rounded-full bg-[#fef3e2] text-[#92510a]">{honor}</span>
                ))}
              </div>
            </div>
          )}

          {education.activities && education.activities.length > 0 && (
            <div className="bg-[#faf8f4] border border-[#e8e3db] rounded-xl p-4">
              <p className="text-[0.65rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a] mb-3 flex items-center gap-1.5"><Users size={12} /> Activities</p>
              <div className="flex flex-wrap gap-1.5">
                {education.activities.map((act, i) => (
                  <span key={i} className="text-[0.72rem] font-mono px-2.5 py-0.5 rounded-full bg-[#e8f0fc] text-[#2d4eb3]">{act}</span>
                ))}
              </div>
            </div>
          )}

          {education.coursework && education.coursework.length > 0 && (
            <div className="bg-[#faf8f4] border border-[#e8e3db] rounded-xl p-4">
              <p className="text-[0.65rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a] mb-3 flex items-center gap-1.5"><BookOpen size={12} /> Coursework</p>
              <div className="flex flex-wrap gap-1.5">
                {education.coursework.map((course, i) => (
                  <span key={i} className="text-[0.72rem] font-mono px-2.5 py-0.5 rounded-full bg-[#e6f2ee] text-[#2a6b4f]">{course}</span>
                ))}
              </div>
            </div>
          )}

          {education.thesis && (education.thesis.title || education.thesis.description || education.thesis.supervisor) && (
            <div className="bg-[#faf8f4] border border-[#e8e3db] rounded-xl p-4">
              <p className="text-[0.65rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a] mb-3 flex items-center gap-1.5"><FileText size={12} /> Thesis / Research</p>
              <div className="space-y-2">
                {education.thesis.title && <p className="text-[0.875rem] font-semibold text-[#2a2118]">{education.thesis.title}</p>}
                {education.thesis.supervisor && <p className="text-[0.78rem] text-[#8a7a6a]">Supervisor: <span className="text-[#4a3728] font-medium">{education.thesis.supervisor}</span></p>}
                {education.thesis.description && <p className="text-[0.82rem] text-[#4a3728]">{education.thesis.description}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EducationCard({ education, onEdit, onDelete, onView }: {
  education: Education;
  onEdit: (edu: Education) => void;
  onDelete: (id: string) => void;
  onView: (edu: Education) => void;
}) {
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const getDateRange = () => {
    const start = formatDate(education.startDate);
    const end = education.isCurrent ? 'Present' : (education.endDate ? formatDate(education.endDate) : 'Present');
    return `${start} – ${end}`;
  };

  const title = education.degree || education.title;
  const subtitle = education.institution || education.organization;

  return (
    <div className="bg-white border border-[#e8e3db] rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#fef3e2] text-[#92510a] flex items-center justify-center flex-shrink-0">
            <GraduationCap size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-[0.875rem] font-semibold text-[#2a2118] truncate">{title}</h3>
              {education.featured && <Star size={13} className="text-[#d4622a] fill-[#d4622a] flex-shrink-0" />}
              <span className={`text-[0.65rem] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${education.status === 'published' ? 'bg-[#e6f2ee] text-[#2a6b4f]' : 'bg-[#fef3e2] text-[#92510a]'}`}>{education.status}</span>
            </div>
            <p className="text-[0.82rem] font-medium text-[#4a3728] mb-1.5">{subtitle}</p>
            <div className="flex items-center flex-wrap gap-3 text-[0.72rem] text-[#8a7a6a] font-mono mb-2">
              <span className="flex items-center gap-1"><Calendar size={11} /> {getDateRange()}</span>
              {education.location && <span className="flex items-center gap-1"><MapPin size={11} /> {education.location}</span>}
              {education.fieldOfStudy && <span className="flex items-center gap-1"><BookOpen size={11} /> {education.fieldOfStudy}</span>}
            </div>
            {education.gpa && education.maxGpa && (
              <span className="inline-flex items-center gap-1 text-[0.65rem] font-mono tracking-wide px-2.5 py-0.5 rounded-full bg-[#fef3e2] text-[#92510a]">
                <Trophy size={10} /> GPA: {education.gpa} / {education.maxGpa}
              </span>
            )}
            {education.honors && education.honors.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {education.honors.slice(0, 2).map((honor, i) => (
                  <span key={i} className="text-[0.6rem] font-mono px-2 py-0.5 rounded-full bg-[#fef3e2] text-[#92510a]">{honor}</span>
                ))}
                {education.honors.length > 2 && <span className="text-[0.65rem] font-mono text-[#8a7a6a]">+{education.honors.length - 2}</span>}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => onView(education)} className="p-1.5 text-[#8a7a6a] hover:text-[#2a2118] hover:bg-[#f3f1ee] rounded-lg transition-colors" title="View Details"><Eye size={14} /></button>
          <button onClick={() => onEdit(education)} className="p-1.5 text-[#8a7a6a] hover:text-[#2a2118] hover:bg-[#f3f1ee] rounded-lg transition-colors" title="Edit"><Pencil size={14} /></button>
          <button onClick={() => onDelete(education._id!)} className="p-1.5 text-[#8a7a6a] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  );
}

export default function EducationPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [educationEntries, setEducationEntries] = useState<Education[]>([]);
  const [viewingEducation, setViewingEducation] = useState<Education | null>(null);
  const [showForm, setShowForm] = useState<{ show: boolean; mode: 'create' | 'edit'; data?: EducationData }>({ show: false, mode: 'create' });

  const fetchEducation = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/experience/education?status=all');
      const data = await response.json();
      if (data.success) {
        setEducationEntries(data.data.education || []);
      } else {
        setError(data.error || 'Failed to fetch education entries');
      }
    } catch {
      setError('Failed to fetch education entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEducation(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this education entry?')) return;
    try {
      const response = await fetch(`/api/experience/education/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) { fetchEducation(); } else { alert('Failed to delete education entry'); }
    } catch { alert('Failed to delete education entry'); }
  };

  const handleEdit = (education: Education) => {
    const { _id, description, thesis, type, title, organization, ...rest } = education;
    const convertedDescription = typeof description === 'string' ? description : JSON.stringify(description);
    const convertedThesis = thesis ? {
      title: thesis.title,
      description: typeof thesis.description === 'string' ? thesis.description : JSON.stringify(thesis.description),
      supervisor: thesis.supervisor
    } : null;
    const educationData: EducationData = {
      _id,
      type: 'education',
      title: education.degree || education.title || '',
      organization: education.institution || education.organization || '',
      description: convertedDescription,
      thesis: convertedThesis,
      ...rest
    };
    setShowForm({ show: true, mode: 'edit', data: educationData });
  };

  const handleCloseForm = () => { setShowForm({ show: false, mode: 'create', data: undefined }); fetchEducation(); };

  if (showForm.show) {
    return <EducationForm mode={showForm.mode} initialData={showForm.data} onClose={handleCloseForm} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-[#e8e3db] border-t-[#d4622a] rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total', value: educationEntries.length, icon: GraduationCap, tint: 'bg-[#fef3e2] text-[#92510a]' },
    { label: 'Published', value: educationEntries.filter(e => e.status === 'published').length, icon: BookOpen, tint: 'bg-[#e6f2ee] text-[#2a6b4f]' },
    { label: 'Featured', value: educationEntries.filter(e => e.featured).length, icon: Star, tint: 'bg-[#fdf0eb] text-[#d4622a]' },
    { label: 'With Honors', value: educationEntries.filter(e => e.honors && e.honors.length > 0).length, icon: Award, tint: 'bg-[#e8f0fc] text-[#2d4eb3]' },
  ];

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between">
        <p className="text-[0.65rem] font-mono tracking-[0.15em] uppercase text-[#8a7a6a]">
          {educationEntries.length} entr{educationEntries.length !== 1 ? 'ies' : 'y'}
        </p>
        <button
          onClick={() => setShowForm({ show: true, mode: 'create' })}
          className="flex items-center gap-2 px-4 py-2 bg-[#2a2118] text-[#f0ece3] rounded-lg text-[0.82rem] font-medium hover:bg-[#d4622a] transition-colors"
        >
          <Plus size={14} /> Add Education
        </button>
      </div>

      {error && (
        <div className="bg-[#fceaea] border border-[#f0b8b8] text-[#c0392b] px-5 py-4 rounded-xl text-[0.875rem]">
          {error}
        </div>
      )}

      {viewingEducation && (
        <EducationDetailsModal education={viewingEducation} onClose={() => setViewingEducation(null)} />
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, tint }) => (
          <div key={label} className="bg-white border border-[#e8e3db] rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${tint}`}>
              <Icon size={16} />
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold text-[#2a2118] leading-none">{value}</p>
              <p className="text-[0.72rem] text-[#8a7a6a] mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Education List */}
      {educationEntries.length === 0 ? (
        <div className="bg-white border border-[#e8e3db] rounded-xl shadow-sm flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#f3f1ee] flex items-center justify-center mb-4">
            <GraduationCap size={24} className="text-[#8a7a6a]" />
          </div>
          <p className="text-[0.875rem] font-medium text-[#2a2118] mb-1">No education entries yet</p>
          <p className="text-[0.78rem] text-[#8a7a6a] mb-4">Get started by adding your first education entry.</p>
          <button
            onClick={() => setShowForm({ show: true, mode: 'create' })}
            className="flex items-center gap-2 px-4 py-2 bg-[#2a2118] text-[#f0ece3] rounded-lg text-[0.82rem] font-medium hover:bg-[#d4622a] transition-colors"
          >
            <Plus size={14} /> Add Education
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {educationEntries.map((education) => (
            <EducationCard
              key={education._id}
              education={education}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={(edu) => setViewingEducation(edu)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
