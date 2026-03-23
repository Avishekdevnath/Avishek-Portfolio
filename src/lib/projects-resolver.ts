import { isLegacyObjectId } from './slug';

export interface ProjectSlugRecord {
  _id: string;
  slug: string;
  slugHistory: string[];
}

export interface ProjectRouteResolverDeps {
  findPublishedById: (id: string) => Promise<ProjectSlugRecord | null>;
  findPublishedBySlug: (slug: string) => Promise<ProjectSlugRecord | null>;
  findPublishedBySlugHistory: (slug: string) => Promise<ProjectSlugRecord | null>;
}

export type ProjectRouteResult =
  | { kind: 'match'; project: ProjectSlugRecord; slug: string }
  | { kind: 'redirect'; project: ProjectSlugRecord; slug: string }
  | { kind: 'missing' };

export async function resolvePublishedProjectRoute(
  param: string,
  deps: ProjectRouteResolverDeps
): Promise<ProjectRouteResult> {
  // 1. Canonical slug match
  const bySlug = await deps.findPublishedBySlug(param);
  if (bySlug) return { kind: 'match', project: bySlug, slug: bySlug.slug };

  // 2. Old slug in history → redirect to canonical
  const byHistory = await deps.findPublishedBySlugHistory(param);
  if (byHistory) return { kind: 'redirect', project: byHistory, slug: byHistory.slug };

  // 3. Legacy ObjectId → redirect to canonical slug
  if (isLegacyObjectId(param)) {
    const byId = await deps.findPublishedById(param);
    if (byId) return { kind: 'redirect', project: byId, slug: byId.slug };
  }

  return { kind: 'missing' };
}
