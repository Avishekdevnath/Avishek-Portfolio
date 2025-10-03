"use client";

import { useState } from 'react';
import RichTextEditor from '@/components/shared/RichTextEditor';
import RichTextViewer from '@/components/shared/RichTextViewer';

/**
 * Test component for demonstrating paste functionality
 * This component shows how the enhanced RichTextEditor handles pasted content
 */
export default function PasteTestComponent() {
  const [content, setContent] = useState('<p>Start typing or paste formatted content here...</p>');
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">Blog Formatting Test</h2>
        <p className="text-blue-800 text-sm">
          This editor now supports enhanced paste functionality with format preservation.
          Try pasting content from ChatGPT, Canvas, Notion, or other rich text sources.
        </p>
        <div className="mt-3 text-xs text-blue-700">
          <strong>Supported sources:</strong> ChatGPT, Canvas, Notion, Word, Google Docs
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setShowPreview(false)}
          className={`px-4 py-2 rounded ${
            !showPreview 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Edit Mode
        </button>
        <button
          onClick={() => setShowPreview(true)}
          className={`px-4 py-2 rounded ${
            showPreview 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Preview Mode
        </button>
      </div>

      {!showPreview ? (
        <div className="border border-gray-300 rounded-lg">
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Start writing or paste formatted content..."
            minHeight="400px"
            lineSpacing="10"
          />
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-6 bg-white">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Preview</h3>
          <RichTextViewer 
            html={content} 
            className="prose prose-sm max-w-none"
            lineSpacing="10"
          />
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-md font-semibold text-gray-900 mb-2">Test Instructions</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
          <li>Copy formatted content from ChatGPT (with tables, code blocks, lists)</li>
          <li>Paste it into the editor above</li>
          <li>Notice how formatting is preserved with visual indicators</li>
          <li>Switch to Preview mode to see the final rendered output</li>
          <li>Check that tables, code blocks, and lists maintain their structure</li>
        </ol>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-md font-semibold text-yellow-900 mb-2">Features Demonstrated</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
          <li><strong>Format Detection:</strong> Automatically detects source (ChatGPT, Canvas, etc.)</li>
          <li><strong>Content Sanitization:</strong> Removes dangerous HTML while preserving formatting</li>
          <li><strong>CSS Override Resolution:</strong> Preserved content bypasses compact spacing rules</li>
          <li><strong>Visual Feedback:</strong> Shows warnings for complex formatting</li>
          <li><strong>Security:</strong> All content is sanitized before display</li>
        </ul>
      </div>
    </div>
  );
}
