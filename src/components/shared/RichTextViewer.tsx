"use client";

import { useEffect, useMemo } from 'react';

interface RichTextViewerProps {
  html: string;
  className?: string;
  lineSpacing?: string;
}

export default function RichTextViewer({ html, className, lineSpacing = '10' }: RichTextViewerProps) {
  const appliedClass = useMemo(() => `${className ?? ''} line-spacing-${lineSpacing}`.trim(), [className, lineSpacing]);


  return (
    <div
      className={appliedClass}
      data-linespacing={lineSpacing}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
} 