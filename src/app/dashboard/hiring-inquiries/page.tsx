'use client';

import { useState, useEffect } from 'react';
import {
  Mail,
  Building,
  User,
  Calendar,
  Filter,
  Search,
  MoreVertical,
  Eye,
  Archive,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface HiringInquiry {
  _id: string;
  company?: string;
  email: string;
  role?: string;
  message: string;
  status: 'new' | 'reviewed' | 'contacted' | 'archived';
  createdAt: string;
  updatedAt: string;
}

interface InquiryStats {
  total: number;
  new: number;
  reviewed: number;
  contacted: number;
  archived: number;
}

const statusConfig = {
  new: { label: 'New', color: 'bg-[#e8f0fc] text-[#2d4eb3]', icon: AlertCircle },
  reviewed: { label: 'Reviewed', color: 'bg-[#fef3e2] text-[#92510a]', icon: Eye },
  contacted: { label: 'Contacted', color: 'bg-[#e6f2ee] text-[#2a6b4f]', icon: CheckCircle },
  archived: { label: 'Archived', color: 'bg-[#f3f1ee] text-[#6b5c4e]', icon: Archive },
};

export default function HiringInquiriesPage() {
  const [inquiries, setInquiries] = useState<HiringInquiry[]>([]);
  const [stats, setStats] = useState<InquiryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('limit', '50');

      const response = await fetch(`/api/hiring-inquiries?${params}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch inquiries');
      }

      setInquiries(data.data.inquiries);
      setStats(data.data.stats);
    } catch (err) {
      // Error fetching inquiries
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/hiring-inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to update status');

      // Update local state
      setInquiries(prev =>
        prev.map(inquiry =>
          inquiry._id === id ? { ...inquiry, status: newStatus as any } : inquiry
        )
      );

      // Refresh stats
      fetchInquiries();
    } catch (err) {
      // Error updating status
    }
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = !searchTerm ||
      inquiry.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-5">
        {/* Stat card skeletons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#e8e3db] rounded-xl p-5 shadow-sm animate-pulse flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-[#f3f1ee] flex-shrink-0" />
              <div className="space-y-2">
                <div className="h-6 bg-[#f3f1ee] rounded w-10" />
                <div className="h-3 bg-[#f3f1ee] rounded w-16" />
              </div>
            </div>
          ))}
        </div>

        {/* Card skeletons */}
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#e8e3db] rounded-xl p-5 shadow-sm animate-pulse">
              <div className="flex justify-between items-start mb-3">
                <div className="space-y-2">
                  <div className="h-4 bg-[#f3f1ee] rounded w-36" />
                  <div className="h-3 bg-[#f3f1ee] rounded w-52" />
                </div>
                <div className="h-6 bg-[#f3f1ee] rounded-full w-20" />
              </div>
              <div className="h-3 bg-[#f3f1ee] rounded w-full mb-1.5" />
              <div className="h-3 bg-[#f3f1ee] rounded w-4/5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-5">
        <div className="bg-[#fceaea] border border-red-200 text-[#c0392b] px-5 py-4 rounded-xl">
          <p className="font-semibold text-[0.875rem] font-body">Error loading inquiries</p>
          <p className="text-[0.82rem] mt-1 font-body">{error}</p>
          <button
            onClick={fetchInquiries}
            className="mt-3 text-[0.82rem] underline hover:no-underline font-body"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const statCards = stats ? [
    { label: 'Total', count: stats.total, icon: Mail, tint: 'bg-[#e8f0fc] text-[#2d4eb3]' },
    { label: 'New', count: stats.new, icon: AlertCircle, tint: 'bg-[#fdf0eb] text-[#d4622a]' },
    { label: 'Reviewed', count: stats.reviewed, icon: Eye, tint: 'bg-[#fef3e2] text-[#92510a]' },
    { label: 'Contacted', count: stats.contacted, icon: CheckCircle, tint: 'bg-[#e6f2ee] text-[#2a6b4f]' },
  ] : [];

  return (
    <div className="space-y-5">
      {/* Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map(({ label, count, icon: Icon, tint }) => (
            <div key={label} className="bg-white border border-[#e8e3db] rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${tint}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="font-mono text-2xl font-semibold text-[#2a2118] leading-none">{count}</p>
                <p className="text-[0.72rem] text-[#8a7a6a] mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a7a6a]" />
          <input
            type="text"
            placeholder="Search inquiries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-3 bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem] text-[#2a2118] focus:outline-none focus:border-[#d4622a] focus:ring-1 focus:ring-[#d4622a]/20"
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem] text-[#2a2118] focus:outline-none focus:border-[#d4622a] focus:ring-1 focus:ring-[#d4622a]/20"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="reviewed">Reviewed</option>
          <option value="contacted">Contacted</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Inquiries List */}
      <div className="space-y-4">
        {filteredInquiries.length === 0 ? (
          <div className="bg-white border border-[#e8e3db] rounded-xl p-12 shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-[#f3f1ee] flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-[#8a7a6a]" />
            </div>
            <h3 className="text-[0.95rem] font-semibold text-[#2a2118] font-body mb-1">No inquiries found</h3>
            <p className="text-[0.82rem] text-[#8a7a6a] font-body">
              {searchTerm ? 'Try adjusting your search terms' : 'No hiring inquiries have been submitted yet.'}
            </p>
          </div>
        ) : (
          filteredInquiries.map((inquiry) => {
            const StatusIcon = statusConfig[inquiry.status].icon;
            return (
              <div key={inquiry._id} className="bg-white border border-[#e8e3db] rounded-xl p-5 shadow-sm">
                {/* Header row */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    {inquiry.company && (
                      <div className="flex items-center gap-1.5 text-[#2a2118]">
                        <Building className="w-4 h-4 text-[#8a7a6a] flex-shrink-0" />
                        <span className="text-[0.875rem] font-semibold font-body">{inquiry.company}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-[#4a3728]">
                      <Mail className="w-3.5 h-3.5 text-[#8a7a6a] flex-shrink-0" />
                      <span className="text-[0.82rem] font-body">{inquiry.email}</span>
                    </div>
                    {inquiry.role && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.72rem] font-mono tracking-wider uppercase bg-[#fef3e2] text-[#92510a]">
                        {inquiry.role}
                      </span>
                    )}
                  </div>

                  {/* Status badge + select */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.65rem] font-mono tracking-wider uppercase ${statusConfig[inquiry.status].color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig[inquiry.status].label}
                    </span>
                    <select
                      value={inquiry.status}
                      onChange={(e) => updateStatus(inquiry._id, e.target.value)}
                      className="bg-[#faf8f4] border border-[#ddd5c5] rounded-md px-2 py-1 text-[0.75rem] text-[#2a2118] focus:outline-none focus:border-[#d4622a] focus:ring-1 focus:ring-[#d4622a]/20"
                    >
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="contacted">Contacted</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <p className="text-[0.82rem] text-[#4a3728] font-body leading-relaxed mb-3">
                  {inquiry.message.length > 200
                    ? `${inquiry.message.substring(0, 200)}...`
                    : inquiry.message}
                </p>

                {/* Footer */}
                <div className="flex items-center gap-1.5 text-[0.72rem] text-[#8a7a6a] font-mono">
                  <Calendar className="w-3 h-3" />
                  {formatDate(inquiry.createdAt)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
