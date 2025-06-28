'use client';

import { useState, useEffect } from 'react';
import { FaSave, FaPlus, FaTrash } from 'react-icons/fa';

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

interface Stats {
  studentsCount: StatData;
  workExperience: StatData;
  customStats: CustomStat[];
  tagline: string;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats>({
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
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
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

      const response = await fetch('/api/stats', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stats)
      });

      if (!response.ok) throw new Error('Failed to update stats');
      
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to update stats');
      
      setSuccessMessage('Stats updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Statistics</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          <FaSave /> Save Changes
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      <div className="space-y-6">
        {/* Students Count */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Students Mentored</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Count</label>
              <input
                type="number"
                value={stats.studentsCount.value}
                onChange={e => setStats(prev => ({
                  ...prev,
                  studentsCount: { ...prev.studentsCount, value: parseInt(e.target.value) }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                value={stats.studentsCount.description}
                onChange={e => setStats(prev => ({
                  ...prev,
                  studentsCount: { ...prev.studentsCount, description: e.target.value }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Work Experience */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Work Experience</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Years</label>
              <input
                type="number"
                value={stats.workExperience.value}
                onChange={e => setStats(prev => ({
                  ...prev,
                  workExperience: { ...prev.workExperience, value: parseInt(e.target.value) }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                value={stats.workExperience.description}
                onChange={e => setStats(prev => ({
                  ...prev,
                  workExperience: { ...prev.workExperience, description: e.target.value }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Custom Stats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Custom Statistics</h2>
            <button
              onClick={addCustomStat}
              className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <FaPlus /> Add Stat
            </button>
          </div>
          <div className="space-y-4">
            {stats.customStats.map((stat, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg relative">
                <button
                  onClick={() => removeCustomStat(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={stat.title}
                    onChange={e => {
                      const newStats = [...stats.customStats];
                      newStats[index] = { ...stat, title: e.target.value };
                      setStats(prev => ({ ...prev, customStats: newStats }));
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Value</label>
                  <input
                    type="number"
                    value={stat.value}
                    onChange={e => {
                      const newStats = [...stats.customStats];
                      newStats[index] = { ...stat, value: parseInt(e.target.value) };
                      setStats(prev => ({ ...prev, customStats: newStats }));
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input
                    type="text"
                    value={stat.description}
                    onChange={e => {
                      const newStats = [...stats.customStats];
                      newStats[index] = { ...stat, description: e.target.value };
                      setStats(prev => ({ ...prev, customStats: newStats }));
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tagline */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Tagline</h2>
          <textarea
            value={stats.tagline}
            onChange={e => setStats(prev => ({ ...prev, tagline: e.target.value }))}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter a tagline that will appear below your stats..."
          />
        </div>
      </div>
    </div>
  );
} 