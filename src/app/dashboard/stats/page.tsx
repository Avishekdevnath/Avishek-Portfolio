'use client';

import { useState, useEffect } from 'react';
import { FaSave, FaPlus, FaTrash, FaCode, FaLaptopCode, FaUserGraduate, FaBriefcase, FaLock } from 'react-icons/fa';

interface StatData {
  value: number;
  description: string;
}

interface CustomStat {
  title: string;
  value: number;
  description: string;
  icon: string;
}

interface StatsData {
  programmingLanguages: StatData; // Dynamic - read only
  projectsCompleted: StatData; // Dynamic - read only
  studentsCount: StatData; // Editable
  workExperience: StatData; // Editable
  customStats: CustomStat[]; // Editable
  tagline: string; // Editable
}

interface StatsResponse {
  success: boolean;
  data: StatsData;
  error?: string;
}

const iconOptions = [
  { value: 'FaCode', label: 'Code', icon: FaCode },
  { value: 'FaLaptopCode', label: 'Laptop Code', icon: FaLaptopCode },
  { value: 'FaUserGraduate', label: 'User Graduate', icon: FaUserGraduate },
  { value: 'FaBriefcase', label: 'Briefcase', icon: FaBriefcase },
];

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData>({
    programmingLanguages: { value: 0, description: '' },
    projectsCompleted: { value: 0, description: '' },
    studentsCount: { value: 0, description: '' },
    workExperience: { value: 0, description: '' },
    customStats: [],
    tagline: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

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

      // Only send editable fields to the API
      const editableStats = {
        studentsCount: stats.studentsCount,
        workExperience: stats.workExperience,
        customStats: stats.customStats,
        tagline: stats.tagline
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
      
      // Refresh data to get latest counts
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
      customStats: [
        ...prev.customStats,
        { title: '', value: 0, description: '', icon: 'FaCode' }
      ]
    }));
  };

  const removeCustomStat = (index: number) => {
    setStats(prev => ({
      ...prev,
      customStats: prev.customStats.filter((_, i) => i !== index)
    }));
  };

  const updateCustomStat = (index: number, field: keyof CustomStat, value: string | number) => {
    setStats(prev => ({
      ...prev,
      customStats: prev.customStats.map((stat, i) => 
        i === index ? { ...stat, [field]: value } : stat
      )
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portfolio Statistics</h1>
          <p className="text-gray-600 mt-1">Manage your portfolio stats and achievements</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FaSave className={saving ? 'animate-spin' : ''} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          <strong>Success:</strong> {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Dynamic Stats - Read Only */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2 mb-4">
            <FaLock className="text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900">Dynamic Stats (Auto-Calculated)</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">These stats are automatically calculated from your database</p>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <FaCode className="text-blue-500" />
                <h3 className="font-medium">Programming Languages</h3>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.programmingLanguages.value}</div>
              <div className="text-sm text-gray-600">{stats.programmingLanguages.description}</div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <FaLaptopCode className="text-green-500" />
                <h3 className="font-medium">Projects Completed</h3>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.projectsCompleted.value}</div>
              <div className="text-sm text-gray-600">{stats.projectsCompleted.description}</div>
            </div>
          </div>
        </div>

        {/* Editable Stats */}
        <div className="space-y-6">
          {/* Students Count */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2 mb-4">
              <FaUserGraduate className="text-purple-500" />
              <h2 className="text-xl font-semibold text-gray-900">Students Mentored</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Count</label>
                <input
                  type="number"
                  value={stats.studentsCount.value}
                  onChange={e => setStats(prev => ({
                    ...prev,
                    studentsCount: { ...prev.studentsCount, value: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={stats.studentsCount.description}
                  onChange={e => setStats(prev => ({
                    ...prev,
                    studentsCount: { ...prev.studentsCount, description: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Students mentored and guided"
                />
              </div>
            </div>
          </div>

          {/* Work Experience */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2 mb-4">
              <FaBriefcase className="text-orange-500" />
              <h2 className="text-xl font-semibold text-gray-900">Work Experience</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years</label>
                <input
                  type="number"
                  value={stats.workExperience.value}
                  onChange={e => setStats(prev => ({
                    ...prev,
                    workExperience: { ...prev.workExperience, value: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={stats.workExperience.description}
                  onChange={e => setStats(prev => ({
                    ...prev,
                    workExperience: { ...prev.workExperience, description: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Years of professional experience"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Portfolio Tagline</h2>
        <textarea
          value={stats.tagline}
          onChange={e => setStats(prev => ({ ...prev, tagline: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="Write an inspiring tagline that represents your professional journey..."
        />
      </div>

      {/* Custom Stats */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Custom Statistics</h2>
          <button
            onClick={addCustomStat}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaPlus /> Add Custom Stat
          </button>
        </div>

        {stats.customStats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FaCode className="mx-auto text-4xl mb-4 text-gray-300" />
            <p>No custom statistics yet</p>
            <p className="text-sm">Add custom stats to showcase unique achievements</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stats.customStats.map((stat, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={stat.title}
                      onChange={e => updateCustomStat(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Awards Won"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                    <input
                      type="number"
                      value={stat.value}
                      onChange={e => updateCustomStat(index, 'value', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={stat.description}
                      onChange={e => updateCustomStat(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Recognition received"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                    <select
                      value={stat.icon}
                      onChange={e => updateCustomStat(index, 'icon', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {iconOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => removeCustomStat(index)}
                      className="w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      <FaTrash />
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