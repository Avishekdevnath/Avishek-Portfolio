# Enhanced React Quill Editor Setup

This document describes the comprehensive React Quill editor setup that has been implemented in the Avishek Portfolio project.

## 🚀 Features

### Core Features
- **Rich Text Editing**: Full-featured WYSIWYG editor with customizable toolbar
- **Image & Video Upload**: Drag & drop or click to upload media files
- **Auto-Save**: Configurable auto-save functionality with progress indicators
- **Word Count**: Real-time word and character counting
- **Content Validation**: Min/max word limits and content validation
- **Multiple Themes**: Light and dark theme support
- **Responsive Design**: Works perfectly on all screen sizes
- **TypeScript Support**: Full TypeScript support with proper type definitions

### Advanced Features
- **Customizable Toolbar**: Show/hide toolbar options as needed
- **Multiple Configurations**: Pre-configured setups for different use cases
- **Custom Hooks**: Reusable hooks for state management
- **Error Handling**: Comprehensive error handling and validation
- **Content Sanitization**: XSS protection for content viewing
- **History Management**: Undo/redo functionality (optional)
- **Progress Indicators**: Upload progress and save status indicators

## 📁 File Structure

```
src/
├── components/shared/
│   ├── QuillEditor.tsx          # Enhanced Quill editor component
│   ├── QuillViewer.tsx          # Enhanced Quill viewer component
│   ├── DraftEditor.tsx          # Wrapper for QuillEditor with Draft.js compatibility
│   ├── DraftViewer.tsx          # Wrapper for QuillViewer with Draft.js compatibility
│   └── QuillExample.tsx         # Comprehensive example component
├── hooks/
│   └── useQuillEditor.ts        # Custom hooks for Quill editor state management
├── lib/
│   └── quill-config.ts          # Centralized configuration and presets
└── app/globals.css              # Global styles including Quill CSS
```

## 🛠️ Installation & Setup

### 1. Dependencies
The project already includes the necessary dependencies:
```json
{
  "react-quill": "^2.0.0"
}
```

### 2. CSS Import
The Quill CSS is already imported in `src/app/globals.css`:
```css
@import "react-quill/dist/quill.snow.css";
```

### 3. Basic Usage

#### Simple Editor
```tsx
import DraftEditor from '@/components/shared/DraftEditor';

function MyComponent() {
  const [content, setContent] = useState('');

  return (
    <DraftEditor
      value={content}
      onChange={setContent}
      placeholder="Start writing..."
    />
  );
}
```

#### Simple Viewer
```tsx
import DraftViewer from '@/components/shared/DraftViewer';

function MyComponent() {
  return (
    <DraftViewer
      content={htmlContent}
      theme="light"
      fontSize="base"
    />
  );
}
```

## ⚙️ Configuration

### Pre-configured Setups

The project includes several pre-configured editor setups:

#### Blog Editor
```tsx
import { BLOG_EDITOR_CONFIG } from '@/lib/quill-config';

<DraftEditor
  value={content}
  onChange={setContent}
  {...BLOG_EDITOR_CONFIG}
/>
```

#### Project Editor
```tsx
import { PROJECT_EDITOR_CONFIG } from '@/lib/quill-config';

<DraftEditor
  value={content}
  onChange={setContent}
  {...PROJECT_EDITOR_CONFIG}
/>
```

#### Experience Editor
```tsx
import { EXPERIENCE_EDITOR_CONFIG } from '@/lib/quill-config';

<DraftEditor
  value={content}
  onChange={setContent}
  {...EXPERIENCE_EDITOR_CONFIG}
/>
```

### Custom Configuration

You can create custom configurations:

```tsx
import { buildToolbarFromOptions } from '@/lib/quill-config';

const customConfig = {
  theme: 'snow',
  placeholder: 'Custom placeholder...',
  minHeight: '200px',
  maxHeight: '500px',
  toolbarOptions: {
    showHeaders: true,
    showLists: true,
    showImages: false,
    showVideos: false,
  },
  formats: ['header', 'bold', 'italic', 'list'],
};

<DraftEditor
  value={content}
  onChange={setContent}
  {...customConfig}
/>
```

