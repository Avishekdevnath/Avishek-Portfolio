/**
 * Outreach Template Variable Utilities
 */

/**
 * Extract all variables from template content
 * Variables are in format {{variable_name}}
 */
export function extractVariables(template: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = template.matchAll(regex);
  const variables: string[] = [];
  
  for (const match of matches) {
    const variable = match[1].trim();
    if (!variables.includes(variable)) {
      variables.push(variable);
    }
  }
  
  return variables;
}

/**
 * Replace variables in template with values
 * Variables are in format {{variable_name}}
 */
export function replaceVariables(
  template: string,
  values: Record<string, string>
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, variableName) => {
    const key = variableName.trim();
    return values[key] ?? `{{${key}}}`; // Keep original if not found
  });
}

/**
 * Check if a template has all required variables filled
 */
export function hasUnfilledVariables(template: string, values: Record<string, string>): boolean {
  const variables = extractVariables(template);
  return variables.some(v => !values[v] || values[v].trim() === '');
}

/**
 * Get list of unfilled variables
 */
export function getUnfilledVariables(
  template: string,
  values: Record<string, string>
): string[] {
  const variables = extractVariables(template);
  return variables.filter(v => !values[v] || values[v].trim() === '');
}

/**
 * Default variable mappings for outreach
 */
export const defaultTemplateVariables = {
  // Contact variables
  '{{first_name}}': 'First name of the contact',
  '{{last_name}}': 'Last name of the contact',
  '{{name}}': 'Full name of the contact',
  '{{email}}': 'Contact email address',
  '{{role_title}}': 'Job title of the contact',
  '{{linkedin_url}}': 'LinkedIn profile URL',
  
  // Company variables
  '{{company}}': 'Company name',
  '{{company_country}}': 'Country where company is located',
  '{{company_website}}': 'Company website URL',
  '{{company_careers}}': 'Company careers page URL',
  
  // Job variables
  '{{job_title}}': 'Position being hired for',
  '{{job_description}}': 'Job posting description',
  
  // Portfolio variables
  '{{my_name}}': 'Your name',
  '{{my_bio}}': 'Your bio',
  '{{project_title}}': 'Project name',
  '{{project_description}}': 'Project description',
  '{{skill}}': 'Skill name',
  
  // Other variables
  '{{date}}': 'Current date',
  '{{follow_up_number}}': 'Follow-up number (1, 2, or 3)',
};

/**
 * Format variable name for display
 */
export function formatVariableName(variable: string): string {
  return variable
    .replace(/[{}]/g, '')
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Variable categories for organizing
 */
export const variableCategories = {
  contact: [
    '{{name}}',
    '{{first_name}}',
    '{{last_name}}',
    '{{email}}',
    '{{role_title}}',
    '{{linkedin_url}}',
  ],
  company: [
    '{{company}}',
    '{{company_country}}',
    '{{company_website}}',
    '{{company_careers}}',
  ],
  job: [
    '{{job_title}}',
    '{{job_description}}',
  ],
  portfolio: [
    '{{my_name}}',
    '{{project_title}}',
    '{{skill}}',
  ],
  other: [
    '{{date}}',
    '{{follow_up_number}}',
  ],
};

/**
 * Get suggested variables based on template type
 */
export function getSuggestedVariables(templateType: string): string[] {
  const base = [
    '{{name}}',
    '{{company}}',
    '{{job_title}}',
  ];
  
  switch (templateType) {
    case 'follow_up':
      return ['{{name}}', '{{company}}', '{{follow_up_number}}', ...base];
    case 'referral':
      return ['{{name}}', '{{company}}', '{{job_title}}', '{{referrer_name}}', ...base];
    case 'post_application':
      return ['{{name}}', '{{company}}', '{{job_title}}', '{{date}}', ...base];
    default:
      return base;
  }
}
