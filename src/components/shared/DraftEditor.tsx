// Draft.js Editor Component with Enhanced Features

"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  ContentState,
  DraftHandleValue,
  AtomicBlockUtils,
  EntityInstance,
  CompositeDecorator,
  ContentBlock,
  Modifier,
  getDefaultKeyBinding,
  KeyBindingUtil,
} from 'draft-js';
import 'draft-js/dist/Draft.css';
import { DraftContent } from '@/types/experience';
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaCode,
  FaHighlighter,
  FaListUl,
  FaListOl,
  FaQuoteRight,
  FaImage,
  FaVideo,
  FaLink,
  FaUnlink,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaUndoAlt,
  FaRedoAlt,
  FaPalette,
} from 'react-icons/fa';
import { LuHeading1, LuHeading2, LuHeading3 } from 'react-icons/lu';
import { toast } from 'react-hot-toast';

interface DraftEditorProps {
  value: string | DraftContent;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  onImageUpload?: (file: File) => Promise<string>;
}

interface MediaComponentProps {
  contentState: {
    getEntity: (key: string) => EntityInstance;
  };
  block: ContentBlock & {
    getEntityAt: (offset: number) => string;
  };
}

// Media Components
const Image = (props: { src: string; alt?: string }) => {
  return (
    <img 
      src={props.src} 
      alt={props.alt || ''} 
      className="max-w-full h-auto my-2 rounded-lg"
      style={{ maxHeight: '500px' }}
    />
  );
};

const Video = (props: { src: string }) => {
  return (
    <div className="relative w-full pt-[56.25%] my-2">
      <iframe
        className="absolute top-0 left-0 w-full h-full rounded-lg"
        src={props.src}
        allowFullScreen
      />
    </div>
  );
};

// Media Decorator Component
const MediaComponent = ({ contentState, block }: MediaComponentProps) => {
  const entityKey = block.getEntityAt(0);
  if (!entityKey) return null;

  const entity = contentState.getEntity(entityKey);
  const type = entity.getType();
  const data = entity.getData();

  if (type === 'IMAGE') {
    return <Image src={data.src} alt={data.alt || ''} />;
  }

  if (type === 'VIDEO') {
    return <Video src={data.src} />;
  }

  return null;
};

const EMPTY_CONTENT: DraftContent = {
  blocks: [
    {
      text: '',
      type: 'unstyled',
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {},
    },
  ],
  entityMap: {},
};

const BLOCK_TYPES = [
  { label: 'Heading 1', style: 'header-one', icon: LuHeading1 },
  { label: 'Heading 2', style: 'header-two', icon: LuHeading2 },
  { label: 'Heading 3', style: 'header-three', icon: LuHeading3 },
  { label: 'Blockquote', style: 'blockquote', icon: FaQuoteRight },
  { label: 'Unordered List', style: 'unordered-list-item', icon: FaListUl },
  { label: 'Ordered List', style: 'ordered-list-item', icon: FaListOl },
  { label: 'Code Block', style: 'code-block', icon: FaCode },
] as const;

const INLINE_STYLES = [
  { label: 'Bold', style: 'BOLD', icon: FaBold },
  { label: 'Italic', style: 'ITALIC', icon: FaItalic },
  { label: 'Underline', style: 'UNDERLINE', icon: FaUnderline },
  { label: 'Strikethrough', style: 'STRIKETHROUGH', icon: FaStrikethrough },
  { label: 'Code', style: 'CODE', icon: FaCode },
  { label: 'Highlight', style: 'HIGHLIGHT', icon: FaHighlighter },
] as const;

const TEXT_ALIGNMENT = [
  { label: 'Left Align', style: 'text-left', icon: FaAlignLeft },
  { label: 'Center Align', style: 'text-center', icon: FaAlignCenter },
  { label: 'Right Align', style: 'text-right', icon: FaAlignRight },
  { label: 'Justify', style: 'text-justify', icon: FaAlignJustify },
] as const;

const TEXT_COLORS = [
  { label: 'Black', color: '#000000' },
  { label: 'Gray', color: '#666666' },
  { label: 'Red', color: '#FF0000' },
  { label: 'Blue', color: '#0000FF' },
  { label: 'Green', color: '#00FF00' },
  { label: 'Purple', color: '#800080' },
] as const;

// Create a composite decorator for media
const decorator = new CompositeDecorator([
  {
    strategy: (contentBlock, callback, contentState) => {
      contentBlock.findEntityRanges(
        (character) => {
          const entityKey = character.getEntity();
          if (entityKey === null) {
            return false;
          }
          const entity = contentState.getEntity(entityKey);
          return entity.getType() === 'IMAGE' || entity.getType() === 'VIDEO';
        },
        callback
      );
    },
    component: MediaComponent,
  },
]);