## 🎣 Custom Hooks

### useQuillEditor Hook

```tsx
import { useQuillEditor } from '@/hooks/useQuillEditor';

function MyComponent() {
  const editor = useQuillEditor({
    initialValue: '<p>Initial content</p>',
    autoSave: true,
    autoSaveDelay: 3000,
    onAutoSave: (content) => {
      // Save to server or localStorage
      localStorage.setItem('draft', content);
    },
    onWordCountChange: (count) => {
      console.log('Word count:', count);
    },
    minWords: 10,
    maxWords: 1000,
  });

  return (
    <div>
      <DraftEditor
        value={editor.content}
        onChange={editor.setContent}
      />
      <div>Words: {editor.wordCount}</div>
      <div>Status: {editor.isSaving ? 'Saving...' : 'Saved'}</div>
      {editor.error && <div className="error">{editor.error}</div>}
    </div>
  );
}
```

### useQuillWithUpload Hook

```tsx
import { useQuillWithUpload } from '@/hooks/useQuillEditor';

function MyComponent() {
  const handleUpload = async (file: File) => {
    // Upload to your server/cloud storage
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/upload', { method: 'POST', body: formData });
    return response.json().url;
  };

  const editor = useQuillWithUpload(handleUpload, {
    autoSave: true,
  });

  return (
    <DraftEditor
      value={editor.content}
      onChange={editor.setContent}
      onImageUpload={editor.handleUpload}
    />
  );
}
```

## 🎨 Styling

### Custom CSS Classes

The editor includes comprehensive styling with the following classes:

- `.quill-editor-wrapper`: Main editor container
- `.quill-viewer-wrapper`: Main viewer container
- `.ql-editor`: Quill editor content area
- `.ql-toolbar`: Quill toolbar
- `.ql-container`: Quill container

### Theme Support

Both light and dark themes are supported:

```tsx
// Light theme (default)
<DraftViewer content={content} theme="light" />

// Dark theme
<DraftViewer content={content} theme="dark" />
```

### Responsive Design

The editor is fully responsive and includes mobile-specific styles:

```css
@media (max-width: 640px) {
  .quill-editor-wrapper .ql-editor h1 {
    font-size: 1.5rem;
  }
  /* ... more mobile styles */
}
```

## 📝 API Reference

### QuillEditor Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | Editor content |
| `onChange` | `(value: string) => void` | - | Change handler |
| `placeholder` | `string` | `'Start writing...'` | Placeholder text |
| `minHeight` | `string` | `'200px'` | Minimum editor height |
| `maxHeight` | `string` | `'600px'` | Maximum editor height |
| `readOnly` | `boolean` | `false` | Read-only mode |
| `theme` | `'snow' \| 'bubble'` | `'snow'` | Editor theme |
| `onImageUpload` | `(file: File) => Promise<string>` | - | Image upload handler |
| `onVideoUpload` | `(file: File) => Promise<string>` | - | Video upload handler |
| `toolbarOptions` | `QuillToolbarOptions` | `DEFAULT_TOOLBAR_OPTIONS` | Toolbar configuration |
| `formats` | `string[]` | - | Allowed formats |
| `modules` | `any` | - | Custom modules |
| `error` | `boolean` | `false` | Error state |
| `disabled` | `boolean` | `false` | Disabled state |

### QuillViewer Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | - | Content to display |
| `theme` | `'light' \| 'dark'` | `'light'` | Display theme |
| `fontSize` | `'sm' \| 'base' \| 'lg' \| 'xl'` | `'base'` | Font size |
| `lineHeight` | `'tight' \| 'normal' \| 'relaxed'` | `'normal'` | Line height |
| `maxHeight` | `string` | `'none'` | Maximum height |
| `showLineNumbers` | `boolean` | `false` | Show line numbers |

### useQuillEditor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `initialValue` | `string` | `''` | Initial content |
| `autoSave` | `boolean` | `false` | Enable auto-save |
| `autoSaveDelay` | `number` | `3000` | Auto-save delay (ms) |
| `onAutoSave` | `(content: string) => void` | - | Auto-save callback |
| `onWordCountChange` | `(count: number) => void` | - | Word count callback |
| `minWords` | `number` | `0` | Minimum word count |
| `maxWords` | `number` | - | Maximum word count |

