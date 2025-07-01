"use client";

interface RichTextViewerProps {
  html: string;
  className?: string;
}

export default function RichTextViewer({ html, className }: RichTextViewerProps) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
} 