"use client";

import { useState, useEffect } from 'react';
import { PlusCircle, Pencil, Trash2, Building2, Calendar, MapPin, Star, Briefcase, TrendingUp, Award, Eye, X, Globe, Clock, Code, Target, CheckCircle } from 'lucide-react';
import ExperienceForm from '@/components/dashboard/ExperienceForm';
import { IWorkExperience, ExperienceApiResponse, ExperienceListApiResponse } from '@/types/experience';

function WorkExperienceDetailsModal({ experience, onClose }: { experience: IWorkExperience; onClose: () => void; }) {
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const getDateRange = () => {
    const start = formatDate(experience.startDate.toString());
    const end = experience.isCurrent ? 'Present' : (experience.endDate ? formatDate(experience.endDate.toString()) : 'Present');
    return `${start} – ${end}`;
  };

  const getDuration = () => {
    const startDate = new Date(experience.startDate);
    const endDate = experience.isCurrent ? new Date() : (experience.endDate ? new Date(experience.endDate) : new Date());
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    const diffMonths = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    if (diffYears > 0) return `${diffYears}y ${diffMonths > 0 ? `${diffMonths}m` : ''}`;
    return `${diffMonths}m`;
  };

  const getDisplayTitle = () => {
    if (experience.jobTitle) return experience.level ? `${experience.level} ${experience.jobTitle}` : experience.jobTitle;
    if (experience.position) return experience.position;
    return experience.title;
  };

  const title = getDisplayTitle();
  const company = experience.company || experience.organization;

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
            <div className="w-9 h-9 rounded-lg bg-[#e8f0fc] text-[#2d4eb3] flex items-center justify-center flex-shrink-0">
              <Building2 size={16} />
            </div>
            <div>
              <h2 className="text-[0.95rem] font-semibold text-[#2a2118]">{title}</h2>
              <p className="text-[0.78rem] text-[#8a7a6a]">{company}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#8a7a6a] hover:text-[#2a2118] hover:bg-[#f7f5f1] rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InfoRow icon={Building2} label="Company">{company}</InfoRow>
            <InfoRow icon={Calendar} label="Duration">{getDateRange()} <span className="text-[#8a7a6a] font-normal">({getDuration()})</span></InfoRow>
            <InfoRow icon={MapPin} label="Location">{experience.location}</InfoRow>
            {experience.employmentType && (
              <InfoRow icon={Clock} label="Employment Type">{experience.employmentType.replace('-', ' ')}</InfoRow>
            )}
            {experience.website && (
              <InfoRow icon={Globe} label="Company Website">
                <a href={experience.website} target="_blank" rel="noopener noreferrer" className="text-[#d4622a] hover:underline">{experience.website}</a>
              </InfoRow>
            )}
            <InfoRow icon={Star} label="Status">
              <div className="flex flex-wrap gap-1.5">
                <span className={`text-[0.65rem] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full ${experience.status === 'published' ? 'bg-[#e6f2ee] text-[#2a6b4f]' : 'bg-[#fef3e2] text-[#92510a]'}`}>{experience.status}</span>
                {experience.featured && <span className="text-[0.65rem] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#fdf0eb] text-[#d4622a]">Featured</span>}
                {experience.isCurrent && <span className="text-[0.65rem] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#e8f0fc] text-[#2d4eb3]">Current</span>}
              </div>
            </InfoRow>
          </div>

          {experience.technologies && experience.technologies.length > 0 && (
            <div className="bg-[#faf8f4] border border-[#e8e3db] rounded-xl p-4">
              <p className="text-[0.65rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a] mb-3 flex items-center gap-1.5"><Code size={12} /> Technologies</p>
              <div className="flex flex-wrap gap-1.5">
                {experience.technologies.map((tech, i) => (
                  <span key={i} className="text-[0.72rem] font-mono px-2.5 py-0.5 rounded-full bg-[#e8f0fc] text-[#2d4eb3]">{tech}</span>
                ))}
              </div>
            </div>
          )}

          {experience.responsibilities && experience.responsibilities.length > 0 && (
            <div className="bg-[#faf8f4] border border-[#e8e3db] rounded-xl p-4">
              <p className="text-[0.65rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a] mb-3 flex items-center gap-1.5"><Target size={12} /> Responsibilities</p>
              <div className="space-y-1.5">
                {experience.responsibilities.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-[0.82rem] text-[#4a3728]">
                    <CheckCircle size={13} className="text-[#2a6b4f] flex-shrink-0 mt-0.5" />
                    {r}
                  </div>
                ))}
              </div>
            </div>
          )}

          {experience.achievements && experience.achievements.length > 0 && (
            <div className="bg-[#faf8f4] border border-[#e8e3db] rounded-xl p-4">
              <p className="text-[0.65rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a] mb-3 flex items-center gap-1.5"><Award size={12} /> Achievements</p>
              <div className="space-y-1.5">
                {experience.achievements.map((a, i) => (
                  <div key={i} className="flex items-start gap-2 text-[0.82rem] text-[#4a3728]">
                    <Award size={13} className="text-[#d4622a] flex-shrink-0 mt-0.5" />
                    {a}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WorkExperienceCard({ experience, onEdit, onDelete, onView }: {
  experience: IWorkExperience;
  onEdit: (exp: IWorkExperience) => void;
  onDelete: (id: string) => void;
  onView: (exp: IWorkExperience) => void;
}) {
  const formatDate = (date: string | Date) => new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  const getDateRange = () => {
    const start = formatDate(experience.startDate);
    const end = experience.isCurrent ? 'Present' : (experience.endDate ? formatDate(experience.endDate) : 'Present');
    return `${start} – ${end}`;
  };

  const getDisplayTitle = () => {
    if (experience.jobTitle) return experience.level ? `${experience.level} ${experience.jobTitle}` : experience.jobTitle;
    if (experience.position) return experience.position;
    return experience.title;
  };

  const title = getDisplayTitle();
  const subtitle = experience.company || experience.organization;

  return (
    <div className="bg-white border border-[#e8e3db] rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#e8f0fc] text-[#2d4eb3] flex items-center justify-center flex-shrink-0">
            <Building2 size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-[0.875rem] font-semibold text-[#2a2118] truncate">{title}</h3>
              {experience.featured && <Star size={13} className="text-[#d4622a] fill-[#d4622a] flex-shrink-0" />}
              <span className={`text-[0.65rem] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${experience.status === 'published' ? 'bg-[#e6f2ee] text-[#2a6b4f]' : 'bg-[#fef3e2] text-[#92510a]'}`}>{experience.status}</span>
              {experience.isCurrent && <span className="text-[0.65rem] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full flex-shrink-0 bg-[#e8f0fc] text-[#2d4eb3]">Current</span>}
            </div>
            <p className="text-[0.82rem] font-medium text-[#4a3728] mb-1.5">{subtitle}</p>
            <div className="flex items-center flex-wrap gap-3 text-[0.72rem] text-[#8a7a6a] font-mono mb-2">
              <span className="flex items-center gap-1"><Calendar size={11} /> {getDateRange()}</span>
              {experience.location && <span className="flex items-center gap-1"><MapPin size={11} /> {experience.location}</span>}
              {experience.employmentType && <span className="capitalize">{experience.employmentType.replace('-', ' ')}</span>}
            </div>
            {experience.technologies && experience.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {experience.technologies.slice(0, 4).map((tech, i) => (
                  <span key={i} className="text-[0.6rem] font-mono px-2 py-0.5 rounded-full bg-[#e8f0fc] text-[#2d4eb3]">{tech}</span>
                ))}
                {experience.technologies.length > 4 && (
                  <span className="text-[0.65rem] font-mono text-[#8a7a6a]">+{experience.technologies.length - 4}</span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => onView(experience)} className="p-1.5 text-[#8a7a6a] hover:text-[#2a2118] hover:bg-[#f3f1ee] rounded-lg transition-colors" title="View Details"><Eye size={14} /></button>
          <button onClick={() => onEdit(experience)} className="p-1.5 text-[#8a7a6a] hover:text-[#2a2118] hover:bg-[#f3f1ee] rounded-lg transition-colors" title="Edit"><Pencil size={14} /></button>
          <button onClick={() => experience._id && onDelete(experience._id)} disabled={!experience._id} className="p-1.5 text-[#8a7a6a] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" title="Delete"><Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  );
}

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState<IWorkExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<IWorkExperience | null>(null);
  const [viewingExperience, setViewingExperience] = useState<IWorkExperience | null>(null);

  const fetchWorkExperiences = async () => {
    try {
      const response = await fetch('/api/experience/work?status=all');
      const result: ExperienceListApiResponse = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to fetch experiences');
      setExperiences(result.data?.experiences as IWorkExperience[] || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch experiences');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWorkExperiences(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;
    try {
      const response = await fetch(`/api/experience/work/${id}`, { method: 'DELETE' });
      const result: ExperienceApiResponse = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to delete experience');
      setExperiences(prev => prev.filter(exp => exp._id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete experience');
    }
  };

  const handleEdit = (experience: IWorkExperience) => { setSelectedExperience(experience); setShowForm(true); };
  const handleView = (experience: IWorkExperience) => setViewingExperience(experience);
  const handleCloseForm = () => { setShowForm(false); setSelectedExperience(null); fetchWorkExperiences(); };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-[#e8e3db] border-t-[#d4622a] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#fceaea] border border-[#f0b8b8] text-[#c0392b] px-5 py-4 rounded-xl text-[0.875rem]">
        {error}
      </div>
    );
  }

  const statCards = [
    { label: 'Total', value: experiences.length, icon: Briefcase, tint: 'bg-[#e8f0fc] text-[#2d4eb3]' },
    { label: 'Published', value: experiences.filter(e => e.status === 'published').length, icon: TrendingUp, tint: 'bg-[#e6f2ee] text-[#2a6b4f]' },
    { label: 'Featured', value: experiences.filter(e => e.featured).length, icon: Star, tint: 'bg-[#fdf0eb] text-[#d4622a]' },
    { label: 'Current Role', value: experiences.filter(e => e.isCurrent).length, icon: Award, tint: 'bg-[#fef3e2] text-[#92510a]' },
  ];

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between">
        <p className="text-[0.65rem] font-mono tracking-[0.15em] uppercase text-[#8a7a6a]">
          {experiences.length} experience{experiences.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => { setSelectedExperience(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#2a2118] text-[#f0ece3] rounded-lg text-[0.82rem] font-medium hover:bg-[#d4622a] transition-colors"
        >
          <PlusCircle size={14} /> Add Experience
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ExperienceForm
              type="work"
              mode={selectedExperience ? 'edit' : 'create'}
              initialData={selectedExperience || undefined}
              onClose={handleCloseForm}
            />
          </div>
        </div>
      )}

      {viewingExperience && (
        <WorkExperienceDetailsModal experience={viewingExperience} onClose={() => setViewingExperience(null)} />
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

      {/* Experience List */}
      {experiences.length === 0 ? (
        <div className="bg-white border border-[#e8e3db] rounded-xl shadow-sm flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#f3f1ee] flex items-center justify-center mb-4">
            <Building2 size={24} className="text-[#8a7a6a]" />
          </div>
          <p className="text-[0.875rem] font-medium text-[#2a2118] mb-1">No work experiences yet</p>
          <p className="text-[0.78rem] text-[#8a7a6a] mb-4">Get started by adding your first work experience.</p>
          <button
            onClick={() => { setSelectedExperience(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#2a2118] text-[#f0ece3] rounded-lg text-[0.82rem] font-medium hover:bg-[#d4622a] transition-colors"
          >
            <PlusCircle size={14} /> Add Experience
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {experiences.map((experience) => (
            <WorkExperienceCard
              key={experience._id}
              experience={experience}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      )}
    </div>
  );
}
