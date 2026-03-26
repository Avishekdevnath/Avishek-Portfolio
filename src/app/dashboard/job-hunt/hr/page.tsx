'use client';

import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { HR_ROLE_TITLES, HR_CONTACT_STATUSES } from '@/lib/job-hunt-utils';

interface HRContact {
  _id: string;
  companyId: string;
  companyName: string;
  name: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  roleTitle?: string;
  status: string;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Company {
  _id: string;
  name: string;
}

interface HRFormState {
  companyId: string;
  name: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  roleTitle: string;
  status: string;
  lastContactedAt: string;
  nextFollowUpAt: string;
  notes: string;
}

const initialFormState: HRFormState = {
  companyId: '',
  name: '',
  email: '',
  phone: '',
  linkedinUrl: '',
  roleTitle: '',
  status: 'New',
  lastContactedAt: '',
  nextFollowUpAt: '',
  notes: '',
};

export default function HRContactsPage() {
  const [hrContacts, setHRContacts] = useState<HRContact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState<HRFormState>(initialFormState);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');

  const fetchHRContacts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (companyFilter) params.append('companyId', companyFilter);

      const response = await fetch(`/api/job-hunt/hr?${params}`);
      if (!response.ok) throw new Error('Failed to fetch HR contacts');
      const result = await response.json();
      setHRContacts(result.data || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch HR contacts');
    }
  }, [search, statusFilter, companyFilter]);

  const fetchCompanies = useCallback(async () => {
    try {
      const response = await fetch('/api/job-hunt/companies?limit=1000');
      if (!response.ok) throw new Error('Failed to fetch companies');
      const result = await response.json();
      setCompanies(result.data || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    fetchHRContacts();
  }, [fetchHRContacts]);

  const handleOpenCreateModal = () => {
    setFormState(initialFormState);
    setEditingContactId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (contact: HRContact) => {
    setFormState({
      companyId: contact.companyId,
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      linkedinUrl: contact.linkedinUrl || '',
      roleTitle: contact.roleTitle || '',
      status: contact.status,
      lastContactedAt: contact.lastContactedAt ? contact.lastContactedAt.split('T')[0] : '',
      nextFollowUpAt: contact.nextFollowUpAt ? contact.nextFollowUpAt.split('T')[0] : '',
      notes: contact.notes || '',
    });
    setEditingContactId(contact._id);
    setIsModalOpen(true);
  };

  const handleFormChange = (field: keyof HRFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitForm = async () => {
    if (!formState.companyId) {
      toast.error('Please select a company');
      return;
    }

    if (!formState.name.trim()) {
      toast.error('HR contact name is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        companyId: formState.companyId,
        name: formState.name,
        email: formState.email || undefined,
        phone: formState.phone || undefined,
        linkedinUrl: formState.linkedinUrl || undefined,
        roleTitle: formState.roleTitle || undefined,
        status: formState.status,
        lastContactedAt: formState.lastContactedAt || undefined,
        nextFollowUpAt: formState.nextFollowUpAt || undefined,
        notes: formState.notes || undefined,
      };

      const url = editingContactId
        ? `/api/job-hunt/hr/${editingContactId}`
        : '/api/job-hunt/hr';

      const method = editingContactId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${editingContactId ? 'update' : 'create'} HR contact`);
      }

      toast.success(`HR contact ${editingContactId ? 'updated' : 'created'} successfully!`);
      setFormState(initialFormState);
      setEditingContactId(null);
      setIsModalOpen(false);
      await fetchHRContacts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save HR contact');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this HR contact?')) return;

    try {
      const response = await fetch(`/api/job-hunt/hr/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete HR contact');
      }

      toast.success('HR contact deleted successfully');
      await fetchHRContacts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete HR contact');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-neutral-600">Loading HR contacts...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold" style={{ color: '#2a2118' }}>
          HR Contacts
        </h1>
        <button
          onClick={handleOpenCreateModal}
          style={{ backgroundColor: '#d4622a', color: 'white' }}
          className="px-6 py-2 rounded-lg hover:opacity-90 font-medium"
        >
          + Add HR Contact
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg border border-neutral-200">
        <input
          type="text"
          placeholder="Search HR contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': '#d4622a' } as any}
        />
        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': '#d4622a' } as any}
        >
          <option value="">All Companies</option>
          {companies.map((company) => (
            <option key={company._id} value={company._id}>
              {company.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': '#d4622a' } as any}
        >
          <option value="">All Statuses</option>
          {HR_CONTACT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* HR Contacts Table */}
      <div className="overflow-x-auto bg-white rounded-lg border border-neutral-200">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-600">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-600">Company</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-600">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-600">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-600">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {hrContacts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                  No HR contacts found. Add one to get started!
                </td>
              </tr>
            ) : (
              hrContacts.map((contact) => (
                <tr key={contact._id} className="border-b border-neutral-200 hover:bg-neutral-50">
                  <td className="px-6 py-4 text-sm font-medium text-neutral-900">{contact.name}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{contact.companyName}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{contact.roleTitle || '—'}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{contact.email || '—'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: contact.status === 'New' ? '#fee2e2' : contact.status === 'Contacted' ? '#fef3c7' : contact.status === 'Replied' ? '#d1fae5' : '#e5e7eb',
                        color: contact.status === 'New' ? '#991b1b' : contact.status === 'Contacted' ? '#92400e' : contact.status === 'Replied' ? '#065f46' : '#374151',
                      }}
                    >
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(contact)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteContact(contact._id)}
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
          <div className="bg-white rounded-lg shadow-lg max-w-5xl w-full max-h-[84vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-neutral-200 p-5">
              <h2 className="text-xl font-bold" style={{ color: '#2a2118' }}>
                {editingContactId ? 'Edit HR Contact' : 'Add New HR Contact'}
              </h2>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                value={formState.companyId}
                onChange={(e) => handleFormChange('companyId', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#d4622a' } as any}
              >
                <option value="">Select Company *</option>
                {companies.map((company) => (
                  <option key={company._id} value={company._id}>
                    {company.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="HR Contact Name *"
                value={formState.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#d4622a' } as any}
              />
              <input
                type="email"
                placeholder="Email"
                value={formState.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#d4622a' } as any}
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formState.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
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
              <select
                value={formState.roleTitle}
                onChange={(e) => handleFormChange('roleTitle', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#d4622a' } as any}
              >
                <option value="">Select Role Title</option>
                {HR_ROLE_TITLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <select
                value={formState.status}
                onChange={(e) => handleFormChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#d4622a' } as any}
              >
                <option value="">Select Status</option>
                {HR_CONTACT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <div>
                <div className="text-sm font-medium text-neutral-700 mb-1">Last Contacted</div>
                <input
                  type="date"
                  value={formState.lastContactedAt}
                  onChange={(e) => handleFormChange('lastContactedAt', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#d4622a' } as any}
                />
              </div>
              <div>
                <div className="text-sm font-medium text-neutral-700 mb-1">Next Follow-up</div>
                <input
                  type="date"
                  value={formState.nextFollowUpAt}
                  onChange={(e) => handleFormChange('nextFollowUpAt', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#d4622a' } as any}
                />
              </div>
              <textarea
                placeholder="Notes"
                value={formState.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                rows={2}
                className="w-full md:col-span-2 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#d4622a' } as any}
              />
            </div>

            <div className="sticky bottom-0 bg-white border-t border-neutral-200 p-4 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitForm}
                disabled={submitting}
                style={{ backgroundColor: '#d4622a', color: 'white' }}
                className="px-5 py-2 rounded-lg hover:opacity-90 font-medium disabled:opacity-50"
              >
                {submitting ? (editingContactId ? 'Updating...' : 'Creating...') : (editingContactId ? 'Update Contact' : 'Create Contact')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