## 🔧 Integration Examples

### Blog Post Editor

```tsx
import { useQuillEditor } from '@/hooks/useQuillEditor';
import { BLOG_EDITOR_CONFIG } from '@/lib/quill-config';
import DraftEditor from '@/components/shared/DraftEditor';

function BlogEditor() {
  const editor = useQuillEditor({
    autoSave: true,
    autoSaveDelay: 2000,
    onAutoSave: async (content) => {
      await saveBlogDraft(content);
    },
    minWords: 100,
    maxWords: 5000,
  });

  return (
    <div>
      <DraftEditor
        value={editor.content}
        onChange={editor.setContent}
        {...BLOG_EDITOR_CONFIG}
        onImageUpload={handleImageUpload}
        error={!!editor.error}
        disabled={editor.isSaving}
      />
      
      <div className="editor-stats">
        <span>Words: {editor.wordCount}</span>
        <span>Status: {editor.isSaving ? 'Saving...' : 'Saved'}</span>
      </div>
      
      {editor.error && (
        <div className="error-message">{editor.error}</div>
      )}
    </div>
  );
}
```

### Project Description Editor

```tsx
import { PROJECT_EDITOR_CONFIG } from '@/lib/quill-config';
import DraftEditor from '@/components/shared/DraftEditor';

function ProjectEditor({ project, onSave }) {
  const [content, setContent] = useState(project.description);

  return (
    <DraftEditor
      value={content}
      onChange={setContent}
      {...PROJECT_EDITOR_CONFIG}
      onImageUpload={handleProjectImageUpload}
    />
  );
}
```

### Content Viewer with Dark Theme

```tsx
import DraftViewer from '@/components/shared/DraftViewer';

function BlogPost({ post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <DraftViewer
        content={post.content}
        theme="dark"
        fontSize="lg"
        lineHeight="relaxed"
      />
    </article>
  );
}
```

## 🚨 Error Handling

The editor includes comprehensive error handling:

```tsx
const editor = useQuillEditor({
  minWords: 10,
  maxWords: 1000,
});

// Validation errors
if (editor.error) {
  console.log('Validation error:', editor.error);
}

// Upload errors
const handleUpload = async (file: File) => {
  try {
    const url = await uploadFile(file);
    return url;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error; // This will be handled by the editor
  }
};
```

## 🔒 Security

### Content Sanitization

The viewer component includes basic XSS protection:

```tsx
// Automatically removes dangerous scripts and event handlers
<DraftViewer content={userGeneratedContent} />
```

For production use, consider using a library like DOMPurify for more robust sanitization.

## 📱 Mobile Support

The editor is fully responsive and includes:

- Touch-friendly toolbar buttons
- Mobile-optimized font sizes
- Responsive layout adjustments
- Touch gesture support

## 🎯 Best Practices

1. **Use Pre-configured Setups**: Use the provided configurations for consistency
2. **Implement Auto-Save**: Always implement auto-save for better UX
3. **Handle Upload Errors**: Provide proper error handling for file uploads
4. **Validate Content**: Use content validation for quality control
5. **Optimize Images**: Implement image optimization for better performance
6. **Use TypeScript**: Leverage TypeScript for better development experience

## 🔄 Migration from Old Setup

If you're migrating from the old Quill setup:

1. Replace direct `QuillEditor` usage with `DraftEditor`
2. Replace direct `QuillViewer` usage with `DraftViewer`
3. Use the new configuration system instead of inline configurations
4. Implement the new hooks for better state management
5. Update your upload handlers to use the new interface

## 📚 Additional Resources

- [React Quill Documentation](https://github.com/zenoamaro/react-quill)
- [Quill.js Documentation](https://quilljs.com/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

When contributing to the Quill editor setup:

1. Follow the existing code style and patterns
2. Add proper TypeScript types for new features
3. Include comprehensive error handling
4. Test on both desktop and mobile devices
5. Update this documentation for any new features 