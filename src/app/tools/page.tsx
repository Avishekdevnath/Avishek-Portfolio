'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Tool {
  id: string;
  name: string;
  description: string;
  category: 'AI Toolbox' | 'Lightweight Tools' | 'One-Time Tools';
  icon: string;
  status: 'available' | 'coming-soon';
  link?: string;
}

const tools: Tool[] = [
  // AI Toolbox
  {
    id: 'swot-analysis',
    name: 'SWOT Analysis Tool',
    description: 'Analyze Strengths, Weaknesses, Opportunities, and Threats for your business or project',
    category: 'AI Toolbox',
    icon: '📊',
    status: 'coming-soon'
  },
  {
    id: 'finance-advisor',
    name: 'Finance Advisor',
    description: 'Get personalized finance management tips and investment advice',
    category: 'AI Toolbox',
    icon: '💰',
    status: 'coming-soon'
  },
  {
    id: 'diet-planner',
    name: 'Diet Planner',
    description: 'AI-driven nutrition recommendations and meal plans',
    category: 'AI Toolbox',
    icon: '🥗',
    status: 'coming-soon'
  },
  {
    id: 'expense-calculator',
    name: 'Expense Calculator',
    description: 'Track and categorize your expenses, create budgets',
    category: 'AI Toolbox',
    icon: '📱',
    status: 'coming-soon'
  },
  {
    id: 'resume-builder',
    name: 'Resume Builder',
    description: 'Create and optimize your resume with AI suggestions',
    category: 'AI Toolbox',
    icon: '📄',
    status: 'coming-soon'
  },
  
  // Lightweight Tools
  {
    id: 'url-shortener',
    name: 'URL Shortener',
    description: 'Shorten URLs with custom aliases',
    category: 'Lightweight Tools',
    icon: '🔗',
    status: 'coming-soon'
  },
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    description: 'Generate QR codes for URLs, text, or contact info',
    category: 'Lightweight Tools',
    icon: '📱',
    status: 'coming-soon'
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Generate secure, random passwords',
    category: 'Lightweight Tools',
    icon: '🔒',
    status: 'coming-soon'
  },
  {
    id: 'file-resizer',
    name: 'Quick File Resizer',
    description: 'Resize images and documents quickly',
    category: 'Lightweight Tools',
    icon: '📂',
    status: 'coming-soon'
  },
  {
    id: 'tip-calculator',
    name: 'Tip Calculator',
    description: 'Calculate tips and split bills easily',
    category: 'Lightweight Tools',
    icon: '💵',
    status: 'coming-soon'
  },

  // One-Time Tools
  {
    id: 'stress-relief',
    name: 'Stress Relief Assistant',
    description: 'Quick stress relief exercises and techniques',
    category: 'One-Time Tools',
    icon: '🧘‍♂️',
    status: 'coming-soon'
  },
  {
    id: 'emergency-checklist',
    name: 'Emergency Checklist',
    description: 'Generate emergency preparedness checklists',
    category: 'One-Time Tools',
    icon: '🚨',
    status: 'coming-soon'
  },
  {
    id: 'investment-simulator',
    name: 'Investment Simulator',
    description: 'Simulate investment strategies and outcomes',
    category: 'One-Time Tools',
    icon: '📈',
    status: 'coming-soon'
  }
];

export default function ToolsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTools = tools.filter(tool => {
    const matchesSearch = 
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'all' || tool.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(tools.map(tool => tool.category))];

  return (
    <div className="min-h-screen bg-gray-50">
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <div
                key={tool.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{tool.icon}</div>
                  {tool.status === 'coming-soon' && (
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
      </div>
    </div>
  );
}