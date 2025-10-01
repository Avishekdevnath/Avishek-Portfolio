"use client";

import { useEffect, useMemo } from 'react';

interface RichTextViewerProps {
  html: string;
  className?: string;
  lineSpacing?: string;
}

export default function RichTextViewer({ html, className, lineSpacing = '10' }: RichTextViewerProps) {
  const appliedClass = useMemo(() => `${className ?? ''} line-spacing-${lineSpacing}`.trim(), [className, lineSpacing]);

  useEffect(() => {
    // Debug: verify UI receives and applies correct spacing
    // eslint-disable-next-line no-console
    console.log('[RichTextViewer] lineSpacing:', lineSpacing, 'appliedClass:', appliedClass);
  }, [lineSpacing, appliedClass]);

  return (
    <div
      className={appliedClass}
      data-linespacing={lineSpacing}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
} 