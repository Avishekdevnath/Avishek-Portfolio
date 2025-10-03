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
  new: { label: 'New', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
  reviewed: { label: 'Reviewed', color: 'bg-yellow-100 text-yellow-800', icon: Eye },
  contacted: { label: 'Contacted', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  archived: { label: 'Archived', color: 'bg-gray-100 text-gray-800', icon: Archive },
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Hiring Inquiries</h1>
            <p className="text-gray-600">Manage job opportunities and hiring requests</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-12"></div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Hiring Inquiries</h1>
            <p className="text-gray-600">Manage job opportunities and hiring requests</p>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error loading inquiries</p>
          <p className="text-sm mt-1">{error}</p>
          <button 
            onClick={fetchInquiries}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Hiring Inquiries</h1>
          <p className="text-gray-600">Manage job opportunities and hiring requests</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <Mail className="text-blue-500 mr-2" size={20} />
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <h3 className="text-2xl font-semibold mt-2">{stats.total}</h3>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <AlertCircle className="text-blue-500 mr-2" size={20} />
              <span className="text-sm text-gray-500">New</span>
            </div>
            <h3 className="text-2xl font-semibold mt-2">{stats.new}</h3>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <Eye className="text-yellow-500 mr-2" size={20} />
              <span className="text-sm text-gray-500">Reviewed</span>
            </div>
            <h3 className="text-2xl font-semibold mt-2">{stats.reviewed}</h3>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <CheckCircle className="text-green-500 mr-2" size={20} />
              <span className="text-sm text-gray-500">Contacted</span>
            </div>
            <h3 className="text-2xl font-semibold mt-2">{stats.contacted}</h3>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search inquiries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="contacted">Contacted</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="space-y-4">
        {filteredInquiries.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <Mail className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No inquiries found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms' : 'No hiring inquiries have been submitted yet.'}
            </p>
          </div>
        ) : (
          filteredInquiries.map((inquiry) => {
            const StatusIcon = statusConfig[inquiry.status].icon;
            return (
              <div key={inquiry._id} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {inquiry.company && (
                        <div className="flex items-center text-gray-600">
                          <Building size={16} className="mr-1" />
                          <span className="text-sm font-medium">{inquiry.company}</span>
                        </div>
                      )}
                      <div className="flex items-center text-gray-600">
                        <User size={16} className="mr-1" />
                        <span className="text-sm">{inquiry.email}</span>
                      </div>
                      {inquiry.role && (
                        <div className="flex items-center text-gray-600">
                          <span className="text-sm font-medium">{inquiry.role}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed mb-3">
                      {inquiry.message.length > 200 
                        ? `${inquiry.message.substring(0, 200)}...` 
                        : inquiry.message
                      }
                    </p>
                    <div className="flex items-center text-gray-500 text-xs">
                      <Calendar size={14} className="mr-1" />
                      <span>{formatDate(inquiry.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[inquiry.status].color}`}>
                      <StatusIcon size={12} />
                      {statusConfig[inquiry.status].label}
                    </span>
                    
                    <div className="relative">
                      <select
                        value={inquiry.status}
                        onChange={(e) => updateStatus(inquiry._id, e.target.value)}
                        className="appearance-none bg-white border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="new">New</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="contacted">Contacted</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
