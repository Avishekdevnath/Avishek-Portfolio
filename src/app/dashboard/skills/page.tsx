"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useToast } from '@/context/ToastContext';

interface Skill {
  _id: string;
  name: string;
  level: string;
  category: string;
  type: 'programming' | 'software' | 'language';
  order: number;
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<{ [key: string]: Skill[] }>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/skills');
      const data = await response.json();

      if (data.success) {
        setSkills(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch skills',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    try {
      const response = await fetch(`/api/skills/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Skill deleted successfully',
          status: 'success',
        });
        fetchSkills();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete skill',
        status: 'error',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Skills Management</h1>
        <Link
          href="/dashboard/skills/new"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
        >
          <FiPlus /> Add New Skill
        </Link>
      </div>

      <div className="grid gap-6">
        {Object.entries(skills).map(([category, categorySkills]) => (
          <div key={category} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 capitalize">
              {category.replace(/([A-Z])/g, ' $1').trim()}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Level</th>
                    <th className="px-4 py-2 text-left">Order</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categorySkills.map((skill) => (
                    <tr key={skill._id} className="border-t">
                      <td className="px-4 py-2">{skill.name}</td>
                      <td className="px-4 py-2">{skill.level}</td>
                      <td className="px-4 py-2">{skill.order}</td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/dashboard/skills/edit/${skill._id}`}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <FiEdit2 className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(skill._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 