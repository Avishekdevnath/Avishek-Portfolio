"use client";

import React, { useState } from 'react';
import { Search, X, Filter, ArrowUpDown, LayoutGrid, List } from 'lucide-react';

interface SearchFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  sortBy: 'date' | 'title' | 'order';
  setSortBy: (sort: 'date' | 'title' | 'order') => void;
  activeTechFilter: string;
  setActiveTechFilter: (tech: string) => void;
  allTechnologies: string[];
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  isAdmin?: boolean;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

const CATEGORIES = [
  'Web Application',
  'Mobile App',
  'Desktop App',
  'API',
  'Library',
  'Tool',
  'Game',
  'Other'
];

const STATUS_OPTIONS = ['published', 'draft'];

export default function SearchFilter({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  sortBy,
  setSortBy,
  activeTechFilter,
  setActiveTechFilter,
  allTechnologies,
  viewMode,
  setViewMode,
  isAdmin = false,
  onClearFilters,
  activeFiltersCount
}: SearchFilterProps) {
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  return (
    <div className="space-y-4 text-sm font-ui">
      {/* Modern Search and Controls Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-2 items-start lg:items-center justify-between">
          {/* Search Section */}
          <div className="flex-1 w-full lg:w-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full !pl-8 pr-8 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-300"
              />
              {searchTerm && (
                <button 
                  className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Controls Section */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            {/* Filter Toggle */}
            <button
              onClick={() => setIsFiltersVisible(!isFiltersVisible)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border transition-all duration-300 ${
                isFiltersVisible
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg ring-2 ring-blue-200'
                  : activeFiltersCount > 0 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className={`w-3.5 h-3.5 transition-all duration-300 ${
                isFiltersVisible ? 'text-blue-600 drop-shadow-sm' : ''
              }`} />
              {activeFiltersCount > 0 && (
                <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-bold rounded-full bg-blue-500 text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            
            {/* View Toggle */}
            <div className="flex rounded-md border border-gray-300 overflow-hidden bg-white">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 transition-all duration-300 ${
                  viewMode === 'grid'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 transition-all duration-300 ${
                  viewMode === 'list'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                aria-label="List view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      {isFiltersVisible && (
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            {/* Category Filter */}
            <div className="w-full">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Filter className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <select
                  id="category-filter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`block w-full pl-8 pr-6 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none text-gray-900 transition-all duration-300 ${
                    selectedCategory 
                      ? 'bg-blue-50 border-blue-300 text-blue-900' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                <option value="">All Categories</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Status Filter (Admin Only) */}
            {isAdmin && (
              <div className="w-full">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <select
                    id="status-filter"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className={`block w-full pl-8 pr-6 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none text-gray-900 transition-all duration-300 ${
                      selectedStatus 
                        ? 'bg-blue-50 border-blue-300 text-blue-900' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                  <option value="">All Status</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Sort */}
            <div className="w-full">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                  <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <select
                  id="sort-filter"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`block w-full pl-8 pr-6 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none text-gray-900 transition-all duration-300 ${
                    sortBy !== 'order' 
                      ? 'bg-blue-50 border-blue-300 text-blue-900' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                <option value="order">Default Order</option>
                <option value="date">Completion Date</option>
                <option value="title">Title</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <div className="w-full flex justify-end">
                <button
                  onClick={onClearFilters}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-all duration-300"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Technology Pills */}
          {allTechnologies.length > 0 && (
            <div className="mt-3 col-span-full">
              <div className="flex flex-wrap gap-1">
                {allTechnologies.map(tech => (
                  <button
                    key={tech}
                    onClick={() => setActiveTechFilter(activeTechFilter === tech ? '' : tech)}
                    className={`px-2 py-1 rounded-sm text-xs font-medium transition-all duration-300 ${
                      activeTechFilter === tech
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
