import { resolveAutoSlug } from './slug';

export async function checkSlugExists(slug: string, excludeProjectId?: string): Promise<boolean> {
  try {
    const params = new URLSearchParams({ slug });
    if (excludeProjectId) {
      params.append('exclude', excludeProjectId);
    }

    const response = await fetch(`/api/projects/check-slug?${params}`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to check slug');
    }

    return data.data.exists;
  } catch (error) {
    console.error('Error checking slug existence:', error);
    // Return false on error to allow user to proceed
    return false;
  }
}

export async function resolveAutoSlugClient(input: string, excludeProjectId?: string): Promise<string> {
  return resolveAutoSlug(input, (slug) => checkSlugExists(slug, excludeProjectId));
}
