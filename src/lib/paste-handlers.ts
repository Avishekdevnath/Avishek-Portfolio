import { Editor } from '@tiptap/react';
import { sanitizePastedHtml, analyzeHtmlContent } from './sanitize';

/**
 * Types for paste handling
 */
export interface PasteSource {
  type: 'chatgpt' | 'canvas' | 'notion' | 'word' | 'google-docs' | 'unknown';
  confidence: number;
  features: string[];
}

export interface PasteResult {
  success: boolean;
  content: string;
  source: PasteSource;
  analysis: ReturnType<typeof analyzeHtmlContent>;
  warnings: string[];
}

/**
 * Detects the source of pasted content based on HTML patterns
 */
export const detectPasteSource = (clipboardData: DataTransfer): PasteSource => {
  const html = clipboardData.getData('text/html');
  const text = clipboardData.getData('text/plain');
  
  if (!html && !text) {
    return { type: 'unknown', confidence: 0, features: [] };
  }

  const features: string[] = [];
  let confidence = 0;

  // ChatGPT detection patterns
  if (html.includes('data-message-author-role="assistant"') || 
      html.includes('markdown') ||
      html.includes('code-block') ||
      html.includes('chatgpt')) {
    features.push('chatgpt-markers');
    confidence += 0.8;
  }

  // Canvas/Notion detection patterns
  if (html.includes('notion-') || 
      html.includes('canvas-') ||
      html.includes('data-block-id') ||
      html.includes('notion-page')) {
    features.push('canvas-notion-markers');
    confidence += 0.7;
  }

  // Word detection patterns
  if (html.includes('mso-') || 
      html.includes('Microsoft') ||
      html.includes('Word.Document')) {
    features.push('word-markers');
    confidence += 0.9;
  }

  // Google Docs detection patterns
  if (html.includes('google-docs') || 
      html.includes('docs.google.com') ||
      html.includes('docs-internal-guid')) {
    features.push('google-docs-markers');
    confidence += 0.8;
  }

  // Formatting pattern analysis
  if (html.includes('<table')) {
    features.push('tables');
    confidence += 0.3;
  }
  
  if (html.includes('<pre') || html.includes('<code')) {
    features.push('code-blocks');
    confidence += 0.2;
  }
  
  if (html.includes('<ul') || html.includes('<ol')) {
    features.push('lists');
    confidence += 0.1;
  }

  // Determine source type based on confidence
  let type: PasteSource['type'] = 'unknown';
  
  if (features.includes('chatgpt-markers')) {
    type = 'chatgpt';
  } else if (features.includes('canvas-notion-markers')) {
    type = 'canvas';
  } else if (features.includes('word-markers')) {
    type = 'word';
  } else if (features.includes('google-docs-markers')) {
    type = 'google-docs';
  } else if (features.length > 0) {
    type = 'notion'; // Default for rich content
  }

  return {
    type,
    confidence: Math.min(confidence, 1),
    features
  };
};

/**
 * Transforms content based on detected source
 */
export const transformContentForSource = (
  html: string, 
  source: PasteSource
): string => {
  let transformedHtml = html;

  switch (source.type) {
    case 'chatgpt':
      transformedHtml = transformChatGPTContent(html);
      break;
    case 'canvas':
    case 'notion':
      transformedHtml = transformCanvasNotionContent(html);
      break;
    case 'word':
      transformedHtml = transformWordContent(html);
      break;
    case 'google-docs':
      transformedHtml = transformGoogleDocsContent(html);
      break;
    default:
      transformedHtml = transformGenericContent(html);
  }

  return transformedHtml;
};

/**
 * ChatGPT-specific content transformation
 */
const transformChatGPTContent = (html: string): string => {
  let transformed = html;

  // Preserve code blocks with proper formatting
  transformed = transformed.replace(
    /<pre[^>]*class="[^"]*code[^"]*"[^>]*>/gi,
    '<pre class="code-block" data-preserve-formatting="true">'
  );

  // Preserve table formatting
  transformed = transformed.replace(
    /<table[^>]*>/gi,
    '<table class="preserved-table" data-preserve-table="true">'
  );

  // Preserve list formatting
  transformed = transformed.replace(
    /<[uo]l[^>]*>/gi,
    (match) => match.replace('>', ' data-preserve-list="true">')
  );

  // Clean up ChatGPT-specific attributes
  transformed = transformed.replace(/data-message-author-role="[^"]*"/gi, '');
  transformed = transformed.replace(/data-message-id="[^"]*"/gi, '');

  return transformed;
};

/**
 * Canvas/Notion-specific content transformation
 */
const transformCanvasNotionContent = (html: string): string => {
  let transformed = html;

  // Preserve block-level formatting
  transformed = transformed.replace(
    /<div[^>]*class="[^"]*block[^"]*"[^>]*>/gi,
    '<div class="preserved-block" data-preserve-block="true">'
  );

  // Preserve table formatting
  transformed = transformed.replace(
    /<table[^>]*>/gi,
    '<table class="preserved-table" data-preserve-table="true">'
  );

  // Clean up Canvas/Notion-specific attributes
  transformed = transformed.replace(/data-block-id="[^"]*"/gi, '');
  transformed = transformed.replace(/notion-[^=]*="[^"]*"/gi, '');
  transformed = transformed.replace(/canvas-[^=]*="[^"]*"/gi, '');

  return transformed;
};

