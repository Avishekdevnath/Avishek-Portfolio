"use client";

import React from 'react';
import { X, LayoutGrid, List } from 'lucide-react';

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
  categoryCounts: Record<string, number>;
  totalCount: number;
  filteredCount: number;
}

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
  activeFiltersCount,
  categoryCounts,
  totalCount,
  filteredCount
}: SearchFilterProps) {
  const categories = Object.keys(categoryCounts).sort();

  return (
    <div className="space-y-0 font-body text-sm">
      {/* Controls Bar */}
      <div className="flex items-center gap-3 flex-wrap mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-[300px]">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 px-4 border-[1.5px] border-cream-deeper rounded-full bg-off-white font-mono text-[0.8rem] text-ink outline-none transition-all duration-200 placeholder:text-text-muted/60 placeholder:tracking-wide focus:border-sand focus:shadow-[0_0_0_3px_rgba(201,185,154,0.2)]"
          />
          {searchTerm && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-ink transition-colors"
              onClick={() => setSearchTerm('')}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-[0.4rem] flex-wrap">
          <button
            onClick={() => setSelectedCategory('')}
            className={`inline-flex items-center gap-[0.35rem] py-[0.35rem] px-[0.82rem] rounded-full text-[0.8rem] font-medium cursor-pointer border-[1.5px] transition-all duration-200 whitespace-nowrap font-body ${
              !selectedCategory
                ? 'bg-ink text-off-white border-ink'
                : 'border-cream-deeper bg-off-white text-text-muted hover:border-sand hover:text-ink'
            }`}
          >
            All <span className="font-mono text-[0.58rem] opacity-60">{totalCount}</span>
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
              className={`inline-flex items-center gap-[0.35rem] py-[0.35rem] px-[0.82rem] rounded-full text-[0.8rem] font-medium cursor-pointer border-[1.5px] transition-all duration-200 whitespace-nowrap font-body ${
                selectedCategory === cat
                  ? 'bg-ink text-off-white border-ink'
                  : 'border-cream-deeper bg-off-white text-text-muted hover:border-sand hover:text-ink'
              }`}
            >
              {cat.replace('Development', '').replace('Application', 'App').replace('Package', 'Pkg').trim()}
              <span className="font-mono text-[0.58rem] opacity-60">{categoryCounts[cat]}</span>
            </button>
          ))}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 ml-auto">
          {/* Result Count */}
          <span className="font-mono text-[0.65rem] text-text-muted whitespace-nowrap">
            Showing {filteredCount} project{filteredCount !== 1 ? 's' : ''}
          </span>

          {/* View Toggle */}
          <div className="flex gap-[2px] bg-cream-dark rounded-lg p-[3px] border border-cream-deeper">
            <button
              onClick={() => setViewMode('grid')}
              className={`w-[30px] h-[28px] border-none rounded-[0.35rem] cursor-pointer flex items-center justify-center transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-off-white text-ink shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                  : 'bg-transparent text-text-muted'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-[14px] h-[14px]" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`w-[30px] h-[28px] border-none rounded-[0.35rem] cursor-pointer flex items-center justify-center transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-off-white text-ink shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                  : 'bg-transparent text-text-muted'
              }`}
              aria-label="List view"
            >
              <List className="w-[14px] h-[14px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
