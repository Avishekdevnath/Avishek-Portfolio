"use client";

import { useMemo } from 'react';
import { sanitizeDisplayHtml } from '@/lib/sanitize';

interface RichTextViewerProps {
  html: string;
  className?: string;
  lineSpacing?: string;
}

export default function RichTextViewer({ html, className, lineSpacing = '10' }: RichTextViewerProps) {
  const appliedClass = useMemo(() => 
    `prose prose-sm sm:prose lg:prose-lg ${className ?? ''} line-spacing-${lineSpacing}`.trim(), 
    [className, lineSpacing]
  );
  
  // Sanitize HTML content for security
  const sanitizedHtml = useMemo(() => sanitizeDisplayHtml(html), [html]);

  return (
    <div
      className={appliedClass}
      data-linespacing={lineSpacing}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
} 