"use client";

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ProjectForm from '@/components/dashboard/ProjectForm';

export default function NewProjectPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
        <Link
          href="/dashboard/projects"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
            <ArrowLeft className="w-5 h-5" />
          Back to Projects
        </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
        </div>

      {/* Project Form */}
      <ProjectForm />
    </div>
  );
} 