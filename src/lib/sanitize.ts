import DOMPurify from 'dompurify';

/**
 * Check if we're in a browser environment
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Simple server-side HTML sanitization fallback
 */
const serverSideSanitize = (html: string): string => {
  // Basic HTML tag stripping for server-side
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>.*?<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

/**
 * Configuration for HTML sanitization
 * Balances security with formatting preservation
 */
const SANITIZATION_CONFIG = {
  // Allowed HTML tags for rich text content
  ALLOWED_TAGS: [
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'em', 'u', 's', 'strike',
    'code', 'pre', 'blockquote',
    'ul', 'ol', 'li',
    'a', 'img', 'br', 'hr',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    'div', 'span',
    'mark', 'del', 'ins',
    'sub', 'sup',
    'kbd', 'samp', 'var',
    'cite', 'q', 'abbr', 'time',
    'details', 'summary'
  ],
  
  // Allowed attributes
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'class', 'style',
    'id', 'data-*', 'aria-*',
    'width', 'height', 'border', 'cellpadding', 'cellspacing',
    'colspan', 'rowspan', 'scope',
    'datetime', 'cite', 'lang'
  ],
  
  // Additional security settings
  ALLOW_DATA_ATTR: true,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  SANITIZE_DOM: true,
  KEEP_CONTENT: true,
  
  // Custom hooks for specific handling
  HOOKS: {
    beforeSanitizeElements: (currentNode: Element) => {
      // Preserve ChatGPT-specific formatting
      if (currentNode.tagName === 'PRE' && currentNode.classList.contains('code')) {
        currentNode.setAttribute('data-preserve-formatting', 'true');
      }
      
      // Preserve table formatting
      if (currentNode.tagName === 'TABLE') {
        currentNode.setAttribute('data-preserve-table', 'true');
      }
      
      // Preserve list formatting
      if (['UL', 'OL'].includes(currentNode.tagName)) {
        currentNode.setAttribute('data-preserve-list', 'true');
      }
    },
    
    afterSanitizeElements: (currentNode: Element) => {
      // Clean up any empty elements that might break formatting
      if (currentNode.tagName === 'P' && !currentNode.textContent?.trim()) {
        currentNode.remove();
      }
    }
  }
};

/**
 * Sanitizes HTML content while preserving formatting
 * @param html - Raw HTML content to sanitize
 * @param options - Optional configuration overrides
 * @returns Sanitized HTML string
 */
export const sanitizeHtml = (
  html: string, 
  options: Partial<typeof SANITIZATION_CONFIG> = {}
): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  const config = { ...SANITIZATION_CONFIG, ...options };
  
  try {
    if (isBrowser) {
      return DOMPurify.sanitize(html, config);
    } else {
      // Server-side fallback
      return serverSideSanitize(html);
    }
  } catch (error) {
    // HTML sanitization failed
    // Fallback: strip all HTML tags and return plain text
    return html.replace(/<[^>]*>/g, '');
  }
};

/**
 * Sanitizes HTML content specifically for paste operations
 * More permissive to preserve formatting from external sources
 */
export const sanitizePastedHtml = (html: string): string => {
  const pasteConfig = {
    ...SANITIZATION_CONFIG,
    // Allow more attributes for paste operations
    ALLOWED_ATTR: [
      ...SANITIZATION_CONFIG.ALLOWED_ATTR,
      'data-*', 'aria-*',
      'align', 'valign', 'bgcolor',
      'border', 'cellpadding', 'cellspacing',
      'frame', 'rules', 'summary'
    ],
    // Allow more tags for complex formatting
    ALLOWED_TAGS: [
      ...SANITIZATION_CONFIG.ALLOWED_TAGS,
      'caption', 'col', 'colgroup',
      'fieldset', 'legend',
      'optgroup', 'option',
      'tbody', 'tfoot', 'thead'
    ]
  };

  return sanitizeHtml(html, pasteConfig);
};

/**
 * Sanitizes HTML content for display (more restrictive)
 * Used in RichTextViewer for security
 */
export const sanitizeDisplayHtml = (html: string): string => {
  const displayConfig = {
    ...SANITIZATION_CONFIG,
    // Remove style attributes for display
    ALLOWED_ATTR: SANITIZATION_CONFIG.ALLOWED_ATTR.filter(
      attr => attr !== 'style'
    ),
    // Remove potentially dangerous tags
    ALLOWED_TAGS: SANITIZATION_CONFIG.ALLOWED_TAGS.filter(
      tag => !['script', 'object', 'embed', 'iframe'].includes(tag)
    )
  };

  return sanitizeHtml(html, displayConfig);
};

/**
 * Detects if HTML content contains potentially problematic formatting
 * @param html - HTML content to analyze
 * @returns Object with detection results
 */
export const analyzeHtmlContent = (html: string) => {
  const analysis = {
    hasTables: /<table/i.test(html),
    hasCodeBlocks: /<pre/i.test(html) || /<code/i.test(html),
    hasLists: /<[uo]l/i.test(html),
    hasImages: /<img/i.test(html),
    hasLinks: /<a\s+href/i.test(html),
    hasComplexFormatting: /<table|<pre|<code|<ul|<ol/i.test(html),
    estimatedComplexity: 'simple' as 'simple' | 'moderate' | 'complex'
  };

  // Calculate complexity score
  let complexityScore = 0;
  if (analysis.hasTables) complexityScore += 3;
  if (analysis.hasCodeBlocks) complexityScore += 2;
  if (analysis.hasLists) complexityScore += 1;
  if (analysis.hasImages) complexityScore += 1;
  if (analysis.hasLinks) complexityScore += 1;

  if (complexityScore >= 5) {
    analysis.estimatedComplexity = 'complex';
  } else if (complexityScore >= 2) {
    analysis.estimatedComplexity = 'moderate';
  }

  return analysis;
};

/**
 * Validates if sanitized HTML is safe for display
 * @param html - Sanitized HTML content
 * @returns Boolean indicating if content is safe
 */
export const validateSanitizedHtml = (html: string): boolean => {
  if (!html) return true;
  
  // Check for any remaining potentially dangerous patterns
  const dangerousPatterns = [
    /javascript:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
    /onclick=/i,
    /<script/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];

  return !dangerousPatterns.some(pattern => pattern.test(html));
};

export default {
  sanitizeHtml,
  sanitizePastedHtml,
  sanitizeDisplayHtml,
  analyzeHtmlContent,
  validateSanitizedHtml
};
