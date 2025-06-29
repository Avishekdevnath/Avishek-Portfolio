export interface Tool {
  id: string;
  name: string;
  description: string;
  category: 'AI Toolbox' | 'Lightweight Tools' | 'One-Time Tools';
  icon: string;
  status: 'available' | 'coming-soon';
  link?: string;
}

export const tools: Tool[] = [
  // AI Toolbox
  {
    id: 'swot-analysis',
    name: 'SWOT Analysis Tool',
    description: 'Analyze Strengths, Weaknesses, Opportunities, and Threats for your business or project',
    category: 'AI Toolbox',
    icon: '📊',
    status: 'coming-soon'
  },
  {
    id: 'finance-advisor',
    name: 'Finance Advisor',
    description: 'Get personalized finance management tips and investment advice',
    category: 'AI Toolbox',
    icon: '💰',
    status: 'coming-soon'
  },
  {
    id: 'diet-planner',
    name: 'Diet Planner',
    description: 'AI-driven nutrition recommendations and meal plans',
    category: 'AI Toolbox',
    icon: '🥗',
    status: 'coming-soon'
  },
  {
    id: 'expense-calculator',
    name: 'Expense Calculator',
    description: 'Track and categorize your expenses, create budgets',
    category: 'AI Toolbox',
    icon: '📱',
    status: 'coming-soon'
  },
  {
    id: 'resume-builder',
    name: 'Resume Builder',
    description: 'Create and optimize your resume with AI suggestions',
    category: 'AI Toolbox',
    icon: '📄',
    status: 'coming-soon'
  },
  
  // Lightweight Tools
  {
    id: 'url-shortener',
    name: 'URL Shortener',
    description: 'Shorten URLs with custom aliases',
    category: 'Lightweight Tools',
    icon: '🔗',
    status: 'coming-soon'
  },
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    description: 'Generate QR codes for URLs, text, or contact info',
    category: 'Lightweight Tools',
    icon: '📱',
    status: 'coming-soon'
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Generate secure, random passwords',
    category: 'Lightweight Tools',
    icon: '🔒',
    status: 'coming-soon'
  },
  {
    id: 'file-resizer',
    name: 'Quick File Resizer',
    description: 'Resize images and documents quickly',
    category: 'Lightweight Tools',
    icon: '📂',
    status: 'coming-soon'
  },
  {
    id: 'tip-calculator',
    name: 'Tip Calculator',
    description: 'Calculate tips and split bills easily',
    category: 'Lightweight Tools',
    icon: '💵',
    status: 'coming-soon'
  },

  // One-Time Tools
  {
    id: 'stress-relief',
    name: 'Stress Relief Assistant',
    description: 'Quick stress relief exercises and techniques',
    category: 'One-Time Tools',
    icon: '🧘‍♂️',
    status: 'coming-soon'
  },
  {
    id: 'emergency-checklist',
    name: 'Emergency Checklist',
    description: 'Generate emergency preparedness checklists',
    category: 'One-Time Tools',
    icon: '🚨',
    status: 'coming-soon'
  },
  {
    id: 'investment-simulator',
    name: 'Investment Simulator',
    description: 'Simulate investment strategies and outcomes',
    category: 'One-Time Tools',
    icon: '📈',
    status: 'coming-soon'
  }
]; 