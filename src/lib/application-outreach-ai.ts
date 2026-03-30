import { generateAIContent } from './outreach-ai';

export interface ApplicationOutreachParams {
  contact: {
    name: string;
    title: string;
    roleAtCompany?: string;
    bio?: string;
    linkedinUrl?: string;
  };
  application: {
    company: string;
    jobTitle: string;
    jobUrl?: string;
  };
  sender: {
    name: string;
    bio: string;
    skills: string[];
    projects: Array<{ title: string; shortDescription: string; technologies: string[] }>;
  };
}

export function buildApplicationOutreachPrompt(params: ApplicationOutreachParams): string {
  const { contact, application, sender } = params;

  const projectsContext = sender.projects
    .slice(0, 3)
    .map((p, i) => `${i + 1}. ${p.title}: ${p.shortDescription} (${p.technologies.join(', ')})`)
    .join('\n');

  const skillsContext = sender.skills.slice(0, 10).join(', ');

  const contactContext = [
    contact.name,
    contact.title,
    contact.roleAtCompany ? `(${contact.roleAtCompany})` : '',
    contact.bio ? `— Note: ${contact.bio}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return `
You are helping write job application outreach content.

Applicant: ${sender.name}
Applying for: ${application.jobTitle} at ${application.company}
${application.jobUrl ? `Job posting: ${application.jobUrl}` : ''}

Contact at ${application.company}: ${contactContext}

About the applicant:
${sender.bio}

Key skills: ${skillsContext}

Portfolio projects:
${projectsContext}

Write TWO pieces of outreach:

1. A cold email to ${contact.name} about the ${application.jobTitle} role at ${application.company}.
   - Subject line: compelling and specific (not generic)
   - Body: 150-200 words, professional tone
   - Mention 1-2 relevant projects as evidence
   - End with a clear call to action
   - Do NOT add signature or contact info

2. A LinkedIn DM to ${contact.name} — short, under 300 characters, friendly but professional.

Use this exact output format:
EMAIL_SUBJECT: <subject line>
EMAIL_BODY: <email body>
LINKEDIN_DM: <linkedin message>
`.trim();
}

export function parseApplicationOutreachResponse(response: string): {
  emailSubject: string;
  emailBody: string;
  linkedinDm: string;
} {
  const subjectMatch = response.match(/EMAIL_SUBJECT:\s*(.+?)(?:\n|EMAIL_BODY:|$)/s);
  const bodyMatch = response.match(/EMAIL_BODY:\s*(.+?)(?:\nLINKEDIN_DM:|$)/s);
  const dmMatch = response.match(/LINKEDIN_DM:\s*(.+)/s);

  return {
    emailSubject: subjectMatch?.[1]?.trim() ?? '',
    emailBody: bodyMatch?.[1]?.trim() ?? '',
    linkedinDm: dmMatch?.[1]?.trim() ?? '',
  };
}

export async function generateApplicationOutreach(
  params: ApplicationOutreachParams
): Promise<{ emailSubject: string; emailBody: string; linkedinDm: string }> {
  const prompt = buildApplicationOutreachPrompt(params);
  const raw = await generateAIContent(prompt);
  return parseApplicationOutreachResponse(raw);
}
