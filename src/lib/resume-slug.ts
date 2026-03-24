export function normalizeResumeSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isValidResumeSlug(input: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input);
}

export function buildUniqueSlug(base: string, exists: (slug: string) => Promise<boolean>) {
  return (async () => {
    let slug = normalizeResumeSlug(base) || 'resume';
    let i = 0;
    while (await exists(slug)) {
      i += 1;
      slug = `${normalizeResumeSlug(base) || 'resume'}-${i}`;
    }
    return slug;
  })();
}
