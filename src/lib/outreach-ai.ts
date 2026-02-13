export async function generateAIContent(prompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('Google AI API key not configured');
  }

  try {
    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      throw new Error('No content generated');
    }

    return text;
  } catch (error) {
    console.error('AI generation error:', error);
    throw new Error('Failed to generate AI content');
  }
}

export function buildDraftPrompt(params: {
  contactName: string;
  companyName: string;
  jobTitle: string;
  jobDescription?: string;
  tone: 'professional' | 'friendly';
  portfolioContext: {
    name: string;
    bio: string;
    projects: Array<{ title: string; shortDescription: string; technologies: string[] }>;
    skills: string[];
  };
}): string {
  const { contactName, companyName, jobTitle, jobDescription, tone, portfolioContext } = params;

  const toneInstructions = tone === 'professional'
    ? 'Use a professional, concise tone. Avoid overly casual language.'
    : 'Use a friendly, conversational tone while remaining respectful.';

  const projectsContext = portfolioContext.projects
    .map((p, i) => `${i + 1}. **${p.title}**: ${p.shortDescription} (${p.technologies.join(', ')})`)
    .join('\n');

  const skillsContext = portfolioContext.skills.join(', ');

  return `
Write a cold outreach email ${jobDescription ? 'for a candidate interested in' : 'to'} the ${jobTitle} position at ${companyName}.

**Recipient:** ${contactName}
**Company:** ${companyName}
**Position:** ${jobTitle}
${jobDescription ? `**Job Description:** ${jobDescription}` : ''}
**Tone:** ${toneInstructions}

**About the sender:**
- Name: ${portfolioContext.name}
- Bio: ${portfolioContext.bio}

**Relevant portfolio projects:**
${projectsContext}

**Key skills:** ${skillsContext}

Requirements:
1. Subject line should be compelling and specific
2. Email body should be 150-250 words
3. Include 1-2 relevant portfolio projects as evidence
4. Reference specific skills that match the job
5. End with a clear call to action
6. Do NOT include placeholders like [Company Name] - use the actual values
7. Do NOT add any signature or contact info (these will be added separately)

Output format:
SUBJECT: <subject line>
BODY: <email body>
`.trim();
}

export function buildImprovePrompt(params: {
  currentSubject: string;
  currentBody: string;
  improvementType: 'shorten' | 'clarify' | 'confident';
}): string {
  const { currentSubject, currentBody, improvementType } = params;

  const improvementInstructions = {
    shorten: 'Make the email more concise while keeping the key message. Remove filler words.',
    clarify: 'Improve clarity and flow. Make the message easier to understand.',
    confident: 'Make the tone more confident and assertive while remaining professional.',
  };

  return `
Improve this outreach email:

SUBJECT: ${currentSubject}
BODY: ${currentBody}

Improvement: ${improvementInstructions[improvementType]}

Output format:
SUBJECT: <improved subject>
BODY: <improved body>
`.trim();
}

export function buildFollowUpPrompt(params: {
  contactName: string;
  companyName: string;
  originalSubject: string;
  originalBody: string;
  followUpNumber: number;
  tone: 'professional' | 'friendly';
  portfolioContext: {
    name: string;
    bio: string;
  };
}): string {
  const { contactName, companyName, originalSubject, originalBody, followUpNumber, tone, portfolioContext } = params;

  const toneInstructions = tone === 'professional'
    ? 'Use a professional, concise tone.'
    : 'Use a friendly, conversational tone.';

  return `
Write a follow-up email (${followUpNumber === 1 ? '1st' : '2nd'}) for a cold outreach.

**Original outreach:**
SUBJECT: ${originalSubject}
BODY: ${originalBody}

**Recipient:** ${contactName}
**Company:** ${companyName}
**Follow-up number:** ${followUpNumber}
**Tone:** ${toneInstructions}

Requirements:
1. Be brief - follow-up should be 100-150 words
2. Remind them of the original email without repeating everything
3. Show continued interest in the opportunity
4. Keep it non-pushy but proactive
5. Do NOT include signature or contact info
6. Do NOT use placeholders

Output format:
SUBJECT: <follow-up subject>
BODY: <follow-up body>
`.trim();
}

export function parseAIResponse(response: string): { subject: string; body: string } {
  const subjectMatch = response.match(/SUBJECT:\s*(.+?)(?:\n|BODY:|$)/s);
  const bodyMatch = response.match(/BODY:\s*(.+)/s);

  const subject = subjectMatch ? subjectMatch[1].trim() : '';
  const body = bodyMatch ? bodyMatch[1].trim() : response;

  return { subject, body };
}
