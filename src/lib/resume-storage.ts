export interface ResumeUploadResult {
  url: string;
  pathname: string;
  contentType?: string;
}

const ALLOWED_MIME = new Set(['application/pdf']);
const MAX_RESUME_SIZE = 10 * 1024 * 1024;
const DEFAULT_BLOB_API_URL = 'https://vercel.com/api/blob';
const BLOB_API_VERSION = '12';

export function validateResumeFile(file: File) {
  if (!file) {
    throw new Error('No file provided');
  }

  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error('Invalid file type. Only PDF files are allowed');
  }

  if (file.size > MAX_RESUME_SIZE) {
    throw new Error('File size exceeds 10MB limit');
  }
}

export async function uploadResumeFile(file: File, slug: string): Promise<ResumeUploadResult> {
  validateResumeFile(file);

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error('Missing BLOB_READ_WRITE_TOKEN environment variable');
  }

  const safeName = file.name.replace(/\s+/g, '-').toLowerCase();
  const pathname = `resumes/${slug}/${Date.now()}-${safeName}`;

  const blobApiBaseUrl = process.env.VERCEL_BLOB_API_URL || DEFAULT_BLOB_API_URL;
  const params = new URLSearchParams({ pathname });

  const response = await fetch(`${blobApiBaseUrl}/?${params.toString()}`, {
    method: 'PUT',
    headers: {
      authorization: `Bearer ${token}`,
      'x-api-version': BLOB_API_VERSION,
      'x-content-length': String(file.size),
      'x-content-type': file.type,
      'x-add-random-suffix': '0',
      'x-vercel-blob-access': 'public',
    },
    body: file,
  });

  if (!response.ok) {
    let message = 'Failed to upload to Blob storage';
    try {
      const data = await response.json();
      message = data?.error?.message || data?.message || message;
    } catch {
      // keep default message
    }
    throw new Error(message);
  }

  const result = await response.json();

  return {
    url: result.url,
    pathname: result.pathname,
    contentType: result.contentType,
  };
}
