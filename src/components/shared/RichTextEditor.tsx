"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef, useState } from 'react';
import clsx from 'classnames';
import {
  Bold,
  Italic,
  Strikethrough,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  List as BulletListIcon,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Image as ImageIcon,
  Youtube as YoutubeIcon,
  PaintBucket,
  Type,
} from 'lucide-react';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { ChangeEvent } from 'react';
import { usePasteHandler } from '@/lib/paste-handlers';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  readOnly?: boolean;
  lineSpacing?: string;
  onLineSpacingChange?: (lineSpacing: string) => void;
}

function ToolbarButton({
  onClick,
  icon: Icon,
  active,
  title,
}: {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={clsx(
        'p-2 rounded hover:bg-gray-100',
        active ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
      )}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

// helper font families array
const FONT_FAMILIES = [
  'inherit',
  'Inter',
  'Roboto',
  'Merriweather',
  'Georgia',
];

const LINE_SPACING_OPTIONS = [
  { value: '08', label: '0.8x (Tight)', icon: Type },
  { value: '10', label: '1.0x (Single)', icon: Type },
  { value: '115', label: '1.15x (Default)', icon: Type },
  { value: '125', label: '1.25x (Relaxed)', icon: Type },
  { value: '15', label: '1.5x (Loose)', icon: Type },
  { value: '20', label: '2.0x (Double)', icon: Type },
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing…',
  className,
  minHeight = '200px',
  readOnly = false,
  lineSpacing: externalLineSpacing,
  onLineSpacingChange,
}: RichTextEditorProps) {
  const [lineSpacing, setLineSpacing] = useState(externalLineSpacing || '10');
  const [pasteWarnings, setPasteWarnings] = useState<string[]>([]);
  const { handlePasteEvent } = usePasteHandler();
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
      Image.configure({ allowBase64: false }),
      Youtube.configure({ width: 640, height: 360 }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '<p></p>',
    editable: !readOnly,
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: clsx(
          'prose prose-sm sm:prose lg:prose-lg focus:outline-none',
          'prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-h4:text-sm prose-h1:my-1 prose-h2:my-1 prose-h3:my-1 prose-h4:my-0 prose-headings:leading-tight',
          'prose-p:text-gray-700 prose-p:text-sm',
          'prose-img:rounded-lg prose-img:shadow-sm prose-img:my-1',
          'prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:bg-gray-50 prose-blockquote:p-2 prose-blockquote:my-1 prose-blockquote:text-xs',
          'prose-ul prose-ol',
          'prose-li:text-sm list-inside',
          'prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[11px] prose-code:text-gray-800',
          'prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-1.5 prose-pre:rounded-lg prose-pre:my-1 prose-pre:text-[11px]',
          'prose-strong:text-gray-900 prose-strong:font-semibold',
          'prose-em:text-gray-700',
          'prose-hr:border-gray-200 prose-hr:my-1',
          // Ensure proper text contrast for all content
          'prose-headings:text-gray-900 prose-headings:font-bold',
          'prose-p:text-gray-700 prose-p:font-normal',
          'prose-li:text-gray-700 prose-li:font-normal',
          'prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline',
          'prose-table:text-gray-800 prose-table:border-gray-300',
          'prose-th:text-gray-900 prose-th:font-semibold prose-th:bg-gray-50',
          'prose-td:text-gray-800 prose-td:border-gray-300',
          `line-spacing-${lineSpacing}`,
          className
        ),
        style: `min-height:${minHeight}`,
        placeholder,
      },
      handlePaste: (_, event) => {
        if (event.clipboardData && editor) {
          handlePasteEvent(event, editor).then(result => {
            if (result.success) {
              setPasteWarnings(result.warnings);
              // Clear warnings after 5 seconds
              setTimeout(() => setPasteWarnings([]), 5000);
            } else {
              setPasteWarnings(result.warnings);
            }
          }).catch(error => {
            // Paste handling error
            setPasteWarnings(['Paste failed - using default behavior']);
          });
          return true; // Prevent default paste behavior
        }
        return false; // Allow default paste behavior
      },
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      // Upload to API endpoint which calls uploadImage
      const response = await fetch('/api/blogs/upload-image', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Upload failed');
      
      editor.chain().focus().setImage({ src: data.url }).run();
      e.target.value = '';
    } catch (error) {
      // Image upload error
      alert('Failed to upload image. Please try again.');
    }
  };

  // keep external value in sync when editor first mounts or value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '<p></p>', false);
    }
  }, [value, editor]);

  return (
    <div className="rich-text-editor flex flex-col">
      {/* Paste Warnings */}
      {pasteWarnings.length > 0 && (
        <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          <div className="font-medium">Paste Notice:</div>
          <ul className="mt-1 list-disc list-inside">
            {pasteWarnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
      
      {editor && !readOnly && (
        <div className="toolbar motion-reduce:animate-none">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            icon={Bold}
            active={editor.isActive('bold')}
            title="Bold"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            icon={Italic}
            active={editor.isActive('italic')}
            title="Italic"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            icon={Strikethrough}
            active={editor.isActive('strike')}
            title="Strike"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            icon={UnderlineIcon}
            active={editor.isActive('underline')}
            title="Underline"
          />
          <span className="w-px h-5 bg-gray-200 mx-1" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            icon={Heading1}
            active={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            icon={Heading2}
            active={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          />
          <span className="w-px h-5 bg-gray-200 mx-1" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            icon={BulletListIcon}
            active={editor.isActive('bulletList')}
            title="Bullet List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            icon={ListOrdered}
            active={editor.isActive('orderedList')}
            title="Ordered List"
          />
          <span className="w-px h-5 bg-gray-200 mx-1" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            icon={Quote}
            active={editor.isActive('blockquote')}
            title="Blockquote"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            icon={Code}
            active={editor.isActive('codeBlock')}
            title="Code Block"
          />
          <span className="w-px h-5 bg-gray-200 mx-1" />
          <ToolbarButton
            onClick={() => {
              const url = prompt('Enter URL');
              if (url) {
                editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
              }
            }}
            icon={LinkIcon}
            active={editor.isActive('link')}
            title="Add Link"
          />
          <span className="w-px h-5 bg-gray-200 mx-1" />
          <select
            className="text-sm border rounded"
            value={editor.getAttributes('textStyle').fontFamily || 'inherit'}
            onChange={e => editor.chain().focus().setMark('textStyle', { fontFamily: e.target.value }).run()}
          >
            {FONT_FAMILIES.map(f => (<option key={f} value={f}>{f}</option>))}
          </select>
          <input
            type="color"
            title="Text color"
            className="w-8 h-8 p-0 border rounded"
            onChange={e => editor.chain().focus().setColor(e.target.value).run()}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetColor().run()}
            icon={PaintBucket}
            title="Reset color"
          />
          <span className="w-px h-5 bg-gray-200 mx-1" />
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} icon={AlignLeft} active={editor.isActive({ textAlign: 'left' })} title="Align Left" />
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} icon={AlignCenter} active={editor.isActive({ textAlign: 'center' })} title="Align Center" />
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} icon={AlignRight} active={editor.isActive({ textAlign: 'right' })} title="Align Right" />
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} icon={AlignJustify} active={editor.isActive({ textAlign: 'justify' })} title="Justify" />
          <span className="w-px h-5 bg-gray-200 mx-1" />
          <select
            value={lineSpacing}
            onChange={(e) => {
              const newLineSpacing = e.target.value;
              setLineSpacing(newLineSpacing);
              onLineSpacingChange?.(newLineSpacing);
            }}
            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            title="Line Spacing"
          >
            {LINE_SPACING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="w-px h-5 bg-gray-200 mx-1" />
          <ToolbarButton onClick={() => fileInputRef.current?.click()} icon={ImageIcon} title="Insert Image" />
          <ToolbarButton
            onClick={() => {
              const url = prompt('YouTube URL');
              if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
            }}
            icon={YoutubeIcon}
            title="Embed YouTube"
          />
          <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleImageSelect} />
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            icon={Undo2}
            title="Undo"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            icon={Redo2}
            title="Redo"
          />
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
} 