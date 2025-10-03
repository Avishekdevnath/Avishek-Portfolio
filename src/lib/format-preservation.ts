/**
 * Format preservation utilities for maintaining original formatting
 * from external sources like ChatGPT, Canvas, etc.
 */

export interface FormatPreservationOptions {
  preserveTables: boolean;
  preserveCodeBlocks: boolean;
  preserveLists: boolean;
  preserveSpacing: boolean;
  preserveColors: boolean;
  preserveFonts: boolean;
}

export const DEFAULT_PRESERVATION_OPTIONS: FormatPreservationOptions = {
  preserveTables: true,
  preserveCodeBlocks: true,
  preserveLists: true,
  preserveSpacing: true,
  preserveColors: false, // Disabled for consistency
  preserveFonts: false    // Disabled for consistency
};

/**
 * CSS classes for format preservation
 */
export const PRESERVATION_CLASSES = {
  TABLE: 'preserved-table',
  CODE_BLOCK: 'preserved-code',
  LIST: 'preserved-list',
  SPACING: 'preserved-spacing',
  FORMATTING: 'preserved-formatting',
  BLOCK: 'preserved-block'
} as const;

/**
 * Data attributes for format preservation
 */
export const PRESERVATION_ATTRIBUTES = {
  TABLE: 'data-preserve-table',
  CODE_BLOCK: 'data-preserve-formatting',
  LIST: 'data-preserve-list',
  SPACING: 'data-preserve-spacing',
  FORMATTING: 'data-preserve-formatting',
  BLOCK: 'data-preserve-block'
} as const;

/**
 * Applies format preservation to HTML content
 */
export const applyFormatPreservation = (
  html: string,
  options: Partial<FormatPreservationOptions> = {}
): string => {
  const opts = { ...DEFAULT_PRESERVATION_OPTIONS, ...options };
  let preservedHtml = html;

  // Preserve tables
  if (opts.preserveTables) {
    preservedHtml = preservedHtml.replace(
      /<table([^>]*)>/gi,
      `<table$1 class="${PRESERVATION_CLASSES.TABLE}" ${PRESERVATION_ATTRIBUTES.TABLE}="true">`
    );
  }

  // Preserve code blocks
  if (opts.preserveCodeBlocks) {
    preservedHtml = preservedHtml.replace(
      /<pre([^>]*)>/gi,
      `<pre$1 class="${PRESERVATION_CLASSES.CODE_BLOCK}" ${PRESERVATION_ATTRIBUTES.CODE_BLOCK}="true">`
    );
    
    preservedHtml = preservedHtml.replace(
      /<code([^>]*)>/gi,
      `<code$1 class="${PRESERVATION_CLASSES.CODE_BLOCK}" ${PRESERVATION_ATTRIBUTES.CODE_BLOCK}="true">`
    );
  }

  // Preserve lists
  if (opts.preserveLists) {
    preservedHtml = preservedHtml.replace(
      /<([uo])l([^>]*)>/gi,
      `<$1l$2 class="${PRESERVATION_CLASSES.LIST}" ${PRESERVATION_ATTRIBUTES.LIST}="true">`
    );
  }

  // Preserve spacing
  if (opts.preserveSpacing) {
    preservedHtml = preservedHtml.replace(
      /<p([^>]*)>/gi,
      `<p$1 class="${PRESERVATION_CLASSES.SPACING}" ${PRESERVATION_ATTRIBUTES.SPACING}="true">`
    );
  }

  // Preserve formatting blocks
  preservedHtml = preservedHtml.replace(
    /<div([^>]*class="[^"]*block[^"]*"[^>]*)>/gi,
    `<div$1 class="${PRESERVATION_CLASSES.BLOCK}" ${PRESERVATION_ATTRIBUTES.BLOCK}="true">`
  );

  return preservedHtml;
};

/**
 * Removes format preservation attributes and classes
 */
export const removeFormatPreservation = (html: string): string => {
  let cleanedHtml = html;

  // Remove preservation classes
  Object.values(PRESERVATION_CLASSES).forEach(className => {
    const regex = new RegExp(`\\s*class="[^"]*${className}[^"]*"`, 'gi');
    cleanedHtml = cleanedHtml.replace(regex, '');
  });

  // Remove preservation attributes
  Object.values(PRESERVATION_ATTRIBUTES).forEach(attr => {
    const regex = new RegExp(`\\s*${attr}="[^"]*"`, 'gi');
    cleanedHtml = cleanedHtml.replace(regex, '');
  });

  // Clean up empty class attributes
  cleanedHtml = cleanedHtml.replace(/class="\s*"/gi, '');
  cleanedHtml = cleanedHtml.replace(/\s+class=""/gi, '');

  return cleanedHtml;
};

