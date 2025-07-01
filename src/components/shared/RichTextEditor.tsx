"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef } from 'react';
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
} from 'lucide-react';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { uploadImage } from '@/lib/cloudinary';
import { ChangeEvent } from 'react';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Image as ImageIcon, Youtube as YoutubeIcon, PaintBucket } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  readOnly?: boolean;
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

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing…',
  className,
  minHeight = '200px',
  readOnly = false,
}: RichTextEditorProps) {
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
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: clsx(
          'prose prose-sm sm:prose lg:prose-lg focus:outline-none',
          className
        ),
        style: `min-height:${minHeight}`,
        placeholder,
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
      console.error('Image upload error:', error);
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
      {editor && !readOnly && (
        <div className="toolbar">
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
            onChange={e => editor.chain().focus().setFontFamily(e.target.value).run()}
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