import { NextRequest, NextResponse } from 'next/server';
import JobLead from '@/models/JobLead';
import { connectDB } from '@/lib/mongodb';
import { LeadSource, normalizeDedupValue } from '@/lib/job-hunt-utils';
import { ensureDashboardAuth } from '../../_auth';

interface LeadPayload {
  title: string;
  company: string;
  location?: string;
  jobType?: 'Remote' | 'Onsite' | 'Hybrid' | 'Other';
  source: LeadSource;
  jobUrl: string;
}

interface FetchLeadRequestBody {
  title?: string;
  search?: string;
  role?: string;
  tech?: string;
  location?: string;
  remoteOnly?: boolean;
  source?: string;
}

const KEYWORDS = [
  'software engineer',
  'software developer',
  'backend engineer',
  'frontend developer',
  'full stack',
  'web developer',
  'python developer',
  'react developer',
  'node developer',
  'devops engineer',
  'cloud engineer',
  'mobile developer',
  'data engineer',
  'ml engineer',
  'ai engineer',
  'tech lead',
  'engineering manager'
];

const TIMEOUT_MS = 10000;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

function titleMatchesKeyword(title: string, keywords: string[]): boolean {
  const normalized = title.toLowerCase();
  return keywords.some((k) => normalized.includes(k));
}

function extractManualKeywords(input?: string): string[] {
  if (!input) return [];
  return input
    .split(/[\n,]+/)
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 25);
}

function locationMatchesFilter(jobLocation: string | undefined, locationFilter: string): boolean {
  if (!locationFilter) return true;
  const normalizedLocation = (jobLocation || '').toLowerCase();
  return normalizedLocation.includes(locationFilter.toLowerCase());
}

function remoteMatchesFilter(jobLocation: string | undefined, remoteOnly: boolean): boolean {
  if (!remoteOnly) return true;
  const normalizedLocation = (jobLocation || '').toLowerCase();
  return normalizedLocation.includes('remote');
}

function sourceMatchesFilter(jobSource: LeadSource, sourceFilter: string): boolean {
  if (!sourceFilter || sourceFilter === 'all') return true;
  return jobSource === sourceFilter;
}

function inferLocationType(location?: string): 'Remote' | 'Onsite' | 'Hybrid' | 'Other' {
  if (!location) return 'Other';
  const value = location.toLowerCase();
  if (value.includes('remote')) return 'Remote';
  if (value.includes('hybrid')) return 'Hybrid';
  if (value.includes('onsite') || value.includes('on-site')) return 'Onsite';
  return 'Other';
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal, cache: 'no-store' });
  } finally {
    clearTimeout(timeout);
  }
}

function parseRssItems(xml: string) {
  return xml.match(/<item>[\s\S]*?<\/item>/g) || [];
}

