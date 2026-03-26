'use client';

import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { COMPANY_TIERS } from '@/lib/job-hunt-utils';

interface Company {
  _id: string;
  name: string;
  website?: string;
  careerPageUrl?: string;
  linkedinUrl?: string;
  industry?: string;
  size?: string;
  locationHQ?: string;
  tier?: string;
  notes?: string;
  isActive: boolean;
  hrContactCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CompanyFormState {
  name: string;
  website: string;
  careerPageUrl: string;
  linkedinUrl: string;
  industry: string;
  size: string;
  locationHQ: string;
  tier: string;
  notes: string;
}

const initialFormState: CompanyFormState = {
  name: '',
  website: '',
  careerPageUrl: '',
  linkedinUrl: '',
  industry: '',
  size: '',
  locationHQ: '',
  tier: '',
  notes: '',
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState<CompanyFormState>(initialFormState);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');

  const fetchCompanies = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (tierFilter) params.append('tier', tierFilter);

      const response = await fetch(`/api/job-hunt/companies?${params}`);
      if (!response.ok) throw new Error('Failed to fetch companies');
      const result = await response.json();
      setCompanies(result.data || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  }, [search, tierFilter]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleOpenCreateModal = () => {
    setFormState(initialFormState);
    setEditingCompanyId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (company: Company) => {
    setFormState({
      name: company.name,
      website: company.website || '',
      careerPageUrl: company.careerPageUrl || '',
      linkedinUrl: company.linkedinUrl || '',
      industry: company.industry || '',
      size: company.size || '',
      locationHQ: company.locationHQ || '',
      tier: company.tier || '',
      notes: company.notes || '',
    });
    setEditingCompanyId(company._id);
    setIsModalOpen(true);
  };

  const handleFormChange = (field: keyof CompanyFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitForm = async () => {
    if (!formState.name.trim()) {
      toast.error('Company name is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formState.name,
        website: formState.website || undefined,
        careerPageUrl: formState.careerPageUrl || undefined,
        linkedinUrl: formState.linkedinUrl || undefined,
        industry: formState.industry || undefined,
        size: formState.size || undefined,
        locationHQ: formState.locationHQ || undefined,
        tier: formState.tier || undefined,
        notes: formState.notes || undefined,
      };

      const url = editingCompanyId
        ? `/api/job-hunt/companies/${editingCompanyId}`
        : '/api/job-hunt/companies';

      const method = editingCompanyId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${editingCompanyId ? 'update' : 'create'} company`);
      }

      toast.success(`Company ${editingCompanyId ? 'updated' : 'created'} successfully!`);
      setFormState(initialFormState);
      setEditingCompanyId(null);
      setIsModalOpen(false);
      await fetchCompanies();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save company');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company?')) return;

    try {
      const response = await fetch(`/api/job-hunt/companies/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete company');
      }

      toast.success('Company deleted successfully');
      await fetchCompanies();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete company');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-neutral-600">Loading companies...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold" style={{ color: '#2a2118' }}>
          Companies
        </h1>
        <button
          onClick={handleOpenCreateModal}
          style={{ backgroundColor: '#d4622a', color: 'white' }}
          className="px-6 py-2 rounded-lg hover:opacity-90 font-medium"
        >
          + Add Company
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-neutral-200">
        <input
          type="text"
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': '#d4622a' } as any}
        />
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': '#d4622a' } as any}
        >
          <option value="">All Tiers</option>
          {COMPANY_TIERS.map((tier) => (
            <option key={tier} value={tier}>
              {tier} Companies
            </option>
          ))}
        </select>
      </div>

      {/* Companies Table */}
      <div className="overflow-x-auto bg-white rounded-lg border border-neutral-200">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-600">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-600">Industry</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-600">Tier</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-600">HR Contacts</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                  No companies found. Create one to get started!
                </td>
              </tr>
            ) : (
              companies.map((company) => (
                <tr key={company._id} className="border-b border-neutral-200 hover:bg-neutral-50">
                  <td className="px-6 py-4 text-sm font-medium text-neutral-900">{company.name}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{company.industry || '—'}</td>
                  <td className="px-6 py-4 text-sm">
                    {company.tier ? (
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: company.tier === 'Dream' ? '#fef3c7' : company.tier === 'Target' ? '#dbeafe' : '#dcfce7',
                          color: company.tier === 'Dream' ? '#92400e' : company.tier === 'Target' ? '#1e40af' : '#166534',
                        }}
                      >
                        {company.tier}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{company.hrContactCount}</td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(company)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCompany(company._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-neutral-200 p-6">
              <h2 className="text-xl font-bold" style={{ color: '#2a2118' }}>
                {editingCompanyId ? 'Edit Company' : 'Add New Company'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Company Name *"
                value={formState.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#d4622a' } as any}
              />
              <input
                type="url"
                placeholder="Website URL"
                value={formState.website}
                onChange={(e) => handleFormChange('website', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#d4622a' } as any}
              />
              <input
                type="url"
                placeholder="Career Page URL"
                value={formState.careerPageUrl}
                onChange={(e) => handleFormChange('careerPageUrl', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#d4622a' } as any}
              />
              <input
                type="url"
                placeholder="LinkedIn URL"
                value={formState.linkedinUrl}
                onChange={(e) => handleFormChange('linkedinUrl', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#d4622a' } as any}
              />
              <input
                type="text"
                placeholder="Industry"
                value={formState.industry}
                onChange={(e) => handleFormChange('industry', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#d4622a' } as any}
              />
              <select
                value={formState.size}
                onChange={(e) => handleFormChange('size', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#d4622a' } as any}
              >
                <option value="">Select Company Size</option>
                <option value="Startup">Startup</option>
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
                <option value="Enterprise">Enterprise</option>
              </select>
              <input
                type="text"
                placeholder="HQ Location"
                value={formState.locationHQ}
                onChange={(e) => handleFormChange('locationHQ', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#d4622a' } as any}
              />
              <select
                value={formState.tier}
                onChange={(e) => handleFormChange('tier', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#d4622a' } as any}
              >
                <option value="">Select Tier</option>
                {COMPANY_TIERS.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Notes"
                value={formState.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#d4622a' } as any}
              />
            </div>

            <div className="sticky bottom-0 bg-white border-t border-neutral-200 p-6 flex justify-between gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitForm}
                disabled={submitting}
                style={{ backgroundColor: '#d4622a', color: 'white' }}
                className="px-6 py-2 rounded-lg hover:opacity-90 font-medium disabled:opacity-50"
              >
                {submitting ? (editingCompanyId ? 'Updating...' : 'Creating...') : (editingCompanyId ? 'Update Company' : 'Create Company')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
