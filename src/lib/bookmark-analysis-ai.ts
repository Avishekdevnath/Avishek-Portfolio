import { generateAIContent } from './outreach-ai';

export interface AnalysisParams {
  jobTitle: string;
  company: string;
  jobDescription: string;
  sender: {
    name: string;
    bio: string;
    skills: string[];
    projects: Array<{ title: string; shortDescription: string; technologies: string[] }>;
  };
}

export function buildAnalysisPrompt(params: AnalysisParams): string {
  const { jobTitle, company, jobDescription, sender } = params;

  const skillsContext = sender.skills.slice(0, 15).join(', ');
  const projectsContext = sender.projects
    .slice(0, 4)
    .map((p, i) => `${i + 1}. ${p.title}: ${p.shortDescription} (${p.technologies.join(', ')})`)
    .join('\n');

  return `
You are a career advisor analyzing a job posting for a candidate.

Candidate: ${sender.name}
Bio: ${sender.bio}
Skills: ${skillsContext}
Projects:
${projectsContext}

Job Title: ${jobTitle}
Company: ${company}
Job Description:
${jobDescription}

Analyze the match between the candidate and this job. Be specific and actionable.

Output EXACTLY in this format (do not add extra text outside these markers):

RELEVANCE_SCORE: <number 0-100>
RELEVANCE_SUMMARY: <2-3 sentences explaining the match verdict>
INTERVIEW_PREP:
- <topic or question to prepare>
- <topic or question to prepare>
- <topic or question to prepare>
- <topic or question to prepare>
- <topic or question to prepare>
RESUME_TIPS:
- <specific thing to add or highlight in resume>
- <specific thing to add or highlight in resume>
- <specific thing to add or highlight in resume>
SKILL_GAPS:
- <skill the JD wants that the candidate lacks or should strengthen>
- <skill the JD wants that the candidate lacks or should strengthen>
`.trim();
}

export function parseAnalysisResponse(response: string): {
  relevanceScore: number;
  relevanceSummary: string;
  interviewPrep: string[];
  resumeTips: string[];
  skillGaps: string[];
} {
  const scoreMatch = response.match(/RELEVANCE_SCORE:\s*(\d+)/);
  const summaryMatch = response.match(/RELEVANCE_SUMMARY:\s*(.+?)(?:\nINTERVIEW_PREP:|$)/s);
  const prepMatch = response.match(/INTERVIEW_PREP:\s*([\s\S]+?)(?:\nRESUME_TIPS:|$)/);
  const tipsMatch = response.match(/RESUME_TIPS:\s*([\s\S]+?)(?:\nSKILL_GAPS:|$)/);
  const gapsMatch = response.match(/SKILL_GAPS:\s*([\s\S]+?)$/);

  const parseBullets = (block: string): string[] =>
    block
      .split('\n')
      .map((l) => l.replace(/^[-•*]\s*/, '').trim())
      .filter(Boolean);

  return {
    relevanceScore: scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[1]))) : 0,
    relevanceSummary: summaryMatch?.[1]?.trim() ?? '',
    interviewPrep: prepMatch ? parseBullets(prepMatch[1]) : [],
    resumeTips: tipsMatch ? parseBullets(tipsMatch[1]) : [],
    skillGaps: gapsMatch ? parseBullets(gapsMatch[1]) : [],
  };
}

export async function generateJobAnalysis(params: AnalysisParams) {
  const prompt = buildAnalysisPrompt(params);
  const raw = await generateAIContent(prompt);
  return parseAnalysisResponse(raw);
}
