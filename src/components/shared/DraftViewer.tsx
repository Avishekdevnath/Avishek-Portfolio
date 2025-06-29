"use client";

import React from 'react';
import { EditorState, convertFromRaw, ContentState, ContentBlock } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import { DraftContent } from '@/types/experience';

interface DraftViewerProps {
  content: string | DraftContent;
  className?: string;
}

interface DraftBlock extends ContentBlock {
  getData: () => {
    get: (key: string) => string;
  };
}

export default function DraftViewer({ content, className = '' }: DraftViewerProps) {
  const getProcessedContent = (content: string | DraftContent): string => {
    if (!content) return '';

    try {
      // If content is already a DraftContent object or JSON string
      let parsedContent: DraftContent;
      
      if (typeof content === 'string') {
        try {
          // Try parsing as JSON first
          parsedContent = JSON.parse(content) as DraftContent;
        } catch {
          // If not valid JSON, create from plain text
          const plainState = ContentState.createFromText(content);
          const plainEditorState = EditorState.createWithContent(plainState);
          return stateToHTML(plainEditorState.getCurrentContent());
        }
      } else {
        parsedContent = content;
      }

      // Validate Draft.js content structure
      if (!parsedContent.blocks || !Array.isArray(parsedContent.blocks)) {
        const plainState = ContentState.createFromText(typeof content === 'string' ? content : '');
        const plainEditorState = EditorState.createWithContent(plainState);
        return stateToHTML(plainEditorState.getCurrentContent());
      }

      // Add missing keys to blocks if needed
      const contentWithKeys = {
        ...parsedContent,
        blocks: parsedContent.blocks.map((block, index) => ({
          ...block,
          key: block.key || `block-${index}-${Date.now()}`
        }))
      };

      const contentState = convertFromRaw(contentWithKeys);
      const editorState = EditorState.createWithContent(contentState);

      const options = {
        inlineStyles: {
          BOLD: { element: 'strong' },
          ITALIC: { element: 'em' },
          UNDERLINE: { element: 'u' },
          CODE: { element: 'code' },
          STRIKETHROUGH: { element: 'del' },
          HIGHLIGHT: { 
            element: 'span',
            style: { backgroundColor: '#fef08a' }
          }
        },
        blockStyleFn: (block: DraftBlock) => {
          const type = block.getType();
          const data = block.getData();
          const alignment = data.get('textAlignment');
          
          let styles: Record<string, string> = {};
          
          if (alignment) {
            styles.textAlign = alignment.replace('text-', '');
          }

          if (type === 'code-block') {
            return {
              element: 'pre',
              style: {
                ...styles,
                backgroundColor: '#f3f4f6',
                padding: '1rem',
                borderRadius: '0.375rem',
                fontFamily: 'monospace'
              }
            };
          }

          if (type === 'header-one') {
            return { element: 'h1' };
          }
          if (type === 'header-two') {
            return { element: 'h2' };
          }
          if (type === 'header-three') {
            return { element: 'h3' };
          }
          if (type === 'blockquote') {
            return { element: 'blockquote' };
          }
          if (type === 'unordered-list-item') {
            return { element: 'li', wrapper: 'ul' };
          }
          if (type === 'ordered-list-item') {
            return { element: 'li', wrapper: 'ol' };
          }

          if (Object.keys(styles).length > 0) {
            return { style: styles };
          }

          return null;
        },
        entityStyleFn: (entity: { getType: () => string; getData: () => any; }) => {
          const entityType = entity.getType();
          const data = entity.getData();

          if (entityType === 'IMAGE') {
            return {
              element: 'img',
              attributes: {
                src: data.src,
                alt: data.alt || '',
                class: 'max-w-full h-auto my-2 rounded-lg',
                style: 'max-height: 500px;'
              }
            };
          }

          if (entityType === 'VIDEO') {
            return {
              element: 'div',
              attributes: {
                class: 'relative w-full pt-[56.25%] my-2'
              },
              style: {
                position: 'relative',
                paddingTop: '56.25%',
                margin: '0.5rem 0'
              },
              children: [
                {
                  element: 'iframe',
                  attributes: {
                    src: data.src,
                    class: 'absolute top-0 left-0 w-full h-full rounded-lg',
                    allowfullscreen: 'true',
                    style: 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 0.5rem;'
                  }
                }
              ]
            };
          }

          if (entityType === 'LINK') {
            return {
              element: 'a',
              attributes: {
                href: data.url,
                target: '_blank',
                rel: 'noopener noreferrer',
                class: 'text-blue-600 hover:underline'
              }
            };
          }

          return null;
        }
      };

      return stateToHTML(editorState.getCurrentContent(), options);
    } catch (error) {
      console.error('Error processing content:', error);
      // If all else fails, try to render as plain text
      const rawContent = typeof content === 'string' ? content : '';
      if (!rawContent.trim()) return '';
      
      const plainState = ContentState.createFromText(rawContent);
      const plainEditorState = EditorState.createWithContent(plainState);
      return stateToHTML(plainEditorState.getCurrentContent());
    }
  };

  const processedContent = getProcessedContent(content);

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: processedContent }} 
    />
  );
} 