/**
 * Word-specific content transformation
 */
const transformWordContent = (html: string): string => {
  let transformed = html;

  // Remove Word-specific styling
  transformed = transformed.replace(/mso-[^=]*="[^"]*"/gi, '');
  transformed = transformed.replace(/<o:p[^>]*><\/o:p>/gi, '');
  transformed = transformed.replace(/<o:p[^>]*>/gi, '');
  transformed = transformed.replace(/<\/o:p>/gi, '');

  // Preserve table formatting
  transformed = transformed.replace(
    /<table[^>]*>/gi,
    '<table class="preserved-table" data-preserve-table="true">'
  );

  // Convert Word-specific formatting to standard HTML
  transformed = transformed.replace(/<span[^>]*style="[^"]*font-weight:\s*bold[^"]*"[^>]*>/gi, '<strong>');
  transformed = transformed.replace(/<span[^>]*style="[^"]*font-style:\s*italic[^"]*"[^>]*>/gi, '<em>');

  return transformed;
};

/**
 * Google Docs-specific content transformation
 */
const transformGoogleDocsContent = (html: string): string => {
  let transformed = html;

  // Preserve Google Docs formatting
  transformed = transformed.replace(
    /<span[^>]*class="[^"]*docs-internal-guid[^"]*"[^>]*>/gi,
    '<span class="preserved-formatting" data-preserve-formatting="true">'
  );

  // Preserve table formatting
  transformed = transformed.replace(
    /<table[^>]*>/gi,
    '<table class="preserved-table" data-preserve-table="true">'
  );

  // Clean up Google Docs-specific attributes
  transformed = transformed.replace(/docs-internal-guid="[^"]*"/gi, '');
  transformed = transformed.replace(/google-docs="[^"]*"/gi, '');

  return transformed;
};

/**
 * Generic content transformation
 */
const transformGenericContent = (html: string): string => {
  let transformed = html;

  // Basic cleanup and preservation
  transformed = transformed.replace(
    /<table[^>]*>/gi,
    '<table class="preserved-table" data-preserve-table="true">'
  );

  transformed = transformed.replace(
    /<pre[^>]*>/gi,
    '<pre class="preserved-code" data-preserve-formatting="true">'
  );

  return transformed;
};

/**
 * Main paste handler function
 */
export const handlePaste = async (
  event: ClipboardEvent,
  editor: Editor
): Promise<PasteResult> => {
  const clipboardData = event.clipboardData;
  if (!clipboardData) {
    return {
      success: false,
      content: '',
      source: { type: 'unknown', confidence: 0, features: [] },
      analysis: { hasTables: false, hasCodeBlocks: false, hasLists: false, hasImages: false, hasLinks: false, hasComplexFormatting: false, estimatedComplexity: 'simple' },
      warnings: ['No clipboard data available']
    };
  }

  const warnings: string[] = [];
  
  try {
    // Get HTML content
    const html = clipboardData.getData('text/html');
    const text = clipboardData.getData('text/plain');
    
    if (!html && !text) {
      return {
        success: false,
        content: '',
        source: { type: 'unknown', confidence: 0, features: [] },
        analysis: { hasTables: false, hasCodeBlocks: false, hasLists: false, hasImages: false, hasLinks: false, hasComplexFormatting: false, estimatedComplexity: 'simple' },
        warnings: ['No content available in clipboard']
      };
    }

    // Detect source
    const source = detectPasteSource(clipboardData);
    
    // Transform content based on source
    const transformedHtml = html ? transformContentForSource(html, source) : text;
    
    // Sanitize content
    const sanitizedHtml = sanitizePastedHtml(transformedHtml);
    
    // Analyze content
    const analysis = analyzeHtmlContent(sanitizedHtml);
    
    // Insert content into editor
    editor.commands.insertContent(sanitizedHtml);
    
    // Add warnings for complex content
    if (analysis.estimatedComplexity === 'complex') {
      warnings.push('Complex formatting detected - some formatting may need manual adjustment');
    }
    
    if (analysis.hasTables) {
      warnings.push('Table formatting preserved - verify layout');
    }
    
    if (analysis.hasCodeBlocks) {
      warnings.push('Code blocks preserved - check syntax highlighting');
    }

    return {
      success: true,
      content: sanitizedHtml,
      source,
      analysis,
      warnings
    };

  } catch (error) {
    // Paste handling failed
    return {
      success: false,
      content: '',
      source: { type: 'unknown', confidence: 0, features: [] },
      analysis: { hasTables: false, hasCodeBlocks: false, hasLists: false, hasImages: false, hasLinks: false, hasComplexFormatting: false, estimatedComplexity: 'simple' },
      warnings: [`Paste failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
};

/**
 * Hook for using paste handler in React components
 */
export const usePasteHandler = () => {
  const handlePasteEvent = async (event: ClipboardEvent, editor: Editor) => {
    event.preventDefault();
    return await handlePaste(event, editor);
  };

  return { handlePasteEvent };
};

export default {
  detectPasteSource,
  transformContentForSource,
  handlePaste,
  usePasteHandler
};
