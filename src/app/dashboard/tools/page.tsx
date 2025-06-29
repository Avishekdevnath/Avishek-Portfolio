'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'available' | 'coming-soon';
  link?: string;
}

const tools: Tool[] = [
  {
    id: 'image-optimizer',
    name: 'Image Optimizer',
    description: 'Optimize and compress images for better web performance',
    icon: '🖼️',
    status: 'coming-soon'
  },
  {
    id: 'code-formatter',
    name: 'Code Formatter',
    description: 'Format and beautify your code snippets',
    icon: '📝',
    status: 'coming-soon'
  },
  {
    id: 'seo-analyzer',
    name: 'SEO Analyzer',
    description: 'Analyze and improve your content for better SEO',
    icon: '🔍',
    status: 'coming-soon'
  }
];

export default function ToolsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tools</h1>
        <p className="mt-1 text-gray-500">
          A collection of useful tools to help you with your work
        </p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search tools..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="text-3xl mb-4">{tool.icon}</div>
              {tool.status === 'coming-soon' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Coming Soon
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{tool.name}</h3>
            <p className="mt-2 text-gray-600">{tool.description}</p>
            {tool.link && (
              <Link
                href={tool.link}
                className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
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
    </div>
  );
} 