'use client';

import dynamic from 'next/dynamic';

const ProjectLightbox = dynamic(() => import('./ProjectLightbox'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-text-muted text-sm">
      Loading images...
    </div>
  ),
});

export default ProjectLightbox;