/**
 * Detects if content has preservation markers
 */
export const hasFormatPreservation = (html: string): boolean => {
  const preservationMarkers = [
    ...Object.values(PRESERVATION_CLASSES),
    ...Object.values(PRESERVATION_ATTRIBUTES)
  ];

  return preservationMarkers.some(marker => 
    html.includes(marker) || html.includes(`data-preserve`)
  );
};

/**
 * Extracts preservation information from HTML
 */
export const extractPreservationInfo = (html: string) => {
  const info = {
    hasTables: html.includes(PRESERVATION_CLASSES.TABLE),
    hasCodeBlocks: html.includes(PRESERVATION_CLASSES.CODE_BLOCK),
    hasLists: html.includes(PRESERVATION_CLASSES.LIST),
    hasSpacing: html.includes(PRESERVATION_CLASSES.SPACING),
    hasBlocks: html.includes(PRESERVATION_CLASSES.BLOCK),
    preservationCount: 0
  };

  // Count preservation markers
  info.preservationCount = Object.values(PRESERVATION_CLASSES).reduce(
    (count, className) => {
      const matches = html.match(new RegExp(className, 'gi'));
      return count + (matches ? matches.length : 0);
    },
    0
  );

  return info;
};

/**
 * Validates preservation integrity
 */
export const validatePreservationIntegrity = (html: string): {
  isValid: boolean;
  issues: string[];
} => {
  const issues: string[] = [];

  // Check for orphaned preservation classes
  Object.values(PRESERVATION_CLASSES).forEach(className => {
    const classRegex = new RegExp(`class="[^"]*${className}[^"]*"`, 'gi');
    const attrRegex = new RegExp(`data-preserve-[^=]*="true"`, 'gi');
    
    const classMatches = html.match(classRegex);
    const attrMatches = html.match(attrRegex);
    
    if (classMatches && !attrMatches) {
      issues.push(`Orphaned preservation class: ${className}`);
    }
  });

  // Check for orphaned preservation attributes
  Object.values(PRESERVATION_ATTRIBUTES).forEach(attr => {
    const attrRegex = new RegExp(`${attr}="[^"]*"`, 'gi');
    const matches = html.match(attrRegex);
    
    if (matches && matches.length > 1) {
      issues.push(`Duplicate preservation attribute: ${attr}`);
    }
  });

  return {
    isValid: issues.length === 0,
    issues
  };
};

/**
 * Creates preservation CSS rules
 */
export const generatePreservationCSS = (): string => {
  return `
/* Format Preservation Styles */
.${PRESERVATION_CLASSES.TABLE} {
  border-collapse: separate !important;
  border-spacing: 2px !important;
  width: auto !important;
}

.${PRESERVATION_CLASSES.TABLE} th,
.${PRESERVATION_CLASSES.TABLE} td {
  border: 1px solid #ddd !important;
  padding: 8px !important;
  text-align: left !important;
}

.${PRESERVATION_CLASSES.CODE_BLOCK} {
  background-color: #f5f5f5 !important;
  border: 1px solid #ddd !important;
  border-radius: 4px !important;
  padding: 12px !important;
  font-family: 'Courier New', monospace !important;
  white-space: pre-wrap !important;
  overflow-x: auto !important;
}

.${PRESERVATION_CLASSES.LIST} {
  margin: 0 !important;
  padding-left: 20px !important;
}

.${PRESERVATION_CLASSES.LIST} li {
  margin: 4px 0 !important;
  line-height: 1.4 !important;
}

.${PRESERVATION_CLASSES.SPACING} {
  margin: 8px 0 !important;
  line-height: 1.5 !important;
}

.${PRESERVATION_CLASSES.BLOCK} {
  margin: 12px 0 !important;
  padding: 8px !important;
  border-left: 3px solid #ddd !important;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .${PRESERVATION_CLASSES.TABLE} th,
  .${PRESERVATION_CLASSES.TABLE} td {
    border-color: #555 !important;
  }
  
  .${PRESERVATION_CLASSES.CODE_BLOCK} {
    background-color: #2d2d2d !important;
    border-color: #555 !important;
    color: #f8f8f2 !important;
  }
  
  .${PRESERVATION_CLASSES.BLOCK} {
    border-left-color: #555 !important;
  }
}
`;
};

export default {
  applyFormatPreservation,
  removeFormatPreservation,
  hasFormatPreservation,
  extractPreservationInfo,
  validatePreservationIntegrity,
  generatePreservationCSS,
  PRESERVATION_CLASSES,
  PRESERVATION_ATTRIBUTES,
  DEFAULT_PRESERVATION_OPTIONS
};
