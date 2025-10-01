"use client";

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ProjectForm from '@/components/dashboard/ProjectForm';

export default function NewProjectPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-ui">
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6 text-body-sm weight-medium"
          >
            <ArrowLeft className="icon-sm" />
            Back to Projects
          </Link>
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h1 className="text-h2 text-gray-900 mb-2">Create New Project</h1>
            <p className="text-body-sm text-gray-600">
              Add a new project to your portfolio. Fill in the details below to showcase your work.
            </p>
          </div>
        </div>

        {/* Project Form */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <ProjectForm />
        </div>
      </div>
    </div>
  );
} 