function extractXml(item: string, tags: string[]): string {
  for (const tag of tags) {
    const match = item.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'));
    if (match?.[1]) {
      return match[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim();
    }
  }
  return '';
}

async function fetchRemotive(): Promise<LeadPayload[]> {
  const response = await fetchWithTimeout('https://remotive.com/api/remote-jobs');
  if (!response.ok) throw new Error('Remotive fetch failed');

  const data = (await response.json()) as { jobs?: Array<{ title?: string; company_name?: string; url?: string; candidate_required_location?: string }> };
  const jobs = data.jobs || [];

  return jobs
    .filter((j) => j.title && j.company_name && j.url)
    .map((j) => ({
      title: j.title as string,
      company: j.company_name as string,
      location: j.candidate_required_location || 'Remote',
      jobType: inferLocationType(j.candidate_required_location),
      source: 'Remotive' as const,
      jobUrl: j.url as string,
    }));
}

async function fetchArbeitnow(): Promise<LeadPayload[]> {
  const response = await fetchWithTimeout('https://www.arbeitnow.com/api/job-board-api');
  if (!response.ok) throw new Error('Arbeitnow fetch failed');

  const data = (await response.json()) as { data?: Array<{ title?: string; company_name?: string; url?: string; location?: string; remote?: boolean }> };
  const jobs = data.data || [];

  return jobs
    .filter((j) => j.title && j.company_name && j.url)
    .map((j) => ({
      title: j.title as string,
      company: j.company_name as string,
      location: j.location || (j.remote ? 'Remote' : 'Other'),
      jobType: inferLocationType(j.location || (j.remote ? 'Remote' : 'Other')),
      source: 'Arbeitnow' as const,
      jobUrl: j.url as string,
    }));
}

async function fetchHimalayas(): Promise<LeadPayload[]> {
  const response = await fetchWithTimeout('https://himalayas.app/jobs/api?limit=100');
  if (!response.ok) throw new Error('Himalayas fetch failed');

  const data = (await response.json()) as { jobs?: Array<{ title?: string; companyName?: string; applyUrl?: string; location?: string }> };
  const jobs = data.jobs || [];

  return jobs
    .filter((j) => j.title && j.companyName && j.applyUrl)
    .map((j) => ({
      title: j.title as string,
      company: j.companyName as string,
      location: j.location || 'Remote',
      jobType: inferLocationType(j.location || 'Remote'),
      source: 'Himalayas' as const,
      jobUrl: j.applyUrl as string,
    }));
}

async function fetchWeWorkRemotely(): Promise<LeadPayload[]> {
  const response = await fetchWithTimeout('https://weworkremotely.com/remote-jobs.json');
  if (!response.ok) throw new Error('WeWorkRemotely fetch failed');

  const data = (await response.json()) as {
    jobs?: Array<{
      title?: string;
      company_name?: string;
      url?: string;
      region?: string;
    }>;
  };

  const jobs = data.jobs || [];

  return jobs
    .filter((j) => j.title && j.company_name && j.url)
    .map((j) => ({
      title: j.title as string,
      company: j.company_name as string,
      location: j.region || 'Remote',
      jobType: inferLocationType(j.region || 'Remote'),
      source: 'WeWorkRemotely' as const,
      jobUrl: j.url as string,
    }));
}

async function fetchBdjobs(): Promise<LeadPayload[]> {
  const feeds = [
    'https://jobs.bdjobs.com/rss/ITJob.xml',
    'https://jobs.bdjobs.com/rss/SoftwareDeveloper.xml',
  ];

  const jobs: LeadPayload[] = [];

  for (const feed of feeds) {
    const response = await fetchWithTimeout(feed);
    if (!response.ok) continue;
    const xml = await response.text();

    for (const item of parseRssItems(xml).slice(0, 30)) {
      const title = extractXml(item, ['title']);
      const company = extractXml(item, ['author', 'dc:creator']);
      const url = extractXml(item, ['link']);
      if (!title || !url) continue;

      jobs.push({
        title,
        company: company || 'Unknown',
        location: 'Dhaka, Bangladesh',
        jobType: 'Onsite',
        source: 'Himalayas',
        jobUrl: url,
      });
    }
  }

  return jobs;
}

async function fetchChakriBD(): Promise<LeadPayload[]> {
  const response = await fetchWithTimeout('https://www.chakri.com/rss/it-software-jobs.xml');
  if (!response.ok) return [];

  const xml = await response.text();
  const items = parseRssItems(xml);

  return items.slice(0, 25).map((item) => {
    const title = extractXml(item, ['title']);
    const jobUrl = extractXml(item, ['link']);
    return {
      title,
      company: 'Unknown',
      location: 'Dhaka, Bangladesh',
      jobType: 'Onsite' as const,
      source: 'Arbeitnow' as const,
      jobUrl,
    };
  }).filter((job) => job.title && job.jobUrl);
}

async function fetchJSearchRemote(): Promise<LeadPayload[]> {
  if (!RAPIDAPI_KEY) return [];

  const query = encodeURIComponent('software engineer remote');
  const url = `https://jsearch.p.rapidapi.com/search?query=${query}&page=1&num_results=20&date_posted=today&employment_types=FULLTIME%2CCONTRACTOR&remote_jobs_only=true`;

  const response = await fetch(url, {
    cache: 'no-store',
    headers: {
      'x-rapidapi-host': 'jsearch.p.rapidapi.com',
      'x-rapidapi-key': RAPIDAPI_KEY,
    },
  });

  if (!response.ok) return [];

  const data = (await response.json()) as {
    data?: Array<{
      job_title?: string;
      employer_name?: string;
      job_apply_link?: string;
      job_google_link?: string;
    }>;
  };

  return (data.data || []).map((job) => ({
    title: job.job_title || '',
    company: job.employer_name || 'Unknown',
    location: 'Remote',
    jobType: 'Remote' as const,
    source: 'Remotive' as const,
    jobUrl: job.job_apply_link || job.job_google_link || '',
  })).filter((job) => job.title && job.jobUrl);
}

export async function POST(request: NextRequest) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();

    let body: FetchLeadRequestBody = {};
    try {
      body = (await request.json()) as FetchLeadRequestBody;
    } catch {
      body = {};
    }

    const manualKeywords = [
      ...extractManualKeywords(body.title),
      ...extractManualKeywords(body.search),
      ...extractManualKeywords(body.role),
      ...extractManualKeywords(body.tech),
    ];

    const effectiveKeywords = manualKeywords.length > 0 ? manualKeywords : KEYWORDS;
    const locationFilter = (body.location || '').trim();
    const sourceFilter = (body.source || 'all').trim();
    const remoteOnly = Boolean(body.remoteOnly);

    const sourceFetchers: Array<{ name: LeadSource; fetcher: () => Promise<LeadPayload[]> }> = [
      { name: 'Remotive', fetcher: fetchRemotive },
      { name: 'Arbeitnow', fetcher: fetchArbeitnow },
      { name: 'Himalayas', fetcher: fetchHimalayas },
      { name: 'WeWorkRemotely', fetcher: fetchWeWorkRemotely },
      { name: 'Himalayas', fetcher: fetchBdjobs },
      { name: 'Arbeitnow', fetcher: fetchChakriBD },
      { name: 'Remotive', fetcher: fetchJSearchRemote },
    ];

    let fetched = 0;
    let inserted = 0;
    let skipped = 0;
    const failedSources: string[] = [];

    for (const source of sourceFetchers) {
      try {
        const sourceJobs = await source.fetcher();
        fetched += sourceJobs.length;

        const filtered = sourceJobs.filter((lead) => (
          titleMatchesKeyword(lead.title, effectiveKeywords)
          && locationMatchesFilter(lead.location, locationFilter)
          && remoteMatchesFilter(lead.location, remoteOnly)
          && sourceMatchesFilter(lead.source, sourceFilter)
        ));

        for (const lead of filtered) {
          const normalizedTitle = normalizeDedupValue(lead.title);
          const normalizedCompany = normalizeDedupValue(lead.company);

          const existing = await JobLead.findOne({
            normalizedTitle,
            normalizedCompany,
            source: lead.source,
          }).lean();

          if (existing) {
            skipped += 1;
            continue;
          }

          await JobLead.create({
            title: lead.title,
            company: lead.company,
            location: lead.location,
            jobType: lead.jobType,
            source: lead.source,
            jobUrl: lead.jobUrl,
            status: 'New',
            dateFound: new Date(),
            synced: false,
            normalizedTitle,
            normalizedCompany,
          });

          inserted += 1;
        }
      } catch {
        failedSources.push(source.name);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        fetched,
        inserted,
        skipped,
        failedSources,
        keywordsUsed: effectiveKeywords,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}
