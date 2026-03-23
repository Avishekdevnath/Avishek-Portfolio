import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePublishedProjectRoute } from './projects-resolver';

const makeDeps = (overrides: Partial<{
  findPublishedById: (id: string) => Promise<any>;
  findPublishedBySlug: (slug: string) => Promise<any>;
  findPublishedBySlugHistory: (slug: string) => Promise<any>;
}> = {}) => ({
  findPublishedById: async () => null,
  findPublishedBySlug: async () => null,
  findPublishedBySlugHistory: async () => null,
  ...overrides,
});

test('canonical slug resolves as match', async () => {
  const result = await resolvePublishedProjectRoute('my-project', makeDeps({
    findPublishedBySlug: async (slug) =>
      slug === 'my-project' ? { slug: 'my-project', slugHistory: [] } : null,
  }));

  assert.equal(result.kind, 'match');
  assert.equal(result.slug, 'my-project');
});

test('old slug in history resolves as redirect', async () => {
  const result = await resolvePublishedProjectRoute('old-project', makeDeps({
    findPublishedBySlugHistory: async (slug) =>
      slug === 'old-project' ? { slug: 'my-project', slugHistory: ['old-project'] } : null,
  }));

  assert.equal(result.kind, 'redirect');
  assert.equal(result.slug, 'my-project');
});

test('legacy object id resolves to a redirect', async () => {
  const result = await resolvePublishedProjectRoute('65f111111111111111111111', makeDeps({
    findPublishedById: async () => ({ _id: '65f111111111111111111111', slug: 'my-project', slugHistory: [] }),
  }));

  assert.equal(result.kind, 'redirect');
  assert.equal(result.slug, 'my-project');
});

test('unknown slug returns missing', async () => {
  const result = await resolvePublishedProjectRoute('totally-unknown', makeDeps());
  assert.equal(result.kind, 'missing');
});
