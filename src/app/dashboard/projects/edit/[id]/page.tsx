'use client';

import { Suspense } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import EditProjectForm from './EditForm';

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  // Redirect to 404 if ID is undefined or invalid
  if (!params.id || params.id === 'undefined') {
    notFound();
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/dashboard/projects');
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button Header */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
        
        <h1 className="text-2xl font-bold mb-6">Edit Project</h1>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        }>
          <EditProjectForm projectId={params.id} />
        </Suspense>
      </div>
    </div>
  );
} 