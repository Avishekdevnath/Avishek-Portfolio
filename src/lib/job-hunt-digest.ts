import type { LeadSource } from './job-hunt-utils';

export interface DigestLead {
  title: string;
  company: string;
  location?: string;
  jobType?: string;
  source: LeadSource | string;
  jobUrl: string;
}

function esc(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildJobCard(job: DigestLead) {
  const safeTitle = esc(job.title || 'Untitled');
  const safeCompany = esc(job.company || 'Unknown');
  const safeLoc = esc(job.location || 'N/A');
  const safeSource = esc(job.source || 'Unknown');
  const safeUrl = job.jobUrl || '#';

  return `
  <div style="border:1px solid #e6e1d6;border-radius:10px;padding:12px 14px;margin-bottom:10px;background:#fff;">
    <div style="font-size:14px;font-weight:700;color:#2a2118;margin-bottom:4px;">${safeTitle}</div>
    <div style="font-size:12px;color:#6b5c4e;margin-bottom:8px;">🏢 ${safeCompany} &nbsp;|&nbsp; 📍 ${safeLoc} &nbsp;|&nbsp; <span style="background:#f3f1ee;color:#6b5c4e;padding:2px 8px;border-radius:999px;">${safeSource}</span></div>
    <a href="${safeUrl}" target="_blank" style="display:inline-block;background:#2a2118;color:#f0ece3;text-decoration:none;padding:7px 14px;border-radius:7px;font-size:12px;font-weight:600;">Apply →</a>
  </div>`;
}

export function buildJobHuntDigestHtml(input: {
  dateLabel: string;
  remoteJobs: DigestLead[];
  dhakaJobs: DigestLead[];
  leadsUrl: string;
}) {
  const total = input.remoteJobs.length + input.dhakaJobs.length;

  const remoteSection = input.remoteJobs.length
    ? `<div style="padding:18px 24px;">
        <div style="font-size:14px;font-weight:700;color:#1a73e8;background:#e8f0fe;padding:8px 12px;border-radius:8px;margin-bottom:10px;">🌍 Remote Global Jobs (${input.remoteJobs.length})</div>
        ${input.remoteJobs.slice(0, 25).map(buildJobCard).join('')}
      </div>`
    : '';

  const dhakaSection = input.dhakaJobs.length
    ? `<div style="padding:18px 24px;">
        <div style="font-size:14px;font-weight:700;color:#137333;background:#e6f4ea;padding:8px 12px;border-radius:8px;margin-bottom:10px;">🇧🇩 Dhaka / Bangladesh Jobs (${input.dhakaJobs.length})</div>
        ${input.dhakaJobs.slice(0, 25).map(buildJobCard).join('')}
      </div>`
    : '';

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body style="font-family:Arial,sans-serif;background:#f7f5f1;margin:0;padding:20px;">
  <div style="max-width:760px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e8e3db;">
    <div style="background:#2a2118;color:#f0ece3;padding:20px 24px;">
      <div style="font-size:20px;font-weight:700;">📬 Daily Job Digest</div>
      <div style="font-size:12px;opacity:0.9;margin-top:4px;">${esc(input.dateLabel)} • ${total} new jobs</div>
    </div>

    <div style="display:flex;gap:10px;padding:16px 24px;">
      <div style="flex:1;background:#f3f1ee;border-radius:8px;padding:10px;text-align:center;">
        <div style="font-size:22px;font-weight:700;color:#2a2118;">${total}</div>
        <div style="font-size:11px;color:#6b5c4e;">Total</div>
      </div>
      <div style="flex:1;background:#e8f0fe;border-radius:8px;padding:10px;text-align:center;">
        <div style="font-size:22px;font-weight:700;color:#1a73e8;">${input.remoteJobs.length}</div>
        <div style="font-size:11px;color:#6b5c4e;">Remote</div>
      </div>
      <div style="flex:1;background:#e6f4ea;border-radius:8px;padding:10px;text-align:center;">
        <div style="font-size:22px;font-weight:700;color:#137333;">${input.dhakaJobs.length}</div>
        <div style="font-size:11px;color:#6b5c4e;">Dhaka</div>
      </div>
    </div>

    <div style="padding:0 24px 6px;">
      <a href="${input.leadsUrl}" target="_blank" style="display:inline-block;background:#d4622a;color:#fff;text-decoration:none;padding:10px 14px;border-radius:8px;font-size:12px;font-weight:700;">Open Job Leads Dashboard →</a>
    </div>

    ${remoteSection}
    ${dhakaSection}

    <div style="padding:16px 24px;background:#f7f5f1;font-size:12px;color:#8a7a6a;">
      Tip: set a lead status to <strong>Applied</strong> to auto-sync into Applications.
    </div>
  </div>
</body>
</html>`;
}
