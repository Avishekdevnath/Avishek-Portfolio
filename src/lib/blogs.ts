export interface BlogSlugRecord {
  slug: string;
  slugHistory: string[];
}

export interface BlogResolverDeps {
  findBySlug: (slug: string) => Promise<BlogSlugRecord | null>;
  findByHistory: (slug: string) => Promise<BlogSlugRecord | null>;
}

export type BlogSlugResult =
  | { kind: 'match'; blog: BlogSlugRecord; slug: string }
  | { kind: 'redirect'; blog: BlogSlugRecord; slug: string }
  | { kind: 'missing' };

export async function resolveCanonicalBlogSlug(
  inputSlug: string,
  deps: BlogResolverDeps
): Promise<BlogSlugResult> {
  const canonical = await deps.findBySlug(inputSlug);
  if (canonical) return { kind: 'match', blog: canonical, slug: canonical.slug };

  const redirect = await deps.findByHistory(inputSlug);
  if (redirect) return { kind: 'redirect', blog: redirect, slug: redirect.slug };

  return { kind: 'missing' };
}
