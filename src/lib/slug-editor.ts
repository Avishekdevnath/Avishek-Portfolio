import { normalizeSlug } from './slug';

export type SlugMode = 'auto' | 'manual';

export interface SlugDraft {
  title: string;
  slug: string;
  slugMode: SlugMode;
}

interface CreateSlugDraftOptions {
  slug?: string;
  slugMode?: SlugMode;
}

export function createSlugDraft(title: string, options: CreateSlugDraftOptions = {}): SlugDraft {
  const slugMode = options.slugMode ?? 'auto';
  const normalizedTitleSlug = normalizeSlug(title);
  const normalizedSlug = normalizeSlug(options.slug ?? '');

  return {
    title,
    slug: slugMode === 'manual' ? normalizedSlug : normalizedTitleSlug,
    slugMode,
  };
}

export function applyTitleToSlugDraft(draft: SlugDraft, title: string): SlugDraft {
  if (draft.slugMode === 'manual') {
    return {
      ...draft,
      title,
    };
  }

  return {
    title,
    slug: normalizeSlug(title),
    slugMode: 'auto',
  };
}

export function applyManualSlugEdit(draft: SlugDraft, slug: string): SlugDraft {
  return {
    ...draft,
    slug: normalizeSlug(slug),
    slugMode: 'manual',
  };
}

export function regenerateSlugDraft(draft: SlugDraft, title = draft.title): SlugDraft {
  return {
    title,
    slug: normalizeSlug(title),
    slugMode: 'auto',
  };
}
