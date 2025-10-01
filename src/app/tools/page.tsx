"use client";

import { useEffect, useState, useMemo } from 'react';
import LoadingScreen from '@/components/shared/LoadingScreen';
import Link from 'next/link';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

interface Tool {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  icon?: string;
  link?: string;
}

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchTools = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/tools');
        const data = await res.json();
        if (data.success) setTools(data.data);
        else setError(data.error || 'Failed to fetch tools');
      } catch (err) {
        setError('Failed to fetch tools');
      } finally {
        setLoading(false);
      }
    };
    fetchTools();
  }, []);

  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(tools.map(tool => tool.category).filter((c): c is string => !!c)))];
  }, [tools]);

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch =
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tool.description && tool.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory =
        selectedCategory === 'all' || tool.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [tools, searchTerm, selectedCategory]);

  return (
    <>
      <Header />
      <div className="bg-gray-50 min-h-screen">
        <div>
          <div className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">AI & Utility Tools</h1>
                <p className="text-xl text-gray-600">
                  A collection of powerful tools to help you be more productive
                </p>
              </div>

              <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center">
                <input
                  type="text"
                  placeholder="Search tools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="flex gap-2 flex-wrap justify-center">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      aria-current={selectedCategory === category ? 'page' : undefined}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                        ${selectedCategory === category
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                    >
                      {category === 'all' ? 'All Tools' : category}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center min-h-[200px]">
                  <Loader text="Loading tools..." />
                </div>
              ) : error ? (
                <div className="text-red-600 text-center py-8 font-medium text-lg">{error}</div>
              ) : tools.length === 0 ? (
                <div className="text-gray-400 text-center py-12 text-lg font-medium">No tools have been added yet. Please add tools from the dashboard.</div>
              ) : filteredTools.length === 0 ? (
                <div className="text-gray-400 text-center py-12 text-lg font-medium">No tools found.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTools.map((tool) => (
                    <div
                      key={tool._id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-3xl">{tool.icon}</div>
                        {!tool.link && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.name}</h3>
                      <p className="text-gray-600 mb-4">{tool.description}</p>
                      {tool.link && (
                        <Link
                          href={tool.link}
                          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${tool.name} tool in a new tab`}
                        >
                          Try it out
                          <svg className="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}