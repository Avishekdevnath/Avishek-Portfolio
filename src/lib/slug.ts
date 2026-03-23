export type SlugExists = (slug: string) => Promise<boolean>;

const SLUG_FALLBACK = 'item';
const LEGACY_OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i;

export function normalizeSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function resolveAutoSlug(input: string, slugExists: SlugExists) {
  const baseSlug = normalizeSlug(input) || SLUG_FALLBACK;
  let nextSlug = baseSlug;
  let counter = 0;

  while (await slugExists(nextSlug)) {
    counter += 1;
    nextSlug = `${baseSlug}-${counter}`;
  }

  return nextSlug;
}

export async function assertManualSlugAvailable(
  input: string,
  slugExists: SlugExists,
  currentSlug?: string | null
) {
  const manualSlug = normalizeSlug(input);

  if (!manualSlug) {
    throw new Error('Slug is required');
  }

  if (manualSlug !== currentSlug && await slugExists(manualSlug)) {
    throw new Error('Slug already exists');
  }

  return manualSlug;
}

export function buildNextSlugHistory(
  currentSlug?: string | null,
  nextSlug?: string | null,
  slugHistory: string[] = []
) {
  const history = slugHistory.filter(Boolean).filter((value) => value !== nextSlug);

  if (!currentSlug || currentSlug === nextSlug || history.includes(currentSlug)) {
    return history;
  }

  return [...history, currentSlug];
}

export function isLegacyObjectId(value: string) {
  return LEGACY_OBJECT_ID_PATTERN.test(value);
}