export default function DraftEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
  className = '',
  minHeight = '200px',
  onImageUpload,
}: DraftEditorProps) {
  const [editorState, setEditorState] = useState(() => {
    if (!value) return EditorState.createEmpty(decorator);

    try {
      // If value is already a DraftContent object
      const content = typeof value === 'string' ? JSON.parse(value) : value;
      if (!content.blocks || !Array.isArray(content.blocks)) {
        throw new Error('Invalid content structure');
      }
      const contentWithKeys = {
        ...content,
        blocks: content.blocks.map((block, index) => ({
          ...block,
          key: block.key || `block-${index}-${Date.now()}`
        }))
      };
      return EditorState.createWithContent(convertFromRaw(contentWithKeys as any), decorator);
    } catch (error) {
      console.warn('Failed to parse editor content:', error);
      const plainText = typeof value === 'string' ? value : '';
      return EditorState.createWithContent(
        ContentState.createFromText(plainText),
        decorator
      );
    }
  });

  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [linkInputValue, setLinkInputValue] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef<Editor>(null);

  // Update parent form when content changes
  useEffect(() => {
    const contentState = editorState.getCurrentContent();
    const hasText = contentState.hasText();
    
    if (!hasText && !contentState.getBlockMap().first().getType().includes('atomic')) {
      onChange('');
      return;
    }

    try {
      const raw = convertToRaw(contentState);
      onChange(JSON.stringify(raw));
    } catch (error) {
      console.error('Failed to convert editor content:', error);
      const plainText = contentState.getPlainText();
      onChange(plainText);
    }
  }, [editorState, onChange]);

  const handleKeyBinding = (e: React.KeyboardEvent): string | null => {
    if (KeyBindingUtil.hasCommandModifier(e)) {
      switch (e.key) {
        case 'b': return 'bold';
        case 'i': return 'italic';
        case 'u': return 'underline';
        case 'k': return 'link';
        case 'z': return e.shiftKey ? 'redo' : 'undo';
        default: return getDefaultKeyBinding(e);
      }
    }
    return getDefaultKeyBinding(e);
  };

  const handleKeyCommand = (command: string, currentState: EditorState): DraftHandleValue => {
    if (command === 'bold') {
      setEditorState(RichUtils.toggleInlineStyle(currentState, 'BOLD'));
      return 'handled';
    }
    if (command === 'italic') {
      setEditorState(RichUtils.toggleInlineStyle(currentState, 'ITALIC'));
      return 'handled';
    }
    if (command === 'underline') {
      setEditorState(RichUtils.toggleInlineStyle(currentState, 'UNDERLINE'));
      return 'handled';
    }
    if (command === 'link') {
      setShowLinkInput(true);
      return 'handled';
    }
    if (command === 'undo') {
      setEditorState(EditorState.undo(currentState));
      return 'handled';
    }
    if (command === 'redo') {
      setEditorState(EditorState.redo(currentState));
      return 'handled';
    }

    const newState = RichUtils.handleKeyCommand(currentState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const addLink = (url: string) => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    
    if (!url) {
      const newContentState = Modifier.removeInlineStyle(contentState, selection, 'LINK');
      const newEditorState = EditorState.push(editorState, newContentState, 'change-inline-style');
      setEditorState(newEditorState);
      return;
    }

    const contentStateWithEntity = contentState.createEntity('LINK', 'MUTABLE', { url });
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    
    let newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity,
    });
    
    newEditorState = RichUtils.toggleLink(newEditorState, selection, entityKey);
    setEditorState(newEditorState);
  };

  const removeLink = () => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const newContentState = Modifier.removeInlineStyle(contentState, selection, 'LINK');
    const newEditorState = EditorState.push(editorState, newContentState, 'change-inline-style');
    setEditorState(newEditorState);
  };

  const applyColor = (color: string) => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const newContentState = Modifier.applyInlineStyle(contentState, selection, `color-${color}`);
    const newEditorState = EditorState.push(editorState, newContentState, 'change-inline-style');
    setEditorState(newEditorState);
    setShowColorPicker(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      editorRef.current?.focus();
    }, 0);
  };

  // Toggle block type
  const toggleBlockType = (blockType: string) => {
    setEditorState(RichUtils.toggleBlockType(editorState, blockType));
  };

  // Toggle inline style
  const toggleInlineStyle = (inlineStyle: string) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  // Handle text alignment
  const toggleTextAlignment = (alignment: string) => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const blockData = contentState
      .getBlockForKey(selection.getStartKey())
      .getData()
      .merge({ textAlignment: alignment });

    const newContentState = contentState.merge({
      blockMap: contentState.getBlockMap().map(block => {
        if (selection.hasEdgeWithin(block.getKey())) {
          return block.merge({ data: blockData });
        }
        return block;
      })
    });

    const newEditorState = EditorState.push(
      editorState,
      newContentState as any,
      'change-block-data'
    );

    setEditorState(newEditorState);
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    if (!onImageUpload) return;

    try {
      const imageUrl = await onImageUpload(file);
      const contentState = editorState.getCurrentContent();
      const contentStateWithEntity = contentState.createEntity(
        'IMAGE',
        'IMMUTABLE',
        { src: imageUrl, alt: file.name }
      );
      const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
      const newEditorState = AtomicBlockUtils.insertAtomicBlock(
        editorState,
        entityKey,
        ' '
      );
      setEditorState(newEditorState);
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };

  // Handle video embed
  const handleVideoEmbed = (url: string) => {
    // Support YouTube and Vimeo URLs
    let embedUrl = url;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.split('v=')[1] || url.split('/').pop();
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop();
      embedUrl = `https://player.vimeo.com/video/${videoId}`;
    }

    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      'VIDEO',
      'IMMUTABLE',
      { src: embedUrl }
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = AtomicBlockUtils.insertAtomicBlock(
      editorState,
      entityKey,
      ' '
    );
    setEditorState(newEditorState);
  };

  // Get current block type and style
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();
  const currentStyle = editorState.getCurrentInlineStyle();
  const currentBlock = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey());
  const currentAlignment = currentBlock.getData().get('textAlignment') || 'text-left';

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      <div className={`border rounded-lg shadow-sm bg-white ${className} ${isFullscreen ? 'h-full' : ''}`}>
        {/* Toolbar */}
        <div className="sticky top-0 z-10 border-b bg-gray-50 p-2 space-y-2">
          <div className="flex flex-wrap items-center gap-1">
            {/* Block Type Controls */}
            <div className="flex items-center gap-1 border-r pr-2">
              {BLOCK_TYPES.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.style}
                    onClick={() => toggleBlockType(type.style)}
                    className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
                      RichUtils.getCurrentBlockType(editorState) === type.style
                        ? 'bg-gray-200 text-blue-600'
                        : 'text-gray-700'
                    }`}
                    title={type.label}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>

            {/* Inline Style Controls */}
            <div className="flex items-center gap-1 border-r pr-2">
              {INLINE_STYLES.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.style}
                    onClick={() => toggleInlineStyle(type.style)}
                    className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
                      editorState.getCurrentInlineStyle().has(type.style)
                        ? 'bg-gray-200 text-blue-600'
                        : 'text-gray-700'
                    }`}
                    title={type.label}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>

            {/* Text Alignment Controls */}
            <div className="flex items-center gap-1 border-r pr-2">
              {TEXT_ALIGNMENT.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.style}
                    onClick={() => toggleTextAlignment(type.style)}
                    className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700"
                    title={type.label}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>

            {/* Media Controls */}
            <div className="flex items-center gap-1 border-r pr-2">
              <button
                onClick={() => document.getElementById('image-upload')?.click()}
                className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700"
                title="Insert Image"
              >
                <FaImage className="w-4 h-4" />
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
              </button>
              <button
                onClick={() => {
                  const url = prompt('Enter video URL (YouTube, Vimeo, etc.):');
                  if (url) handleVideoEmbed(url);
                }}
                className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700"
                title="Insert Video"
              >
                <FaVideo className="w-4 h-4" />
              </button>
            </div>

            {/* Link Controls */}
            <div className="flex items-center gap-1 border-r pr-2">
              <button
                onClick={() => setShowLinkInput(true)}
                className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700"
                title="Insert Link"
              >
                <FaLink className="w-4 h-4" />
              </button>
              <button
                onClick={removeLink}
                className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700"
                title="Remove Link"
              >
                <FaUnlink className="w-4 h-4" />
              </button>
            </div>

            {/* Color Picker */}
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700"
                title="Text Color"
              >
                <FaPalette className="w-4 h-4" />
              </button>
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-1 p-2 bg-white border rounded-lg shadow-lg grid grid-cols-3 gap-1">
                  {TEXT_COLORS.map(color => (
                    <button
                      key={color.color}
                      onClick={() => applyColor(color.color)}
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: color.color }}
                      title={color.label}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Undo/Redo Controls */}
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={() => setEditorState(EditorState.undo(editorState))}
                className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700"
                title="Undo"
              >
                <FaUndoAlt className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditorState(EditorState.redo(editorState))}
                className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700"
                title="Redo"
              >
                <FaRedoAlt className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Link Input */}
          {showLinkInput && (
            <div className="flex items-center gap-2 pt-2">
              <input
                type="url"
                value={linkInputValue}
                onChange={(e) => setLinkInputValue(e.target.value)}
                placeholder="Enter URL..."
                className="flex-1 px-2 py-1 border rounded"
              />
              <button
                onClick={() => {
                  addLink(linkInputValue);
                  setShowLinkInput(false);
                  setLinkInputValue('');
                }}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowLinkInput(false);
                  setLinkInputValue('');
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Editor */}
        <div
          className={`p-4 ${isFullscreen ? 'h-[calc(100vh-180px)] overflow-y-auto' : ''}`}
          style={{ minHeight }}
          onClick={() => editorRef.current?.focus()}
        >
          <Editor
            ref={editorRef}
            editorState={editorState}
            onChange={setEditorState}
            handleKeyCommand={handleKeyCommand}
            keyBindingFn={handleKeyBinding}
            placeholder={placeholder}
            spellCheck
          />
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="absolute top-2 right-2 p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isFullscreen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0 0l-5-5m-7 11h4m-4 0v4m0-4l5 5m5-9v4m0-4h4m-4 0l5 5"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0 0l-5-5m-7 11h4m-4 0v4m0-4l5 5m5-9v4m0-4h4m-4 0l5 5"
              />
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}
