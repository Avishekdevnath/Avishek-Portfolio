import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import EditProjectForm from './EditForm';

export default function EditProjectPage({ params }: { params: { id: string } }) {
  // Redirect to 404 if ID is undefined or invalid
  if (!params.id || params.id === 'undefined') {
    notFound();
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
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